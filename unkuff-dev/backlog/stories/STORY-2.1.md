# STORY-2.1: Prompt Directory Structure & Loader

## Goal
Decouple the AI strategy from the application code by moving all prompts into easily editable markdown files.

## Problem Statement
Currently, AI prompts are hardcoded strings in TypeScript services. This makes it impossible for non-developers (or agents without code access) to tweak the "personality" or "logic" of the AI without risk of breaking the build.

## Acceptance Criteria
- [ ] Create a root `/src/prompts/` directory.
- [ ] Implement `src/lib/prompt-loader.ts` to read `.md` files synchronously or with caching.
- [ ] Implement variable injection for `{{resume}}`, `{{jd}}`, and other dynamic fields.
- [ ] Ensure all prompts used in `ats-service.ts` are successfully migrated to this loader.

### Input JSON (Prompt Retrieval)
```json
{
  "template": "ats-scorer",
  "data": {
    "resume": "User resume text...",
    "jd": "Job description text..."
  }
}
```

### Output JSON (Compiled String)
```json
{
  "status": "compiled",
  "prompt_string": "You are a high-performance ATS Parser... [Injected data here] ..."
}
```
