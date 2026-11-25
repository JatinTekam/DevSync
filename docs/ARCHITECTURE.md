# DevSync --- System Architecture

> This document describes the **intended architecture** for DevSync. It
> is a design baseline, not proof that every component has been
> implemented. Update the status of components as implementation
> progresses.

## 1. Architectural goals

DevSync is a multi-tenant SaaS product for teams collaborating on shared
Git repositories.

The architecture should:

-   Make repository activity visible to authorized team members.
-   Support Git provider integrations without coupling product logic to
    one provider.
-   Deliver real-time updates securely.
-   Detect potential file overlap using evidence available from Git
    branches and commits.
-   Keep organization data isolated.
-   Remain understandable and deployable as a modular monolith during
    early development.

## 2. System context

``` mermaid
flowchart LR
    Dev[Developer / Team Lead]
    Browser[Web Browser]
    Git[GitLab]
    Web[DevSync Web App]
    API[DevSync API]
    DB[(PostgreSQL)]
    Socket[Socket.IO]

    Dev --> Browser
    Browser --> Web
    Web -->|HTTPS REST| API
    Web <-->|WebSocket| Socket
    Git -->|Signed webhooks| API
    API --> DB
    API --> Socket
```

GitLab is the first planned provider. GitHub can be added later through
the same integration boundary.

## 3. Container-level architecture

``` mermaid
flowchart TB
    subgraph Client["Client"]
      UI["React + TypeScript + Vite"]
      Query["TanStack Query (planned)"]
      UI --> Query
    end

    subgraph Server["Node.js application — modular monolith"]
      HTTP["Express REST API"]
      Auth["Authentication / Authorization"]
      Modules["Domain modules"]
      Webhook["Git provider webhook receiver"]
      Processor["Event normalization and processing"]
      Realtime["Socket.IO gateway"]
      HTTP --> Auth
      Auth --> Modules
      Webhook --> Processor
      Processor --> Modules
      Modules --> Realtime
    end

    DB[("PostgreSQL — planned")]
    Provider["GitLab API / Webhooks"]
    Redis[("Redis — optional future scaling")]

    Query -->|"HTTPS"| HTTP
    UI <-->|"WebSocket"| Realtime
    Provider -->|"Webhook"| Webhook
    Modules --> DB
    Realtime -. "adapter if multi-instance deployment needs it" .-> Redis
```

### Frontend responsibilities

-   Render organization, project, repository, team, and activity views.
-   Call the REST API through a centralized API client.
-   Subscribe to authorized real-time updates.
-   Handle loading, empty, error, and success states.
-   Never contain privileged Git provider credentials.

### API responsibilities

-   Authenticate users and authorize every organization-scoped
    operation.
-   Validate request parameters, bodies, and webhook payloads.
-   Enforce business rules and tenant boundaries.
-   Persist normalized domain data.
-   Publish authorized real-time events.
-   Integrate with Git provider APIs.

### Persistence responsibilities

PostgreSQL is the planned source of truth for users, organizations,
memberships, projects, connected repositories, provider events, and
notifications.

Prisma is the planned ORM. Schema design and migrations should be
introduced with the relevant feature rather than speculatively
implementing every table at once.

### Database migration workflow

-   During development, use `prisma migrate dev` against the local
    development database to create and apply migrations. Review and
    commit the migration files together with the schema changes.
-   During deployment, run `prisma migrate deploy` as a release step
    against the production database. It applies committed migrations;
    it does not create migrations or reset the database.
-   Never run `prisma migrate dev`, reset commands, or development
    database credentials against production. Run production migrations
    once per release, not independently from every API instance.
-   Keep database URLs separate per environment. Supply production
    credentials through deployment secrets or environment variables;
    never commit them or environment files containing credentials.
-   Prefer backward-compatible schema changes when deployments may
    overlap old and new API instances.

## 4. Proposed domain modules

The following is a suggested backend organization. Adapt it to the
actual codebase when the API is created.

``` text
apps/api/src/
├── config/
├── modules/
│   ├── auth/
│   ├── organizations/
│   ├── members/
│   ├── projects/
│   ├── repositories/
│   ├── git-providers/
│   │   ├── gitlab/
│   │   └── github/           # later
│   ├── activity/
│   └── notifications/
├── middleware/
├── realtime/
├── shared/
├── app.ts
└── server.ts
```

