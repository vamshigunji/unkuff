import * as fs from 'fs';
import * as mammoth from 'mammoth';

/**
 * Extracts text from a DOCX file using mammoth library.
 * Provides reliable cross-platform DOCX text extraction.
 */
export async function extractTextFromDocx(filePath: string): Promise<string> {
    console.log(`[DOCX Parser] Extracting text from: ${filePath}`);

    const result = await mammoth.extractRawText({ path: filePath });

    if (result.messages.length > 0) {
        console.log('[DOCX Parser] Mammoth messages:', result.messages);
    }

    const text = result.value.trim();

    if (!text) {
        throw new Error('DOCX file contains no extractable text');
    }

    console.log(`[DOCX Parser] Extracted ${text.length} characters`);
    return text;
}

/**
 * Extracts raw text from a PDF file using pdf-parse.
 * Uses dynamic import to avoid issues in test environments.
 */
export async function extractTextFromPdf(filePath: string): Promise<string> {
    console.log(`[PDF Parser] Extracting text from: ${filePath}`);

    const dataBuffer = fs.readFileSync(filePath);
    // Use require for pdf-parse as it doesn't have proper ESM support
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(dataBuffer);
    const text = data.text.trim();

    if (!text) {
        throw new Error('PDF file contains no extractable text');
    }

    console.log(`[PDF Parser] Extracted ${text.length} characters`);
    return text;
}

/**
 * Extracts text from a resume file based on its MIME type.
 * Returns a Promise since both PDF and DOCX parsing are async.
 */
export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
    console.log(`[File Parser] Processing file with MIME type: ${mimeType}`);

    if (mimeType === 'application/pdf') {
        return extractTextFromPdf(filePath);
    }

    if (mimeType.includes('officedocument.wordprocessingml.document')) {
        return extractTextFromDocx(filePath);
    }

    if (mimeType === 'application/msword') {
        // Legacy .doc format is not supported by mammoth
        throw new Error('Legacy .doc format is not supported. Please convert to .docx or .pdf');
    }

    if (mimeType === 'text/plain') {
        const text = fs.readFileSync(filePath, 'utf-8').trim();
        if (!text) {
            throw new Error('Text file is empty');
        }
        console.log(`[File Parser] Extracted ${text.length} characters from text file`);
        return text;
    }

    throw new Error(`Unsupported file type: ${mimeType}. Please upload a PDF, DOCX, or TXT file.`);
}
