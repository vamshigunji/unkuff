"use server";

/**
 * Export Actions - Server-Side PDF and DOCX Generation
 * 
 * These actions handle the generation of resume exports:
 * - PDF: Uses Puppeteer to render HTML templates to PDF
 * - DOCX: Uses docx library for programmatic document creation
 * 
 * CRITICAL: All actions return { data: T | null, error: string | null }
 * as per project-context.md Server Actions pattern.
 */

import puppeteer from "puppeteer";
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    BorderStyle,
    SectionType,
} from "docx";
import type { ResumeData } from "./types";
import type { TemplateId } from "./templates";

// ============================================================================
// TYPES
// ============================================================================

export type ExportResponse = {
    data: string | null; // Base64 encoded file content
    error: string | null;
};

// Maximum file size for generated documents (10MB)
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// Puppeteer timeout for page operations
const PUPPETEER_TIMEOUT_MS = 30000;

// ============================================================================
// PDF GENERATION (Puppeteer)
// ============================================================================

/**
 * Generate a PDF from resume data using server-side rendering.
 * 
 * @param data - Resume data to render
 * @param templateId - Template style to use
 * @returns Base64 encoded PDF content or error
 */
export async function generatePdf(
    data: ResumeData,
    templateId: TemplateId
): Promise<ExportResponse> {
    let browser = null;

    try {
        // Input validation
        if (!data || !data.contact) {
            return { data: null, error: "Invalid resume data: contact information is required" };
        }

        // Generate HTML from resume data
        const html = generateResumeHtml(data, templateId);

        // Launch Puppeteer with hardened flags for server environment
        browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
            ],
        });

        const page = await browser.newPage();

        // Set page timeout
        page.setDefaultTimeout(PUPPETEER_TIMEOUT_MS);

        // Set content and wait for fonts to load (with timeout)
        await page.setContent(html, {
            waitUntil: "networkidle0",
            timeout: PUPPETEER_TIMEOUT_MS,
        });

        // Set print media type for proper styling
        await page.emulateMediaType("print");

        // Generate PDF with A4 format
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "0.5in",
                right: "0.5in",
                bottom: "0.5in",
                left: "0.5in",
            },
        });

        // Convert to base64 for transfer to client
        const base64Pdf = Buffer.from(pdfBuffer).toString("base64");

        return { data: base64Pdf, error: null };
    } catch (error) {
        console.error("PDF generation failed:", error);
        return {
            data: null,
            error: error instanceof Error ? error.message : "PDF generation failed",
        };
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error("Failed to close browser:", closeError);
            }
        }
    }
}

// ============================================================================
// DOCX GENERATION (docx library)
// ============================================================================

/**
 * Generate a DOCX from resume data using docx library.
 * 
 * @param data - Resume data to render
 * @param templateId - Template style to use (affects font choices)
 * @returns Base64 encoded DOCX content or error
 */
