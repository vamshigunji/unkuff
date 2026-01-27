import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getResumeData, hasProfileData } from "@/features/resume/actions";
import { ResumePreviewWorkspace } from "@/features/resume/components";

export default async function ResumesPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    // Fetch resume data and profile status in parallel
    const [resumeResult, profileResult] = await Promise.all([
        getResumeData(),
        hasProfileData(),
    ]);

    const hasProfile = profileResult.data ?? false;
    const resumeData = resumeResult.data;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Resume Preview</h1>
                    <p className="text-sm text-muted-foreground">
                        Preview and customize your professional resume
                    </p>
                </div>
            </div>

            {/* Resume Preview Workspace (Client Component) */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <ResumePreviewWorkspace
                    initialData={resumeData}
                    hasProfile={hasProfile}
                />
            </div>
        </div>
    );
}
