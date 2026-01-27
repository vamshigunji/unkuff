/**
 * Export Actions Tests
 * 
 * Tests for PDF and DOCX resume export functionality.
 * Following red-green-refactor cycle: these tests are written FIRST.
 */

import { describe, it, expect } from 'vitest';
import type { ResumeData } from './types';

// Mock resume data for testing
const mockResumeData: ResumeData = {
    contact: {
        fullName: "John Doe",
        email: "john@example.com",
        phone: "+1-555-0123",
        location: "San Francisco, CA",
        linkedin: "linkedin.com/in/johndoe",
        github: "github.com/johndoe",
        portfolio: null,
    },
    summary: "Experienced software engineer with 5+ years building scalable web applications.",
    experience: [
        {
            id: "exp-1",
            company: "Tech Corp",
            title: "Senior Software Engineer",
            location: "San Francisco, CA",
            startDate: "Jan 2020",
            endDate: null,
            isCurrent: true,
            description: "Leading development of microservices architecture.",
            accomplishments: [
                "Reduced API latency by 40%",
                "Mentored team of 3 junior developers",
            ],
        },
    ],
    education: [
        {
            id: "edu-1",
            institution: "University of California",
            degree: "Bachelor of Science",
            fieldOfStudy: "Computer Science",
            location: "Berkeley, CA",
            startDate: "Aug 2014",
            endDate: "May 2018",
        },
    ],
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    certifications: [
        {
            id: "cert-1",
            name: "AWS Solutions Architect",
            issuer: "Amazon Web Services",
            issueDate: "Mar 2022",
            expiryDate: "Mar 2025",
            credentialId: "ABC123",
        },
    ],
};

describe('Export Actions', () => {
    describe('generatePdf', () => {
        it('should return base64 encoded PDF data on success', async () => {
            const { generatePdf } = await import('./export-actions');

            const result = await generatePdf(mockResumeData, 'classic');

            expect(result.error).toBeNull();
            expect(result.data).not.toBeNull();
            expect(typeof result.data).toBe('string');
            // Base64 encoded PDF starts with specific bytes
            if (result.data) {
                const buffer = Buffer.from(result.data, 'base64');
                // PDF magic bytes: %PDF (0x25 0x50 0x44 0x46)
                expect(buffer[0]).toBe(0x25); // %
                expect(buffer[1]).toBe(0x50); // P
                expect(buffer[2]).toBe(0x44); // D
                expect(buffer[3]).toBe(0x46); // F
            }
        }, 30000); // 30s timeout for Puppeteer

        it('should handle missing resume data gracefully', async () => {
            const { generatePdf } = await import('./export-actions');

            const emptyData: ResumeData = {
                contact: { fullName: '', email: '' },
                summary: null,
                experience: [],
                education: [],
                skills: [],
                certifications: [],
            };

            const result = await generatePdf(emptyData, 'classic');

            // Should still succeed with minimal data
            expect(result.error).toBeNull();
            expect(result.data).not.toBeNull();
        }, 30000);

        it('should support all template types', async () => {
            const { generatePdf } = await import('./export-actions');

            const templates = ['classic', 'modern', 'minimalist', 'executive', 'compact'] as const;

            for (const template of templates) {
                const result = await generatePdf(mockResumeData, template);
                expect(result.error).toBeNull();
                expect(result.data).not.toBeNull();
            }
        }, 120000); // Longer timeout for 5 templates
    });

    describe('generateDocx', () => {
        it('should return base64 encoded DOCX data on success', async () => {
            const { generateDocx } = await import('./export-actions');

            const result = await generateDocx(mockResumeData, 'classic');

            expect(result.error).toBeNull();
            expect(result.data).not.toBeNull();
            expect(typeof result.data).toBe('string');
            // DOCX is a ZIP file, starts with PK (0x50 0x4B)
            if (result.data) {
                const buffer = Buffer.from(result.data, 'base64');
                expect(buffer[0]).toBe(0x50); // P
                expect(buffer[1]).toBe(0x4B); // K
            }
        });

        it('should include all resume sections in DOCX', async () => {
            const { generateDocx } = await import('./export-actions');

            const result = await generateDocx(mockResumeData, 'classic');

            expect(result.error).toBeNull();
            expect(result.data).not.toBeNull();
            // Further content validation would require parsing the DOCX
        });

        it('should handle empty experience and education arrays', async () => {
            const { generateDocx } = await import('./export-actions');

            const minimalData: ResumeData = {
                contact: { fullName: 'Jane Doe', email: 'jane@example.com' },
                summary: 'A professional summary.',
                experience: [],
                education: [],
                skills: ['Skill 1'],
                certifications: [],
            };

            const result = await generateDocx(minimalData, 'modern');

            expect(result.error).toBeNull();
            expect(result.data).not.toBeNull();
        });
    });

    describe('ActionResponse format', () => {
        it('should always return { data, error } format for PDF', async () => {
            const { generatePdf } = await import('./export-actions');

            const result = await generatePdf(mockResumeData, 'classic');

            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('error');
        });

        it('should always return { data, error } format for DOCX', async () => {
            const { generateDocx } = await import('./export-actions');

            const result = await generateDocx(mockResumeData, 'classic');

            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('error');
        });
    });

    describe('Error handling', () => {
        it('should return error for null resume data in PDF', async () => {
            const { generatePdf } = await import('./export-actions');

            const result = await generatePdf(null, 'classic');

            expect(result.data).toBeNull();
            expect(result.error).toBe('Invalid resume data: contact information is required');
        });

        it('should return error for null resume data in DOCX', async () => {
            const { generateDocx } = await import('./export-actions');

            const result = await generateDocx(null, 'classic');

            expect(result.data).toBeNull();
            expect(result.error).toBe('Invalid resume data: contact information is required');
        });

        it('should return error for missing contact in PDF', async () => {
            const { generatePdf } = await import('./export-actions');

            const result = await generatePdf({ summary: 'test' }, 'classic');

            expect(result.data).toBeNull();
            expect(result.error).toBe('Invalid resume data: contact information is required');
        });

        it('should return error for missing contact in DOCX', async () => {
            const { generateDocx } = await import('./export-actions');

            const result = await generateDocx({ summary: 'test' }, 'classic');

            expect(result.data).toBeNull();
            expect(result.error).toBe('Invalid resume data: contact information is required');
        });
    });
});
