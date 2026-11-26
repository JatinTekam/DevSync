# DevSync --- AI Agent Instructions

> **Purpose:** This file is the source of truth for AI coding agents
> working in the DevSync repository. Read it before inspecting,
> planning, or changing code. Keep it updated when the project
> structure, architecture, commands, or conventions change.

## 1. Project overview

**DevSync** is a multi-tenant SaaS platform for software development
teams collaborating on shared Git repositories.

**Product goal:** Give teams real-time visibility into repository
activity, help developers coordinate work, and make overlapping changes
easier to identify before they become merge problems.

**Product tagline:** One repository. One team. Always in sync.

### Problems DevSync aims to address

-   Developers cannot easily see what teammates are working on.
-   Multiple branches may modify the same files.
-   Teams lack a single view of branches, commits, merge requests, and
    activity.
-   Important repository events are not communicated to the right
    teammates.
-   New developers need help understanding a codebase and previous
    technical decisions.

### Planned product modules

1.  **Team dashboard:** projects, members, recent activity, branches,
    commits, and merge requests.
2.  **Git provider integration:** begin with GitLab; design for GitHub
    support later.
3.  **Activity tracking:** process repository events and present a
    useful team activity feed.
4.  **File overlap awareness:** identify files changed on multiple
    active branches using available Git provider data.
5.  **Real-time notifications:** deliver relevant activity to connected
    team members.
6.  **Future capabilities:** CLI/IDE integration for local
    uncommitted-file activity, AI codebase assistance, and knowledge
    base.

Do not represent planned capabilities as already implemented.

## 2. Current implementation status

This section records the known state at the time this file was created.
Inspect the repository before relying on it, because implementation may
have progressed.

  -----------------------------------------------------------------------
  Area                                Known status
  ----------------------------------- -----------------------------------
  Repository                          Git repository initialized

  Monorepo                            pnpm workspace configured

  Frontend                            React + TypeScript app created with
                                      Vite under `apps/web`

  Frontend dev server                 Started successfully

  Tailwind CSS                        Tailwind CSS v4 and
                                      `@tailwindcss/vite` configured;
                                      test styling verified in browser

  UI components                       shadcn/ui selected, but
                                      initialization is not yet confirmed

  Backend                             Express + TypeScript API
                                      foundation in `apps/api` with
                                      CORS, Zod environment validation,
                                      `/api/v1/health`, and
                                      `POST /api/v1/auth/register`;
                                      login and token flows are not
                                      implemented

  Shared package                      `packages/shared` directory
                                      created; package implementation not
                                      yet confirmed

  Database                            PostgreSQL + Prisma 7 configured;
                                      initial User, Organization,
                                      Membership, and RefreshToken
                                      schema, migration, generated
                                      client, and client module present

  API tests                           Vitest + Supertest configured;
                                      health and registration validation
                                      tests present; test setup requires
                                      an isolated `TEST_DATABASE_URL`

  Authentication                      JWT access tokens with rotating
                                      refresh tokens selected;
                                      registration implemented, login
                                      and token flows not implemented

  Real-time                           Socket.IO is planned, not confirmed
                                      as installed/configured

  Git integration                     GitLab first; integration not yet
                                      confirmed as implemented
  -----------------------------------------------------------------------

### Known initial repository layout

``` text
devsync/
├── apps/
│   ├── web/                 # Vite + React + TypeScript frontend
│   └── api/                 # Express + TypeScript API foundation
├── packages/
│   └── shared/              # Planned shared TypeScript contracts/types
├── docs/                    # Product and engineering documentation
├── package.json             # Workspace root
├── pnpm-workspace.yaml
└── AGENTS.md                # This file
```

The exact files inside each directory can change. Always inspect the
current tree before editing. Do not create duplicate files or assume a
planned file already exists.

## 3. Intended architecture

Start with a **modular monolith**, not microservices. Keep clear module
boundaries so the system can evolve without premature infrastructure
complexity.

``` text
Browser
  |
  v
React + TypeScript (apps/web)
  | REST requests                 | WebSocket connection
  v                               v
Express + TypeScript API (apps/api) ---- Socket.IO
  |
  +---- PostgreSQL (planned persistence)
  |
  +---- GitLab webhooks/API (first provider)
  |
  +---- Event processing
             |
             +---- Persist normalized events
             +---- Publish relevant team updates
             +---- Notify connected users
```

### Frontend

Selected stack:

-   React
-   TypeScript
-   Vite
-   Tailwind CSS v4
-   shadcn/ui (selected; verify initialization status)
-   React Router (planned)
-   TanStack Query (planned for server state)
-   Zustand (planned only if shared client state is needed)
-   React Hook Form + Zod (planned for forms and validation)
-   TanStack Table (planned for data-heavy tables)
-   Recharts (planned for charts)
-   Lucide React (planned for icons)
-   Motion (optional; add only when useful)

