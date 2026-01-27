import type { ResumeData } from "../types";
import { cn } from "@/lib/utils";
import { TEMPLATE_PRESETS, CONTAINER } from "./base-styles";

interface CompactTemplateProps {
    data: ResumeData;
    className?: string;
}

/**
 * Compact Resume Template
 * 
 * Dense, information-rich design:
 * - Smaller font sizes for more content per page
 * - Tight line spacing
 * - Dotted line dividers
 * - Left-aligned, efficient layout
 * - ATS-friendly single-column structure
 * 
 * Best for: Academia, Engineering, Technical roles with extensive experience
 */
export function CompactTemplate({ data, className }: CompactTemplateProps) {
    const { contact, summary, experience, education, skills, certifications } = data;
    const preset = TEMPLATE_PRESETS.compact;

    return (
        <div className={cn(
            "bg-white text-gray-800",
            preset.fonts,
            preset.margins,
            CONTAINER.paper.minHeight,
            "shadow-lg",
            className
        )}>
            {/* Header / Contact Section - Compact, Single Line */}
            <header className="mb-4 pb-2 border-b border-gray-300">
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline">
                    <h1 className={cn(
                        preset.nameSize,
                        "font-bold",
                        preset.colors.heading
                    )}>
                        {contact.fullName || "Your Name"}
                    </h1>
                    <div className={cn(
                        "flex flex-wrap items-center gap-2 mt-1 md:mt-0",
                        "text-xs",
                        preset.colors.muted
                    )}>
                        {contact.email && <span>{contact.email}</span>}
                        {contact.phone && (
                            <>
                                <span>•</span>
                                <span>{contact.phone}</span>
                            </>
                        )}
                        {contact.location && (
                            <>
                                <span>•</span>
                                <span>{contact.location}</span>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Summary - Brief */}
            {summary && (
                <section className={preset.sectionGap}>
                    <CompactSectionTitle>Summary</CompactSectionTitle>
                    <p className={cn(
                        preset.bodySize,
                        preset.lineHeight,
                        preset.colors.body
                    )}>
                        {summary}
                    </p>
                </section>
            )}

            {/* Experience - Dense */}
            {experience.length > 0 && (
                <section className={preset.sectionGap}>
                    <CompactSectionTitle>Experience</CompactSectionTitle>
                    <div className="space-y-2">
                        {experience.map((exp) => (
                            <div key={exp.id} className="experience-entry">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline">
                                    <div className="flex flex-wrap items-baseline gap-x-2">
                                        <h3 className={cn("font-semibold", preset.colors.heading)}>
                                            {exp.title}
                                        </h3>
                                        <span className={cn(preset.bodySize, preset.colors.muted)}>
                                            at {exp.company}
                                            {exp.location && `, ${exp.location}`}
                                        </span>
                                    </div>
                                    <span className={cn(
                                        "text-xs",
                                        preset.colors.muted,
                                        "whitespace-nowrap"
                                    )}>
                                        {exp.startDate}–{exp.isCurrent ? "Present" : exp.endDate}
                                    </span>
                                </div>
                                {exp.accomplishments.length > 0 && (
                                    <ul className="mt-1 ml-4">
                                        {exp.accomplishments.map((acc, idx) => (
                                            <li key={idx} className={cn(
                                                preset.bodySize,
                                                preset.lineHeight,
                                                preset.colors.body,
                                                "list-disc"
                                            )}>
                                                {acc}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education - Inline */}
            {education.length > 0 && (
                <section className={preset.sectionGap}>
                    <CompactSectionTitle>Education</CompactSectionTitle>
                    <div className="space-y-1">
                        {education.map((ed) => (
                            <div key={ed.id} className="flex flex-col md:flex-row md:justify-between">
                                <div className={cn(preset.bodySize)}>
                                    <span className={cn("font-semibold", preset.colors.heading)}>
                                        {ed.degree}
                                    </span>
                                    {ed.fieldOfStudy && (
                                        <span className={preset.colors.body}>, {ed.fieldOfStudy}</span>
                                    )}
                                    <span className={preset.colors.muted}>
                                        {" "}— {ed.institution}
                                    </span>
                                </div>
                                <span className={cn("text-xs", preset.colors.muted)}>
                                    {ed.endDate}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills - Inline List */}
            {skills.length > 0 && (
                <section className={preset.sectionGap}>
                    <CompactSectionTitle>Technical Skills</CompactSectionTitle>
                    <p className={cn(preset.bodySize, preset.colors.body)}>
                        {skills.join(", ")}
                    </p>
                </section>
            )}

            {/* Certifications - Comma Separated */}
            {certifications.length > 0 && (
                <section className={preset.sectionGap}>
                    <CompactSectionTitle>Certifications</CompactSectionTitle>
                    <p className={cn(preset.bodySize, preset.colors.body)}>
                        {certifications.map((cert, idx) => (
                            <span key={cert.id}>
                                {cert.name} ({cert.issuer}
                                {cert.issueDate && `, ${cert.issueDate}`})
                                {idx < certifications.length - 1 && " • "}
                            </span>
                        ))}
                    </p>
                </section>
            )}
        </div>
    );
}

/**
 * Compact section title with dotted underline
 */
export function CompactSectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className={cn(
            "text-xs font-bold uppercase tracking-wide",
            "text-gray-700",
            "border-b border-dotted border-gray-300",
            "pb-1 mb-2"
        )}>
            {children}
        </h2>
    );
}
