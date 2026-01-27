---
id: 6-3
title: "Multi-Format PDF/DOCX Generation Logic"
epic: 6
priority: P1
status: done
created: 2026-01-25
assigned_to: dev-engineer
tags: [export, pdf, docx, generation, resume]
---

# Story 6.3: Multi-Format PDF/DOCX Generation Logic

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want the system to generate download-ready files in my chosen template's format,
So that I can apply via any standard external portal.

## Acceptance Criteria

1. **Given** an approved tailored resume draft
2. **When** the user clicks "Download PDF" or "Download DOCX"
3. **Then** a high-fidelity document is generated on the server using the active template's CSS
4. **And** the resulting file is returned to the user via browser download
5. **And** the file content is identical to the visual preview (Story 4.2).

## Tasks / Subtasks

- [x] Task 1: Set Up Document Generation Infrastructure
  - [x] Install PDF generation library (Puppeteer)
  - [x] Install DOCX generation library (docx v9.5.1)
  - [x] Create export functions in `src/features/resume/export-actions.ts`
  - [x] Define TypeScript types in `src/features/resume/types.ts`

- [x] Task 2: Implement PDF Generation Service
  - [x] Create `generatePdf()` function with Puppeteer
  - [x] Implement HTML-to-PDF rendering with template CSS
  - [x] Ensure exact match with visual preview
  - [x] Handle custom fonts (Inter, Georgia) via Google Fonts
  - [x] Add proper page breaks and A4 margins

- [x] Task 3: Implement DOCX Generation Service
  - [x] Create `generateDocx()` function using docx library
  - [x] Map resume sections to DOCX paragraphs
  - [x] Preserve formatting (bold, italic, bullet points)
  - [x] Handle template-specific styling
  - [x] Ensure ATS-friendly DOCX structure

- [x] Task 4: Create Export UI Components
  - [x] Implement `ExportButton` component with phases (idle, preparing, formatting, complete, error)
  - [x] Implement `ExportSection` container with download handling
  - [x] Add shimmer animation for loading states
  - [x] Add Truth Pulse animation for success states
  - [x] Integrate toast notifications

- [x] Task 5: Testing & Validation
  - [x] Create comprehensive unit tests (12 tests)
  - [x] Verify PDF magic bytes validation
  - [x] Verify DOCX ZIP structure
  - [x] Test all 5 template variations
  - [x] Test error handling for edge cases

## Dev Notes

### Implementation Summary
The PDF/DOCX export functionality was already fully implemented prior to story file creation:
- **PDF Generation:** Uses Puppeteer with headless Chrome for pixel-perfect CSS rendering
- **DOCX Generation:** Uses `docx` library for programmatic Word document creation
- **5 Templates:** classic, modern, minimalist, executive, compact
- **Server Actions:** Both return `{ data: string | null, error: string | null }` format

### File Structure
```
src/features/resume/
├── export-actions.ts        # Server actions for PDF/DOCX generation (778 lines)
├── export-actions.test.ts   # Comprehensive tests (220 lines, 12 tests)
├── components/
│   ├── export-button.tsx    # Button with shimmer/loading states
│   └── export-section.tsx   # Container with download trigger
├── types.ts                 # ResumeData and related types
└── templates/               # Template configurations
```

### Dependencies
- `puppeteer: ^24.36.0` - For PDF generation
- `docx: ^9.5.1` - For DOCX generation

## Dev Agent Record

### Agent Model Used
dev (Gemini)

### File List
- `src/features/resume/export-actions.ts` - PDF/DOCX generation server actions
- `src/features/resume/export-actions.test.ts` - Unit tests (12 passing)
- `src/features/resume/components/export-button.tsx` - Export button with states
- `src/features/resume/components/export-section.tsx` - Export container section
- `src/features/resume/types.ts` - TypeScript interfaces

### Completion Notes List
- ✅ PDF generation via Puppeteer with 5 template styles
- ✅ DOCX generation via docx library with ATS-friendly structure
- ✅ Base64 encoding for client download
- ✅ All 12 unit tests passing
- ✅ Glass-themed UI with shimmer and Truth Pulse animations
- ✅ Toast notifications for success/error feedback
- ✅ Story verified as pre-existing implementation (2026-01-25)
