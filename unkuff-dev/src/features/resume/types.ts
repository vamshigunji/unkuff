/**
 * Resume Data Types
 * 
 * These types define the structure for resume rendering and preview.
 * They transform profile data into a resume-ready format.
 */

export interface ResumeContact {
    fullName: string;
    email: string;
    phone?: string | null;
    location?: string | null;
    linkedin?: string | null;
    github?: string | null;
    portfolio?: string | null;
}

export interface ResumeExperience {
    id: string;
    company: string;
    title: string;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
    accomplishments: string[];
}

export interface ResumeEducation {
    id: string;
    institution: string;
    degree: string | null;
    fieldOfStudy: string | null;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
}

export interface ResumeCertification {
    id: string;
    name: string;
    issuer: string;
    issueDate: string | null;
    expiryDate: string | null;
    credentialId: string | null;
}

export interface ResumeData {
    jobId?: string;
    jobDescription?: string | null;
    atsScore?: number | null;
    contact: ResumeContact;
    summary: string | null;
    experience: ResumeExperience[];
    education: ResumeEducation[];
    skills: string[];
    certifications: ResumeCertification[];
}

export interface TemplateConfig {
    id: string;
    name: string;
    description: string;
    thumbnail?: string;
}

export type TemplateId = 'classic' | 'modern' | 'minimal';
