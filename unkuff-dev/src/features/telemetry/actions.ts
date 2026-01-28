"use server";

import { db } from "@/lib/db";
import { systemLogs } from "./schema";
import { desc, lt } from "drizzle-orm";

export async function logEvent(module: string, message: string, level: string = "info", metadata: any = null) {
    try {
        await db.insert(systemLogs).values({
            module,
            message,
            level,
            metadata,
        });
    } catch (e) {
        console.error("Failed to log event:", e);
    }
}

export async function getRecentLogs(limit: number = 50) {
    try {
        return await db.query.systemLogs.findMany({
            orderBy: [desc(systemLogs.createdAt)],
            limit,
        });
    } catch (e) {
        console.error("Failed to fetch logs:", e);
        return [];
    }
}
