---
stepsCompleted: [step-01-validate-prerequisites.md, step-02-design-epics.md, step-03-create-stories.md, step-04-final-validation.md]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# unkuff - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for unkuff, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Candidate can manage personal contact details and social professional links.
FR2: Candidate can maintain a persistent "Master Profile" containing work history, education, skills, and certifications.
FR3: System must use the Master Profile as the exclusive "Truth Anchor" for all AI generations.
FR4: Candidate can execute job searches across multiple boards using parameters (Keyword, Location, Salary, Job Type).
FR5: System can retrieve job data using Aggregator APIs (Adzuna, TheirStack, or Jooble).
FR6: System can trigger and manage Specific Apify Actors (e.g., LinkedIn Job Scraper, Indeed Scraper) to ingest deep-site data.
FR7: System must deduplicate job listings across all ingestion sources (Aggregators + Actors).
FR8: Candidate can save search filters to receive automated daily recommendation updates via scheduled actor runs.
FR9: System can map varied data schemas from different actors into a Normalized Unkuff Job Object.
FR10: System can calculate a numerical "Suitability Score" comparing candidate profile vs. job description.
FR11: System can identify specific "Keyword Gaps" required for ATS optimization.
FR12: Candidate can trigger AI generation of a tailored resume based on a specific job card.
FR13: System must evaluate generated resumes against a target ATS score of 95%+, performing iterative refinement if needed.
FR14: Candidate can choose between 3-5 distinct resume templates.
FR15: Candidate can preview and download tailored resumes in PDF and DOCX formats.
FR16: System must provide a Kanban dashboard to visualize and persist job-card states (Recommended, Applied, Interviewing, Offer).
FR17: Candidate can drag-and-drop job cards to update their application status.
FR18: System must provide a deep link to the original external application portal for each job card.
FR19: System must encrypt all PII at rest using AES-256 standards.
FR20: Candidate can permanently purge all account data (GDPR/CCPA compliance).
FR21: System must implement LLM system prompts that strictly forbid invented skills or experiences.

### NonFunctional Requirements

NFR1: Search Latency (Aggregators): Display results in < 2 seconds for 95th percentile requests.
NFR2: Actor Ingestion (Background): For tasks utilizing deep-scraping actors, provide asynchronous status updates ("Scraping in progress...").
NFR3: AI Latency: Resume tailoring must complete in < 45 seconds, with a real-time progress indicator.
NFR4: UI Responsiveness: Kanban drag-and-drop must maintain < 16ms frame-rate latency.
NFR5: Data Transit: All data transmission must utilize TLS 1.3 or higher.
NFR6: AI Privacy: System must use Enterprise-grade LLM endpoints with Zero Data Retention policies.
NFR7: Failover: The system must handle Aggregator or Actor failures gracefully, presenting the best available partial dataset.
NFR8: Persistence: 100% of candidate edits and board state changes must persist to the database within 500ms of the action.
NFR9: Accessibility Compliance: All user-facing interfaces must meet WCAG 2.1 AA standards.

### Additional Requirements

- **Starter Template:** Official `create-next-app` initialized with `shadcn@latest` and **Tailwind CSS v4**.
- **Initialization Command:** `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm` followed by `npx shadcn@latest init`.
- **Infrastructure:** Local-first PostgreSQL with `pgvector` for semantic search/matching and data sovereignty.
- **ORM:** Drizzle ORM for type-safe database access.
- **AI Core:** Google Gemini 1.5 Pro via Vercel AI SDK (@ai-sdk/google).
- **Authentication:** Auth.js v5 (self-hosted in local DB using Drizzle adapter).
- **Architecture Pattern:** "Standardized Feature Folders" (components, actions, schema co-located in `src/features/[feature-name]/`).
- **Wait-State Management:** Streaming-first architecture (SSE) using Vercel AI SDK for granular AI status updates (thinking, mapping, grounding).
- **Liquid Glass Aesthetic:** Custom Tailwind glass tokens (`bg-glass-sm`, `bg-glass-lg`) with 30-40px backdrop blur and 1px refraction stroke.
- **Micro-Animations:** Limit to 3 active "Shimmer" states per view; "Truth Pulse" emerald shimmer on grounding success.
- **Responsive strategy:** Desktop (Power Station) vs Tablet (Review) vs Mobile (View-only feed).
- **Grounding & Transparency:** Every AI claim must reference a `source_id` via `<GroundingLink />`.
- **Truth Anchor Rules:** AI Generations must strictly ground in the Master Profile data.
- **Red Zone Interface:** Targeted feedback for keyword/data gaps using "Amber Oscillation" pulse for warnings.

