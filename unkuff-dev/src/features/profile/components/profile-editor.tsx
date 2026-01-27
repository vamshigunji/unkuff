"use client";

import { useState, useCallback, useRef } from "react";
import {
    User,
    Briefcase,
    GraduationCap,
    Award,
    Tag,
    Check,
    Loader2,
    FileText,
    Target,
    Lightbulb,
    FileUp,
    ChevronLeft,
    ChevronRight,
    CheckCircle2
} from "lucide-react";

import { ContactSection } from "./contact-section";
import { WorkExperienceSection } from "./work-experience-section";
import { EducationSection } from "./education-section";
import { SkillsSection } from "./skills-section";
import { CertificationsSection } from "./certifications-section";
import { SummarySection } from "./summary-section";
import { AccomplishmentsSection } from "./accomplishments-section";
import { PowerStatementsSection } from "./power-statements-section";

// Type definitions for profile data
export interface ProfileData {
    id?: string;
    userId: string;
    name: string | null;
    bio: string | null;
    summary: string | null;
    location: string | null;
    phone: string | null;
    address: string | null;
    idNumber: string | null;
    hobbies: string[] | null;
    interests: string[] | null;
}

export interface WorkExperienceData {
    id: string;
    profileId: string;
    company: string;
    title: string;
    description: string | null;
    accomplishments: string[] | null;
    location: string | null;
    startDate: Date | null;
    endDate: Date | null;
    isCurrent: string | null;
}

export interface EducationData {
    id: string;
    profileId: string;
    institution: string;
    degree: string | null;
    fieldOfStudy: string | null;
    location: string | null;
    startDate: Date | null;
    endDate: Date | null;
}

export interface SkillData {
    id: string;
    profileId: string;
    name: string;
    level: string | null;
    category: string | null;
}

export interface CertificationData {
    id: string;
    profileId: string;
    name: string;
    issuer: string;
    issueDate: Date | null;
    expiryDate: Date | null;
    credentialId: string | null;
    link: string | null;
}

export interface AccomplishmentData {
    id: string;
    profileId: string;
    title: string;
    description: string;
    impact: string | null;
    category: string | null;
}

export interface PowerStatementData {
    id: string;
    profileId: string;
    statement: string;
    context: string | null;
    category: string | null;
}

interface ProfileEditorProps {
    userId: string;
    userEmail: string;
    userName: string;
    initialProfile: ProfileData | null;
    initialWorkExperience: WorkExperienceData[];
    initialEducation: EducationData[];
    initialSkills: SkillData[];
    initialCertifications: CertificationData[];
}

type StepId = "upload" | "contact" | "summary" | "experience" | "education" | "skills" | "accomplishments" | "power-statements" | "certifications" | "complete";

interface Step {
    id: StepId;
    label: string;
    icon: React.ReactNode;
}

// Define the wizard steps - Upload is FIRST
const WIZARD_STEPS: Step[] = [
    { id: "upload", label: "Upload Resume", icon: <FileUp className="h-4 w-4" /> },
    { id: "contact", label: "Contact", icon: <User className="h-4 w-4" /> },
    { id: "summary", label: "Summary", icon: <FileText className="h-4 w-4" /> },
    { id: "experience", label: "Experience", icon: <Briefcase className="h-4 w-4" /> },
    { id: "education", label: "Education", icon: <GraduationCap className="h-4 w-4" /> },
    { id: "skills", label: "Skills", icon: <Tag className="h-4 w-4" /> },
    { id: "accomplishments", label: "Accomplishments", icon: <Target className="h-4 w-4" /> },
    { id: "power-statements", label: "Power Statements", icon: <Lightbulb className="h-4 w-4" /> },
    { id: "certifications", label: "Certifications", icon: <Award className="h-4 w-4" /> },
];

