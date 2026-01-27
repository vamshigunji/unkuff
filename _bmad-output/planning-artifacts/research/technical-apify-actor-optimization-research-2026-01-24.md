---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: []
workflowType: 'research'
lastStep: 1
research_type: 'technical'
research_topic: 'Apify Actor Optimization'
research_goals: 'Evaluate specific actors for cost vs. performance, technical robustness, and create a best practices guide for Epic 2 integration.'
user_name: 'Venkatavamshigunji'
date: '2026-01-24'
web_research_enabled: true
source_verification: true
---

# Research Report: technical

**Date:** 2026-01-24
**Author:** Venkatavamshigunji
**Research Type:** technical

---

## Research Overview

## Technical Research Scope Confirmation

**Research Topic:** Apify Actor Optimization
**Research Goals:** Evaluate specific actors for cost vs. performance, technical robustness, and create a best practices guide for Epic 2 integration.

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

---

## Technology Stack Analysis

### Programming Languages

Node.js and Python are the dominant languages for Apify Actor development, with dedicated SDKs provided by the platform. For the **unkuff** project, **TypeScript** is the recommended choice due to its strong typing, auto-completion, and full support within the modern Apify/Crawlee ecosystem.

- **Primary Choice: TypeScript/Node.js**: The Apify SDK and Crawlee are fully rewritten in TypeScript, offering superior type declarations and catching errors during development.
- **Evolution**: The shift from the legacy Apify SDK to `Crawlee` has made Node.js even more powerful for complex scraping tasks.
- **Performance**: Node.js's asynchronous nature is ideal for non-blocking I/O operations required during high-volume scraping.
- _Source: [apify.com](https://apify.com/docs/sdk/js/docs/guides/typescript), [github.com/apify/tsconfig](https://github.com/apify/tsconfig)_

### Development Frameworks and Libraries

The ecosystem has matured into a two-tier structure: logic-focused and platform-focused.

- **Crawlee**: The go-to open-source library for the actual crawling and scraping logic. It handles autoscaling, proxy management, and fingerprinted browsers (Playwright/Puppeteer).
- **Apify Client**: A lightweight library (`apify-client`) used primarily for interacting with the Apify API (triggering actors, fetching results).
- **Ecosystem Maturity**: High. Extensive community support and standardized templates make it the "gold standard" for professional scraping.
- _Source: [crawlee.dev](https://crawlee.dev/), [npmjs.com/package/apify-client](https://www.npmjs.com/package/apify-client)_

### Database and Storage Technologies

Apify provides native serverless storage that integrates tightly with Actors, but external SQL storage is required for long-term persistence in unkuff.

- **Native Storage**:
  - **Datasets**: Optimized for structured scraping results.
  - **Request Queues**: Maintains URLs for recursive crawling.
  - **Key-Value Stores**: For state management and binary assets.
- **External Integration (PostgreSQL + pgvector)**:
  - **pgvector-integration Actor**: Apify offers a specialized integration (`apify/pgvector-integration`) that automates the flow from scraping -> embedding generation (Gemini/OpenAI) -> PostgreSQL/pgvector storage.
- _Source: [apify.com/storage](https://docs.apify.com/storage), [apify.com/apify/pgvector-integration](https://apify.com/apify/pgvector-integration)_

### Development Tools and Platforms

The development workflow is designed for local-to-cloud parity.

- **Apify CLI**: The primary tool for creating, building (`apify build`), and deploying (`apify push`) actors.
- **Docker**: Every Actor is a Docker image. Optimized base images provided by Apify (e.g., `apify/actor-node-puppeteer-chrome`) reduce startup time and image size.
- **Unit Testing**: Integrated with standard frameworks like Jest or Vitest for local validation before deployment.
- _Source: [docs.apify.com/cli](https://docs.apify.com/cli), [hub.docker.com/u/apify](https://hub.docker.com/u/apify)_

### Cloud Infrastructure and Deployment

While Apify is a managed serverless platform, its architecture allows for cloud portability.

- **Apify Cloud**: Provides managed proxy rotation, scheduling, and automatic resource scaling.
- **Alternatives**: AWS Fargate or Google Cloud Run can host these Dockerized scrapers, but require custom proxy management and anti-blocking logic (e.g., integrating with Bright Data or Oxylabs).
- **Actor Standby**: A specialized mode that allows Actors to behave as real-time APIs for low-latency integrations.
- _Source: [apify.com/pricing](https://apify.com/pricing), [cloud.google.com/run](https://cloud.google.com/run)_

---

## Integration Patterns Analysis

### API Design Patterns

Apify Actors are primarily controlled and integrated via RESTful API design patterns, with support for both synchronous and asynchronous execution flows.

- **RESTful APIs**: The standard way to programmatically trigger Actor runs and retrieve data. Inputs are passed as JSON bodies in POST requests, while configuration is handled via query parameters.
- **Synchronous Runs**: For tasks completing in < 5 minutes, the `run-sync-get-dataset-items` endpoint allows for a simplified "request-response" pattern.
- **Asynchronous Patterns**: For longer-running tasks (common in deep-scraping), the system returns a `runId`, and the client polls the status until completion before fetching data.
- **Webhook Patterns**: Essential for event-driven architectures. Webhooks can trigger external POST requests to high-level automation platforms or custom endpoints upon run success, failure, or timeout.
- _Source: [apify.com/docs/api](https://docs.apify.com/api/v2), [apify.com/docs/webhooks](https://docs.apify.com/webhooks)_

### Communication Protocols

The platform relies on mature, web-standard protocols to ensure interoperability across different environments (local, cloud, AI agents).

- **HTTP/HTTPS**: The backbone of all API and Webhook communication, ensuring compatibility with virtually any modern language or framework.
- **Server-Sent Events (SSE)**: Utilized by tools like the Apify MCP Tester to provide real-time streaming updates from Actors.
- **Model Context Protocol (MCP)**: A growing standard used to expose Actors as tools directly to AI Agents and LLM frameworks.
- _Source: [apify.com/docs/platform/integrations/mcp](https://docs.apify.com/platform/integrations/mcp), [github.com/apify/apify-mcp-server](https://github.com/apify/apify-mcp-server)_

### Data Formats and Standards

JSON is the heart of the Apify ecosystem, used for everything from configuration to data extraction results.

- **JSON (JavaScript Object Notation)**: The universal format for `input_schema.json`, `actor.json`, and default dataset outputs.
- **Input/Output Schemas**: Structured JSON schemas define exactly what an Actor expects and what it will return, providing a "contract-first" development experience.
- **Export Standards**: While JSON is the default, the platform supports automated export to CSV, XML, RSS, and Excel for legacy system compatibility.
- _Source: [apify.com/docs/sdk/js/docs/guides/input-schema](https://docs.apify.com/sdk/js/docs/guides/input-schema), [apify.com/docs/storage/dataset](https://docs.apify.com/storage/dataset)_

### System Interoperability Approaches

Apify promotes a modular, microservice-like approach to scraper development through chaining and external connectors.

- **Actor-to-Actor Integration**: A native feature that allows chaining Actors (e.g., a "Search Actor" triggering a "Detail Scraper Actor") by passing dataset IDs as dynamic inputs.
- **API Gateway Patterns**: The Apify platform itself acts as a managed API Gateway, handling rate limiting, request routing, and authentication for all Actors.
- **Low-Code Connectors**: Out-of-the-box support for Zapier, Make (formerly Integromat), and n8n for rapid integration into business workflows.
- _Source: [apify.com/docs/platform/integrations](https://docs.apify.com/platform/integrations)_

### Event-Driven & Microservices Integration

For complex, enterprise-grade pipelines, Apify supports integration with industry-standard message brokers and distributed transaction patterns.

- **Kafka Integration**: Specialized Python APIs exist to stream data directly from Apify datasets to Kafka topics for real-time processing.
- **RabbitMQ**: Integrated via webhooks, where the "run completed" event triggers a publisher service to push a message onto a RabbitMQ queue.
- **Saga Pattern**: When multiple Actors are chained, the platform's retry logic and webhook failure notifications support distributed transaction management across scraper steps.
- **Circuit Breaker**: Managed by the Apify platform's internal state handling, preventing repeated execution of failing actors and providing status signals to the caller.
- _Source: [apify.com/docs/api/v2/kafka-integration](https://docs.apify.com/api/v2/kafka-integration)_

### Integration Security Patterns

Security is handled via multi-layered authentication and modern token-based auth.

- **API Key/Token Management**: All API access requires a secure personal token.
- **OAuth 2.0**: Used for third-party service connections (Google Drive, Dropbox, Slack).
- **JWT (JSON Web Tokens)**: Often used in downstream integrations to verify the identity of the user triggering the scraper.
- _Source: [apify.com/docs/platform/security](https://docs.apify.com/platform/security)_

---

## Architectural Patterns and Design

### System Architecture Patterns

Apify Actors are fundamentally **Serverless Microservices** encapsulated in Docker containers. This architecture provides a robust foundation for unkuff's ingestion engine.

- **Serverless Design**: Actors leverage managed infrastructure for CPU, RAM, and network, allowing unkuff to scale from zero to thousands of jobs without managing servers.
- **Modularity**: Each scraper or data processor functions as an independent bounded context.
- **Chaining Patterns**: 
  - **Metamorph**: Allows an Actor to "morph" into another while keeping the same Run ID and storage context—ideal for multi-stage job processing.
  - **Actor-to-Actor Integration**: The native platform feature for connecting scrapers to processors (e.g., Job Searcher -> Detail Scraper -> Vectorizer).
- _Source: [apify.com/docs/sdk/js/docs/guides/metamorph](https://docs.apify.com/sdk/js/docs/guides/metamorph), [docs.apify.com/platform/actors/running/microservices](https://docs.apify.com/platform/actors/running/microservices)_

### Design Principles and Best Practices

Professional Actor development follows a "Contract-First" and "Fail-Fast" philosophy.

- **Input Schema-driven UI**: Using `INPUT_SCHEMA.json` to generate clean, validated user interfaces for configuring searches.
- **Stateless Execution with Persistent Storage**: Actors remain stateless while offloading data to **Datasets** (for job listings) and **Key-Value Stores** (for state persistence like session cookies).
- **Modularity**: Decomposing complex scraping into single-responsibility Actors (e.g., one for LinkedIn, one for Indeed) to simplify maintenance when site selectors change.
- _Source: [apify.com/docs/sdk/js/docs/guides/input-schema](https://docs.apify.com/sdk/js/docs/guides/input-schema)_

### Scalability and Performance Patterns

Scalability is built into the request-queue model and parallel execution engine.

- **Parallel Processing**: Using an "Orchestrator Actor" to fan out multiple "Worker Actors" to scrape hundreds of pages simultaneously.
- **Request Queues**: Acts as a shared load-balancer between parallel runs, ensuring unique URL processing and deduplication at the edge.
- **Resource Profiling**: Allocating custom CPU/RAM quotas based on the target site complexity (e.g., Playwright needs more RAM than simple Cheerio scrapers).
- _Source: [crawlee.dev/docs/guides/scaling-and-resource-management](https://crawlee.dev/docs/guides/scaling-and-resource-management)_

### Integration and Communication Patterns

The system's interoperability is handled via standardized JSON contracts and event triggers.

- **Event-Driven Chaining**: Using Webhooks to trigger downstream actions (like updating unkuff's PostgreSQL) only when a scrape succeeds.
- **Shared State via KV Store**: Passing authentication sessions or interim results between chained actors via named Key-Value stores.
- _Source: [apify.com/docs/webhooks](https://docs.apify.com/webhooks)_

### Security Architecture Patterns

Security is managed through granular permissions and encrypted "Secret Inputs".

- **Granular Permissions**: "Limited" vs "Full" permissions ensure that even if an Actor is compromised, it only has access to its own specific data/storage.
- **Secret Input Encryption**: Sensitive data like API keys or passwords are encrypted using `aes-256-gcm` at the platform level and only decrypted within the secure Actor context.
- **SOC 2 & GDPR Compliance**: The underlying platform's compliance ensures unkuff's user data sovereignty is maintained.
- _Source: [apify.com/docs/platform/security](https://docs.apify.com/platform/security)_

### Data Architecture Patterns

Data is tiered from edge-storage to central-persistence.

- **Tier 1 (Edge)**: Apify Datasets for raw, unstructured scraped results.
- **Tier 2 (Central)**: Relational PostgreSQL (via `apify/pgvector-integration`) for structured, searchable job listings.
- **Incremental Updates**: Using content-hashes to ensure only *new* or *changed* job postings are pushed to the central database, reducing cost and noise.
- _Source: [apify.com/apify/pgvector-integration](https://apify.com/apify/pgvector-integration)_

### Deployment and Operations Architecture

Deployment is automated through Git and CLI tools.

- **CLI-driven CI/CD**: Using `apify push` within GitHub Actions to update Actors whenever the source code changes.
- **Base Image Optimization**: Maintaining custom-cached Docker layers for the unkuff scraper to ensure < 1s startup times.
- _Source: [docs.apify.com/cli](https://docs.apify.com/cli)_

---

---

## Implementation Approaches and Technology Adoption

### Technology Adoption Strategies

Migrating from custom scraping scripts to a comprehensive "Career DevOps" platform requires a phased adoption strategy.

- **Managed Migration**: Transitioning from fragile local scripts to **Managed Apify Actors** leveraging the `Crawlee` library. This shifts the burden of proxy rotation, browser fingerprinting, and complex I/O to the platform.
- **State Persistence during Migrations**: Utilizing the `Actor.events` listener to handle `migrating` and `persistState` events, ensuring that if an Actor is moved to a new server, it can resume from its last checkpoint without data loss.
- **Gradual Modernization**: Initial focus on high-fidelity scrapers for LinkedIn/Indeed using specialized actors, followed by a universal "Cheerio-first" fallback for smaller job boards to minimize costs.
- _Source: [apify.com/docs/sdk/js/docs/guides/state-persistence](https://docs.apify.com/sdk/js/docs/guides/state-persistence), [outrightcrm.com/apify-migration](https://outrightcrm.com/apify-migration)_

### Development Workflows and Tooling

A robust CI/CD pipeline is essential for maintaining the unkuff ingestion engine as target sites change their selectors.

- **GitHub Actions Integration**: Implementing the `apify/push-actor-action` to automatically rebuild and deploy Actors on every commit to the `main` branch.
- **Secret Management**: Storing Apify API tokens and database credentials strictly within **GitHub Secrets** and injecting them into the workflow at runtime.
- **Local-First Development**: Using the **Apify CLI** for local `apify run` testing before pushing to the cloud, ensuring high-fidelity parity between dev and prod.
- _Source: [github.com/apify/push-actor-action](https://github.com/apify/push-actor-action), [docs.apify.com/cli](https://docs.apify.com/cli)_

### Testing and Quality Assurance

Scraper quality is maintained through multi-layered automated validation.

- **Actor Testing Tool**: Utilizing the Jasmine-based testing tool within the Apify Store to perform daily "Health Checks" on dataset consistency and completion times.
- **Data Integrity Validation**: Implementing automated checks for non-empty datasets and deduplication logic using the "Results Checker" public actor.
- **Regression Monitoring**: Setting up platform alerts for "Failure Rates" and "Compute Unit Spikes" to detect target site changes immediately.
- _Source: [apify.com/apify/actor-testing](https://apify.com/apify/actor-testing), [apify.com/monitoring](https://docs.apify.com/monitoring)_

### Deployment and Operations Practices

Efficiency in production is measured by Compute Unit (CU) consumption and response latency.

- **Actor Standby Mode**: Employing Standby mode for real-time job lookups from the UI, minimizing "cold start" delays to < 1s.
- **Resource Management**: Allocating 4096MB of memory for browser-based scrapers (Playwright/Puppeteer) to secure 1 full CPU core, while using 512MB for Cheerio-based aggregators to conserve CUs.
- **Batch Processing**: Groups of job URLs should be processed in a single batch run to reuse browser instances and reduce start/stop overhead.
- _Source: [apify.com/docs/platform/actors/running/standby](https://docs.apify.com/platform/actors/running/standby)_

### Cost Optimization and Resource Management

Minimizing unkuff's operational burn is critical for sustainability.

- **"Cheerio-First" Pattern**: Always attempt to scrape via raw HTTP/Cheerio before falling back to expensive headless browsers. This can reduce CU consumption by up to 20x.
- **Caching Middlewares**: Implementing a caching layer for job listings to prevent re-scraping the same URL within a 24-hour window.
- **Spot Instance Awareness**: Leveraging Apify's internal scheduling to run non-critical batch jobs during lower platform-demand periods.
- _Source: [apify.com/pricing/compute-units](https://apify.com/pricing/compute-units)_

### Risk Assessment and Mitigation

| Risk | Mitigation Strategy |
| :--- | :--- |
| **IP Blocking** | Mandatory use of the Apify Proxy with residency-aware rotation. |
| **Selector Changes** | Automated recurring tests (Daily) with Slack alerts on dataset schema failures. |
| **Pll Leakage** | Enforcing "Limited Permissions" on all scraper actors; keeping PII in the local PostgreSQL only. |
| **Compute Unit Spikes** | Setting strict CU hard-limits per-user and per-run in the platform settings. |

---

## Technical Research Recommendations

### Implementation Roadmap

1.  **Level 1 (Foundation)**: Initialize the `apify-client` and `Crawlee` in the Next.js 15 backend; set up the GitHub Action for automated deployment.
2.  **Level 2 (Scraper Build)**: Implement modular actors for LinkedIn and Indeed using the **4096MB/Playwright** pattern for high-fidelity extraction.
3.  **Level 3 (Integration)**: Deploy the **pgvector-integration Actor** to automate the flow of job descriptions into unkuff's PostgreSQL instance.
4.  **Level 4 (Optimization)**: Transition the aggregators to **Cheerio-based** logic and implement **Actor Standby** for the real-time dashboard updates.

### Technology Stack Recommendations

- **Framework**: Crawlee (TypeScript)
- **Scraper Engines**: Playwright (for deep sites), Cheerio (for simple aggregators)
- **CI/CD**: GitHub Actions + Apify CLI
- **Monitoring**: Apify Platform Alerts + Slack Integration
- **Persistent Storage**: PostgreSQL + pgvector (external)

### Success Metrics and KPIs

- **Dataset Completion Rate**: > 98% (Success/Fail ratio of triggered runs).
- **Compute Unit Efficiency**: < 0.05 CU per successful job extraction.
- **Aggregator Latency**: < 3s for a 10-job real-time lookup (via Standby).
- **Schema Compliance**: 100% (No missing `title`, `company`, or `description` fields).

---

<!-- End of Technical Research Report -->