export async function generateDocx(
    data: ResumeData,
    templateId: TemplateId
): Promise<ExportResponse> {
    try {
        // Input validation
        if (!data || !data.contact) {
            return { data: null, error: "Invalid resume data: contact information is required" };
        }

        // Get template-specific styling
        const style = getDocxStyle(templateId);

        // Build document sections
        const children: Paragraph[] = [];

        // Header - Name
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: data.contact.fullName || "Your Name",
                        bold: true,
                        size: style.nameSize,
                        font: style.fontFamily,
                    }),
                ],
                alignment: style.headerAlignment,
                spacing: { after: 100 },
            })
        );

        // Header - Contact Info
        const contactParts: string[] = [];
        if (data.contact.email) contactParts.push(data.contact.email);
        if (data.contact.phone) contactParts.push(data.contact.phone);
        if (data.contact.location) contactParts.push(data.contact.location);
        if (data.contact.linkedin) contactParts.push(data.contact.linkedin);
        if (data.contact.github) contactParts.push(data.contact.github);

        if (contactParts.length > 0) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: contactParts.join(" • "),
                            size: style.bodySize,
                            font: style.fontFamily,
                        }),
                    ],
                    alignment: style.headerAlignment,
                    spacing: { after: 200 },
                    border: {
                        bottom: {
                            color: "999999",
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 6,
                        },
                    },
                })
            );
        }

        // Professional Summary
        if (data.summary) {
            children.push(createSectionHeading("PROFESSIONAL SUMMARY", style));
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: data.summary,
                            size: style.bodySize,
                            font: style.fontFamily,
                        }),
                    ],
                    spacing: { after: 200 },
                })
            );
        }

        // Work Experience
        if (data.experience.length > 0) {
            children.push(createSectionHeading("PROFESSIONAL EXPERIENCE", style));

            for (const exp of data.experience) {
                // Title and dates
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: exp.title,
                                bold: true,
                                size: style.bodySize,
                                font: style.fontFamily,
                            }),
                            new TextRun({
                                text: `  |  ${exp.startDate} – ${exp.isCurrent ? "Present" : exp.endDate}`,
                                size: style.bodySize,
                                font: style.fontFamily,
                            }),
                        ],
                        spacing: { before: 100 },
                    })
                );

                // Company and location
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: exp.company + (exp.location ? ` • ${exp.location}` : ""),
                                italics: true,
                                size: style.bodySize,
                                font: style.fontFamily,
                            }),
                        ],
                        spacing: { after: 50 },
                    })
                );

                // Description
                if (exp.description) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: exp.description,
                                    size: style.bodySize,
                                    font: style.fontFamily,
                                }),
                            ],
                            spacing: { after: 50 },
                        })
                    );
                }

                // Accomplishments
                for (const acc of exp.accomplishments) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `• ${acc}`,
                                    size: style.bodySize,
                                    font: style.fontFamily,
                                }),
                            ],
                            indent: { left: 360 }, // 0.25 inch
                        })
                    );
                }
            }

            children.push(new Paragraph({ spacing: { after: 100 } }));
        }

        // Education
        if (data.education.length > 0) {
            children.push(createSectionHeading("EDUCATION", style));

            for (const ed of data.education) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${ed.degree}${ed.fieldOfStudy ? ` in ${ed.fieldOfStudy}` : ""}`,
                                bold: true,
                                size: style.bodySize,
                                font: style.fontFamily,
                            }),
                            new TextRun({
                                text: ed.endDate ? `  |  ${ed.startDate ? `${ed.startDate} – ` : ""}${ed.endDate}` : "",
                                size: style.bodySize,
                                font: style.fontFamily,
                            }),
                        ],
                        spacing: { before: 100 },
                    })
                );

                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: ed.institution + (ed.location ? ` • ${ed.location}` : ""),
                                italics: true,
                                size: style.bodySize,
                                font: style.fontFamily,
                            }),
                        ],
                        spacing: { after: 100 },
                    })
                );
            }
        }

        // Skills
        if (data.skills.length > 0) {
            children.push(createSectionHeading("SKILLS", style));
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: data.skills.join(" • "),
                            size: style.bodySize,
                            font: style.fontFamily,
                        }),
                    ],
                    spacing: { after: 200 },
                })
            );
        }

        // Certifications
        if (data.certifications.length > 0) {
            children.push(createSectionHeading("CERTIFICATIONS", style));

            for (const cert of data.certifications) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: cert.name,
                                bold: true,
                                size: style.bodySize,
                                font: style.fontFamily,
                            }),
                            new TextRun({
                                text: ` – ${cert.issuer}`,
                                size: style.bodySize,
                                font: style.fontFamily,
                            }),
                            new TextRun({
                                text: cert.issueDate ? `  |  ${cert.issueDate}` : "",
                                size: style.bodySize,
                                font: style.fontFamily,
                            }),
                        ],
                        spacing: { after: 50 },
                    })
                );
            }
        }

        // Create document
        const doc = new Document({
            sections: [
                {
                    properties: {
                        type: SectionType.CONTINUOUS,
                    },
                    children,
                },
            ],
        });

        // Generate DOCX buffer
        const buffer = await Packer.toBuffer(doc);
        const base64Docx = Buffer.from(buffer).toString("base64");

        return { data: base64Docx, error: null };
    } catch (error) {
        console.error("DOCX generation failed:", error);
        return {
            data: null,
            error: error instanceof Error ? error.message : "DOCX generation failed",
        };
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate HTML string for resume rendering.
 * This is used by Puppeteer to create the PDF.
 */
function generateResumeHtml(data: ResumeData, templateId: TemplateId): string {
    const style = getHtmlStyle(templateId);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Georgia&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${style.fontFamily};
            font-size: ${style.fontSize};
            line-height: 1.5;
            color: #374151;
            background: white;
            padding: 0.75in;
        }
        
        .header {
            text-align: ${style.headerAlign};
            margin-bottom: 1.5em;
            padding-bottom: 1em;
            border-bottom: 1px solid #d1d5db;
        }
        
        .name {
            font-size: ${style.nameSize};
            font-weight: 700;
            color: #111827;
            margin-bottom: 0.25em;
        }
        
        .contact-info {
            font-size: 0.875em;
            color: #6b7280;
        }
        
        .section {
            margin-bottom: 1.25em;
        }
        
        .section-title {
            font-size: ${style.sectionTitleSize};
            font-weight: 700;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5em;
            padding-bottom: 0.25em;
            border-bottom: ${style.sectionBorder};
        }
        
        .entry {
            margin-bottom: 0.75em;
        }
        
        .entry-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            flex-wrap: wrap;
        }
        
        .entry-title {
            font-weight: 600;
            color: #111827;
        }
        
        .entry-subtitle {
            font-size: 0.875em;
            color: #6b7280;
            font-style: italic;
        }
        
        .entry-date {
            font-size: 0.875em;
            color: #9ca3af;
        }
        
        .entry-description {
            margin-top: 0.25em;
            font-size: 0.875em;
        }
        
        .accomplishments {
            margin-top: 0.5em;
            padding-left: 1.25em;
        }
        
        .accomplishments li {
            margin-bottom: 0.25em;
            font-size: 0.875em;
        }
        
        .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5em;
        }
        
        .skill-tag {
            background: #f3f4f6;
            padding: 0.25em 0.75em;
            border-radius: 9999px;
            font-size: 0.875em;
        }
        
        @media print {
            body {
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <h1 class="name">${escapeHtml(data.contact.fullName) || "Your Name"}</h1>
        <div class="contact-info">
            ${[
            escapeHtml(data.contact.email),
            escapeHtml(data.contact.phone),
            escapeHtml(data.contact.location),
            escapeHtml(data.contact.linkedin),
            escapeHtml(data.contact.github),
        ].filter(Boolean).join(" • ")}
        </div>
    </header>
    
    ${data.summary ? `
    <section class="section">
        <h2 class="section-title">Professional Summary</h2>
        <p>${escapeHtml(data.summary)}</p>
    </section>
    ` : ""}
    
    ${data.experience.length > 0 ? `
    <section class="section">
        <h2 class="section-title">Professional Experience</h2>
        ${data.experience.map(exp => `
            <div class="entry">
                <div class="entry-header">
                    <span class="entry-title">${escapeHtml(exp.title)}</span>
                    <span class="entry-date">${exp.startDate} – ${exp.isCurrent ? "Present" : exp.endDate}</span>
                </div>
                <div class="entry-subtitle">
                    ${escapeHtml(exp.company)}${exp.location ? ` • ${escapeHtml(exp.location)}` : ""}
                </div>
                ${exp.description ? `<p class="entry-description">${escapeHtml(exp.description)}</p>` : ""}
                ${exp.accomplishments.length > 0 ? `
                    <ul class="accomplishments">
                        ${exp.accomplishments.map(acc => `<li>${escapeHtml(acc)}</li>`).join("")}
                    </ul>
                ` : ""}
            </div>
        `).join("")}
    </section>
    ` : ""}
    
    ${data.education.length > 0 ? `
    <section class="section">
        <h2 class="section-title">Education</h2>
        ${data.education.map(ed => `
            <div class="entry">
                <div class="entry-header">
                    <span class="entry-title">${escapeHtml(ed.degree || "")}${ed.fieldOfStudy ? ` in ${escapeHtml(ed.fieldOfStudy)}` : ""}</span>
                    <span class="entry-date">${ed.startDate ? `${ed.startDate} – ` : ""}${ed.endDate || ""}</span>
                </div>
                <div class="entry-subtitle">
                    ${escapeHtml(ed.institution)}${ed.location ? ` • ${escapeHtml(ed.location)}` : ""}
                </div>
            </div>
        `).join("")}
    </section>
    ` : ""}
    
    ${data.skills.length > 0 ? `
    <section class="section">
        <h2 class="section-title">Skills</h2>
        <div class="skills-list">
            ${data.skills.map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join("")}
        </div>
    </section>
    ` : ""}
    
    ${data.certifications.length > 0 ? `
    <section class="section">
        <h2 class="section-title">Certifications</h2>
        ${data.certifications.map(cert => `
            <div class="entry">
                <div class="entry-header">
                    <span class="entry-title">${escapeHtml(cert.name)} – ${escapeHtml(cert.issuer)}</span>
                    <span class="entry-date">${cert.issueDate || ""}</span>
                </div>
            </div>
        `).join("")}
    </section>
    ` : ""}
</body>
</html>
    `.trim();
}

