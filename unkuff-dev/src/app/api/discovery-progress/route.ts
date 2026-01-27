import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { discoveryProgress } from "@/features/dashboard/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        const progress = await db.query.discoveryProgress.findFirst({
            where: eq(discoveryProgress.userId, userId),
            orderBy: (progress, { desc }) => [desc(progress.updatedAt)],
        });

        if (!progress) {
            return NextResponse.json({ message: "No discovery progress found" }, { status: 404 });
        }

        return NextResponse.json(progress, { status: 200 });
    } catch (error) {
        console.error("Error fetching discovery progress:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
