import { auth } from "@/auth";
import { getIngestionStats, getRecentJobs } from "@/features/ingestion/queries";
import { DiscoveryForm } from "@/features/ingestion/components/discovery-form";
import { IngestionStats } from "@/features/ingestion/components/ingestion-stats";
import { JobFeed } from "@/features/ingestion/components/job-feed";
import { redirect } from "next/navigation";

export default async function IngestionDashboardPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const stats = await getIngestionStats(session.user.id);
    const jobs = await getRecentJobs(session.user.id);

    return (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="flex flex-col gap-1">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic">Ingestion Dashboard</h1>
                <p className="text-muted-foreground font-medium">Unified management for decentralized job discovery.</p>
            </header>

            <IngestionStats stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 flex flex-col gap-10">
                    <JobFeed jobs={jobs} />
                </div>

                <div className="flex flex-col gap-8">
                    <DiscoveryForm />

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <h4 className="text-sm font-bold tracking-widest uppercase text-zinc-500">Service Status</h4>
                            <p className="text-xs text-muted-foreground font-medium">Real-time health of ingestion providers.</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <ProviderHealth name="Arbeitnow" status="Healthy" />
                            <ProviderHealth name="MockProvider" status="Healthy" />
                            <ProviderHealth name="Jooble" status="Pending Key" warning />
                            <ProviderHealth name="TheirStack" status="Pending Key" warning />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProviderHealth({ name, status, warning = false }: { name: string, status: string, warning?: boolean }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <span className="text-sm font-medium">{name}</span>
            <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${warning ? "bg-amber-400" : "bg-green-400"} animate-pulse`} />
                <span className={`text-[10px] font-bold uppercase tracking-widest ${warning ? "text-amber-400/80" : "text-green-400/80"}`}>
                    {status}
                </span>
            </div>
        </div>
    );
}
