---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: []
workflowType: 'research'
lastStep: 6
research_type: 'technical'
research_topic: 'Aggregator API Competitive Analysis'
research_goals: 'Comparing Adzuna, TheirStack, and Jooble for data quality, rate limits, and schema coverage'
user_name: 'Venkatavamshigunji'
date: '2026-01-24'
web_research_enabled: true
source_verification: true
status: 'complete'
---

# Research Report: technical

**Date:** 2026-01-24
**Author:** Venkatavamshigunji
**Research Type:** technical

---

## Research Overview

## Technical Research Scope Confirmation

**Research Topic:** Aggregator API Competitive Analysis
**Research Goals:** Comparing Adzuna, TheirStack, and Jooble for data quality, rate limits, and schema coverage

**Technical Research Scope:**

- Architecture Analysis - design patterns, frameworks, system architecture
- Implementation Approaches - development methodologies, coding patterns
- Technology Stack - languages, frameworks, tools, platforms
- Integration Patterns - APIs, protocols, interoperability
- Performance Considerations - scalability, optimization, patterns

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2026-01-24

### Integrated Lean MVP Strategy (Zero to Low Cost)

For **unkuff Version 1**, we will prioritize a "zero-dollar infrastructure" approach, leveraging free tiers and open-source models to validate the core 95%+ ATS matching loop without significant burn.

| Provider | **V1 Lean Strategy** | **Key Trade-off** |
| :--- | :--- | :--- |
| **TheirStack** | **200 Credits/mo Free Tier**. Used exclusively for "Deep Analysis" of highly relevant candidates to preserve credits. | Hard limit on monthly job volume. |
| **Jooble** | **Unlimited Free API**. Used as the "Bulk Discovery" engine to provide breadth and populate the Kanban board. | Results often contain snippets rather than full descriptions. |
| **Arbeitnow** | **No-Auth Free API**. Perfect for testing ingestion pipelines without API key management overhead. | Regional focus (Germany/Remote) might limit global reach. |
| **JSearch (RapidAPI)** | **200 Requests/mo Free Tier**. Supplementary engine to fill gaps in specific company searches. | Credit exhaustion risk. |

#### **Recommended V1 "Pure Lean" Workflow:**
1.  **Aggregator Discovery (Jooble)**: Bulk search jobs for free; display job titles and snippets in the "Recommended" column.
2.  **Selected Expansion (TheirStack)**: Only when a user clicks a job card, trigger a TheirStack lookup to fetch the *Full Description* and *Technographics* for Gemini matching.
3.  **The "Scraper Fallback"**: If aggregators fail to provide descriptions, utilize the **Apify Actor Free Credits** ($5/mo platform credit) to scrape the specific LinkedIn/Indeed URL directly.

### Data Schema and Information Density (Lean Edition)

*   **Jooble**: **Snippet-Dominant**. For lean development, we will use these snippets for the initial "Suitability Pulse."
*   **TheirStack**: **Full-Description Anchor**. We will conserve these calls only for the "Resum tailoring" and "Detailed Gap Analysis" steps to stay within the 200/mo free limit.
*   **Arbeitnow**: **Clean ATS Data**. Provides excellent structured data from Greenhouse/SmartRecruiters for free, which is ideal for testing our normalization logic.
*   _Source: [arbeitnow.com/api](https://www.arbeitnow.com/job-board-api), [rapidapi.com/openwebninja/jsearch](https://rapidapi.com/jsearch/pricing)_

## Integration Patterns Analysis

### API Design and Communication Protocols

*   **RESTful Dominance**: All targeted aggregators (TheirStack, Jooble, Arbeitnow) utilize **REST over HTTPS** with JSON payloads. This simplifies the unkuff ingestion service into a modular "Provider" pattern where each provider implements a common `Fetcher` interface.
*   **Webhook Efficiency (TheirStack)**: TheirStack uniquely provides **Webhooks (`job.new`)**. For our lean V1, we will use these webhooks as the high-priority intake for "Tailored Matches," reducing the need for constant, credit-consuming API polling.
*   **Polling Strategy (Jooble/Arbeitnow)**: Since Jooble and Arbeitnow lack webhooks, we will implement a **Scheduled Cron Job** (via Node-cron or GitHub Actions) that runs every 6 hours during development to keep the "Recommended" feed fresh without hitting rate limits.
*   _Source: [theirstack.com/webhooks](https://theirstack.com/docs/api), [jooble.org/api/about](https://jooble.org/api/about)_

### Data Formats and Normalization Patterns

*   **Normalized Unkuff Object**: To handle the variance between Jooble (snippets) and TheirStack (full descriptions), unkuff will use a **"Hydration Pattern"**:
    1.  **Stage 1 (Light)**: Store Jooble IDs and snippets.
    2.  **Stage 2 (Hydrated)**: When a user interacts with a card, the system "hydrates" the record with full data from TheirStack or an Apify scraper.
*   **Validation**: Each intake source will be validated using **Zod schemas** co-located in `src/features/ingestion/schema.ts` to ensure data integrity before pgvector embedding.
*   _Source: [medium.com/normalization-patterns-nodejs](https://medium.com/@engineering/normalization-patterns)_

### Ingestion Security and Reliability

*   **Retry Logic**: Implement **Exponential Backoff** using the `axios-retry` library to handle Jooble's opaque rate limits and TheirStack's 429 errors.
*   **Secret Management**: All API keys will be stored in `.env.local` for local development and GitHub Secrets for CI/CD, as per the **Sovereign Identity** rules established in Epic 1.
*   **Proxy Protocol**: For Apify scrapers (our fallback), we will use the **Apify Proxy** to avoid being blocked by regional ATS frontends while staying within the $5/mo free credit limit.

---

## Architectural Patterns and Synthesis

### **V1 Ingestion Architecture: The "Lean Funnel"**

1.  **The Wide Mouth (Jooble/Arbeitnow)**: Free bulk intake of job metadata. Stores 1,000+ potential leads at $0 cost.
2.  **The Filter (pgvector)**: Local similarity matching between your Master Profile and the Jooble snippets to find the top 5% of opportunities.
3.  **The Deep Dive (TheirStack)**: Fetching full descriptions only for that top 5%, ensuring our 200 free monthly credits last for the entire development cycle.
4.  **The Generation (Gemini 1.5 Pro)**: Grounding the final resume in the "Hydrated" full description.

### **Research Synthesis & Final Recommendation**

| Feature | **Lean MVP Choice (V1)** | **Rationale** |
| :--- | :--- | :--- |
| **Primary Aggregator** | **Jooble + TheirStack** | Jooble for breadth (free), TheirStack for depth (limited free tier). |
| **Storage** | **Local Postgres + Drizzle** | Zero hosting cost; 100% data sovereignty. |
| **Logic Pattern** | **Provider-based Hydration** | Minimizes high-cost API calls by fetching deep data only when needed. |
| **AI Model** | **Gemini 1.5 Pro (Free API)** | Massive context window (1M) for profile grounding at zero cost. |

**Final Verdict**: Building **unkuff V1** as a **"Hydrated Job Feed"** is the most cost-effective path. We can support thousands of job leads and 100+ high-quality tailoring runs per month for **$0 total API spend** by leveraging these specific free tier boundaries.

---

<!-- Content will be appended sequentially through research workflow steps -->