Keep provider-specific API calls and payload mapping inside provider
adapters. Domain modules should consume normalized events rather than
depending directly on GitLab payload shapes.

## 5. Core domain concepts

These are conceptual entities; exact database schema and relationships
must be designed and migrated as features are implemented.

  -----------------------------------------------------------------------
  Concept                             Meaning
  ----------------------------------- -----------------------------------
  User                                A person with a DevSync account

  Organization                        A tenant/workspace that owns team
                                      resources

  Membership                          A user's membership and role in an
                                      organization

  Project                             A team work area within an
                                      organization

  Repository                          A connected Git provider repository

  Provider installation/connection    Authorized connection to GitLab or
                                      another provider

  Activity event                      A normalized repository event such
                                      as push or merge request update

  Branch activity                     Branch and commit information used
                                      for team visibility

  File change                         A path reported as changed by a
                                      commit or provider event

  Notification                        A user-visible alert associated
                                      with an authorized event
  -----------------------------------------------------------------------

Do not assume one user belongs to only one organization. Do not assume
repository names or branch names are globally unique.

## 6. Git provider event flow

``` mermaid
sequenceDiagram
    participant GL as GitLab
    participant API as Webhook API
    participant Verify as Signature/Secret Verification
    participant Processor as Event Processor
    participant DB as PostgreSQL
    participant WS as Socket.IO
    participant Team as Authorized Team Clients

    GL->>API: Repository event webhook
    API->>Verify: Validate secret/signature and payload
    Verify-->>API: Valid / invalid
    API->>Processor: Pass verified event
    Processor->>DB: Check delivery ID / idempotency
    Processor->>DB: Persist normalized event
    Processor->>WS: Publish scoped event
    WS-->>Team: Deliver to authorized project/organization room
```

Implementation requirements:

1.  Verify the provider's webhook secret/signature using the provider's
    documented mechanism.
2.  Reject invalid or malformed payloads.
3.  Record delivery identifiers or another idempotency key so retries do
    not create duplicate activity.
4.  Normalize provider payloads into internal event types.
5.  Persist events before publishing updates where practical, so clients
    can recover after disconnects.
6.  Avoid logging secrets or unnecessary sensitive payload data.
7.  Return provider-compatible responses and handle retries safely.

## 7. File overlap awareness

### What the first version can detect

Using provider-reported commits and branch information, DevSync can
compare changed paths across branches or recent activity windows and
flag possible overlap.

Example:

``` text
Repository: devsync-api

Branch: feature/auth
  - src/modules/auth/auth.service.ts
  - src/modules/auth/auth.routes.ts

Branch: feature/profile
  - src/modules/users/user.service.ts
  - src/modules/auth/auth.service.ts

Potential overlap:
  src/modules/auth/auth.service.ts
```

This is a **potential overlap signal**, not proof of a merge conflict.
Two branches can edit the same file without conflicting, and a conflict
can depend on the exact changed lines and merge base.

### Important limitation

A normal GitLab webhook does not provide a continuous view of every
uncommitted local file being edited. To show live working-tree activity,
a later opt-in local agent or IDE extension would need to report it.

The UI must communicate the source and freshness of overlap information.
Never label a file as currently being edited unless the system has a
reliable live signal.

## 8. Real-time event design

Potential internal event names:

-   `repository.activity.created`
-   `repository.branch.updated`
-   `repository.merge_request.updated`
-   `repository.file_overlap.detected`
-   `notification.created`

These are proposed names; define and version actual event contracts in
code before relying on them.

Security requirements:

-   Authenticate the socket connection.
-   Authorize subscriptions on the server.
-   Scope rooms to an organization and, where needed, a project or
    repository.
-   Never accept arbitrary room names from clients without
    authorization.
-   Avoid sending access tokens or provider secrets in event payloads.
-   Support reconnect behavior by refetching persisted activity from the
    API.

Redis is not required for the first single-instance implementation.
Consider a Socket.IO Redis adapter only when multi-instance delivery is
needed.

## 9. Multi-tenancy and authorization

Tenant isolation is a foundational requirement.

-   Every organization-owned resource must be associated with an
    organization.
-   Every read and write must verify the authenticated user's membership
    and permission.
