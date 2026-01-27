"use client";

import React, { useState } from "react";
import { 
    Search, 
    Upload, 
    Sparkles, 
    MoreVertical, 
    Edit2, 
    Check, 
    Clock, 
    Target,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MOCK_RESUMES = [
    {
        id: "1",
        name: "Sarah Chen",
        subtitle: "VCA Match",
        lastModified: "2 hours ago",
        targetRole: "Senior Product Designer",
        status: "Active",
        type: "Tailored"
    },
    {
        id: "2",
        name: "Sergey Chen",
        subtitle: "Pre-Active",
        lastModified: "1 day ago",
        targetRole: "Startup - ML Lead",
        status: "Draft",
        type: "Tailored"
    },
    {
        id: "3",
        name: "General Resume",
        subtitle: "Download",
        lastModified: "3 days ago",
        targetRole: "Universal",
        status: "Active",
        type: "Base"
    }
];

export function ResumeList() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("All");

    const filteredResumes = MOCK_RESUMES.filter(resume => {
        const matchesSearch = resume.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             resume.targetRole.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "All" || 
                          (activeTab === "Tailored" && resume.type === "Tailored") ||
                          (activeTab === "Base" && resume.type === "Base");
        return matchesSearch && matchesTab;
    });

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Resume Manager
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Manage all your tailored resumes in one place
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-full bg-white/5 border-white/10 hover:bg-white/10 gap-2 px-6">
                        <Upload size={16} />
                        Upload Resume
                    </Button>
                    <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 px-6">
                        <Sparkles size={16} />
                        Create with AI
                    </Button>
                </div>
            </div>

            {/* Tabs and Search Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="p-1 bg-white/5 border border-white/10 rounded-full flex w-fit">
                    {["All Resumes", "Tailored", "Base"].map((tab) => {
                        const tabKey = tab === "All Resumes" ? "All" : tab;
                        const isActive = activeTab === tabKey;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tabKey)}
                                className={cn(
                                    "px-6 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
                                    isActive 
                                        ? "bg-white/10 text-foreground shadow-sm" 
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>

                <div className="relative group max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" size={18} />
                    <Input 
                        placeholder="Search resumes..." 
                        className="pl-10 rounded-full bg-white/5 border-white/10 focus-visible:ring-primary/50 transition-all duration-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List View */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resume Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Modified</th>
                            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Role</th>
                            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredResumes.map((resume, index) => (
                            <tr 
                                key={resume.id} 
                                className="group hover:bg-white/[0.04] transition-colors duration-300"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                                            {resume.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {resume.subtitle}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock size={14} />
                                        {resume.lastModified}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <Target size={14} className="text-primary/70" />
                                        {resume.targetRole}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
                                        resume.status === "Active" 
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    )}>
                                        {resume.status === "Active" && <Check size={12} />}
                                        {resume.status}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-8 rounded-lg hover:bg-white/10 px-3"
                                            onClick={() => window.location.href = `/dashboard/resumes?view=${resume.id}`}
                                        >
                                            Edit
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            className="h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 px-4"
                                            onClick={() => window.location.href = `/dashboard/resumes?view=${resume.id}`}
                                        >
                                            Select
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {filteredResumes.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4">
                            <Search className="text-muted-foreground" size={24} />
                        </div>
                        <p className="text-muted-foreground">No resumes found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
