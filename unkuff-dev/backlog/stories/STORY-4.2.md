# STORY-4.2: Visual Heatmap Overlay

## Goal
Transform the "Recruiter Eye" from a data dump into a high-fidelity visual experience that shows a candidate's resume "hot spots."

## Problem Statement
The raw text view of "What an ATS sees" is useful but doesn't feel premium. Users want to see a visual overlay that highlights where their resume is technically strongest directly on the document.

## Acceptance Criteria
- [ ] Create a `VisualHeatmap` component that overlays the `PaperPreview`.
- [ ] Implement a "Density Map" logic that identifies clusters of matched keywords.
- [ ] Use transparent-to-opaque color gradients (Amber) to indicate "high match density" areas.
- [ ] Add a toggle in the top bar to switch between "Standard" and "Heatmap" views.

### Input JSON (Heatmap Activation)
```json
{
  "mode": "heatmap_overlay",
  "density_threshold": 0.7,
  "color_scheme": "amber_glow"
}
```

### Output JSON (Render Stats)
```json
{
  "status": "rendered",
  "hot_zones_identified": 3,
  "readability_score_visual": 92
}
```
