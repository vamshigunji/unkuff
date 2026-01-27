import { Zap, Database, CheckCircle2 } from "lucide-react";

export function IngestionStats({ stats }: { stats: { total: number, recommended: number, hydrated: number } }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
                label="Total Discovered"
                value={stats.total}
                icon={<Database className="h-5 w-5 text-zinc-400" />}
                description="Cross-source unique records"
            />
            <StatCard
                label="Recommended"
                value={stats.recommended}
                icon={<CheckCircle2 className="h-5 w-5 text-green-400" />}
                description="High-fidelity candidates"
            />
            <StatCard
                label="AI Deep Dives"
                value={stats.hydrated}
                icon={<Zap className="h-5 w-5 text-blue-400" />}
                description="Hydrated truth anchors"
            />
        </div>
    );
}

function StatCard({ label, value, icon, description }: { label: string, value: number, icon: React.ReactNode, description: string }) {
    return (
        <div className="flex flex-col gap-2 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    {icon}
                </div>
            </div>
            <div className="flex flex-col">
                <span className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{description}</span>
            </div>
        </div>
    );
}