### Project Implementation Phases

**Phase I: The Headless Engine (Backend Focus)**
- Goal: Functional database, robust authentication, and the complete ingestion pipeline.
- Key Components: PostgreSQL/pgvector setup, Drizzle schemas, Auth.js v5, Apify/Aggregator service connections, Job Normalization logic.
- Outcome: Scraped job data visible in the database; multi-user robustness verified at the API/Data layer.

**Phase II: The Liquid Glass Workspace (Frontend Focus)**
- Goal: Building the visual system and user interfaces.
- Key Components: Master Profile editor UI, Kanban dashboard shell, "Liquid Glass" component library, responsive layouts (Mobile/Tablet/Desktop).
- Outcome: A high-fidelity, interactive UI that works with mocked or static data.

**Phase III: The Success Pipeline (Integration & AI)**
- Goal: Tightly coupling backend power with frontend polish.
- Key Components: Semantic Matching integration, Gemini AI Tailoring orchestration, real-time streaming updates, end-to-end user journeys (Discovery -> Tailor -> Applied).
- Outcome: A fully functional Career DevOps platform as described in the PRD.

### FR Coverage Map

FR1: Epic 1 & Epic 4 - Profile management backend and UI.
FR2: Epic 1 & Epic 4 - Master Profile persistence and UI editors.
FR3: Epic 1 - Truth Anchor logic enforcement at the data layer.
FR4: Epic 2 - Search parameter handling in the backend engine.
FR5: Epic 2 - Aggregator API integration.
FR6: Epic 2 - Apify Actor management.
FR7: Epic 2 - Ingestion deduplication logic.
FR8: Epic 5 - Search filter persistence and scheduled matching.
FR9: Epic 2 - Job data normalization for multiple sources.
FR10: Epic 5 - Numerical suitability score calculation.
FR11: Epic 5 - Keyword gap identifying.
FR12: Epic 6 - AI tailoring trigger and pilot.
FR13: Epic 6 - Iterative ATS optimization logic.
FR14: Epic 4 & Epic 6 - Template selection UI and generation logic.
FR15: Epic 4 & Epic 6 - Resume preview UI and export generation.
FR16: Epic 3 - Kanban dashboard visualization.
FR17: Epic 3 - Interactive drag-and-drop state management.
FR18: Epic 3 - External job portal deep linking.
FR19: Epic 1 - AES-256 PII encryption.
FR20: Epic 1 - Account data purge (GDPR compliance).
FR21: Epic 6 - AI Hallucination guards/system prompts.

## Epic List

### Phase I: The Headless Engine (Backend Priority)

#### Epic 1: Sovereign Identity & Truth Anchor Vault
Establish the secure multi-user authentication foundation and the "Truth Anchor" database layer to ensure all future career data is private and grounded.
**FRs covered:** FR1, FR2, FR3, FR19, FR20

### Story 1.1: Local-First Postgres & Drizzle Architecture
As a developer,
I want to establish a robust local PostgreSQL database with Drizzle ORM and `pgvector`,
So that I have a high-performance foundation for sovereign career data.

