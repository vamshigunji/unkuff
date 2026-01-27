
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { jobs, profiles, generatedResumes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { tailoringRequestSchema } from "@/features/tailoring/schema";
import { generateOptimizedResume } from "@/features/tailoring/service";

export const maxDuration = 45; // 45s timeout for tailoring (NFR3)

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new Response("Unauthorized", { status: 401 });
        }

        const json = await req.json();
        const validated = tailoringRequestSchema.safeParse(json);

        if (!validated.success) {
            return new Response("Invalid request", { status: 400 });
        }

        // 1. Fetch Data (blocking, before stream starts)
        const job = await db.query.jobs.findFirst({
            where: eq(jobs.id, validated.data.jobId)
        });

        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.userId, session.user.id),
            with: {
                workExperience: true,
                skills: true,
                education: true
            }
        });

        if (!job || !profile) {
            return new Response("Data not found", { status: 404 });
        }

        // 2. Prepare Data
        const profileData = {
            bio: profile.bio || "",
            // @ts-ignore
            workExperience: profile.workExperience || [],
            // @ts-ignore
            skills: profile.skills.map(s => ({ name: s.name })) || [],
            // @ts-ignore
            education: profile.education || []
        };

        const jobData = {
            title: job.title,
            description: job.description || "",
            company: job.company
        };

        // 3. Create Stream using custom logic
        // We need to stream statuses ("Thinking", "Mapping") and then the final JSON.
        // Since generateOptimizedResume is NOT a stream itself but a loop,
        // we will manually construct a ReadableStream.

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                const send = (msg: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));

                try {
                    // Status callback
                    const onStatus = (status: string) => {
                        send({ type: "status", content: status });
                    };

                    const result = await generateOptimizedResume(profileData, jobData, 3, onStatus);

                    // Persist
                    const [savedResume] = await db.insert(generatedResumes).values({
                        userId: session!.user!.id!,
                        jobId: validated.data.jobId,
                        content: result.resume,
                        atsScore: result.score,
                        templateId: validated.data.templateId || "default",
                    }).returning();

                    // Send Final Result
                    send({ type: "result", content: { resumeId: savedResume.id, score: result.score, resume: result.resume } });

                    controller.close();
                } catch (err) {
                    console.error("Stream Error", err);
                    send({ type: "error", content: "Failed to generate resume" });
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (e) {
        console.error(e);
        return new Response("Internal Error", { status: 500 });
    }
}
