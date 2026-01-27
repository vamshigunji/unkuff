import type { ResumeData } from "../types";
import { cn } from "@/lib/utils";

interface ClassicTemplateProps {
    data: ResumeData;
    className?: string;
}

/**
 * Classic Resume Template
 * 
 * A clean, professional resume layout with:
 * - Centered header with contact info
 * - Clear section dividers
 * - Traditional typography (Inter font family)
 * - ATS-friendly structure
 */
export function ClassicTemplate({ data, className }: ClassicTemplateProps) {
    const { contact, summary, experience, education, skills, certifications } = data;

    return (
        <div className={cn(
            "bg-white text-gray-900 font-sans",
            "p-12 md:p-16",
            // A4 page height approximation (297mm ≈ 11.7in at 96dpi ≈ 1123px)
            // Using 1100px for slight margin and cross-browser consistency
            "min-h-[1100px]",
            "shadow-lg",
            className
        )}>
            {/* Header / Contact Section */}
            <header className="text-center mb-8 border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                    {contact.fullName || "Your Name"}
                </h1>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    {contact.email && (
                        <span>{contact.email}</span>
                    )}
                    {contact.phone && (
                        <span>{contact.phone}</span>
                    )}
                    {contact.location && (
                        <span>{contact.location}</span>
                    )}
                    {contact.linkedin && (
                        <span>{contact.linkedin}</span>
                    )}
                    {contact.github && (
                        <span>{contact.github}</span>
                    )}
                </div>
            </header>

            {/* Professional Summary */}
            {summary && (
                <section className="mb-6">
                    <SectionTitle>Professional Summary</SectionTitle>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {summary}
                    </p>
                </section>
            )}

            {/* Work Experience */}
            {experience.length > 0 && (
                <section className="mb-6">
                    <SectionTitle>Professional Experience</SectionTitle>
                    <div className="space-y-4">
                        {experience.map((exp) => (
                            <div key={exp.id} className="experience-entry">
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            {exp.company}
                                            {exp.location && ` • ${exp.location}`}
                                        </p>
                                    </div>
                                    <span className="text-sm text-gray-500 whitespace-nowrap">
                                        {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                                    </span>
                                </div>
                                {exp.description && (
                                    <p className="text-sm text-gray-700 mt-1">
                                        {exp.description}
                                    </p>
                                )}
                                {exp.accomplishments.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {exp.accomplishments.map((acc, idx) => (
                                            <li key={idx} className="text-sm text-gray-700 flex">
                                                <span className="mr-2">•</span>
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
                <section className="mb-6">
                    <SectionTitle>Education</SectionTitle>
                    <div className="space-y-3">
                        {education.map((ed) => (
                            <div key={ed.id} className="education-entry">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {ed.degree}
                                            {ed.fieldOfStudy && ` in ${ed.fieldOfStudy}`}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {ed.institution}
                                            {ed.location && ` • ${ed.location}`}
                                        </p>
                                    </div>
                                    <span className="text-sm text-gray-500 whitespace-nowrap">
                                        {ed.startDate && `${ed.startDate} – `}
                                        {ed.endDate}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <section className="mb-6">
                    <SectionTitle>Skills</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
                <section className="mb-6">
                    <SectionTitle>Certifications</SectionTitle>
                    <div className="space-y-2">
                        {certifications.map((cert) => (
                            <div key={cert.id} className="flex justify-between items-start">
                                <div>
                                    <span className="font-medium text-gray-900">{cert.name}</span>
                                    <span className="text-sm text-gray-600"> – {cert.issuer}</span>
                                </div>
                                {cert.issueDate && (
                                    <span className="text-sm text-gray-500">
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
 * Reusable section title component for resume templates.
 * Can be imported by other templates (Modern, Minimal, Creative).
 */
export function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide mb-3 border-b border-gray-300 pb-1">
            {children}
        </h2>
    );
}

