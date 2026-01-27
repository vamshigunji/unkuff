
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db';
import { profiles, workExperience, education, skills } from './schema';
import { eq } from 'drizzle-orm';
import { encrypt } from '@/lib/encryption';

// ============================================================================
// SCHEMAS - Smaller, focused schemas for each extraction stage
// ============================================================================

const BasicInfoSchema = z.object({
    name: z.string().describe("Full name exactly as written"),
    summary: z.string().describe("Professional summary or synthesized 2-3 sentence summary"),
    email: z.string().optional().describe("Email if found"),
    phone: z.string().optional().describe("Phone number if found"),
    location: z.string().optional().describe("Location/city if found"),
});

const WorkExperienceItemSchema = z.object({
    company: z.string(),
    title: z.string(),
    location: z.string().optional(),
    startDate: z.string().describe("Format: YYYY-MM"),
    endDate: z.string().describe("Format: YYYY-MM or 'Present' for current role"),
    isCurrent: z.boolean(),
    description: z.string().optional().describe("1-2 sentence role summary"),
    accomplishments: z.array(z.string()).describe("Each bullet point as separate item"),
});

const WorkExperienceSchema = z.object({
    experiences: z.array(WorkExperienceItemSchema),
});

const EducationItemSchema = z.object({
    institution: z.string(),
    degree: z.string().optional(),
    fieldOfStudy: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    gpa: z.string().optional(),
});

const EducationSchema = z.object({
    education: z.array(EducationItemSchema),
});