-   Never trust a client-supplied organization ID as proof of access.
-   Apply the same authorization rules to REST endpoints,
    webhook-derived data, and WebSocket subscriptions.
-   Ensure background jobs and event processors retain the correct
    organization context.
-   Add tests that attempt cross-organization access.

Define roles and permissions deliberately. Avoid assuming that hiding a
button in the UI is sufficient authorization.

## 10. Security baseline

-   Store secrets in environment variables or a secrets manager, never
    in source control.
-   Commit only placeholder values in `.env.example`.
-   Validate environment configuration at startup.
-   Verify webhook authenticity.
-   Validate all external input.
-   Apply rate limits to sensitive endpoints.
-   Use secure authentication and session/token handling appropriate to
    the selected auth design.
-   Restrict CORS to trusted frontend origins in deployed environments.
-   Avoid leaking stack traces, credentials, tokens, or private
    repository data in logs and API errors.
-   Use least-privilege scopes for Git provider access.
-   Document token storage, encryption, rotation, and revocation before
    implementing provider connections.

## 11. API design principles

The exact endpoint list will be defined as modules are implemented. Use
these principles:

-   Use versioned REST routes (for example, `/api/v1/...`) unless the
    project adopts another documented convention.
-   Keep controllers thin; business rules belong in services/domain
    modules.
-   Validate path parameters, query strings, and request bodies.
-   Use consistent response and error shapes.
-   Paginate activity and other potentially large collections.
-   Avoid exposing database records directly as public API contracts.
-   Document endpoints with OpenAPI when the API surface becomes stable.

## 12. Frontend structure principles

The current frontend lives in `apps/web`. As features grow, a possible
structure is:

``` text
apps/web/src/
├── app/                      # App providers and route setup
├── components/
│   ├── ui/                   # shadcn/ui-owned components
│   └── shared/               # Reusable product components
├── features/
│   ├── auth/
│   ├── organizations/
│   ├── projects/
│   ├── repositories/
│   ├── activity/
│   └── notifications/
├── hooks/
├── lib/                      # API client and utilities
├── pages/
├── styles/
└── main.tsx
```

This is a target structure, not a requirement to create all directories
immediately. Organize around real features and follow the existing
project conventions.

## 13. Testing strategy

Add tests alongside each feature.

-   **Unit tests:** validation, normalization, overlap comparison,
    authorization rules.
-   **Integration tests:** API routes, database behavior, webhook
    verification and idempotency.
-   **Realtime tests:** authentication, room authorization, event
    delivery, reconnect/refetch behavior.
-   **Frontend tests:** key user flows, loading/error/empty states,
    accessible interactions.
-   **Security tests:** cross-tenant access attempts and invalid webhook
    requests.

Do not claim a test passed unless it was actually run and passed.

## 14. Deployment evolution

Start with the simplest reliable deployment:

1.  One web frontend deployment.
2.  One API deployment.
3.  Managed PostgreSQL.
4.  Secure environment configuration and provider webhook URL.
5.  Logging, health checks, backups, and error monitoring.

Add Redis, background workers, queues, or multiple API instances only
when actual throughput or reliability requirements justify them. Do not
introduce microservices as an initial requirement.

## 15. Architecture decision log

Record significant decisions here with date, context, decision, and
consequences.

  -----------------------------------------------------------------------
  Date                    Decision                Reason / consequence
  ----------------------- ----------------------- -----------------------
  2026-11-24              Start with a modular    Keeps early development
                          monolith                and deployment
                                                  manageable while
                                                  preserving module
                                                  boundaries

  2026-11-24              Use GitLab as the first Establishes one
                          provider                integration path before
                                                  adding more providers

  2026-11-24              Use React + Vite +      Separate frontend app
                          TypeScript              pairs with the planned
                                                  Express API

  2026-11-24              Use Tailwind CSS v4 and Flexible styling and
                          shadcn/ui               locally owned reusable
                                                  components
  -----------------------------------------------------------------------

## 16. Keeping this document accurate

Whenever architecture changes:

1.  Inspect the implemented code and configuration.
2.  Update the relevant section in this document.
3.  Mark features as implemented only after they exist and have been
    verified.
4.  Record significant trade-offs in the decision log.
5.  Keep `README.md` and the root `AGENTS.md` consistent with the actual
    project.