**Acceptance Criteria:**
- **Given** a fresh Next.js 15 project
- **When** the database service is initialized
- **Then** a local Docker-based or native PostgreSQL instance is connected
- **And** Drizzle ORM is configured with a unified schema in `src/db/schema.ts`
- **And** the `pgvector` extension is successfully enabled via an initial migration.

### Story 1.2: Auth.js v5 with Local Database Adapter
As a candidate,
I want to sign up and log in securely using my local credentials,
So that my session and identity remain within my sovereign workstation.

**Acceptance Criteria:**
- **Given** the local PostgreSQL instance
- **When** a user accesses the login/signup routes
- **Then** Auth.js v5 manages the session via the Drizzle database adapter
- **And** all user identity data (email, hashed password) is stored strictly in the local `users` table
- **And** protected routes are only accessible to authenticated sessions.

### Story 1.3: "Truth Anchor" Master Profile Schema
As a candidate,
I want my work history, education, and skills to be stored in a structured "Truth Anchor" table,
So that the AI has a definitive source for all generations.

**Acceptance Criteria:**
- **Given** an authenticated user
- **When** the profile schema is deployed
- **Then** tables for `profiles`, `work_experience`, `education`, and `skills` are available
- **And** the `profiles` table includes a `bio_embedding` vector column for semantic matching
- **And** strict foreign key constraints ensure data integrity across the profile sections.

### Story 1.4: PII Encryption & GDPR "Purge" Protocol
As a candidate,
I want my sensitive data encrypted at rest and a "Self-Destruct" button to delete my account,
So that I have absolute control and security over my career data.

**Acceptance Criteria:**
- **Given** stored PII (Contact, Address, SSN-like data)
- **When** saved to the database
- **Then** the value is encrypted using AES-256 before insertion
- **And** a "Delete Account" action successfully cascades through all user-related tables, performing a hard delete of all data.

#### Epic 2: Robust Hybrid Ingestion Engine
Build the high-speed data engine capable of retrieving, normalizing, and deduplicating job postings from both REST APIs and deep-scraping actors.
**FRs covered:** FR4, FR5, FR6, FR7, FR9

### Story 2.1: Multi-Provider Ingestion Workspace
As a developer,
I want a modular "Provider" architecture for different aggregators (Jooble, TheirStack),
So that I can easily add or swap ingestion sources as unkuff scales.

**Acceptance Criteria:**
- **Given** the ingestion feature folder
- **When** implementing a new aggregator
- **Then** it follows the `BaseProvider` interface with standardized `fetch` and `normalize` methods
- **And** the service can handle different authentication headers (API Key, Bearer Token) dynamically.

### Story 2.2: "Wide Mouth" Bulk Discovery (Jooble/Arbeitnow)
As a candidate,
I want to see a broad feed of potentially relevant jobs from free aggregators,
So that I have a high-volume discovery stream without spending API credits.

**Acceptance Criteria:**
- **Given** a keyword search (e.g., "React Developer")
- **When** the bulk discovery service is triggered
- **Then** it fetches data from Jooble (Free API) and Arbeitnow (No-Auth)
- **And** it populates the local `jobs` table with basic metadata (Title, snippets, URLs)
- **And** the results are deduplicated via a Title+Company hash within 2 seconds (NFR1).

### Story 2.3: "Deep Dive" On-Demand Hydration (TheirStack)
As a candidate,
I want to fetch the full description and tech stack for a specific job card when I click it,
So that I have the "Truth Anchor" context for a >95% match without wasting credits on irrelevant jobs.

**Acceptance Criteria:**
- **Given** a job card with metadata only
- **When** the user clicks "View Details" or "Hydrate"
- **Then** the system triggers a TheirStack API call to fetch the full `description` and `technographics`
- **And** the local record is updated ("Hydrated") in the database
- **And** this process is only triggered once per job to preserve the 200/mo free credit limit.

### Story 2.4: Normalized Job Schema & Ingestion Dashboard
As a developer,
I want a unified database schema and a basic status dashboard for ingestion tasks,
So that I can monitor the health and deduplication of my job pipeline.