export function ProfileEditor({
    userId,
    userEmail,
    userName,
    initialProfile,
    initialWorkExperience,
    initialEducation,
    initialSkills,
    initialCertifications,
}: ProfileEditorProps) {
    // Check if profile exists for conditional UI
    const hasExistingProfile = initialProfile !== null;
    // Always start at Step 1 (Upload Resume) to give users the choice
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
    // Don't auto-mark upload as complete - let user take action
    const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentStep = WIZARD_STEPS[currentStepIndex];

    const handleSaveStart = useCallback(() => {
        setSaveStatus("saving");
    }, []);

    const handleSaveComplete = useCallback((success: boolean) => {
        setSaveStatus(success ? "saved" : "error");
        if (success) {
            // Mark current step as completed
            setCompletedSteps(prev => new Set([...prev, currentStep.id]));
            setTimeout(() => setSaveStatus("idle"), 2000);
        }
    }, [currentStep.id]);

    const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload a PDF or Word document');
            return;
        }

        setIsUploading(true);
        setUploadProgress("Uploading resume...");

        try {
            const formData = new FormData();
            formData.append('resume', file);

            setUploadProgress("AI is analyzing your resume...");

            const response = await fetch('/api/profile/parse-resume', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to parse resume');
            }

            setUploadProgress("Auto-filling your profile...");

            // Mark upload as complete and move to next step
            setCompletedSteps(prev => new Set([...prev, "upload"]));

            import('sonner').then(({ toast }) => {
                toast.success("Resume processed successfully! Auto-filling your data...");
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            });

        } catch (error) {
            console.error('Resume upload failed:', error);
            setUploadProgress(null);
            alert('Failed to parse resume. Please try again or fill in manually.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const goToNextStep = () => {
        if (currentStepIndex < WIZARD_STEPS.length - 1) {
            // Mark current step as completed
            setCompletedSteps(prev => new Set([...prev, currentStep.id]));
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const goToStep = (index: number) => {
        // Allow navigation to any step (for review)
        setCurrentStepIndex(index);
    };

    const skipUpload = () => {
        setCompletedSteps(prev => new Set([...prev, "upload"]));
        setCurrentStepIndex(1);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                        Step {currentStepIndex + 1} of {WIZARD_STEPS.length}
                    </span>
                    {/* Save Status */}
                    <div className="flex items-center gap-2 text-xs">
                        {saveStatus === "saving" && (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin text-active-blue" />
                                <span className="text-muted-foreground">Saving...</span>
                            </>
                        )}
                        {saveStatus === "saved" && (
                            <>
                                <Check className="h-3 w-3 text-emerald-green" />
                                <span className="text-emerald-green">Saved</span>
                            </>
                        )}
                        {saveStatus === "error" && (
                            <span className="text-destructive">Save failed</span>
                        )}
                    </div>
                </div>

                {/* Step Indicators */}
                <div className="flex items-center gap-1">
                    {WIZARD_STEPS.map((step, index) => (
                        <button
                            key={step.id}
                            onClick={() => goToStep(index)}
                            className={`
                                flex-1 h-1.5 rounded-full transition-all cursor-pointer
                                ${index === currentStepIndex
                                    ? "bg-active-blue"
                                    : completedSteps.has(step.id)
                                        ? "bg-emerald-green"
                                        : "bg-white/10"
                                }
                            `}
                            title={step.label}
                        />
                    ))}
                </div>
            </div>

            {/* Current Step Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${currentStep.id === "upload" ? "bg-active-blue/20 text-active-blue" : "bg-white/[0.08]"}`}>
                    {currentStep.icon}
                </div>
                <div>
                    <h2 className="font-semibold text-lg">{currentStep.label}</h2>
                    {currentStep.id === "upload" && (
                        <p className="text-sm text-muted-foreground">Upload your resume to auto-fill all sections</p>
                    )}
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto scroll-smooth">
                {currentStep.id === "upload" && (
                    <div className="flex flex-col items-center justify-center py-12 px-6">
                        <div className="max-w-md w-full space-y-6">
                            {/* Show existing profile notice if data exists */}
                            {hasExistingProfile && (
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                                    <p className="font-medium text-emerald-400">Profile data exists</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        You can re-upload to update your data, or skip to review what you have.
                                    </p>
                                </div>
                            )}

                            {/* Upload Dropzone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative p-8 rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.04] hover:border-active-blue/50 transition-all cursor-pointer group"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleResumeUpload}
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center text-center">
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="h-12 w-12 text-active-blue animate-spin mb-4" />
                                            <p className="font-medium text-foreground">{uploadProgress}</p>
                                            <p className="text-sm text-muted-foreground mt-1">Please wait...</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-4 rounded-full bg-active-blue/10 mb-4 group-hover:bg-active-blue/20 transition-colors">
                                                <FileUp className="h-10 w-10 text-active-blue" />
                                            </div>
                                            <p className="font-medium text-foreground">
                                                {hasExistingProfile ? "Re-upload resume" : "Drop your resume here or click to browse"}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">Supports PDF, DOC, DOCX (max 10MB)</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
                                <p className="text-sm text-muted-foreground text-center">
                                    {hasExistingProfile
                                        ? "Re-uploading will update all your profile data with fresh information from the resume."
                                        : "Your resume will be parsed and all sections will be auto-filled for you to review."
                                    }
                                </p>
                            </div>

                            {/* Skip Option */}
                            <div className="text-center">
                                <button
                                    onClick={skipUpload}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                                >
                                    {hasExistingProfile ? "Skip to review my profile" : "Skip and fill manually"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep.id === "contact" && (
                    <ContactSection
                        userId={userId}
                        userEmail={userEmail}
                        userName={userName}
                        initialData={initialProfile}
                        onSaveStart={handleSaveStart}
                        onSaveComplete={handleSaveComplete}
                    />
                )}

                {currentStep.id === "summary" && (
                    <SummarySection
                        userId={userId}
                        initialData={initialProfile}
                        onSaveStart={handleSaveStart}
                        onSaveComplete={handleSaveComplete}
                    />
                )}

                {currentStep.id === "experience" && (
                    <WorkExperienceSection
                        profileId={userId}
                        initialData={initialWorkExperience}
                        onSaveStart={handleSaveStart}
                        onSaveComplete={handleSaveComplete}
                    />
                )}

                {currentStep.id === "education" && (
                    <EducationSection
                        profileId={userId}
                        initialData={initialEducation}
                        onSaveStart={handleSaveStart}
                        onSaveComplete={handleSaveComplete}
                    />
                )}

                {currentStep.id === "skills" && (
                    <SkillsSection
                        profileId={userId}
                        initialData={initialSkills}
                        onSaveStart={handleSaveStart}
                        onSaveComplete={handleSaveComplete}
                    />
                )}

                {currentStep.id === "accomplishments" && (
                    <AccomplishmentsSection
                        profileId={userId}
                        initialData={[]}
                        onSaveStart={handleSaveStart}
                        onSaveComplete={handleSaveComplete}
                    />
                )}

                {currentStep.id === "power-statements" && (
                    <PowerStatementsSection
                        profileId={userId}
                        initialData={[]}
                        onSaveStart={handleSaveStart}
                        onSaveComplete={handleSaveComplete}
                    />
                )}

                {currentStep.id === "certifications" && (
                    <CertificationsSection
                        profileId={userId}
                        initialData={initialCertifications}
                        onSaveStart={handleSaveStart}
                        onSaveComplete={handleSaveComplete}
                    />
                )}
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                <button
                    onClick={goToPreviousStep}
                    disabled={currentStepIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </button>

                <div className="flex items-center gap-2">
                    {/* Step dots for quick navigation */}
                    {WIZARD_STEPS.map((step, index) => (
                        <button
                            key={step.id}
                            onClick={() => goToStep(index)}
                            className={`
                                w-2 h-2 rounded-full transition-all
                                ${index === currentStepIndex
                                    ? "bg-active-blue w-4"
                                    : completedSteps.has(step.id)
                                        ? "bg-emerald-green"
                                        : "bg-white/20 hover:bg-white/40"
                                }
                            `}
                            title={step.label}
                        />
                    ))}
                </div>

                <button
                    onClick={() => {
                        if (currentStepIndex === WIZARD_STEPS.length - 1) {
                            // On last step, mark complete and redirect to dashboard
                            import('sonner').then(({ toast }) => {
                                toast.success("Profile complete! Redirecting to dashboard...");
                            });
                            setTimeout(() => {
                                window.location.href = '/dashboard';
                            }, 1000);
                        } else {
                            goToNextStep();
                        }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-active-blue text-white rounded-lg hover:bg-active-blue/80 transition-all"
                >
                    {currentStepIndex === WIZARD_STEPS.length - 1 ? (
                        <>
                            <CheckCircle2 className="h-4 w-4" />
                            Complete
                        </>
                    ) : (
                        <>
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
