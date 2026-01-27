---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ['_bmad-output/planning-artifacts/project-context.md', '_bmad-output/planning-artifacts/prd.md']
date: '2026-01-24'
author: 'Venkatavamshigunji'
---

# Product Brief: unkuff

## Executive Summary

Unkuff is an AI-first "Career DevOps" platform designed to transform the job application process from a multi-hour manual scramble into a high-precision, automated workflow. By leveraging advanced AI to analyze job descriptions against candidate experience, Unkuff provides hyper-relevant "High-Fit" recommendations and automates the tailoring of ATS-optimized resumes. The platform serves as a unified command center (Kanban) where professionals can manage their entire journey—from discovery to negotiation—reducing the time-to-apply from 4-5 hours to mere minutes while significantly increasing the likelihood of securing an interview.

---

## Core Vision

### Problem Statement
Professionals today face a crushing "Application Overhead": a single, high-quality job application takes between 3 to 4 hours of manual labor to perfectly tailor a resume and achieve a competitive ATS score.

### Problem Impact
This manual friction leads to "Application Fatigue," where qualified candidates either apply with generic resumes (resulting in low callback rates) or limit their opportunities due to the sheer time cost of tailoring. Furthermore, existing platforms like LinkedIn rely on shallow keyword matching, frequently presenting irrelevant roles that further waste candidate time and mental energy.

### Why Existing Solutions Fall Short
Mainstream job boards are "Search-First," not "Fit-First." They prioritize keyword density over the semantic alignment of a candidate’s actual experience with a role’s requirements. Additionally, they provide the *leads* but abandon the candidate for the most difficult part: the high-stakes tailoring and pipeline management.

### Proposed Solution
Unkuff is a "One-Stop Shop" for the modern job seeker. It replaces keyword searching with AI-driven "Experience-to-Role" analysis to surface only high-probability matches. It then uses its AI-first foundation to instantly generate resumes that are perfectly grounded in the candidate's truth while maximizing ATS scores. All activity is visualized in a persistent "Liquid Glass" Kanban board, providing full transparency across the recommendation, application, and interview pipeline.

### Key Differentiators
- **AI-First Foundation:** Unlike legacy boards with AI bolt-ons, Unkuff is architected around AI-driven relevance from the ground up.
- **High-Fit Discovery:** Moves beyond keywords to analyze the semantic relevance between a candidate’s specific experience and a job’s nuanced requirements.
- **Closed-Loop "Career DevOps":** Combines discovery, tailoring, and tracking into a single, cohesive experience.
- **Efficiency Transformation:** A radical 98% reduction in application time (4-5 hours down to <5 minutes).

---

## Target Users

### Primary Users

#### **The Efficiency-Driven Professional (e.g., "Alex")**
- **Context:** A mid-to-senior level professional who values their time above all else. They treat their career like a product and expect "DevOps-level" efficiency in their job search.
- **Motivations:** Maximizing "Return on Effort." They want to eliminate the 4-hour manual tailoring process and focus only on roles where they have a high-probability "Fit Score."
- **Problem Experience:** Exhausted by the "spray and pray" method. They currently use messy spreadsheets and browser bookmarks to track applications, leading to missed follow-ups and "Application Fatigue."
- **Success Vision:** A "Liquid Glass" dashboard that presents a curated list of High-Fit roles. They see the job, confirm the 95% suitablity score, and click "Tailor & Apply" to finish a perfect application in minutes.

#### **The Strategic Career Transitioner (e.g., "Jordan")**
- **Context:** Someone looking to pivot industries or level up. They have the experience but struggle to "translate" their skills for new ATS filters and recruiter expectations.
- **Motivations:** Overcoming the "ATS Black Hole." They need AI to help them communicate their existing value in the language of a new role.
- **Success Vision:** Using Unkuff’s AI matching to discover roles they didn't realize they were qualified for, and receiving a tailored resume that bridges their experience gap with semantic precision.

### User Journey

