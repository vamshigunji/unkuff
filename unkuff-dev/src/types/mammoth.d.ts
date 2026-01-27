declare module 'mammoth' {
    interface ExtractRawTextResult {
        value: string;
        messages: Array<{
            type: string;
            message: string;
        }>;
    }

    interface ExtractOptions {
        path?: string;
        buffer?: Buffer;
    }

    function extractRawText(options: ExtractOptions): Promise<ExtractRawTextResult>;

    export { extractRawText, ExtractRawTextResult, ExtractOptions };
}
