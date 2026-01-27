---
stepsCompleted:
  - step-01-init.md
  - step-02-discovery.md
  - step-03-success.md
  - step-04-journeys.md
  - step-05-domain.md
  - step-06-innovation.md
  - step-07-project-type.md
  - step-08-scoping.md
  - step-09-functional.md
  - step-10-nonfunctional.md
  - step-11-polish.md
inputDocuments: []
workflowType: prd
briefCount: 0
researchCount: 0
brainstormingCount: 0
projectDocsCount: 0
classification:
  projectType: web_app
  domain: career_tech
  complexity: High
  projectContext: greenfield
---

# Product Requirements Document - unkuff

**Author:** Venkatavamshigunji
**Date:** 2026-01-24

## Executive Summary
Unkuff is an AI-powered career acceleration engine designed to eliminate the manual drudgery of the job application process. It provides a "Closed-Loop" experience where candidates discover highly relevant roles via a **Hybrid Ingestion Engine** (combining broad reaching Aggregator APIs with deep, curated Apify Actors), evaluate their suitability using automated scoring, and generate ATS-optimized resumes—all within a single, unified Kanban dashboard. The goal is to reduce the time-to-apply from 45 minutes to under 5 minutes while maintaining a >95% ATS suitability score.

## Success Criteria

### User Success
*   **Efficiency:** Reduce average time-to-apply per job to < 5 minutes.
*   **Confidence:** Users achieve a target ATS suitability score of > 95% before application.
*   **Outcome:** Increase interview callback rates by providing precisely tailored resumes.
*   **Simplicity:** Users manage the complete lifecycle (Search -> Tailor -> Track) within one dashboard.

### Business & Technical Success
*   **Adoption:** Target 5+ completed application loops per user in the first week.
*   **Retention:** Daily active usage for job recommendation reviews.
*   **Reliability:** > 98% success rate for Hybrid Ingestion (Aggregators + Apify Actors).
*   **Performance:** End-to-end resume tailoring completes in < 45 seconds.

## Product Scope

### Phase 1: MVP (Core Value)
*   **Hybrid Ingestion Layer:** Support for both Aggregator APIs (Adzuna/TheirStack) and curated Apify Actors (LinkedIn/Indeed).
*   **Master Profile:** Persistent "Source of Truth" for candidate skills, education, and experience.
*   **AI Tailoring:** LLM-driven resume refinement and ATS keyword optimization.
*   **Kanban Dashboard:** Visual tracking of job status (Recommended, Applied, etc.).
*   **Export:** PDF/DOCX resume generation.

### Phase 2: Growth & Refinement
*   **Actor Customization:** Interface for adding and configuring custom Apify scraping actors.
*   **In-App Editor:** Rich-text editing for manual resume polish.
*   **Template Library:** Multiple resume design options.
*   **Advanced Analytics:** Tracking interview status and callback conversion rates.

### Phase 3: Vision (Expansion)
*   **Auto-Apply:** Browser-assisted automated form filling.
*   **AI Interview Coach:** Mock interview generation based on specific job descriptions.

## User Journeys

### Journey 1: The High-Efficiency Job Seeker (Alex)
1.  **Opening Scene:** Alex, a busy professional, logs into Unkuff on a Sunday.
2.  **Action:** Uses "Unified Search" with filters (Keywords: "Senior Data Scientist", Salary: "$140k+", Location: "Remote").
3.  **Discovery:** System triggers both Aggregator API queries and high-priority Apify Actors to build a fresh, curated dataset. Alex reviews 10 recommended cards.
4.  **Tailoring:** Clicks "Tailor Resume"; AI grounds the resume in Alex's Master Profile and optimizes for the job description.
5.  **Resolution:** Downloads the PDF and moves the card to "Applied" in under 4 minutes.

## Functional Requirements

