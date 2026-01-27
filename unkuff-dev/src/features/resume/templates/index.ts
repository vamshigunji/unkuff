// Template component exports
export { ClassicTemplate, SectionTitle } from "./classic";
export { ModernTemplate, ModernSectionTitle } from "./modern";
export { MinimalistTemplate, MinimalistSectionTitle } from "./minimalist";
export { ExecutiveTemplate, ExecutiveSectionTitle } from "./executive";
export { CompactTemplate, CompactSectionTitle } from "./compact";

// Base styles exports for custom templates
export * from "./base-styles";

// Template registry for easy selection
export const TEMPLATES = {
    classic: {
        id: "classic",
        name: "Classic",
        description: "Traditional, professional design with centered header and clear sections",
        bestFor: "Corporate, Finance, Law, Healthcare",
        preview: "Clean serif typography with bottom-bordered section headings",
    },
    modern: {
        id: "modern",
        name: "Modern",
        description: "Contemporary design with left-aligned layout and subtle accent colors",
        bestFor: "Tech, Startups, Marketing, Digital roles",
        preview: "Sans-serif typography with left accent lines on sections",
    },
    minimalist: {
        id: "minimalist",
        name: "Minimalist",
        description: "Maximum whitespace with centered, clean typography",
        bestFor: "Creative, Design, UX, Consulting roles",
        preview: "Generous spacing, no dividers, centered content",
    },
    executive: {
        id: "executive",
        name: "Executive",
        description: "Authoritative design emphasizing leadership and achievements",
        bestFor: "C-Suite, Directors, Senior Managers, VP roles",
        preview: "Serif typography, double-line dividers, prominent headings",
    },
    compact: {
        id: "compact",
        name: "Compact",
        description: "Information-dense layout for extensive experience",
        bestFor: "Academia, Engineering, Technical roles",
        preview: "Smaller fonts, tight spacing, dotted dividers",
    },
} as const;

export type TemplateId = keyof typeof TEMPLATES;

// Template component map for dynamic rendering
export const TEMPLATE_COMPONENTS = {
    classic: "ClassicTemplate",
    modern: "ModernTemplate",
    minimalist: "MinimalistTemplate",
    executive: "ExecutiveTemplate",
    compact: "CompactTemplate",
} as const;
