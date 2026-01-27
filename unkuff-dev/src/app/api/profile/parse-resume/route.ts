import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Parse Resume API Route
 * 
 * This endpoint handles resume file uploads and parsing.
 * Currently a placeholder that acknowledges the upload.
 * Full AI parsing will be implemented in Epic 6 (AI Tailoring).
 */
import { ProfileParserService } from "@/features/profile/parser-service";
import { extractTextFromFile } from "@/features/profile/parser-utils";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const formData = await req.formData();
        const file = formData.get("resume");

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Please upload PDF or Word document." },
                { status: 400 }
            );
        }

        // Save file to temp location for processing
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const tempPath = path.join(os.tmpdir(), `resume-${Date.now()}-${file.name}`);
        fs.writeFileSync(tempPath, buffer);

        try {
            // 1. Extract text (async for PDF support)
            console.log(`[Resume Parse] Extracting text from ${file.name}...`);
            const text = await extractTextFromFile(tempPath, file.type);
            console.log(`[Resume Parse] Extracted ${text.length} characters`);

            if (!text || text.length < 100) {
                return NextResponse.json(
                    { error: "Failed to extract text from resume. File may be empty or corrupted." },
                    { status: 400 }
                );
            }

            // 2. Parse with AI and Save to DB
            console.log(`[Resume Parse] Calling AI parser...`);
            const parser = new ProfileParserService();
            const result = await parser.parseAndSave(session.user.id, text);

            console.log(`[Resume Parse] User ${session.user.id} parsed ${file.name} successfully.`);

            return NextResponse.json({
                success: true,
                message: "Resume parsed and profile updated successfully!",
                data: result
            });
        } finally {
            // Clean up temp file
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }

    } catch (error) {
        console.error("Failed to parse resume:", error);
        return NextResponse.json(
            { error: "Failed to process resume: " + (error instanceof Error ? error.message : "Unknown error") },
            { status: 500 }
        );
    }
}