1. **The Grounding (Onboarding):** User establishes their "Master Profile" (Source of Truth). AI analyzes their history to build a semantic map of their expertise.
2. **The Curated Insight (Discovery):** User visits the dashboard. Instead of a search bar, they are met with a "High-Fit Recommendation" column. Each job card features a Suitability Score.
3. **The Aha! Moment (Tailoring):** User selects a role. The AI generates an ATS-optimized resume (>95% score) that is strictly grounded in their Master Profile. What used to take 4 hours now takes seconds.
4. **The Pipeline Command (Management):** User clicks "Apply" and moves the card to the "Applied" column in the Kanban board. The visual shift from "Recommended" to "Applied" provides a sense of career sovereignty.
5. **Continuous Optimization:** The system tracks invitations and callback data, refining the recommendation engine to surface even better "High-Fit" roles over time.

---

## Success Metrics

Success for unkuff is defined by the velocity and precision of the "Career DevOps" pipeline. We measure value by how effectively the system converts a job recommendation into a high-quality, ATS-optimized application.

### Business Objectives
- **Establish Pipeline Authority:** Within the first 3 months, users should view Unkuff as their primary command center for all job search activities.
- **Precision Validation:** Achieve a 50% conversion rate from "Recommended" cards to "Applied" cards, validating the accuracy of our AI-driven Fit-Scoring.
- **Cost-to-Value Transformation:** Radically decrease the "time-cost" of applying, proving that AI-first automation can deliver 4+ hours of value in under 5 minutes.

### Key Performance Indicators (KPIs)
- **Pipeline Conversion Rate:** >50% of recommended "High-Fit" jobs must be moved by the user to the "Applied" phase.
- **Tailoring Efficiency:** Average time from "Select Job" to "Tailored Resume Export" must be < 45 seconds.
- **ATS Suitability Floor:** 100% of AI-generated resumes must achieve a suitability score of >95% against the job description.
- **Weekly Application Velocity:** Active users should complete an average of 5+ tailored applications per week.
- **Kanban Fluidity:** 90% of active job cards should show movement between status columns (Recommended -> Applied -> Interviewing) every 7 days.

---

## MVP Scope

### Core Features
- **Progressive "High-Fit" Discovery:** Broad aggregator results in <2s, followed by deep site scraping (LinkedIn/Indeed) that populates the Kanban progressively via SSE. 
- **Streaming AI Tailoring:** Multi-pass tailoring that shows the resume "building" in real-time, completing in <45s with a >95% ATS score.
- **Optimized Liquid Glass (Tailwind v4):** A premium, immersive Kanban experience using performance-tuned glass tokens (`bg-glass-md`) that ensure 60fps across desktop and mobile viewports.
- **Master Profile "Truth Source":** Persistent data store for PII-anonymized candidate experience used as the grounding anchor for all AI tasks.
- **Atomic Foundational Editor:** A clean, high-speed review interface focusing on "Approve Highlighted Changes" to maintain the 5-minute application goal.

### Out of Scope for MVP
- **Auto-Apply Browser Extensions:** Intentionally omitted to focus on the core discovery and tailoring experience.
- **Multi-Format Export (DOCX):** Focus is strictly on standard PDF for day one.
- **Advanced Rich-Text Editor:** Interactive in-app editing with specialized formatting is deferred to Phase II.
- **Extended Template Library:** MVP will launch with 1-2 high-precision, ATS-optimized templates.

### MVP Success Criteria
- **Discovery Latency:** Aggregated results appear in < 2 seconds.
- **Tailoring Accuracy:** 100% of generated PDFs pass a 95% ATS suitability check upon launch.
- **Visual "Wow" Factor:** Successful implementation of the Liquid Glass UI across all core dashboard interactions without performance degradation.

### Future Vision
- **AI Career Agent:** Evolution from a recommendation tool to an active agent that can simulate interviews and negotiate offer terms.
- **The unkuff Community:** A peer-vetted space for job seekers to share "High-Fit" leads and interview strategies.
- **Interview Training Suite:** Integrated AI mock interviews and coaching based on specific job descriptions in the user's Kanban.
- **Multi-Market Expansion:** Expanding the engine beyond standard professional roles into hyper-specialized domains.