**Acceptance Criteria:**
- **Given** the local PostgreSQL instance
- **When** data from multiple providers is ingested
- **Then** it is mapped to a standardized `jobs` table schema
- **And** a helper dashboard UI shows the count of `Recommended` vs `Hydrated` jobs
- **And** any ingestion errors are logged and visible to the developer in the console.

### Phase II: The Liquid Glass Workspace (Frontend Priority)

#### Epic 3: Pro-Grade Command Center UI

**Goal:** Implement the "Liquid Glass" Kanban dashboard and pipeline management interface, providing a premium interactive experience for tracking job status.

### Story 3.1: Dashboard Layout & Command Sidebar (Liquid Glass)

As a candidate,
I want a high-end, responsive dashboard layout with a left-docked command sidebar,
So that I have a professional-grade workstation for my career DevOps.

**Required Skills:**
- `ui-ux-designer`: To establishing the "Liquid Glass" design tokens (blur, vibrancy, spacing) in Tailwind v4.
- `frontend-design`: To implement the layout shell with cinematic-feeling glass materials and backdrop filters.

**Acceptance Criteria:**
- **Given** accurate design tokens in `globals.css`
- **When** the dashboard page is loaded
- **Then** a persistent left sidebar and a main content area are visible
- **And** all containers utilize the "Liquid Glass" effect (40px backdrop-blur, 1px refraction stroke, 30% opacity)
- **And** the layout is fully responsive, collapsing the sidebar on mobile devices.

### Story 3.2: Interactive Kanban Board (States & Transitions)

As a candidate,
I want a multi-column Kanban board representing my pipeline (Recommended, Applied, Interviewing, Offer),
So that I can visually track my application progress.

**Required Skills:**
- `ui-ux-designer`: To define the spatial composition of the columns and the interaction behavior for status updates.
- `full-stack-orchestration-full-stack-feature`: To coordinate the client-side state (Zustand) with the backend persistence via Server Actions.

**Acceptance Criteria:**
- **Given** authenticated access to the dashboard
- **When** the user views the pipeline
- **Then** four columns are visible (Recommended, Applied, Interviewing, Offer)
- **And** job cards are correctly filtered into their respective columns based on their `status` field
- **And** the board maintains a clean, high-density arrangement suitable for desktop-first usage.

### Story 3.3: High-Density Job Card UI

As a candidate,
I want each job card to display critical info (Score, Title, Company, Status) in a high-density glass tile,
So that I can scan my opportunities without visual clutter.

**Required Skills:**
- `frontend-design`: To implement the atomized "Glass Card" component with hover glows and subtle micro-animations.

**Acceptance Criteria:**
- **Given** a normalized job object
- **When** rendered on the Kanban board
- **Then** the card displays the Company Name, Job Title, Location, and Suitability Score
- **And** the card has a subtle hover-glow effect using the "Active Blue" brand color
- **And** the Suitability Score is visually distinct (using Emerald Green for >90% matches).

### Story 3.4: Drag-and-Drop Pipeline Management

As a candidate,
I want to move job cards between pipeline columns using drag-and-drop,
So that I can update my application status with satisfying physical feedback.

**Required Skills:**
- `frontend-design`: To implement smooth, 60fps drag animations (e.g., via `dnd-kit` or `framer-motion`).
- `full-stack-orchestration-full-stack-feature`: To ensure the database persists the new state within 500ms (NFR8).

**Acceptance Criteria:**
- **Given** a job card in the "Recommended" column
- **When** the user drags it to the "Applied" column
- **Then** the card moves smoothly with 60fps performance (NFR4)
- **And** the backend database is updated with the new status via a Server Action
- **And** the UI reflects the change immediately without a full page reload.

## Epic 4: High-Density Workspace & Template Library

**Goal:** Create the visual profile editors and resume preview environments that allow users to manage their "Truth Source" and visual presentation.

