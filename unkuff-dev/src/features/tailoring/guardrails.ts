import { MasterProfileData } from './service';
import { TailoredResumeContent } from './schema';

export type VerificationResult = {
    hasHallucination: boolean;
    hallucinations: string[]; // List of specific invented claims
};

export function checkForHallucinations(
    generated: TailoredResumeContent,
    original: MasterProfileData
): VerificationResult {
    const hallucinations: string[] = [];

    // 1. Strict Skill Verification
    // Every skill in generated MUST exist in original (fuzzy match ok)
    if (original.skills && Array.isArray(original.skills)) {
        const normalizedOriginalSkills = original.skills.map(s => (s.name || "").toLowerCase().trim());

        generated.skills.forEach(skill => {
            const normalizedSkill = skill.toLowerCase().trim();
            // Simple inclusion check. In prod, use embedding similarity or fuzzy matching.
            const exists = normalizedOriginalSkills.some(orig => orig.includes(normalizedSkill) || normalizedSkill.includes(orig));

            if (!exists) {
                hallucinations.push(`Invented Skill: ${skill}`);
            }
        });
    }

    // 2. Company Verification
    // Every company in generated experience MUST match a company in original
    // (MVP: Exact string match on company name)
    const originalCompanies = original.workExperience.map(w => w.company?.toLowerCase().trim());

    generated.experience.forEach(exp => {
        const comp = exp.company.toLowerCase().trim();
        const exists = originalCompanies.some(orig => orig && orig.includes(comp));

        if (!exists) {
            hallucinations.push(`Invented Company: ${exp.company}`);
        }
    });


    return {
        hasHallucination: hallucinations.length > 0,
        hallucinations
    };
}
