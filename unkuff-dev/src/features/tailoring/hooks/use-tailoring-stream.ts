"use client";

import { useState } from "react";
import { type TailoringStatus } from "../components/explainable-shimmer";

// Proper type for tailoring result
export interface TailoringResult {
    resumeId: string;
    score: number;
    resume: Record<string, unknown>;
}

interface UseTailoringStreamResult {
    status: TailoringStatus;
    result: TailoringResult | null;
    startTailoring: (jobId: string, templateId?: string) => Promise<void>;
    reset: () => void;
}

export function useTailoringStream(): UseTailoringStreamResult {
    const [status, setStatus] = useState<TailoringStatus>("idle");
    const [result, setResult] = useState<TailoringResult | null>(null);

    const startTailoring = async (jobId: string, templateId: string = "default") => {
        setStatus("thinking");
        setResult(null);

        try {
            const response = await fetch("/api/tailoring/stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId, templateId })
            });

            if (!response.ok) {
                console.error("Tailoring request failed");
                setStatus("error");
                return;
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No reader");

            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const jsonStr = line.replace("data: ", "");
                            const msg = JSON.parse(jsonStr);

                            if (msg.type === "status") {
                                setStatus(msg.content as TailoringStatus);
                            } else if (msg.type === "result") {
                                setResult(msg.content);
                                setStatus("complete");
                            } else if (msg.type === "error") {
                                setStatus("error");
                            }
                        } catch (e) {
                            // ignore partial chunks
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    };

    const reset = () => {
        setStatus("idle");
        setResult(null);
    };

    return { status, result, startTailoring, reset };
}