### Story 4.1: Master Profile Management Interface

As a candidate,
I want a polished, multi-section form interface to edit my profile (Contact, Work, Education),
So that I can easily update my "Truth Source" as my career evolves.

**Required Skills:**
- `ui-ux-designer`: To design the vertical rhythm and information hierarchy for complex career data sets.
- `full-stack-orchestration-full-stack-feature`: To implement high-performance Server Actions for real-time profile saving.

**Acceptance Criteria:**
- **Given** an authenticated user in the Profile view
- **When** they edit any field in the Contact, Work, or Education sections
- **Then** the changes are persisted via Server Actions
- **And** a "Saved" toast or indicator appears within 500ms (NFR8)
- **And** the UI supports adding multiple items for "Experience" and "Education" with clean, glass-themed transitions.

### Story 4.2: High-Fidelity Resume Preview Layer

As a candidate,
I want a 1:1 visual preview of my tailored resumes within a glass-themed scroll area,
So that I can verify the formatting and content before downloading.

**Required Skills:**
- `frontend-design`: To implement the "Paper Print" abstraction inside a "Liquid Glass" container, ensuring professional typography.

**Acceptance Criteria:**
- **Given** a generated resume fragment
- **When** the user opens the "Tailor" workspace
- **Then** a side-by-side view shows the high-fidelity resume preview
- **And** the preview accurately reflects the chosen template's typography and layout
- **And** the preview is scrollable and containerized within the dashboard layout.

### Story 4.3: Template Library Selector UI

As a candidate,
I want to browse and select from 3-5 distinct resume templates via a visual library,
So that I can match my presentation to different industry expectations.

**Required Skills:**
- `ui-ux-designer`: To design the thumbnail preview system and selection states for templates.
- `frontend-design`: To implement the grid-based library with transition effects between template styles.

**Acceptance Criteria:**
- **Given** the "Tailor" or "Template Selection" view
- **When** a user clicks on a template thumbnail
- **Then** that template becomes the "Active" selection for generation
- **And** the resume preview (Story 4.2) updates to reflect the new template choice
- **And** the selection is persisted to the user's session.

### Story 4.4: Export Action & Progress Feedback

As a candidate,
I want a clear "Export to PDF/DOCX" button with progress feedback,
So that I know exactly when my tailored asset is ready for submission.

**Required Skills:**
- `frontend-design`: To design the "Prepare" and "Complete" pulse animations on the export trigger.
- `full-stack-orchestration-full-stack-feature`: To handle the client-side trigger of the backend generation service.

**Acceptance Criteria:**
- **Given** a tailored job card or preview
- **When** the "Export" button is clicked
- **Then** the button transitions to a "Processing" state with a loading spinner or shimmer
- **And** the UI provides a progress feedback pulse (e.g., "Formatting Assets...")
- **And** the user receives a file download (PDF or DOCX) once the backend process completes.

## Epic 5: Semantic Matcher & Gap Analysis
Implement the "Liquid Glass" Kanban dashboard and pipeline management interface, providing a premium interactive experience for tracking job status.
**FRs covered:** FR16, FR17, FR18

#### Epic 4: High-Density Workspace & Template Library
Create the visual profile editors and resume preview environments that allow users to manage their "Truth Source" and visual presentation.
**FRs covered:** FR1, FR2 (UI), FR14, FR15 (UI)

### Phase III: The Success Pipeline (Integration & AI)

#### Epic 5: Semantic Matcher & Gap Analysis
Integrate the pgvector engine to provide real-time suitability scoring and visual "Red Zone" identifying of keyword gaps.
**FRs covered:** FR8, FR10, FR11

**Goal:** Integrate the pgvector engine to provide real-time suitability scoring and visual "Red Zone" identifying of keyword gaps.

### Story 5.1: pgvector Suitability Score Engine

As a system,
I want to calculate a numerical "Suitability Score" for every job card relative to the Master Profile,
So that I can help users prioritize high-probability matches.

