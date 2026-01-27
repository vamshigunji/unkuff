import type { ResumeData } from "../types";
import { cn } from "@/lib/utils";
import { TEMPLATE_PRESETS, CONTAINER } from "./base-styles";

interface ExecutiveTemplateProps {
    data: ResumeData;
    className?: string;
}

/**
 * Executive Resume Template
 * 
 * Authoritative design for senior leadership:
 * - Serif typography (Georgia/Times) for gravitas
 * - Large name with all-caps styling option
 * - Double-line section dividers
 * - Emphasis on leadership and impact
 * - ATS-friendly single-column structure
 * 
 * Best for: C-Suite, Directors, Senior Managers, VP roles
 */
export function ExecutiveTemplate({ data, className }: ExecutiveTemplateProps) {
    const { contact, summary, experience, education, skills, certifications } = data;
    const preset = TEMPLATE_PRESETS.executive;

    return (
        <div className={cn(
            "bg-white text-gray-800",
            preset.fonts,
            preset.margins,
            CONTAINER.paper.minHeight,
            "shadow-lg",
            className
        )}>
            {/* Header / Contact Section - Grand, Authoritative */}
            <header className="text-center mb-10 pb-6 border-b-2 border-gray-300">
                <h1 className={cn(
                    preset.nameSize,
                    "font-bold uppercase tracking-widest",
                    preset.colors.heading,
                    "mb-3"
                )}>
                    {contact.fullName || "Your Name"}
                </h1>
                <div className={cn(
                    "flex flex-wrap justify-center items-center gap-4",
                    preset.bodySize,
                    preset.colors.muted
                )}>
                    {contact.email && <span>{contact.email}</span>}
                    {contact.phone && (
                        <>
                            <span className="text-gray-400">|</span>
                            <span>{contact.phone}</span>
                        </>
                    )}
                    {contact.location && (
                        <>
                            <span className="text-gray-400">|</span>
                            <span>{contact.location}</span>
                        </>
                    )}
                    {contact.linkedin && (
                        <>
                            <span className="text-gray-400">|</span>
                            <span>{contact.linkedin}</span>
                        </>
                    )}
                </div>
            </header>

            {/* Executive Summary */}
            {summary && (
                <section className={preset.sectionGap}>
                    <ExecutiveSectionTitle>Executive Summary</ExecutiveSectionTitle>
                    <p className={cn(
                        preset.bodySize,
                        preset.lineHeight,
                        preset.colors.body,
                        "italic"
                    )}>
                        {summary}
                    </p>
                </section>
            )}

            {/* Professional Experience */}
            {experience.length > 0 && (
                <section className={preset.sectionGap}>
                    <ExecutiveSectionTitle>Professional Experience</ExecutiveSectionTitle>
                    <div className="space-y-6">
                        {experience.map((exp) => (
                            <div key={exp.id} className="experience-entry">
                                <div className="mb-2">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-baseline">
                                        <h3 className={cn(
                                            "text-lg font-bold uppercase tracking-wide",
                                            preset.colors.heading
                                        )}>
                                            {exp.title}
                                        </h3>
                                        <span className={cn(
                                            "text-sm font-medium",
                                            preset.colors.muted
                                        )}>
                                            {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        preset.bodySize,
                                        "font-semibold",
                                        preset.colors.accent
                                    )}>
                                        {exp.company}
                                        {exp.location && `, ${exp.location}`}
                                    </p>
                                </div>
                                {exp.description && (
                                    <p className={cn(preset.bodySize, preset.colors.body, "mt-2")}>
                                        {exp.description}
                                    </p>
                                )}
                                {exp.accomplishments.length > 0 && (
                                    <div className="mt-3">
                                        <p className={cn(
                                            "text-xs font-bold uppercase tracking-wide",
                                            preset.colors.muted,
                                            "mb-2"
                                        )}>
                                            Key Achievements
                                        </p>
                                        <ul className="space-y-1">
                                            {exp.accomplishments.map((acc, idx) => (
                                                <li key={idx} className={cn(
                                                    preset.bodySize,
                                                    preset.colors.body,
                                                    "flex"
                                                )}>
                                                    <span className="mr-2 font-bold">▸</span>
                                                    <span>{acc}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education & Credentials */}
            {education.length > 0 && (
                <section className={preset.sectionGap}>
                    <ExecutiveSectionTitle>Education & Credentials</ExecutiveSectionTitle>
                    <div className="space-y-4">
                        {education.map((ed) => (
                            <div key={ed.id} className="flex flex-col md:flex-row md:justify-between">
                                <div>
                                    <h3 className={cn("font-bold", preset.colors.heading)}>
                                        {ed.degree}
                                        {ed.fieldOfStudy && ` in ${ed.fieldOfStudy}`}
                                    </h3>
                                    <p className={cn(preset.bodySize, preset.colors.body)}>
                                        {ed.institution}
                                        {ed.location && `, ${ed.location}`}
                                    </p>
                                </div>
                                <span className={cn(
                                    preset.bodySize,
                                    preset.colors.muted,
                                    "whitespace-nowrap"
                                )}>
                                    {ed.endDate}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Core Competencies */}
            {skills.length > 0 && (
                <section className={preset.sectionGap}>
                    <ExecutiveSectionTitle>Core Competencies</ExecutiveSectionTitle>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {skills.map((skill, idx) => (
                            <span
                                key={idx}
                                className={cn(
                                    preset.bodySize,
                                    preset.colors.body,
                                    "py-1"
                                )}
                            >
                                • {skill}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Professional Certifications */}
            {certifications.length > 0 && (
                <section className={preset.sectionGap}>
                    <ExecutiveSectionTitle>Professional Certifications</ExecutiveSectionTitle>
                    <div className="space-y-2">
                        {certifications.map((cert) => (
                            <div key={cert.id} className="flex justify-between items-baseline">
                                <div>
                                    <span className={cn("font-semibold", preset.colors.heading)}>
                                        {cert.name}
                                    </span>
                                    <span className={cn(preset.bodySize, preset.colors.muted)}>
                                        {" "}— {cert.issuer}
                                    </span>
                                </div>
                                {cert.issueDate && (
                                    <span className={cn(preset.bodySize, preset.colors.muted)}>
                                        {cert.issueDate}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

/**
 * Executive section title with double-line border
 */
export function ExecutiveSectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className={cn(
            "text-base font-bold uppercase tracking-widest",
            "text-gray-800",
            "border-b-2 border-double border-gray-400",
            "pb-2 mb-4"
        )}>
            {children}
        </h2>
    );
}
