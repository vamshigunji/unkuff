# STORY-4.4: PDF Generation Engine

## Goal
Provide users with a professional, ATS-optimized PDF export that perfectly matches the high-fidelity design they created in the cinematic editor.

## Problem Statement
A resume is useless if it cannot be downloaded and submitted. Standard browser "Print to PDF" often breaks the custom "Liquid Glass" styling, ruins margins, or makes the text unselectable for ATS machines. Users need a reliable "Single Click" export that is guaranteed to work.

## Acceptance Criteria
- [ ] Implement a server-side PDF generator using Puppeteer or a headless browser service.
- [ ] The engine must render the resume using the user's selected `templateId`.
- [ ] PDFs must be "Text-Selectable" (not images) to ensure ATS compatibility.
- [ ] Implement a "Download PDF" button that triggers the export and starts the file stream.
- [ ] **AC-JSON-VERIFY**: The export request must follow this structure:

### Input JSON (Export Request)
```json
{
  "action": "GENERATE_PDF",
  "payload": {
    "resume_id": "res-999",
    "template": "modern",
    "options": { "include_signatures": true, "paper_size": "A4" }
  }
}
```

### Output JSON (File Metadata)
```json
{
  "status": "complete",
  "url": "https://storage.unkuff.com/exports/res-999-final.pdf",
  "size_kb": 450,
  "pages": 1
}
```