**Required Skills:**
- `ai-engineer`: To implement the embedding generation (via Gemini) and the `pgvector` similarity query logic.
- `backend-architect`: To optimize the database query and implement the scoring service.

**Acceptance Criteria:**
- **Given** a new job posting or an updated Master Profile
- **When** the scoring engine is triggered
- **Then** a cosine similarity calculation is performed using pgvector between the profile embedding and job embedding
- **And** a numerical score (0-100) is saved to the `job_matches` table
- **And** the score is retrieved and displayed on the job card in < 2 seconds (NFR1).

### Story 5.2: "Red Zone" Keyword Gap Identifier

As a candidate,
I want to see specific "Keyword Gaps" where my profile doesn't match a job's high-priority requirements,
So that I can clearly understand what needs to be addressed during tailoring.

**Required Skills:**
- `ai-engineer`: To perform semantic "diff" analysis between the job description and the profile.
- `ui-ux-designer`: To design the "Amber Oscillation" (FR-Specific UX) and gap-listing UI components.

**Acceptance Criteria:**
- **Given** a suitablity score analysis
- **When** the user views a job card's details
- **Then** a list of missing keywords/skills is displayed
- **And** these "Red Zones" are highlighted with a slow amber pulse effect
- **And** each gap can be clicked to view which "Truth Anchor" project is closest but insufficient.

### Story 5.3: Automated Match-Scan (Scheduled/Triggered)

As a candidate,
I want my recommendations to update automatically when new jobs are ingested or my profile changes,
So that my dashboard always reflects the freshest data.

**Required Skills:**
- `backend-architect`: To design the triggering mechanism (cron or event-based) that re-scores jobs when the profile is updated.

**Acceptance Criteria:**
- **Given** an update to the user's "Master Profile"
- **When** the profile is saved
- **Then** the system triggers a background re-scoring of all active job cards in the "Recommended" column
- **And** the Kanban board updates the scores in real-time or upon next refresh.

#### Epic 6: Automated ATS Tailoring & Export Pilot
Orchestrate the AI tailoring pilot to generate 95%+ ATS-optimized resumes, strictly grounded in the Master Profile, with full PDF/DOCX export.
**FRs covered:** FR12, FR13, FR14/15 (Logic), FR21

**Goal:** Orchestrate the AI tailoring pilot to generate 95%+ ATS-optimized resumes, strictly grounded in the Master Profile, with full PDF/DOCX export.

### Story 6.1: Recursive AI Tailoring Engine

As a candidate,
I want to trigger an iterative AI tailoring process that optimizes my resume for a specific job,
So that I achieve a >95% ATS suitability score.

**Required Skills:**
- `ai-engineer`: To implement the Gemini 1.5 Pro prompt chaining logic with strict grounding and hallucination guardrails (FR21).

**Acceptance Criteria:**
- **Given** a user triggers "Tailor Resume" for a specific job
- **When** the LLM executes the prompt chain
- **Then** the output is strictly limited to facts found in the Master Profile
- **And** the engine performs up to 3 iterative passes to reach the target >95% match score (FR13)
- **And** the generated content is formatted according to the specific job's ATS requirements.

### Story 6.2: Real-time "Explainable Shimmer" Progress

As a candidate,
I want to see granular progress updates (e.g., "Mapping skills...", "Refining content...") during the 45s tailoring wait,
So that I stay informed and trust the background work.

**Required Skills:**
- `full-stack-orchestration-full-stack-feature`: To implement the Vercel AI SDK streaming (SSE) from the backend to the UI.
- `frontend-design`: To implement the cinematic shimmer and status label animations.

**Acceptance Criteria:**
- **Given** an active tailoring process
- **When** the backend emits status events (thinking, mapping, grounding)
- **Then** the UI displays an "Explainable Shimmer" with the current status message
- **And** the total processing time remains < 45 seconds (NFR3).

