import type { ResumeData } from "../types";
import { cn } from "@/lib/utils";
import { TEMPLATE_PRESETS, CONTAINER } from "./base-styles";

interface ModernTemplateProps {
    data: ResumeData;
    className?: string;
}

/**
 * Modern Resume Template
 * 
 * A clean, contemporary design with:
 * - Sans-serif typography (Inter/system fonts)
 * - Left accent lines on section headings
 * - Subtle blue accent color for emphasis
 * - Clean left-aligned layout
 * - ATS-friendly single-column structure
 * 
 * Best for: Tech, Startups, Marketing, Digital roles
 */
export function ModernTemplate({ data, className }: ModernTemplateProps) {
    const { contact, summary, experience, education, skills, certifications } = data;
    const preset = TEMPLATE_PRESETS.modern;

    return (
        <div className={cn(
            "bg-white text-gray-800",
            preset.fonts,
            preset.margins,
            CONTAINER.paper.minHeight,
            "shadow-lg",
            className
        )}>
            {/* Header / Contact Section */}
            <header className="mb-8">
                <h1 className={cn(
                    preset.nameSize,
                    "font-bold tracking-tight",
                    preset.colors.heading,
                    "mb-2"
                )}>
                    {contact.fullName || "Your Name"}
                </h1>
                <div className={cn(
                    "flex flex-wrap items-center gap-3",
                    preset.bodySize,
                    preset.colors.muted
                )}>
                    {contact.email && (
                        <span>{contact.email}</span>
                    )}
                    {contact.phone && (
                        <>
                            <span className="text-gray-300">|</span>
                            <span>{contact.phone}</span>
                        </>
                    )}
                    {contact.location && (
                        <>
                            <span className="text-gray-300">|</span>
                            <span>{contact.location}</span>
                        </>
                    )}
                    {contact.linkedin && (
                        <>
                            <span className="text-gray-300">|</span>
                            <span>{contact.linkedin}</span>
                        </>
                    )}
                </div>
            </header>

            {/* Professional Summary */}
            {summary && (
                <section className={preset.sectionGap}>
                    <ModernSectionTitle>Summary</ModernSectionTitle>
                    <p className={cn(
                        preset.bodySize,
                        preset.lineHeight,
                        preset.colors.body
                    )}>
                        {summary}
                    </p>
                </section>
            )}

            {/* Work Experience */}
            {experience.length > 0 && (
                <section className={preset.sectionGap}>
                    <ModernSectionTitle>Experience</ModernSectionTitle>
                    <div className="space-y-4">
                        {experience.map((exp) => (
                            <div key={exp.id} className="experience-entry">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-1">
                                    <div>
                                        <h3 className={cn("font-semibold", preset.colors.heading)}>
                                            {exp.title}
                                        </h3>
                                        <p className={cn(preset.bodySize, preset.colors.accent, "font-medium")}>
                                            {exp.company}
                                            {exp.location && ` · ${exp.location}`}
                                        </p>
                                    </div>
                                    <span className={cn(
                                        "text-xs",
                                        preset.colors.muted,
                                        "whitespace-nowrap mt-1 md:mt-0"
                                    )}>
                                        {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                                    </span>
                                </div>
                                {exp.description && (
                                    <p className={cn(preset.bodySize, preset.colors.body, "mt-2")}>
                                        {exp.description}
                                    </p>
                                )}
                                {exp.accomplishments.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {exp.accomplishments.map((acc, idx) => (
                                            <li key={idx} className={cn(
                                                preset.bodySize,
                                                preset.colors.body,
                                                "flex"
                                            )}>
                                                <span className="mr-2 text-blue-600">•</span>
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
                    <ModernSectionTitle>Education</ModernSectionTitle>
                    <div className="space-y-3">
                        {education.map((ed) => (
                            <div key={ed.id} className="flex flex-col md:flex-row md:justify-between">
                                <div>
                                    <h3 className={cn("font-semibold", preset.colors.heading)}>
                                        {ed.degree}
                                        {ed.fieldOfStudy && ` in ${ed.fieldOfStudy}`}
                                    </h3>
                                    <p className={cn(preset.bodySize, preset.colors.body)}>
                                        {ed.institution}
                                        {ed.location && ` · ${ed.location}`}
                                    </p>
                                </div>
                                <span className={cn(
                                    "text-xs",
                                    preset.colors.muted,
                                    "whitespace-nowrap mt-1 md:mt-0"
                                )}>
                                    {ed.startDate && `${ed.startDate} – `}
                                    {ed.endDate}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <section className={preset.sectionGap}>
                    <ModernSectionTitle>Skills</ModernSectionTitle>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill, idx) => (
                            <span
                                key={idx}
                                className={cn(
                                    "px-3 py-1",
                                    "text-xs font-medium",
                                    "bg-blue-50 text-blue-700",
                                    "rounded"
                                )}
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
                <section className={preset.sectionGap}>
                    <ModernSectionTitle>Certifications</ModernSectionTitle>
                    <div className="space-y-2">
                        {certifications.map((cert) => (
                            <div key={cert.id} className="flex justify-between items-baseline">
                                <div>
                                    <span className={cn("font-medium", preset.colors.heading)}>
                                        {cert.name}
                                    </span>
                                    <span className={cn(preset.bodySize, preset.colors.muted)}>
                                        {" "}– {cert.issuer}
                                    </span>
                                </div>
                                {cert.issueDate && (
                                    <span className={cn("text-xs", preset.colors.muted)}>
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
 * Modern section title with left accent line
 */
export function ModernSectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className={cn(
            "text-xs font-bold uppercase tracking-widest",
            "text-blue-700",
            "border-l-4 border-blue-600 pl-3",
            "mb-3"
        )}>
            {children}
        </h2>
    );
}
