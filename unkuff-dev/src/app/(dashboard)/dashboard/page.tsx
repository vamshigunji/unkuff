import { getKanbanBoardData } from "@/features/dashboard/actions";
import { KanbanBoard } from "@/features/dashboard/components/kanban-board";
import { DiscoveryProgress } from "@/features/dashboard/components/discovery-progress"; // Import DiscoveryProgress
import { KanbanColumn, SerializedJob } from "@/features/dashboard/types";

export default async function DashboardPage() {
    const data = await getKanbanBoardData();
    // Serialize validation to pass to Client Components
    const serializedData: KanbanColumn<SerializedJob>[] = JSON.parse(JSON.stringify(data));

    return (
        <div className="flex flex-col h-full">
            <DiscoveryProgress />
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <h1 className="text-xl font-bold text-foreground/90">My Applications</h1>
                <span className="text-xs text-muted-foreground">
                    {serializedData.reduce((acc, col) => acc + col.jobs.length, 0)} jobs tracked
                </span>
            </div>

            {/* Kanban Board - Takes remaining height */}
            <KanbanBoard initialData={serializedData} />
        </div>
    );
}


