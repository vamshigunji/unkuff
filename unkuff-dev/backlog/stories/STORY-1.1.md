# STORY-1.1: Click-to-Pulse Highlighting for Matched Keywords

## Goal
Enable users to quickly locate technical and soft skills in their resume by clicking the corresponding "Matched" keyword in the sidebar, triggering a visual "pulse" on the document.

## Problem Statement
Resumes are dense documents. When the sidebar indicates a keyword like "Data Science" is a match, users currently have to manually scan the entire document to find where that match was detected, which is slow and high-friction.

## Acceptance Criteria
- [ ] Implement a `highlight_keyword` event in the `AIResumeEditor`.
- [ ] Logic must identify the first occurrence of the exact keyword in the `contentEditable` area.
- [ ] The editor must perform a `scrollIntoView` with `smooth` behavior to center the keyword.
- [ ] The keyword must be wrapped in a temporary `<span>` with the CSS class `pulse-highlight`.
- [ ] The `pulse-highlight` class must trigger a 2-second background transition (Amber #ff8303 to transparent).
- [ ] The temporary `<span>` must be removed after the animation without breaking the text node structure.

### Input JSON
```json
{
  "action": "trigger_pulse",
  "payload": {
    "keyword": "Python",
    "type": "matched",
    "target_ref": "editor_canvas"
  }
}
```

### Output JSON
```json
{
  "status": "success",
  "data": {
    "instances_found": 1,
    "scrolled": true,
    "animation_duration_ms": 2000
  }
}
```