const SkillsSchema = z.object({
    skills: z.array(z.string()).describe("All technical skills, tools, and technologies"),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseDate(dateStr: string | undefined | null): Date | null {
    if (!dateStr || dateStr.toLowerCase() === 'present') return null;

    const yyyyMmMatch = dateStr.match(/^(\d{4})-(\d{2})$/);
    if (yyyyMmMatch) {
        const [, year, month] = yyyyMmMatch;
        return new Date(parseInt(year), parseInt(month) - 1, 1);
    }

    const monthYearMatch = dateStr.match(/(\w+)\s+(\d{4})/);
    if (monthYearMatch) {
        const [, monthName, year] = monthYearMatch;
        const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
        if (!isNaN(monthIndex)) {
            return new Date(parseInt(year), monthIndex, 1);
        }
    }

    const yearMatch = dateStr.match(/^(\d{4})$/);
    if (yearMatch) {
        return new Date(parseInt(yearMatch[1]), 0, 1);
    }

    return null;
}

function deriveIsCurrent(endDate: string | undefined | null, explicitIsCurrent?: boolean): boolean {
    if (endDate && endDate.toLowerCase() === 'present') return true;
    if (explicitIsCurrent === true) return true;
    return false;
}

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            console.warn(`[Retry] Attempt ${attempt}/${maxRetries} failed:`, lastError.message);

            if (attempt < maxRetries) {
                const delay = baseDelayMs * Math.pow(2, attempt - 1);
                console.log(`[Retry] Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

// ============================================================================
// STAGED EXTRACTION SERVICE
// ============================================================================

export class ProfileParserService {
    private model = google('gemini-2.0-flash');

    /**
     * Stage 1: Extract basic info (name, summary, contact)
     */
    private async extractBasicInfo(resumeText: string) {
        console.log('[Parser:Stage1] Extracting basic info...');

        const result = await withRetry(() => generateObject({
            model: this.model,
            schema: BasicInfoSchema,
            prompt: `Extract the basic information from this resume.

RESUME:
${resumeText}

Extract:
- name: The person's full name (usually at the top)
- summary: Professional summary if exists, or create a 2-sentence summary from their experience
- email: Email address if found
- phone: Phone number if found
- location: City/location if found`,
        }));

        console.log('[Parser:Stage1] Basic info extracted:', result.object.name);
        return result.object;
    }

    /**
     * Stage 2: Extract work experiences
     */
    private async extractWorkExperience(resumeText: string) {
        console.log('[Parser:Stage2] Extracting work experience...');

        const result = await withRetry(() => generateObject({
            model: this.model,
            schema: WorkExperienceSchema,
            prompt: `Extract ALL work experiences from this resume.

CRITICAL RULES:
1. Extract EVERY job position listed
2. For dates: use YYYY-MM format (e.g., "2023-06")
3. ONLY the current/most recent ongoing role should have:
   - endDate: "Present"
   - isCurrent: true
4. ALL past positions must have specific endDate (not "Present") and isCurrent: false
5. Extract EVERY bullet point as a separate accomplishment - do NOT skip or summarize

RESUME:
${resumeText}

Return all work experiences with their accomplishments.`,
        }));

        console.log(`[Parser:Stage2] Found ${result.object.experiences.length} work experiences`);
        return result.object.experiences;
    }

    /**
     * Stage 3: Extract education
     */
    private async extractEducation(resumeText: string) {
        console.log('[Parser:Stage3] Extracting education...');

        const result = await withRetry(() => generateObject({
            model: this.model,
            schema: EducationSchema,
            prompt: `Extract education information from this resume.

Rules:
- For completed degrees, estimate graduation year from work history if not explicit
- Use YYYY or YYYY-MM format for dates

RESUME:
${resumeText}`,
        }));

        console.log(`[Parser:Stage3] Found ${result.object.education.length} education entries`);
        return result.object.education;
    }

    /**
     * Stage 4: Extract skills
     */
    private async extractSkills(resumeText: string) {
        console.log('[Parser:Stage4] Extracting skills...');

        const result = await withRetry(() => generateObject({
            model: this.model,
            schema: SkillsSchema,
            prompt: `Extract ALL skills from this resume.

Include:
- Programming languages (Python, SQL, etc.)
- Tools and platforms (Tableau, AWS, etc.)
- Frameworks (TensorFlow, React, etc.)
- Methodologies (Agile, CI/CD, etc.)
- Any other technical or professional skills mentioned

RESUME:
${resumeText}`,
        }));

        console.log(`[Parser:Stage4] Found ${result.object.skills.length} skills`);
        return result.object.skills;
    }

    /**
     * Main orchestrator: Parses resume in stages and saves to database
     */
    async parseAndSave(userId: string, resumeText: string) {
        if (!resumeText.trim()) throw new Error("Resume text is empty");

        console.log(`[ProfileParser] Starting staged extraction for user ${userId}`);
        console.log(`[ProfileParser] Resume length: ${resumeText.length} characters`);

        // ====================================================================
        // STAGE 1-4: Parallel extraction for speed
        // ====================================================================
        console.log('[ProfileParser] Running parallel extraction stages...');

        const [basicInfo, workExperiences, educationList, skillsList] = await Promise.all([
            this.extractBasicInfo(resumeText),
            this.extractWorkExperience(resumeText),
            this.extractEducation(resumeText),
            this.extractSkills(resumeText),
        ]);

        console.log('[ProfileParser] All stages complete. Saving to database...');

        // ====================================================================
        // PERSIST TO DATABASE
        // ====================================================================
        return await db.transaction(async (tx) => {
            // 1. Update or create profile
            const existingProfile = await tx.query.profiles.findFirst({
                where: eq(profiles.userId, userId)
            });

            // Encrypt sensitive fields (PII)
            const encryptedPhone = basicInfo.phone ? encrypt(basicInfo.phone) : null;

            let profileId: string;
            if (existingProfile) {
                await tx.update(profiles).set({
                    name: basicInfo.name,
                    summary: basicInfo.summary,
                    location: basicInfo.location || existingProfile.location,
                    phone: encryptedPhone || existingProfile.phone,
                    updatedAt: new Date()
                }).where(eq(profiles.userId, userId));
                profileId = existingProfile.id;

                // Clear existing child data for fresh parse
                await tx.delete(workExperience).where(eq(workExperience.profileId, profileId));
                await tx.delete(education).where(eq(education.profileId, profileId));
                await tx.delete(skills).where(eq(skills.profileId, profileId));
            } else {
                const [newProfile] = await tx.insert(profiles).values({
                    userId,
                    name: basicInfo.name,
                    summary: basicInfo.summary,
                    location: basicInfo.location,
                    phone: encryptedPhone,
                }).returning();
                profileId = newProfile.id;
            }

            // 2. Insert Work Experience
            if (workExperiences.length > 0) {
                await tx.insert(workExperience).values(
                    workExperiences.map(exp => ({
                        profileId,
                        company: exp.company,
                        title: exp.title,
                        description: exp.description,
                        accomplishments: exp.accomplishments,
                        location: exp.location,
                        startDate: parseDate(exp.startDate),
                        endDate: parseDate(exp.endDate),
                        isCurrent: deriveIsCurrent(exp.endDate, exp.isCurrent) ? "true" : "false"
                    }))
                );
            }

            // 3. Insert Education
            if (educationList.length > 0) {
                await tx.insert(education).values(
                    educationList.map(edu => ({
                        profileId,
                        institution: edu.institution,
                        degree: edu.degree,
                        fieldOfStudy: edu.fieldOfStudy,
                        startDate: parseDate(edu.startDate),
                        endDate: parseDate(edu.endDate),
                    }))
                );
            }

            // 4. Insert Skills
            if (skillsList.length > 0) {
                await tx.insert(skills).values(
                    skillsList.map(name => ({
                        profileId,
                        name,
                        category: "Technical"
                    }))
                );
            }

            console.log('[ProfileParser] Database save complete!');

            return {
                profileId,
                name: basicInfo.name,
                summary: basicInfo.summary,
                workExperienceCount: workExperiences.length,
                educationCount: educationList.length,
                skillsCount: skillsList.length,
            };
        });
    }
}