### Story 6.3: Multi-Format PDF/DOCX Generation Logic

As a candidate,
I want the system to generate download-ready files in my chosen template's format,
So that I can apply via any standard external portal.

**Required Skills:**
- `backend-architect`: To implement the server-side PDF generation (e.g., via Puppeteer or specialized libs) and DOCX synthesis.

**Acceptance Criteria:**
- **Given** an approved tailored resume draft
- **When** the user clicks "Download PDF" or "Download DOCX"
- **Then** a high-fidelity document is generated on the server using the active template's CSS
- **And** the resulting file is returned to the user via browser download
- **And** the file content is identical to the visual preview (Story 4.2).

## Phase IV: Production Readiness & Optimization

#### Epic 7: Data Orchestration & Smart Ingestion Architecture

**Goal:** Implement a cost-efficient, multi-tenant data orchestration system that manages job ingestion across users with shared job pools, criteria-based discovery, and scheduled background refresh.

**FRs covered:** FR4, FR5, FR6, FR7, FR8

**Priority Note:** Story 7.1 is marked P0-CRITICAL and should be worked IMMEDIATELY. The cron job (Story 7.5) is deferred to production phase.

### Story 7.1: Dev Test - Manual Apify Ingestion Trigger Button [P0-CRITICAL]

As a developer,
I want a manual trigger button in the dev environment to initiate Apify data pulls on-demand,
So that I can test the ingestion pipeline without automated cron jobs and control API credit consumption.

**Status:** READY-FOR-DEV (Next Priority)

**Acceptance Criteria:**
- **Given** the app runs in development mode (`NODE_ENV=development`)
- **When** the dev accesses Dev Tools
- **Then** a "🚀 Trigger Apify Pull" button is available with keyword/location inputs
- **And** real-time ingestion status is displayed
- **And** results summary shows new vs. duplicate job counts
- **And** the button is completely excluded from production builds (tree-shaken)

### Story 7.2: Shared Job Pool Architecture (Multi-Tenant Deduplication)

As the system,
I want to store job postings in a shared pool with user-specific links,
So that multiple users with the same criteria don't cause duplicate storage or Apify calls.

**Acceptance Criteria:**
- **Given** the new schema architecture
- **When** jobs are ingested
- **Then** unique jobs go to `job_pool` table (no user_id)
- **And** each user gets a `user_job` link to the pool record
- **And** existing data is migrated from per-user to shared model

### Story 7.3: Job Criteria Management & Persistence

As a candidate,
I want to save and manage my job search criteria,
So that the system can automatically discover matching jobs without re-entering search terms.

**Acceptance Criteria:**
- **Given** an authenticated user
- **When** they access Search Preferences
- **Then** they can create/edit criteria sets (job titles, locations, work modes)
- **And** criteria can be toggled active/inactive
- **And** active criteria are summarized on the dashboard

### Story 7.4: Criteria Deduplication Engine

As the system,
I want to aggregate and deduplicate job criteria across all users before triggering Apify,
So that identical searches are only executed once, saving API credits.

**Acceptance Criteria:**
- **Given** multiple users with similar criteria
- **When** the ingestion engine runs
- **Then** criteria are grouped by normalized key (title + location + mode)
- **And** only unique criteria sets trigger Apify calls
- **And** results are distributed to all matching users

### Story 7.5: Scheduled Background Ingestion (Cron Job) [PRODUCTION ONLY]

As a candidate with active job criteria,
I want the system to automatically refresh my job recommendations on a schedule,
So that I receive fresh opportunities without manually triggering searches.

**Note:** This is a production-only feature. Use Story 7.1 for development testing.

**Acceptance Criteria:**
- **Given** production deployment with Vercel Cron
- **When** the scheduler runs (every 4 hours)
- **Then** active criteria from eligible users are processed
- **And** inactive users (>7 days) are skipped to save credits
- **And** rate limiting prevents exceeding Apify quotas

