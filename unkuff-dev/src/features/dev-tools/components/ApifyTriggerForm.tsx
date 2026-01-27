/**
 * Apify Trigger Form
 * Story 7.1: Manual trigger UI with form inputs
 * AC2: Manual Trigger Button UI
 * AC3: Real-Time Ingestion Feedback
 */
"use client";

import { useState, useTransition } from "react";
import { triggerDevIngestion } from "../actions";
import { IngestionStatusCard } from "./IngestionStatusCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { IngestionStatus } from "../types";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function ApifyTriggerForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<IngestionStatus>({
        phase: "idle",
        message: "Ready to trigger ingestion",
    });

    const [formData, setFormData] = useState({
        keyword: "Data Scientist",
        location: "San Francisco",
        maxResults: "5",
        source: "linkedin" as "linkedin" | "indeed" | "both",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setStatus({ phase: "starting", message: "🔄 Initializing Apify actor..." });

        startTransition(async () => {
            try {
                setStatus({ phase: "fetching", message: "📥 Fetching jobs from " + formData.source + "..." });

                const result = await triggerDevIngestion({
                    keyword: formData.keyword,
                    location: formData.location,
                    maxResults: parseInt(formData.maxResults),
                    source: formData.source,
                });

                if (result.error) {
                    setStatus({
                        phase: "error",
                        message: "❌ " + result.error,
                    });
                } else {
                    setStatus({
                        phase: "complete",
                        message: "✅ Ingestion complete!",
                        result: {
                            newJobs: result.data?.newJobs ?? 0,
                            duplicates: result.data?.duplicates ?? 0,
                            errors: result.data?.errors,
                        },
                    });
                }
            } catch (error) {
                setStatus({
                    phase: "error",
                    message: "❌ Unexpected error: " + String(error),
                });
            }
        });
    };

    const handleRefresh = () => {
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {/* Form Inputs - AC2 */}
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-amber-300 text-xs">Job Title/Keyword *</Label>
                    <Input
                        value={formData.keyword}
                        onChange={(e) => setFormData(f => ({ ...f, keyword: e.target.value }))}
                        placeholder="Data Scientist"
                        required
                        className="bg-black/30 border-amber-700/50 text-white text-sm h-8"
                    />
                </div>
                <div>
                    <Label className="text-amber-300 text-xs">Location</Label>
                    <Input
                        value={formData.location}
                        onChange={(e) => setFormData(f => ({ ...f, location: e.target.value }))}
                        placeholder="San Francisco"
                        className="bg-black/30 border-amber-700/50 text-white text-sm h-8"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-amber-300 text-xs">Max Results</Label>
                    <Select
                        value={formData.maxResults}
                        onValueChange={(v) => setFormData(f => ({ ...f, maxResults: v }))}
                    >
                        <SelectTrigger className="bg-black/30 border-amber-700/50 text-white text-sm h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="3">3 (minimal cost)</SelectItem>
                            <SelectItem value="5">5 (default)</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25 (high cost)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="text-amber-300 text-xs">Source</Label>
                    <Select
                        value={formData.source}
                        onValueChange={(v: "linkedin" | "indeed" | "both") => setFormData(f => ({ ...f, source: v }))}
                    >
                        <SelectTrigger className="bg-black/30 border-amber-700/50 text-white text-sm h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="indeed">Indeed</SelectItem>
                            <SelectItem value="both">Both (2x cost)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Action Section */}
            <div className="pt-2 border-t border-amber-700/30">
                <p className="text-amber-600 text-xs mb-2">
                    ⚠️ This will consume Apify API credits
                </p>
                <Button
                    type="submit"
                    disabled={isPending || !formData.keyword}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-black font-semibold h-9"
                >
                    {isPending ? "⏳ Running..." : "🚀 Trigger Apify Pull"}
                </Button>
            </div>

            {/* Status Display - AC3 */}
            <IngestionStatusCard status={status} />

            {/* Refresh Button - AC4 */}
            {status.phase === "complete" && (
                <Button
                    type="button"
                    onClick={handleRefresh}
                    variant="outline"
                    className="w-full border-emerald-600/50 text-emerald-400 hover:bg-emerald-900/30 h-8"
                >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Refresh Kanban
                </Button>
            )}
        </form>
    );
}
