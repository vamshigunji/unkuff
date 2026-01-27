# Unkuff Implementation Master Plan

**Project:** Unkuff - High-Performance AI Job Matching System  
**Lead Architect:** BMad Master Agent  
**Stakeholder:** Venkatavamshigunji  
**Status:** Planning Phase (High Fidelity)

---

## 🎯 Vision
Unkuff aims to automate the job application process by providing high-fidelity resume tailoring, deep job ingestion (Apify), and AI-driven matching scores. The "Scratch-Built" Resume Builder with "Fake It Mode" allows users to bridge skill gaps and maximize ATS compatibility.

---

## 🏗️ Epic 1: Advanced Ingestion & Data Pipeline
**Objective:** Establish a robust, high-volume job data pipeline using Apify and TheirStack.

### Stories:
1. **[ING-01] Apify Actor Integration & Scaling**
   - Implement persistent queueing for Apify actor triggers to handle LinkedIn/Indeed rate limits.
   - **Review and Error Fix:** Implement retry logic for "Actor Run Failed" states.
2. **[ING-02] Deep Data Hydration (TheirStack)**
   - Connect the `hydrateJob` service to real TheirStack API keys.
   - Extract technographics (software stacks) for better keyword matching.
   - **Review and Error Fix:** Handle 429 (Rate Limit) and 403 (Invalid Key) errors gracefully.
3. **[ING-03] Deduplication & Hashing Engine**
   - Refine `calculateJobHash` to include title + company + city to prevent duplicates across sources.
   - **Review and Error Fix:** Verify UPSERT logic in Drizzle to ensure no job loss.

---

## 🤖 Epic 2: AI Engine - Matching & ATS Optimization
**Objective:** Finalize the AI services for keyword extraction and ATS scoring.

### Stories:
1. **[AI-01] High-Fidelity Keyword Extractor**
   - Update `keyword-service.ts` to use Gemini 1.5 Pro with structured output for hard/soft/domain skills.
   - **Review and Error Fix:** Validate Zod schema against edge-case JDs (e.g., extremely short descriptions).
2. **[AI-02] ATS Code Generator & Evaluation Signature**
   - Implement the `atsCode` generator (8-char hex) in `ats-service.ts`.
   - Store evaluation history in the database to track score improvements over time.
   - **Review and Error Fix:** Ensure the hex code is unique per (ResumeVersion, JobID).
3. **[AI-03] ATS Recommendation Engine**
   - Generate actionable "Power Statements" to replace weak bullet points in the resume.
   - **Review and Error Fix:** Prevent AI hallucinations in "Power Statements" by grounding them in the Master Profile.

---

## 📝 Epic 3: The "Scratch-Built" Resume Builder
**Objective:** Implement the core "Fake It Mode" and resume orchestration.

### Stories:
1. **[RES-01] Resume Builder Orchestration**
   - Implement the logic to merge Master Profile + Job Description + Keywords into a new `ResumeVersion`.
   - **Review and Error Fix:** Fix potential token limit issues when sending large Master Profiles to LLM.
2. **[RES-02] "Fake It Mode" Implementation**
   - Implement the `overexaggerate` flag in `builder-service.ts`.
   - Logic: Slightly stretch accomplishment metrics (e.g., "Led team of 5" -> "Orchestrated cross-functional leadership for 10+ stakeholders") based on user-defined "Stretch Level".
   - **Review and Error Fix:** Add "Truth Anchors" to ensure the AI doesn't invent entirely new jobs.
3. **[RES-03] Template Engine & PDF Export**
   - Implement the High-Fidelity templates (Classic, Modern, Executive) from the `.pen` design.
   - Integration with a PDF generation service (e.g., Puppeteer or React-PDF).
   - **Review and Error Fix:** Fix layout shifting in PDF exports.

---

## 🎨 Epic 4: High-Fidelity Frontend & Dashboard
**Objective:** Translate the Lunaris Design System to a production-ready UI.

### Stories:
1. **[UI-01] Resume Manager List View**
   - Implement the grid/list view with status badges (Active, Draft, Tailored).
   - Search and filter functionality for resumes.
   - **Review and Error Fix:** Ensure responsive behavior on mobile/tablet.
2. **[UI-02] Job Board Kanban (DND)**
   - Finalize the `use-kanban-dnd.ts` hook for smooth job card transitions.
   - Add "Discovery Progress" bar to cards.
   - **Review and Error Fix:** Fix z-index issues during drag-and-drop.
3. **[UI-03] AI Assistant Sidebar**
   - Implement the conversational interface for the AI Architect to help users refine bullet points.
   - **Review and Error Fix:** Ensure streaming responses (Vercel AI SDK) don't break on network blips.

---

## 🚀 Epic 5: Production Readiness & Infrastructure
**Objective:** Hardening the application for deployment.

### Stories:
1. **[PROD-01] Database Schema Migration**
   - Update Drizzle schemas for all features: `resumes`, `resume_versions`, `ats_reports`, `ingestion_logs`.
   - **Review and Error Fix:** Dry-run migrations to prevent data loss.
2. **[PROD-02] Auth & Security Guardrails**
   - Implement Clerk/Auth.js protection for all ingestion and AI actions.
   - Add rate limiting (Upstash) for LLM endpoints.
   - **Review and Error Fix:** Audit all Server Actions for missing `userId` checks.
3. **[PROD-03] End-to-End Testing (Playwright)**
   - Create test suites for the core loop: Ingest Job -> Extract Keywords -> Tailor Resume -> Check ATS Score.
   - **Review and Error Fix:** Fix flaky tests in the drag-and-drop board.

---

## 🛠️ Roles & Responsibilities
- **AI Engineer:** Responsible for `builder-service.ts`, `ats-service.ts`, and "Fake It Mode" logic.
- **Architect:** Responsible for DB schema, Ingestion pipeline, and system orchestration.
- **Frontend Lead:** Responsible for translating `.pen` designs and Kanban functionality.
- **DevOps:** Responsible for Apify management and Vercel deployment.

---

**Next Steps:**
1. Initialize the Database with the new schema.
2. Implement the Apify Actor trigger logic.
3. Begin High-Fidelity UI development for the Resume Manager.
