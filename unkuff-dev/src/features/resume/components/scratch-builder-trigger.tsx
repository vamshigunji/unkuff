"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ScratchBuilderTriggerProps {
    jobId: string;
    onComplete?: (data: any) => void;
}

export function ScratchBuilderTrigger({ jobId, onComplete }: ScratchBuilderTriggerProps) {
    const [isBuilding, setIsBuilding] = useState(false);
    const [overexaggerate, setOverexaggerate] = useState(false);

    const handleBuild = async () => {
        setIsBuilding(true);
        try {
            const res = await fetch("/api/resume/build", {
                method: "POST",
                body: JSON.stringify({ jobId, overexaggerate }),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error("Failed to build resume");

            const data = await res.json();
            toast.success("AI Resume built from scratch!");
            onComplete?.(data);
        } catch (error) {
            toast.error("Build failed. Check console.");
            console.error(error);
        } finally {
            setIsBuilding(false);
        }
    };

    return (
        <div className="w-full space-y-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-active-blue" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">AI Builder</span>
                </div>
                <button 
                    onClick={() => setOverexaggerate(!overexaggerate)}
                    className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-all",
                        overexaggerate 
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                            : "bg-white/5 text-muted-foreground border border-transparent"
                    )}
                >
                    {overexaggerate ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    FAKE IT MODE
                </button>
            </div>
            
            <p className="text-[11px] text-muted-foreground leading-relaxed">
                Build a new resume from scratch tailored precisely for this role.
            </p>

            <Button
                onClick={handleBuild}
                disabled={isBuilding}
                className="w-full h-10 bg-active-blue hover:bg-active-blue/90 text-white rounded-xl gap-2 font-bold text-sm shadow-lg shadow-active-blue/20"
            >
                {isBuilding ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Architecting...
                    </>
                ) : (
                    <>
                        <Wand2 className="w-4 h-4" />
                        Build from Scratch
                    </>
                )}
            </Button>
        </div>
    );
}
