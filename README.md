# DevSync

**One repository. One team. Always in sync.**

DevSync is a multi-tenant SaaS platform for software development teams
collaborating on shared Git repositories. It aims to give teams a clear
view of repository activity, improve coordination, and surface
overlapping changes before they become merge problems.

> **Project status:** Early development. This repository currently has a
> Vite + React + TypeScript frontend with Tailwind CSS v4 configured.
> Several product capabilities described below are planned and are not
> yet implemented.

## Product goals

DevSync is intended to help teams:

-   See which developers are active on a project and understand recent
    repository activity.
-   Track branches, commits, and merge requests in one place.
-   Identify files changed on multiple active branches.
-   Receive relevant, real-time team notifications.
-   Onboard developers with clearer project context and technical
    knowledge.

## Planned modules

  -----------------------------------------------------------------------
  Module                  Purpose                 Status
  ----------------------- ----------------------- -----------------------
  Team dashboard          Projects, members,      Planned
                          recent activity,        
                          branches and merge      
                          requests                

  Git provider            Connect repositories,   Planned
  integration             starting with GitLab    

  Activity tracking       Normalize and display   Planned
                          repository events       

  File overlap awareness  Find files changed      Planned
                          across active branches  

  Real-time notifications Deliver authorized      Planned
                          updates to connected    
                          team members            

  CLI/IDE integration     Optionally report local Future
                          uncommitted-file        
                          activity                

  AI codebase assistant   Help developers         Future
                          understand a repository 
  -----------------------------------------------------------------------

Git provider webhooks do not reveal every uncommitted file a developer
is editing. Initial overlap awareness will therefore use available
branch, commit, and provider data. More immediate local activity would
require a future opt-in CLI or IDE extension.

## Technology choices

### Frontend

-   React + TypeScript
-   Vite
-   Tailwind CSS v4
-   shadcn/ui (selected; initialize and add components as needed)
-   Planned supporting tools: React Router, TanStack Query, Zustand
    where justified, React Hook Form, Zod, TanStack Table, Recharts, and
    Lucide React

### Backend and infrastructure

Planned:

-   Node.js + Express + TypeScript
-   PostgreSQL + Prisma
-   Socket.IO
-   Zod for validation
-   Pino for logging
-   Vitest and Supertest for tests
-   Docker for local and deployment environments

### Integrations

-   GitLab first
-   GitHub later
-   Provider webhooks and APIs

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the intended
system design and implementation boundaries.

## Repository structure

The intended workspace layout is:

``` text
devsync/
├── AGENTS.md
├── README.md
├── apps/
│   ├── web/                 # React + Vite frontend
│   └── api/                 # Planned Express API
├── packages/
│   └── shared/              # Planned shared TypeScript contracts
├── docs/
│   └── ARCHITECTURE.md
├── package.json
└── pnpm-workspace.yaml
```

This is the target layout. Inspect the actual repository before assuming
every planned file or module exists.

## Prerequisites

-   A supported Node.js LTS release
-   pnpm
-   Git

Check the installed versions:

``` bash
node -v
pnpm -v
git --version
```

## Getting started

From the repository root:

``` bash
pnpm install
```

Start the frontend:

``` bash
pnpm --dir apps/web dev
```

Vite normally prints the local development URL in the terminal (commonly
`http://localhost:5173`).

Build the frontend:

``` bash
pnpm --dir apps/web build
```

Run the frontend linter, if configured:

``` bash
pnpm --dir apps/web lint
```

> Commands depend on the scripts currently defined in each
> `package.json`. Check those scripts before assuming a command is
> available. The API and database setup instructions will be added when
> those parts are implemented.

## Development principles

-   Use pnpm for package management and keep one workspace lockfile.
-   Use TypeScript across the applications and shared packages.
-   Begin with a modular monolith; do not introduce microservices
    prematurely.
-   Keep organization and repository data isolated by tenant.
-   Validate inputs and authorize access on the server.
-   Never commit `.env` files, credentials, access tokens, or real
    webhook secrets.
-   Add tests for meaningful behavior and document architectural
    changes.
-   Clearly distinguish implemented behavior from planned features.

## AI coding agents

Before making changes, AI coding agents must read
[`AGENTS.md`](AGENTS.md). It contains project context, coding
conventions, security constraints, Git safety rules, and a required
workflow for inspecting, changing, testing, and documenting the
codebase.

## Documentation

-   [`AGENTS.md`](AGENTS.md) --- instructions for AI coding agents.
-   [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) --- system
    architecture, data flow, module boundaries, and design constraints.

## Contributing

The project is in its early development stage. Before implementing a
feature:

1.  Read `AGENTS.md`.
2.  Inspect the current code and Git status.
3.  Confirm whether the feature is already implemented.
4.  Keep the change focused and add relevant tests.
5.  Update documentation when behavior or architecture changes.

Do not commit or push changes unless explicitly requested by the
repository owner.
