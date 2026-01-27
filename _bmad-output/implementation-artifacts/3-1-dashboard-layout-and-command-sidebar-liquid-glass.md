# Story 3.1: Dashboard Layout & Command Sidebar (Liquid Glass)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want a high-end, responsive dashboard layout with a left-docked command sidebar,
so that I have a professional-grade workstation for my career DevOps.

## Acceptance Criteria

1. **Liquid Glass Design Tokens**: Establish custom "Liquid Glass" tokens in Tailwind v4 (backdrop-blur: 40px, refraction stroke: 1px, opacity: 30%).
2. **Standardized Layout Shell**: Implement a reusable layout shell in `src/components/layout/dashboard-layout.tsx` with defined Sidebar and Main Content zones.
3. **Responsive Command Sidebar**: Implement a persistent left sidebar that collapses on mobile devices and supports high-density navigation.
4. **Visual Excellence**: All containers utilize the "Liquid Glass" effect with backdrop filters and subtle refraction strokes.
5. **Responsive Integrity**: The layout must maintain professional readability across Desktop (Power Station), Tablet, and Mobile (View-only feed).

## Tasks / Subtasks

- [x] Task 1: Initialize Design System & Tokens (AC: 1)
  - [x] Add `bg-glass-sm` and `bg-glass-lg` utilities to `app/globals.css`.
  - [x] Define the "Active Blue" and "Emerald Green" brand colors in the Tailwind theme.
- [x] Task 2: Implement Dashboard Layout Component (AC: 2, 5)
  - [x] Create `src/components/layout/dashboard-layout.tsx`.
  - [x] Implement the `Sidebar` and `MainContent` grid/flex structure.
- [x] Task 3: Develop Command Sidebar (AC: 3)
  - [x] Create `src/components/layout/sidebar.tsx`.
  - [x] Add navigation items placeholder (Discovery, Kanban, Profile, Settings).
  - [x] Implement mobile-responsive collapse logic.
- [x] Task 4: Apply Visual Polish (AC: 4)
  - [x] Apply `backdrop-blur-xl` and border refraction to main containers.
  - [x] Add subtle hover states to sidebar items.

## Dev Notes

- **Implementation Pattern**: Standardized Feature Folders concepts apply, but common layout goes in `src/components/layout`.
- **Styling**: Use Tailwind CSS v4 features. Note the `@theme` block in `globals.css`.
- **Aesthetic**: 40px backdrop-blur, 1px refraction stroke, 30% opacity.

### Project Structure Notes

- New folder: `src/components/layout/`
- Feature reference: Dashboard will eventually live in `src/features/dashboard/`.

### References

- [Source: planning-artifacts/epics.md#Story 3.1]
- [Source: planning-artifacts/prd.md#Phase II]

## Dev Agent Record

### Agent Model Used

Amelia (Developer Agent) / Gemini 1.5 Pro

### Debug Log References

No blocking issues encountered during implementation. Implementation was straightforward following Tailwind CSS v4 @utility pattern.

### Completion Notes List

**Implementation Summary (2026-01-24):**
- ✅ Established Liquid Glass design system in `globals.css` using Tailwind v4 @utility directives
- ✅ Implemented `bg-glass-sm` (20px blur, 10% opacity) and `bg-glass-lg` (40px blur, 20% opacity) utilities
- ✅ Created reusable `DashboardLayout` component with responsive grid structure (sidebar + main content)
- ✅ Built persistent command sidebar with high-density navigation, active link highlighting, and mobile-hidden behavior
- ✅ Applied glassmorphism effects to main content container with 40px backdrop blur and refraction borders
- ✅ Integrated brand colors: `active-blue` (oklch 0.585 0.233 277.117) and `emerald-green` (oklch 0.696 0.17 162.48)
- ✅ Achieved responsive layout supporting Desktop (power station), Tablet, and Mobile (view-only) viewports
- ✅ Added unit tests for layout rendering and glass effect application

**Technical Decisions:**
- Used Tailwind v4 `@theme inline` and `@utility` features for design tokens
- Sidebar set to `hidden lg:flex` - mobile users access via mobile header (view-only feed pattern)
- Employed `backdrop-filter: blur(40px)` with webkit prefix for cross-browser support
- Applied `oklch` color space for perceptually uniform brand colors

### File List

**New Files:**
- `src/components/layout/dashboard-layout.tsx` - Main dashboard layout component with glass container
- `src/components/layout/sidebar.tsx` - Command sidebar with navigation
- `src/components/layout/digital-background.tsx` - Animated background component
- `tests/dashboard-layout.test.tsx` - Unit tests for dashboard layout
- `tests/sidebar.test.tsx` - Unit tests for sidebar component (7 tests covering rendering, navigation, styling, responsiveness)

**Modified Files:**
- `src/app/globals.css` - Added Liquid Glass design tokens (`bg-glass-sm`, `bg-glass-lg`) and brand colors (`active-blue`, `emerald-green`)

## Change Log

- **2026-01-24**: Initial implementation complete - Dashboard layout with Liquid Glass design system, command sidebar, and responsive structure. Status: review
- **2026-01-24 (Code Review)**: Addressed code review findings - Added File List documentation, Completion Notes, Debug Log References, Change Log entry, and comprehensive sidebar test coverage (7 tests). Status: done
