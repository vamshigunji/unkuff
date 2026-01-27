"use client";

import { useState } from "react";
import { discoverJobs } from "../actions";
import { Search, Loader2 } from "lucide-react";

export function DiscoveryForm() {
    const [query, setQuery] = useState("");
    const [location, setLocation] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await discoverJobs(query, location);
            // In a real app, we'd use router.refresh() or a state update
            window.location.reload();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold tracking-tight">Discovery Engine</h2>
                <p className="text-sm text-muted-foreground">Pulse the market for new opportunities across all aggregators.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Role (e.g. React Developer)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-sans"
                        required
                    />
                </div>
                <input
                    type="text"
                    placeholder="Location (Optional)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-white text-black font-medium py-2 px-6 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Discovering...
                        </>
                    ) : (
                        "Pulse Market"
                    )}
                </button>
            </div>
        </form>
    );
}
