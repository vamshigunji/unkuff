"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, User, FileText, Settings, LogOut, Database } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    {
        section: "Jobs",
        items: [
            { href: "/dashboard", icon: LayoutDashboard, label: "My Applications" },
            { href: "/dashboard/criteria", icon: Search, label: "Job Criteria" },
        ]
    },
    {
        section: "Me",
        items: [
            { href: "/dashboard/profile", icon: User, label: "My Resume" },
            { href: "/dashboard/resumes", icon: FileText, label: "Tailored Resumes" },
        ]
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex w-56 border-r border-white/10 flex-col fixed h-full bg-white/[0.03] backdrop-blur-[40px] z-50">
            {/* Refraction border effect */}
            <div className="absolute inset-0 border-r border-white/5 pointer-events-none" />

            {/* Logo */}
            <div className="flex items-center gap-2 p-4 mb-1">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-active-blue to-emerald-green flex items-center justify-center shadow-lg shadow-active-blue/20 transform hover:scale-105 transition-transform duration-300">
                    <span className="text-white font-black text-lg italic select-none">U</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-bold tracking-tight select-none">unkuff</span>
                    <span className="text-[9px] text-muted-foreground font-medium tracking-wider">Job Search Companion</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-0.5">
                {navItems.map((section) => (
                    <div key={section.section}>
                        <div className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-2 py-1.5 mt-4 first:mt-0">
                            {section.section}
                        </div>
                        {section.items.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                                        isActive
                                            ? "text-active-blue bg-active-blue/10"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/[0.08]"
                                    )}
                                >
                                    <span className={cn(
                                        "transition-transform duration-200 group-hover:scale-110",
                                        isActive ? "text-active-blue" : "group-hover:text-active-blue"
                                    )}>
                                        <item.icon className="h-4 w-4" />
                                    </span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Bottom Section - Settings */}
            <div className="mt-auto border-t border-white/5 p-3 space-y-2">
                <Link
                    href="/dashboard/settings"
                    className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                        pathname === "/dashboard/settings"
                            ? "text-active-blue bg-active-blue/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/[0.08]"
                    )}
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </Link>

                {/* User Avatar Placeholder */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-active-blue/30 to-emerald-green/30 border border-white/20 flex items-center justify-center text-xs font-bold">
                            U
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-xs font-semibold truncate">User</span>
                            <span className="text-[10px] text-muted-foreground truncate">Sign in to continue</span>
                        </div>
                    </div>
                </div>

                {/* Sign In Link */}
                <Link
                    href="/login"
                    className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-active-blue hover:text-active-blue/80 hover:bg-active-blue/10 rounded-xl transition-all duration-200 font-medium"
                >
                    <LogOut className="h-4 w-4" />
                    Sign In
                </Link>
            </div>
        </aside>
    );
}