### Backend

Intended stack:

-   Node.js
-   Express
-   TypeScript
-   Zod for input validation
-   Prisma ORM
-   PostgreSQL
-   Socket.IO for real-time communication
-   Pino for structured logging
-   Vitest and Supertest for testing

Verify installed versions and existing choices before adding
dependencies. Do not install every planned library at once.

### Integrations

-   GitLab is the first planned Git provider.
-   GitHub support may follow.
-   Use provider webhooks for repository events where appropriate.
-   Verify webhook signatures and validate payloads before processing.
-   Make webhook handling idempotent; providers may retry delivery.
-   Keep provider-specific logic behind a clear integration boundary.

## 4. Important product and technical constraints

### Multi-tenancy and authorization

-   Treat organization/team boundaries as a core security requirement.
-   Every organization-owned record and query must be scoped to the
    authorized organization.
-   Never trust an organization ID, user ID, role, or permission
    supplied by the client without server-side authorization.
-   Enforce authorization in the backend, not only by hiding frontend
    controls.
-   Avoid leaking repository events or metadata across organizations.

### Repository activity versus live editor activity

Git provider webhooks can report events such as pushes, commits, and
merge-request changes. They **cannot reliably reveal every uncommitted
file currently open or edited on a developer's machine**.

-   Do not claim webhook-based tracking detects all live working-tree
    changes.
-   Initial overlap detection should be based on available
    branch/commit/provider data and clearly communicate its limitations.
-   Live uncommitted-file awareness would require a future opt-in local
    CLI or IDE extension.

### Real-time delivery

-   Authenticate WebSocket connections.
-   Authorize room/channel membership on the server.
-   Scope rooms by organization and project/repository as appropriate.
-   Do not broadcast private repository data to all connected clients.
-   Design event handling so reconnecting clients can recover from
    missed updates through persisted data or API refetching.

### Security and secrets

-   Never commit `.env` files, tokens, private keys, credentials, or
    real webhook secrets.
-   Provide `.env.example` with placeholder values only.
-   Validate environment variables at application startup.
-   Do not log access tokens, secrets, passwords, or sensitive webhook
    payload fields.
-   Validate and sanitize untrusted input.
-   Use safe error responses; do not expose stack traces or internal
    secrets to clients in production.

## 5. Coding conventions

-   Use TypeScript for frontend, backend, and shared code.
-   Prefer clear, descriptive names over abbreviations.
-   Keep modules focused and avoid oversized components or route
    handlers.
-   Separate transport concerns (HTTP/WebSocket) from business logic and
    persistence.
-   Reuse shared types/schemas only when they genuinely belong across
    apps.
-   Avoid `any`; use `unknown` and narrow types when necessary.
-   Handle loading, empty, success, and error states in the UI.
-   Make interfaces responsive and accessible; use semantic HTML and
    keyboard-friendly controls.
-   Follow the existing formatting, linting, import, and naming
    conventions found in the repository.
-   Do not introduce a new library for a problem already solved by an
    installed dependency.
-   Avoid unnecessary abstractions and premature optimization.

## 6. Frontend guidance

-   Keep reusable UI components separate from page-level features.
-   Use shadcn/ui components as locally owned building blocks once
    initialized; customize them consistently rather than creating
    unrelated design patterns.
-   Use Tailwind utility classes and the project's shared design tokens.
-   Keep API communication in a dedicated service/client layer rather
    than scattering raw `fetch` or Axios calls through components.
-   Use TanStack Query for remote/server state when configured.
-   Use local component state for short-lived UI state; add Zustand only
    for genuinely shared client state.
-   Keep forms validated consistently with Zod and React Hook Form when
    those packages are configured.
-   Do not put secrets or privileged Git provider tokens in browser
    code.

## 7. Backend guidance

When the backend is implemented, prefer clear feature/module boundaries.
A possible organization is:

``` text
apps/api/src/
├── config/                  # Environment and app configuration
├── modules/
│   ├── auth/
│   ├── organizations/
│   ├── members/
│   ├── projects/
│   ├── repositories/
│   ├── gitlab/
│   ├── activity/
│   └── notifications/
├── middleware/
├── shared/
├── app.ts
└── server.ts
```

This is a proposed structure, not a claim about the current files. Adapt
it to the code already present.

-   Keep route/controller code thin.
-   Put business rules in services or domain modules.
-   Validate request bodies, query parameters, and webhook payloads.
-   Centralize error handling.
-   Use database transactions when multiple related writes must succeed
    together.
