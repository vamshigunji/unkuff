# Story 1.2: Auth.js v5 with Local Database Adapter

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want to sign up and log in securely using my local credentials,
so that my session and identity remain within my sovereign workstation.

## Acceptance Criteria

1. [AC-1] Auth.js v5 handles authentication with the Drizzle adapter in `unkuff-dev`. [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]
2. [AC-2] Local credential provider (Email/Password) stores data in the local `user` table. [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]
3. [AC-3] Middleware protects sensitive routes (e.g., `/dashboard`) from unauthenticated access. [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]
4. [AC-4] Session data is persisted in the local database via the Drizzle adapter. [Source: _bmad-output/planning-artifacts/architecture.md#Security Requirements]

## Tasks / Subtasks

- [x] Task 1: Install and Configure Auth.js v5 (AC-1)
  - [x] Install `next-auth@beta` and `@auth/drizzle-adapter`.
  - [x] Create `src/auth.ts` to export `NextAuth` handlers and config.
  - [x] Create `src/app/api/auth/[...nextauth]/route.ts`.
- [x] Task 2: Implement Credentials Provider (AC-2)
  - [x] Define `Credentials` provider in `src/auth.ts`.
  - [x] Implement password hashing (e.g., `bcryptjs`).
  - [x] Create a basic signup/login server action in `src/features/auth/actions.ts`.
- [x] Task 3: Secure Routes with Middleware (AC-3)
  - [x] Create `src/middleware.ts` to verify sessions.
  - [x] Redirect unauthenticated users to `/login`.
- [x] Task 4: Verify Local Database Persistence (AC-4)
  - [x] Sign up a test user and verify record in the `user` table.
  - [x] Verify `account` and `session` tables are populated.

## Dev Notes

- **Next.js 15 Rules:** Ensure all mutations use Server Actions. Leaf-interactivity only. [Source: project-context.md#⚛️ Next.js 15 & React 19 Rules]
- **Auth.js v5 Pattern:** Use the new `NextAuth` pattern from the beta documentation.
- **Sovereignty:** No OIDC/OAuth providers (Google/GitHub) allowed for MVP to ensure local-first data sovereignty. [Source: architecture.md#Security Requirements]

### Project Structure Notes

- Co-locate auth UI and actions in `src/features/auth/`.
- Maintain `src/db/schema.ts` as the aggregate export for the Drizzle adapter.

### References

- [Source: _bmad-output/planning-artifacts/project-context.md#🔒 Local Sovereignty & Auth]
- [Source: _bmad-output/planning-artifacts/architecture.md#Security Requirements]

## Dev Agent Record

### Agent Model Used

Antigravity v1.0 (Amelia)

### Debug Log References

- [2026-01-24] Resolved Code Review Findings:
    - Implemented Zod schema validation for signup/login actions.
    - Added TypeScript augmentation for session user ID.
    - Optimized bcrypt imports and standardized server action responses.
    - Removed redundant dotenv configuration to favor Next.js native env handling.

### Completion Notes List

- Auth.js v5 integrated with Drizzle Adapter.
- Local Credentials provider successfully validates against encrypted DB records.
- Middleware protects `/dashboard` route.

### File List

- `unkuff-dev/src/auth.ts`
- `unkuff-dev/src/app/api/auth/[...nextauth]/route.ts`
- `unkuff-dev/src/middleware.ts`
- `unkuff-dev/src/features/auth/actions.ts`
- `unkuff-dev/src/features/auth/schema.ts` (updated with password field)
