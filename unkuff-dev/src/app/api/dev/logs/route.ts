import { auth } from "@/auth";
import { getRecentLogs } from "@/features/telemetry/actions";

export async function GET() {
    const session = await auth();
    // Allow demo user or anyone for now for debugging
    // if (!session) return new Response("Unauthorized", { status: 401 });

    const logs = await getRecentLogs(50);
    return new Response(JSON.stringify(logs), {
        headers: { "Content-Type": "application/json" }
    });
}
