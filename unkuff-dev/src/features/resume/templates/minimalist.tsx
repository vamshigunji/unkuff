import type { ResumeData } from "../types";
import { cn } from "@/lib/utils";
import { TEMPLATE_PRESETS, CONTAINER } from "./base-styles";

interface MinimalistTemplateProps {
    data: ResumeData;
    className?: string;
}

/**
 * Minimalist Resume Template
 * 
 * Maximum whitespace, essential information only:
 * - Clean sans-serif typography
 * - No divider lines (whitespace creates structure)
 * - Centered header with inline contact
 * - Generous spacing between sections
 * - ATS-friendly single-column structure
 * 
 * Best for: Creative, Design, UX, Consulting roles
 */
export function MinimalistTemplate({ data, className }: MinimalistTemplateProps) {
    const { contact, summary, experience, education, skills, certifications } = data;
    const preset = TEMPLATE_PRESETS.minimalist;

    return (
        <div className={cn(
            "bg-white text-gray-800",
            preset.fonts,
            preset.margins,
            CONTAINER.paper.minHeight,
            "shadow-lg",
            className
        )}>
            {/* Header / Contact Section - Centered, Minimal */}
            <header className="text-center mb-12">
                <h1 className={cn(
                    preset.nameSize,
                    "font-light tracking-wide",
                    preset.colors.heading,
                    "mb-4"
                )}>
                    {contact.fullName || "Your Name"}
                </h1>
                <div className={cn(
                    "flex flex-wrap justify-center items-center gap-x-3 gap-y-1",
                    "text-xs tracking-wide",
                    preset.colors.muted
                )}>
                    {contact.email && <span>{contact.email}</span>}
                    {contact.phone && (
                        <>
                            <span className="text-gray-300">·</span>
                            <span>{contact.phone}</span>
                        </>
                    )}
                    {contact.location && (
                        <>
                            <span className="text-gray-300">·</span>
                            <span>{contact.location}</span>
                        </>
                    )}
                </div>
            </header>

            {/* Professional Summary */}
            {summary && (
                <section className={preset.sectionGap}>
                    <MinimalistSectionTitle>Profile</MinimalistSectionTitle>
                    <p className={cn(
                        preset.bodySize,
                        preset.lineHeight,
                        preset.colors.body,
                        "text-center max-w-2xl mx-auto"
                    )}>
                        {summary}
                    </p>
                </section>
            )}

            {/* Work Experience */}
            {experience.length > 0 && (
                <section className={preset.sectionGap}>
                    <MinimalistSectionTitle>Experience</MinimalistSectionTitle>
                    <div className="space-y-6">
                        {experience.map((exp) => (
                            <div key={exp.id} className="experience-entry">
                                <div className="text-center mb-2">
                                    <h3 className={cn(
                                        "font-medium",
                                        preset.colors.heading
                                    )}>
                                        {exp.title}
                                    </h3>
                                    <p className={cn(
                                        "text-xs",
                                        preset.colors.muted
                                    )}>
                                        {exp.company}
                                        {exp.location && ` · ${exp.location}`}
                                        {" · "}
                                        {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                                    </p>
                                </div>
                                {exp.description && (
                                    <p className={cn(
                                        preset.bodySize,
                                        preset.colors.body,
                                        "text-center"
                                    )}>
                                        {exp.description}
                                    </p>
                                )}
                                {exp.accomplishments.length > 0 && (
                                    <ul className="mt-3 space-y-1">
                                        {exp.accomplishments.map((acc, idx) => (
                                            <li key={idx} className={cn(
                                                preset.bodySize,
                                                preset.colors.body,
                                                "flex"
                                            )}>
                                                <span className="mr-2 text-gray-400">—</span>
                                                <span>{acc}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education */}
            {education.length > 0 && (
                <section className={preset.sectionGap}>
                    <MinimalistSectionTitle>Education</MinimalistSectionTitle>
                    <div className="space-y-4">
                        {education.map((ed) => (
                            <div key={ed.id} className="text-center">
                                <h3 className={cn("font-medium", preset.colors.heading)}>
                                    {ed.degree}
                                    {ed.fieldOfStudy && `, ${ed.fieldOfStudy}`}
                                </h3>
                                <p className={cn("text-xs", preset.colors.muted)}>
                                    {ed.institution}
                                    {ed.endDate && ` · ${ed.endDate}`}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <section className={preset.sectionGap}>
                    <MinimalistSectionTitle>Skills</MinimalistSectionTitle>
                    <p className={cn(
                        preset.bodySize,
                        preset.colors.body,
                        "text-center"
                    )}>
                        {skills.join(" · ")}
                    </p>
                </section>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
                <section className={preset.sectionGap}>
                    <MinimalistSectionTitle>Certifications</MinimalistSectionTitle>
                    <div className="space-y-2 text-center">
                        {certifications.map((cert) => (
                            <p key={cert.id} className={cn(preset.bodySize, preset.colors.body)}>
                                <span className="font-medium">{cert.name}</span>
                                <span className={preset.colors.muted}> · {cert.issuer}</span>
                                {cert.issueDate && (
                                    <span className={preset.colors.muted}> · {cert.issueDate}</span>
                                )}
                            </p>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

/**
 * Minimalist section title - simple uppercase with no dividers
 */
export function MinimalistSectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className={cn(
            "text-xs font-medium uppercase tracking-[0.3em]",
            "text-gray-400",
            "text-center",
            "mb-6"
        )}>
            {children}
        </h2>
    );
}
