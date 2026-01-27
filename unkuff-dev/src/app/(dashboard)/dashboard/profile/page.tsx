import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profiles, workExperience, education, skills, certifications } from "@/features/profile/schema";
import { eq } from "drizzle-orm";
import { ProfileEditor } from "@/features/profile/components/profile-editor";
import { decrypt } from "@/lib/encryption";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const userId = session.user.id;
    const userEmail = session.user.email || "";
    const userName = session.user.name || "";

    // First fetch the profile to get the profile ID
    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, userId),
    });

    // If profile exists, fetch related data using profile.id
    // Otherwise, return empty arrays (new user)
    const profileId = profile?.id;

    const [workExp, edu, skillsList, certs] = profileId
        ? await Promise.all([
            db.query.workExperience.findMany({
                where: eq(workExperience.profileId, profileId),
                orderBy: (table, { desc }) => [desc(table.startDate)],
            }),
            db.query.education.findMany({
                where: eq(education.profileId, profileId),
                orderBy: (table, { desc }) => [desc(table.startDate)],
            }),
            db.query.skills.findMany({
                where: eq(skills.profileId, profileId),
            }),
            db.query.certifications.findMany({
                where: eq(certifications.profileId, profileId),
                orderBy: (table, { desc }) => [desc(table.issueDate)],
            }),
        ])
        : [[], [], [], []];

    // Decrypt PII fields for display
    const profileData = profile ? {
        ...profile,
        phone: profile.phone ? decrypt(profile.phone) : null,
        address: profile.address ? decrypt(profile.address) : null,
        idNumber: profile.idNumber ? decrypt(profile.idNumber) : null,
    } : null;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
                    <p className="text-sm text-muted-foreground">
                        Your professional information
                    </p>
                </div>
            </div>


            {/* Profile Editor (Client Component) */}
            <div className="flex-1 overflow-y-auto">
                <ProfileEditor
                    userId={userId}
                    userEmail={userEmail}
                    userName={userName}
                    initialProfile={profileData}
                    initialWorkExperience={workExp || []}
                    initialEducation={edu || []}
                    initialSkills={skillsList || []}
                    initialCertifications={certs || []}
                />
            </div>
        </div>
    );
}

