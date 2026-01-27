/**
 * Base Styles and Typography Tokens for ATS-Friendly Resume Templates
 * 
 * These shared tokens ensure consistency across all templates while
 * maintaining ATS compatibility (single-column, no graphics, text-only)
 */

// ============================================================================
// TYPOGRAPHY SCALE (ATS-Friendly Font Sizes)
// ============================================================================

export const FONT_SIZES = {
    // Name/Header: 24-36pt equivalent
    name: {
        sm: "text-xl",      // ~20px
        md: "text-2xl",     // ~24px
        lg: "text-3xl",     // ~30px
        xl: "text-4xl",     // ~36px
    },
    // Section Headings: 12-14pt equivalent
    heading: {
        sm: "text-xs",      // ~12px
        md: "text-sm",      // ~14px
        lg: "text-base",    // ~16px
    },
    // Body Text: 10-12pt equivalent
    body: {
        sm: "text-xs",      // ~12px (compact)
        md: "text-sm",      // ~14px (standard)
    },
    // Sub-details
    caption: "text-xs",     // ~12px
} as const;

// ============================================================================
// LINE HEIGHT (Readability)
// ============================================================================

export const LINE_HEIGHTS = {
    tight: "leading-tight",     // 1.25
    snug: "leading-snug",       // 1.375
    normal: "leading-normal",   // 1.5
    relaxed: "leading-relaxed", // 1.625
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const SPACING = {
    // Between major sections (Experience, Education, etc.)
    sectionGap: {
        compact: "mb-4",
        standard: "mb-6",
        generous: "mb-8",
    },
    // Between entries within a section
    entryGap: {
        compact: "mb-2",
        standard: "mb-4",
        generous: "mb-6",
    },
    // Between lines within an entry
    lineGap: {
        tight: "mb-0.5",
        standard: "mb-1",
        relaxed: "mb-2",
    },
} as const;

// ============================================================================
// SECTION DIVIDER STYLES
// ============================================================================

export const SECTION_DIVIDERS = {
    none: "",
    borderBottom: "border-b border-gray-300 pb-1",
    doubleLine: "border-b-2 border-double border-gray-400 pb-1",
    dottedLine: "border-b border-dotted border-gray-300 pb-1",
    leftAccent: "border-l-4 border-gray-400 pl-3",
} as const;

// ============================================================================
// CONTAINER STYLES
// ============================================================================

export const CONTAINER = {
    // Paper dimensions (A4 approximation for web preview)
    // A4: 210mm x 297mm ≈ 794px x 1123px at 96dpi
    paper: {
        minHeight: "min-h-[1100px]",
        maxWidth: "max-w-[800px]",
    },
    // Margins (1-inch standard margins)
    margins: {
        compact: "p-8 md:p-10",      // ~0.75 inch
        standard: "p-10 md:p-12",    // ~1 inch
        generous: "p-12 md:p-16",    // ~1.25 inch
    },
} as const;

// ============================================================================
// FONT FAMILIES (ATS-Friendly Fonts)
// ============================================================================

// Note: Using system fonts and web-safe fonts for maximum compatibility
// Custom fonts should be loaded via Next.js font optimization

export const FONT_FAMILIES = {
    // Sans-serif options (modern, clean)
    sansSerif: "font-sans",  // Uses Inter from layout.tsx or system sans-serif

    // Serif options (traditional, professional)
    // Georgia is web-safe and widely supported
    serif: "font-serif",

    // Monospace (for technical resumes - use sparingly)
    mono: "font-mono",
} as const;

// ============================================================================
// COLOR PALETTES (Print-Friendly, High Contrast)
// ============================================================================

export const COLORS = {
    // Default (Classic) - Black and gray
    classic: {
        heading: "text-gray-900",
        body: "text-gray-700",
        muted: "text-gray-500",
        accent: "text-gray-600",
        border: "border-gray-300",
    },
    // Modern - Slightly softer blacks
    modern: {
        heading: "text-gray-800",
        body: "text-gray-600",
        muted: "text-gray-500",
        accent: "text-blue-700",
        border: "border-gray-200",
    },
    // Minimalist - Pure black and white
    minimalist: {
        heading: "text-black",
        body: "text-gray-800",
        muted: "text-gray-600",
        accent: "text-black",
        border: "border-gray-300",
    },
    // Executive - Deep, authoritative
    executive: {
        heading: "text-gray-900",
        body: "text-gray-700",
        muted: "text-gray-500",
        accent: "text-gray-800",
        border: "border-gray-400",
    },
} as const;

// ============================================================================
// TEMPLATE PRESETS
// ============================================================================

export const TEMPLATE_PRESETS = {
    classic: {
        fonts: FONT_FAMILIES.serif,
        colors: COLORS.classic,
        nameSize: FONT_SIZES.name.lg,
        headingSize: FONT_SIZES.heading.md,
        bodySize: FONT_SIZES.body.md,
        lineHeight: LINE_HEIGHTS.relaxed,
        sectionGap: SPACING.sectionGap.standard,
        entryGap: SPACING.entryGap.standard,
        margins: CONTAINER.margins.generous,
        sectionDivider: SECTION_DIVIDERS.borderBottom,
    },
    modern: {
        fonts: FONT_FAMILIES.sansSerif,
        colors: COLORS.modern,
        nameSize: FONT_SIZES.name.lg,
        headingSize: FONT_SIZES.heading.sm,
        bodySize: FONT_SIZES.body.md,
        lineHeight: LINE_HEIGHTS.normal,
        sectionGap: SPACING.sectionGap.standard,
        entryGap: SPACING.entryGap.standard,
        margins: CONTAINER.margins.standard,
        sectionDivider: SECTION_DIVIDERS.leftAccent,
    },
    minimalist: {
        fonts: FONT_FAMILIES.sansSerif,
        colors: COLORS.minimalist,
        nameSize: FONT_SIZES.name.md,
        headingSize: FONT_SIZES.heading.sm,
        bodySize: FONT_SIZES.body.md,
        lineHeight: LINE_HEIGHTS.relaxed,
        sectionGap: SPACING.sectionGap.generous,
        entryGap: SPACING.entryGap.generous,
        margins: CONTAINER.margins.generous,
        sectionDivider: SECTION_DIVIDERS.none,
    },
    executive: {
        fonts: FONT_FAMILIES.serif,
        colors: COLORS.executive,
        nameSize: FONT_SIZES.name.xl,
        headingSize: FONT_SIZES.heading.lg,
        bodySize: FONT_SIZES.body.md,
        lineHeight: LINE_HEIGHTS.relaxed,
        sectionGap: SPACING.sectionGap.generous,
        entryGap: SPACING.entryGap.standard,
        margins: CONTAINER.margins.generous,
        sectionDivider: SECTION_DIVIDERS.doubleLine,
    },
    compact: {
        fonts: FONT_FAMILIES.sansSerif,
        colors: COLORS.classic,
        nameSize: FONT_SIZES.name.md,
        headingSize: FONT_SIZES.heading.sm,
        bodySize: FONT_SIZES.body.sm,
        lineHeight: LINE_HEIGHTS.snug,
        sectionGap: SPACING.sectionGap.compact,
        entryGap: SPACING.entryGap.compact,
        margins: CONTAINER.margins.compact,
        sectionDivider: SECTION_DIVIDERS.dottedLine,
    },
} as const;

export type TemplatePresetKey = keyof typeof TEMPLATE_PRESETS;