/**
 * Get HTML styling based on template ID.
 */
function getHtmlStyle(templateId: TemplateId) {
    const styles: Record<TemplateId, {
        fontFamily: string;
        fontSize: string;
        nameSize: string;
        sectionTitleSize: string;
        sectionBorder: string;
        headerAlign: string;
    }> = {
        classic: {
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "11pt",
            nameSize: "24pt",
            sectionTitleSize: "12pt",
            sectionBorder: "1px solid #d1d5db",
            headerAlign: "center",
        },
        modern: {
            fontFamily: "'Inter', sans-serif",
            fontSize: "11pt",
            nameSize: "24pt",
            sectionTitleSize: "11pt",
            sectionBorder: "2px solid #3b82f6",
            headerAlign: "left",
        },
        minimalist: {
            fontFamily: "'Inter', sans-serif",
            fontSize: "11pt",
            nameSize: "22pt",
            sectionTitleSize: "11pt",
            sectionBorder: "none",
            headerAlign: "center",
        },
        executive: {
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "11pt",
            nameSize: "28pt",
            sectionTitleSize: "13pt",
            sectionBorder: "2px double #374151",
            headerAlign: "center",
        },
        compact: {
            fontFamily: "'Inter', sans-serif",
            fontSize: "10pt",
            nameSize: "20pt",
            sectionTitleSize: "10pt",
            sectionBorder: "1px dotted #9ca3af",
            headerAlign: "left",
        },
    };

    return styles[templateId] || styles.classic;
}

