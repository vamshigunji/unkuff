
import { generateHighFidelityScore } from "../../../../src/features/matching/services/ats-service";

describe("High Fidelity ATS Scorer (Phase 1)", () => {
    const mockResume = "Experienced Data Scientist skilled in Python, SQL, and Machine Learning. Led teams at Workday and Tech Corp.";
    const mockJD = "Looking for a Senior Data Scientist with expertise in Python, SQL, and PyTorch. Must have leadership experience.";

    it("should calculate a non-zero score based on keywords and conceptual alignment", async () => {
        const report = await generateHighFidelityScore(mockResume, mockJD);
        
        console.log("[TDD] Generated Score:", report.score);
        console.log("[TDD] Matched Keywords:", report.foundKeywords);
        
        expect(report.score).toBeGreaterThan(0);
        expect(report.score).toBeLessThanOrEqual(100);
        expect(report.foundKeywords.length).toBeGreaterThan(0);
        expect(report.atsCode.length).toBe(8);
    });

    it("should include semantic similarity in the report", async () => {
        const report = await generateHighFidelityScore(mockResume, mockJD);
        expect(report.semanticSimilarity).toBeDefined();
        expect(report.semanticSimilarity).toBeGreaterThan(0);
    });
});
