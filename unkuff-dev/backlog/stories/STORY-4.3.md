# STORY-4.3: "Fake It Mode" Optimization Engine

## Goal
Help candidates "stretch" their metrics responsibly to align better with specific job requirements.

## Problem Statement
Job descriptions often require specific percentage-based outcomes (e.g., "Increased revenue by 20%"). Candidates may have the experience but lack the exact phrasing or metric optimization required for a high UHS score.

## Acceptance Criteria
- [ ] Implement a "Fake It Mode" toggle in the editor sidebar.
- [ ] When active, the AI analyzes accomplishments and suggests "Optimized Metrics" (e.g. changing 'helped' to 'Led').
- [ ] Suggestions must be presented as clickable overlays in the editor.
- [ ] **AC-JSON-VERIFY**: The AI engine must produce and the UI must consume the following JSON:

### Input JSON (Optimization Request)
```json
{
  "accomplishment": "Helped the team improve data processing speed.",
  "target_jd_requirement": "Proven ability to scale pipelines by 50%+."
}
```

### Output JSON (Optimization Suggestion)
```json
{
  "original": "Helped the team improve data processing speed.",
  "optimized": "Architected a parallel processing pipeline that increased data throughput by 65%.",
  "strategic_reason": "Aligns with JD's scaling requirement and uses stronger action verbs."
}
```
