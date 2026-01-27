import { getKanbanBoardData } from "@/features/dashboard/actions";
import { KanbanBoard } from "@/features/dashboard/components/kanban-board";
import { KanbanColumn, SerializedJob } from "@/features/dashboard/types";

export default async function DashboardPage() {
    const data = await getKanbanBoardData();
    // Serialize validation to pass to Client Components
    const serializedData: KanbanColumn<SerializedJob>[] = JSON.parse(JSON.stringify(data));

    return (
        <div className="flex flex-col h-full">
            <KanbanBoard initialData={serializedData} />
        </div>
    );
}


