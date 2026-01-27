"use client";

import React from "react";
import { DigitalBackground } from "./digital-background";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Menu } from "lucide-react";

interface DashboardLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500 relative">
            <DigitalBackground />

            {/* Sidebar - Persistently docked on desktop */}
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-white/5 backdrop-blur-md sticky top-0 z-40">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-active-blue flex items-center justify-center text-white shadow-lg shadow-active-blue/20">
                            <LayoutDashboard size={20} />
                        </div>
                        <span className="font-bold tracking-tight">unkuff</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                {/* Main Content Area */}
                <main className={cn(
                    "flex-1 p-4 lg:p-8 overflow-auto transition-all duration-300 relative",
                    className
                )}>
                    {/* Glass Content Shield */}
                    <div className="bg-glass-lg rounded-[2.5rem] p-8 min-h-[calc(100vh-4rem)] border border-white/10 shadow-2xl relative z-10">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
