# Story 1.1: Local-First Postgres & Drizzle Architecture

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to establish a robust local PostgreSQL database with Drizzle ORM and `pgvector`,
so that I have a high-performance foundation for sovereign career data.

## Acceptance Criteria

1. [AC-1] A fresh Next.js 15 project is initialized with Tailwind v4 and Shadcn UI. [Source: _bmad-output/planning-artifacts/architecture.md#Decision]
2. [AC-2] A local PostgreSQL instance (Docker-based or native) is connected and accessible. [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]
3. [AC-3] Drizzle ORM is configured with a unified schema in `src/db/schema.ts` and client in `src/lib/db.ts`. [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
4. [AC-4] The `pgvector` extension is successfully enabled via an initial migration and verified in the database. [Source: _bmad-output/planning-artifacts/project-context.md#Data & pgvector Precision]

## Tasks / Subtasks

- [x] Task 1: Initialize Project Foundation (AC-1)
  - [x] Initialize Next.js 15 project using `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`
  - [x] Initialize Shadcn UI using `npx shadcn@latest init`
  - [x] Configure `next.config.ts` with `serverComponentsExternalPackages: ["@google/generative-ai"]` [Source: project-context.md#Boundary Control]
- [x] Task 2: Setup Local PostgreSQL Environment (AC-2)
  - [x] Create a `docker-compose.yml` for a local PostgreSQL instance (Port 5433 to avoid conflicts).
  - [x] Verify database connection and `pgvector` availability.
- [x] Task 3: Configure Drizzle ORM (AC-3)
  - [x] Install dependencies: `npm install drizzle-orm pg` and `npm install -D drizzle-kit @types/pg`
  - [x] Create `drizzle.config.ts` in `unkuff-dev`.
  - [x] Create `src/lib/db.ts` to export the Drizzle client.
  - [x] Initialize `src/db/schema.ts` with basic auth/user tables (for Story 1.2 readiness).
- [x] Task 4: Enable pgvector & Execute Initial Migration (AC-4)
  - [x] Create migration to enable `pgvector` extension: `CREATE EXTENSION IF NOT EXISTS vector;`
  - [x] Run initial migration and verify schema in the database.

## Dev Notes

- **Next.js 15 Rules:** Leaf-interactivity only; all mutations must use Server Actions. [Source: project-context.md#⚛️ Next.js 15 & React 19 Rules]
- **Drizzle Pattern:** Use `src/features/[feature-name]/schema.ts` for feature-specific tables, exported via `src/db/schema.ts`. [Source: architecture.md#Structure Patterns]
- **pgvector Precision:** Dimension for Gemini embeddings must be `vector(1536)`. [Source: project-context.md#🧬 Data & pgvector Precision]

### Project Structure Notes

- Adhere strictly to **Standardized Feature Folders**.
- `src/db/schema.ts` should be the central export point for all Drizzle schemas.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure]
- [Source: _bmad-output/planning-artifacts/project-context.md#🧬 Data & pgvector Precision]

## Dev Agent Record

### Agent Model Used

Antigravity v1.0 (create-story workflow)

### Debug Log References

- [2026-01-24] Moved all implementation code to `unkuff-dev/` directory per user request.
- [2026-01-24] Task 1 & 2 completed (Next.js init, Shadcn init, Docker setup).

### Completion Notes List

- Next.js 15 initialized with Tailwind v4 in `unkuff-dev/`.
- Shadcn UI configured.
- Docker Compose set up with PostgreSQL + pgvector on port 5433.

### File List

### File List

- `unkuff-dev/package.json`
- `unkuff-dev/next.config.ts`
- `unkuff-dev/docker-compose.yml`
- `unkuff-dev/src/db/schema.ts`
- `unkuff-dev/src/lib/db.ts`
- `unkuff-dev/drizzle.config.ts`
- `unkuff-dev/src/lib/utils.ts`

## Change Log

- [2026-01-24] Resolved Code Review Findings:
    - Standardized all PostgreSQL tables to `snake_case`.
    - Moved Auth/Job schemas to dedicated feature folders (`src/features/`).
    - Decoupled secrets into `.env.local`.
    - Included `pgvector` extension creation in the first migration.

