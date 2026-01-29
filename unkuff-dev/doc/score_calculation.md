# UHS Score Calculation Logic

The **Universal Hiring Score (UHS)** is a 4-factor composite calculation designed to provide a high-fidelity evaluation of a resume against a specific Job Description (JD). It combines vector-based semantic analysis, keyword matching, and structural readability.

## The Formula

The final score is calculated using the following weighted distribution:

$$Score = (Keyword\ Match\ Rate \times 0.5) + (Semantic\ Similarity \times 20) + (Formatting\ Score \times 0.1) + 20\ (Base)$$

---

## Variable Breakdown

### 1. Keyword Match Rate (50% Weight)
- **Calculation**: `(Found Keywords / (Found + Missing Keywords)) * 100`
- **Logic**: This measures exact and near-match alignment for technical skills, tools, and certifications.
- **Max Impact**: 50 points.

### 2. Semantic Similarity (20% Weight)
- **Calculation**: Cosine Similarity using Google's `text-embedding-004` model.
- **Logic**: Captures conceptual alignment and experience level depth, even if specific keywords differ.
- **Max Impact**: 20 points.

### 3. Formatting Score (10% Weight)
- **Calculation**: AI-driven evaluation of ATS readability (0-100 scale).
- **Logic**: Checks for detectable section headers, contact info clarity, and standard font usage.
- **Max Impact**: 10 points.

### 4. Base Score (20% Weight)
- **Logic**: A constant baseline of 20 points awarded for a complete professional profile submission.
- **Impact**: 20 points.

---

## Implementation Details

The calculation is performed in `src/features/matching/services/ats-service.ts`. 

- **Models used**: `gemini-2.0-flash-001` for keyword/formatting extraction and `text-embedding-004` for vector similarity.
- **Rounding**: The final composite result is rounded to the nearest integer.
- **Guardrails**: Includes "Floor Protection" logic to ensure logical scoring even in edge cases where DOM extraction might be limited.
