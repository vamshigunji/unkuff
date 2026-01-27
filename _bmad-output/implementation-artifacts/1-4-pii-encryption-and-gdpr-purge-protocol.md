# Story 1.4: PII Encryption & GDPR "Purge" Protocol

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want my sensitive data encrypted at rest and a "Self-Destruct" button to delete my account,
so that I have absolute control and security over my career data.

## Acceptance Criteria

1. **AES-256 Encryption:** All PII (Contact details, Address, Social IDs) must be encrypted using AES-256-GCM before being stored in the database.
2. **Key Management:** Encryption must utilize an `ENCRYPTION_KEY` from environment variables.
3. **GDPR Purge:** A "Delete Account" action must successfully perform a hard delete of the user record, cascading through all related tables (profiles, work_experience, education, skills, job_matches, etc.).
4. **Data Sovereignty:** Decryption must only happen on the server; plain-text PII must never be stored in the database logs or backups.
5. **Cascading Integrity:** Ensure no orphaned records remain after a user purge.

## Tasks / Subtasks

- [x] Task 1: Implement AES-256-GCM Encryption Utility (AC: 1, 2)
  - [x] Create `src/lib/encryption.ts` with `encrypt(text: string)` and `decrypt(hash: string)` functions.
  - [x] Add `ENCRYPTION_KEY` to `.env.local` and validation in `src/lib/env.ts` (if it exists).
- [x] Task 2: Update Profile Schema for PII Fields (AC: 1, 4)
  - [x] Add `phone`, `address`, and `idNumber` fields to `profiles` table in `src/features/profile/schema.ts`.
  - [x] Add code comments to schema marking these fields as "Encrypted at Rest".
- [x] Task 3: Implement Encrypted Server Actions for Profile (AC: 1, 4)
  - [x] Update `saveProfile` server action to encrypt PII fields before insertion.
  - [x] Update `getProfile` server action to decrypt PII fields before returning to UI.
- [x] Task 4: Implement "GDPR Purge" Protocol (AC: 3, 5)
  - [x] Create `deleteAccount` server action in `src/features/auth/actions.ts`.
  - [x] Verify database cascades are correctly configured in `schema.ts` for all related tables.
- [x] Task 5: Security & Integrity Testing (AC: 1, 3, 5)
  - [x] Write Vitest unit tests for `encryption.ts`.
  - [x] Write integration test verifying that PII is stored as encrypted strings in the DB.
  - [x] Write integration test verifying matching user data is cleared after `deleteAccount`.

## Dev Notes

- **Implementation Pattern:** Standardized Feature Folders.
- **Encryption:** Node.js `crypto` with AES-256-GCM.
- **Database:** PostgreSQL via Drizzle with `onDelete: cascade`.
- **Security:** Zero-PII Egress maintained.

### Project Structure Notes

- Utility in `src/lib/encryption.ts`.
- Actions in `src/features/profile/actions.ts` and `src/features/auth/actions.ts`.

### References

- [Source: planning-artifacts/epics.md#Story 1.4]
- [Source: planning-artifacts/project-context.md#Local Sovereignty & Auth]
- [Source: planning-artifacts/architecture.md#Decision 002: Auth.js v5]

## Dev Agent Record

### Agent Model Used

Amelia (Developer Agent) / Gemini 1.5 Pro

### Debug Log References

### Completion Notes List

- Implemented AES-256-GCM encryption with Auth Tag verification for PII.
- Added session-based authorization to all sensitive server actions.
- Configured cascading deletes in Drizzle to ensure GDPR "Purge" integrity.
- Verified zero-PII egress via secure server actions.

### File List

- src/lib/encryption.ts
- src/features/profile/schema.ts
- src/features/profile/actions.ts
- src/features/auth/actions.ts
- tests/encryption.test.ts