/**
 * Get DOCX styling based on template ID.
 */
function getDocxStyle(templateId: TemplateId) {
    const styles: Record<TemplateId, {
        fontFamily: string;
        nameSize: number; // Half-points (24 = 12pt)
        headingSize: number;
        bodySize: number;
        headerAlignment: typeof AlignmentType.CENTER | typeof AlignmentType.LEFT;
    }> = {
        classic: {
            fontFamily: "Georgia",
            nameSize: 48, // 24pt
            headingSize: 24, // 12pt
            bodySize: 22, // 11pt
            headerAlignment: AlignmentType.CENTER,
        },
        modern: {
            fontFamily: "Arial",
            nameSize: 48,
            headingSize: 22,
            bodySize: 22,
            headerAlignment: AlignmentType.LEFT,
        },
        minimalist: {
            fontFamily: "Arial",
            nameSize: 44,
            headingSize: 22,
            bodySize: 22,
            headerAlignment: AlignmentType.CENTER,
        },
        executive: {
            fontFamily: "Georgia",
            nameSize: 56,
            headingSize: 26,
            bodySize: 22,
            headerAlignment: AlignmentType.CENTER,
        },
        compact: {
            fontFamily: "Arial",
            nameSize: 40,
            headingSize: 20,
            bodySize: 20,
            headerAlignment: AlignmentType.LEFT,
        },
    };

    return styles[templateId] || styles.classic;
}

/**
 * Create a section heading paragraph for DOCX.
 */
function createSectionHeading(
    text: string,
    style: ReturnType<typeof getDocxStyle>
): Paragraph {
    return new Paragraph({
        children: [
            new TextRun({
                text,
                bold: true,
                size: style.headingSize,
                font: style.fontFamily,
                allCaps: true,
            }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
            bottom: {
                color: "999999",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
            },
        },
    });
}

/**
 * Escape HTML special characters.
 */
function escapeHtml(text: string | null | undefined): string {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