### Candidate Profile & Onboarding
- **FR1:** Candidate can manage personal contact details and social professional links.
- **FR2:** Candidate can maintain a persistent "Master Profile" containing work history, education, skills, and certifications.
- **FR3:** System must use the Master Profile as the exclusive "Truth Anchor" for all AI generations.

### Hybrid Job Discovery Engine
- **FR4:** Candidate can execute job searches across multiple boards using parameters (Keyword, Location, Salary, Job Type).
- **FR5:** System can retrieve job data using **Aggregator APIs** (Adzuna, TheirStack, or Jooble).
- **FR6:** System can trigger and manage **Specific Apify Actors** (e.g., LinkedIn Job Scraper, Indeed Scraper) to ingest deep-site data.
- **FR7:** System must deduplicate job listings across all ingestion sources (Aggregators + Actors).
- **FR8:** Candidate can save search filters to receive automated daily recommendation updates via scheduled actor runs.
- **FR9:** System can map varied data schemas from different actors into a **Normalized Unkuff Job Object**.

### AI Matching & Resume Tailoring
- **FR10:** System can calculate a numerical "Suitability Score" comparing candidate profile vs. job description.
- **FR11:** System can identify specific "Keyword Gaps" required for ATS optimization.
- **FR12:** Candidate can trigger AI generation of a tailored resume based on a specific job card.
- **FR13:** System must evaluate generated resumes against a target ATS score of 95%+, performing iterative refinement if needed.
- **FR14:** Candidate can choose between 3-5 distinct resume templates.
- **FR15:** Candidate can preview and download tailored resumes in PDF and DOCX formats.

### Dashboard & Tracking
- **FR16:** System must provide a Kanban dashboard to visualize and persist job-card states (Recommended, Applied, Interviewing, Offer).
- **FR17:** Candidate can drag-and-drop job cards to update their application status.
- **FR18:** System must provide a deep link to the original external application portal for each job card.

### Governance & Privacy
- **FR19:** System must encrypt all PII at rest using AES-256 standards.
- **FR20:** Candidate can permanently purge all account data (GDPR/CCPA compliance).
- **FR21:** System must implement LLM system prompts that strictly forbid invented skills or experiences.

## Non-Functional Requirements

### Performance
- **NFR1:** **Search Latency (Aggregators):** Display results in < 2 seconds for 95th percentile requests.
- **NFR2:** **Actor Ingestion (Background):** For tasks utilizing deep-scraping actors, provide asynchronous status updates ("Scraping in progress...").
- **NFR3:** **AI Latency:** Resume tailoring must complete in < 45 seconds, with a real-time progress indicator.
- **NFR4:** **UI Responsiveness:** Kanban drag-and-drop must maintain < 16ms frame-rate latency.

### Security
- **NFR5:** **Data Transit:** All data transmission must utilize TLS 1.3 or higher.
- **NFR6:** **AI Privacy:** System must use Enterprise-grade LLM endpoints with Zero Data Retention policies.

### Reliability
- **NFR7:** **Failover:** The system must handle Aggregator or Actor failures gracefully, presenting the best available partial dataset.
- **NFR8:** **Persistence:** 100% of candidate edits and board state changes must persist to the database within 500ms of the action.

### Accessibility
- **NFR9:** **Compliance:** All user-facing interfaces must meet WCAG 2.1 AA standards.

## Web App Requirements

### Architecture
*   **Framework:** Next.js (React) for optimized hybrid rendering.
*   **State Management:** Client-side state (Zustand) for persistent Kanban board interactivity.
*   **Ingestion Service:** A pluggable, asynchronous backend service to handle both Aggregator API polling and Apify Actor webhook events.

### Performance & Platforms
*   **Target Device:** Zero-compromise Desktop experience (Chrome/Edge/Safari).
*   **Mobile:** Responsive "View-Only" mode for checking status and scores.
*   **TTI:** Time to Interactive for the dashboard must be < 1.5 seconds.
