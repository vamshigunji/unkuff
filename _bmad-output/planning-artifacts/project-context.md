---
project_name: 'unkuff'
user_name: 'Venkatavamshigunji'
date: '2026-01-24T17:53:00-08:00'
sections_completed: ['technology_stack', 'ingestion_rules', 'data_rules', 'design_rules', 'sovereignty_rules', 'ai_rules', 'testing_rules', 'anti_patterns']
status: 'updated'
rule_count: 32
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Framework:** Next.js 15.1.x (App Router)
- **Runtime:** React 19 (Concurrent Mode)
- **Styling:** Tailwind CSS v4 + Shadcn UI
- **Database:** Local PostgreSQL 16+ with `pgvector(1536)`
- **ORM:** Drizzle ORM (latest stable)
- **AI Orchestration:** Vercel AI SDK v4 (@ai-sdk/google)
- **LLM:** Google Gemini 1.5 Pro
- **Auth:** Auth.js v5 (NextAuth successor, self-hosted)
- **State Management:** Zustand (for client-side Kanban logic)
- **Ingestion Engine:** Crawlee (TypeScript) + Apify SDK
- **Scraper Engines:** Playwright (High-fidelity), Cheerio (Cost-optimized aggregators)
- **CI/CD:** GitHub Actions + Apify CLI
- **Build Tool:** Turbopack
- **Testing:** Vitest (Unit) + Playwright (E2E)

---

## Critical Implementation Rules

### ⚛️ Next.js 15 & React 19 Rules
- **Leaf-Interactivity Only:** All data fetching and complex grounding logic MUST happen in Server Components. Only atomic components (e.g., `<ShimmerCard />`) can be Client Components.
- **Boundary Control:** Mandatory use of `experimental: { serverComponentsExternalPackages: ["@google/generative-ai"] }` in `next.config.ts`.
- **Next.js 15 Actions:** All mutations must use Server Actions returning `{ data: T | null, error: string | null }`.
- **React 19 Hooks:** Prefer `useActionState` and `useOptimistic` for all form and card interactions. Use `startTransition` for Kanban state updates.

### 🕷️ Ingestion & Scraper Optimization Rules
- **"Cheerio-First" Fallback:** Always implement a Cheerio-based scraper logic first for simple aggregators. Only use Playwright if JS rendering or complex anti-bot measures are required. This saves 20x on Apify Compute Units.
- **Standby UI Integration:** The ingestion dashboard MUST use Apify's **Actor Standby** mode via SSE to display real-time progress to the user.
- **Resource Quotas:** Standardize Playwright actors at **4096MB** (1 CPU core) and Cheerio actors at **512MB** to ensure performance consistency.
- **Migration & Persistence:** All stateful scrapers MUST implement `Actor.events` on `migrating` calls to persist current progress (RequestQueue/KVStore) before the process restarts.

### 🧬 Data & pgvector Precision
- **Atomic Embedding Schema:** Every `schema.ts` with a vector column MUST include a comment defining the fields included in the embedding. Update the embedding action whenever these fields change.
- **Dimension Check:** All vector columns must be initialized as `vector(1536)` (for Gemini).
- **Automated Flow:** Use the `apify/pgvector-integration` actor for bulk data movement from scrapers to the local Postgres instance.
- **Anonymized RAG:** Use `sanitizeForAi(data)` utility to redact PII before sending context windows to Gemini.

### 💎 Liquid Glass & Performance Patterns
- **Tokenized Blurs:** Use ONLY custom Tailwind tokens (`bg-glass-sm`, `bg-glass-md`, `bg-glass-lg`). Raw CSS blurs are forbidden.
- **Animation Limit:** Max 3 active glass-shimmer animations per viewport to ensure 60fps on mobile.

### 🔒 Local Sovereignty & Auth
- **Zero-PII Egress:** Never send PII to external services. All user identity and sessions MUST remain in the local Postgres instance via the Drizzle adapter.
- **Secret Protocol:** Scraper API tokens and database URIs must be stored in specialized GitHub Secrets and injected via `PROJECT_ACCESS_TOKEN` in the Apify environment.

### ⚡ AI Orchestration & Grounding
- **SSE Streaming:** Mandatory SSE via `streamText` for AI tasks > 2s.
- **Status Tokens:** Streams must emit `thinking`, `mapping`, `grounding`, `complete`.
- **Grounding Link:** Every AI-generated claim MUST be wrapped in `<GroundingLink />` with a valid `source_id` mapped from the original scraped metadata.

### 🧪 Testing & Quality
- **Daily Scraper Health:** Implement recurring Jasmine tests (via Apify Actor Testing) to verify dataset consistency and output schema compliance.
- **Grounding Verification:** Vitest tests must verify `source_id` assignment in tailoring outputs.
- **Performance Gates:** Playwright E2E tests must verify UI responsiveness during AI streaming.

### 🚨 Critical Anti-Patterns
- **🚫 No feature-level Client Components.**
- **🚫 No manual IP rotation (use Apify Proxy).**
- **🚫 No polling for AI or Scraper status (use SSE/Webhooks).**
- **🚫 No raw backdrop-filters.**
- **🚫 No legacy NextAuth patterns (use Auth.js v5).**

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code.
- Follow ALL rules exactly as documented.
- When in doubt, prefer the more restrictive option (e.g., Server Components over Client).
- Update this file if new architectural patterns are established.

**For Humans:**
- Keep this file lean and focused on agent-enforceable rules.
- Review quarterly to remove rules that have become "obvious" to the model.
- Update immediately if changing core technologies (e.g., switching AI providers).

Last Updated: 2026-01-24
