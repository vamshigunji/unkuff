import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getResumeData, hasProfileData } from "@/features/resume/actions";
import { ResumeList, AIResumeEditor } from "@/features/resume/components";

export default async function ResumesPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ jobId?: string, view?: string }> 
}) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const params = await searchParams;
    const isEditing = !!(params.jobId || params.view);

    // Fetch resume data and profile status in parallel
    const [resumeResult, profileResult] = await Promise.all([
        getResumeData(params.jobId || params.view),
        hasProfileData(),
    ]);

    const hasProfile = profileResult.data ?? false;
    const resumeData = resumeResult.data;

    return (
        <div className="flex flex-col h-full">
            {isEditing ? (
                <AIResumeEditor 
                    initialData={resumeData} 
                    hasProfile={hasProfile} 
                />
            ) : (
                <ResumeList />
            )}
        </div>
    );
}