-   Add pagination to potentially large activity and repository lists.
-   Add indexes based on actual query patterns.
-   Avoid exposing database models directly as public API contracts.

## 8. Workspace and package-manager rules

-   Use **pnpm** for package management and workspace commands.
-   Do not introduce npm or Yarn lockfiles.
-   Run commands from the repository root where practical, using
    workspace filters or `pnpm --dir` for a specific app.
-   Do not manually edit `pnpm-lock.yaml`.
-   Before adding a dependency, check whether it belongs in the root,
    `apps/web`, `apps/api`, or `packages/shared`.
-   Keep the root package for workspace-level scripts and tooling;
    app-specific runtime dependencies belong in the relevant app.

Useful commands (verify scripts exist before relying on them):

``` bash
# Install workspace dependencies
pnpm install

# Run frontend development server
pnpm --dir apps/web dev

# Run frontend build (if the script exists)
pnpm --dir apps/web build

# Run frontend lint (if the script exists)
pnpm --dir apps/web lint

# Run the API, API tests, and API build
pnpm --filter api dev
pnpm --filter api test
pnpm --filter api build
pnpm --filter api build:prod
```

`apps/api/tests/setup.ts` requires `TEST_DATABASE_URL` and assigns it as
the database URL used by the API in tests. Use an isolated test database;
never run database-writing tests against development or production data.
Create the test database once (skip if it already exists):

``` cmd
psql -h localhost -p 5432 -U postgres -d postgres -c "CREATE DATABASE devsync_test;"
```

For tests and test database migrations in **Command Prompt**, use the
same terminal session. Replace the placeholder password locally, adjust
the connection details for your PostgreSQL setup, and never commit or
share the real URL:

``` cmd
set "NODE_ENV=development"
set "DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/devsync_test"
set "TEST_DATABASE_URL=%DATABASE_URL%"
pnpm --filter api exec prisma migrate deploy
pnpm --filter api test
```

`prisma migrate deploy` applies existing migration files to the database
in `DATABASE_URL`; it does not create the database. Direct Prisma CLI
commands require `NODE_ENV` to be set so `prisma7.config.ts` selects the
matching environment file. For local Prisma commands in PowerShell:

``` powershell
$env:NODE_ENV = "development"
pnpm --filter api exec prisma validate
pnpm --filter api exec prisma migrate dev --name <descriptive_name>
```

## 9. Git and change-management rules

-   Do not switch branches, reset, rebase, force-push, or discard user
    changes unless explicitly asked.
-   Inspect `git status` before making changes.
-   Do not overwrite unrelated user work.
-   Keep changes focused on the requested task.
-   Use descriptive commit messages if asked to create commits.
-   Never commit secrets or generated build output.
-   Do not create a commit unless the user explicitly requests it.

## 10. Required workflow for every AI agent

Before making changes:

1.  Read this `AGENTS.md` completely.
2.  Inspect the current repository tree and relevant source files.
3.  Check `git status` and identify existing user changes.
4.  Read the relevant package scripts and dependency versions.
5.  Identify the requested outcome and the smallest safe set of files to
    change.
6.  Distinguish existing implementation from planned architecture in
    this document.

While making changes:

1.  Follow existing project patterns unless there is a clear reason to
    improve them.
2.  Make focused changes; avoid unrelated refactors.
3.  Preserve backward compatibility unless the task explicitly changes
    behavior.
4.  Add or update tests for changed behavior where practical.
5.  Update documentation when commands, architecture, configuration, or
    behavior changes.
6.  Never invent successful test results.

Before finishing:

1.  Run the most relevant lint, type-check, test, or build commands that
    are available.
2.  Review the final diff for accidental or unrelated changes.
3.  Report files changed and summarize behavior.
4.  State exactly which checks were run and whether they passed.
5.  Mention remaining limitations or follow-up work.
6.  Update this file if the project structure, architecture, commands,
    or conventions have materially changed.

## 11. Documentation maintenance

This file is intended to be read by AI coding agents at the repository
root. Some tools automatically discover `AGENTS.md`; for tools that do
not, explicitly provide this file as project context.

When adding a major feature, consider documenting:

-   Purpose and user workflow
-   Relevant frontend and backend modules
-   API endpoints and event contracts
-   Database changes and migrations
-   Environment variables
-   Local setup and test commands
-   Security and authorization implications

Keep statements factual. Mark proposals as **planned** and implemented
behavior as **implemented**. Remove stale instructions when the project
changes.

------------------------------------------------------------------------

**Last updated:** 2026-11-26\
**Document status:** Initial project guidance; update as implementation
evolves.
