import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Database, User, LogOut, Search, Settings, Kanban, FileText, Menu } from "lucide-react";
import { signOut } from "@/auth";
import { SidebarStatus } from "@/features/dashboard/components/sidebar-status";
import { DiscoveryProgress } from "@/features/dashboard/components/discovery-progress";
import { DevToolsPanel } from "@/features/dev-tools";

// Ascension Background Component - Inline for Server Component
function AscensionBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
            {/* The Void Fog - Deep Indigo/Charcoal Atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[oklch(0.15_0.05_280)] to-transparent opacity-40 mix-blend-overlay" />

            {/* Primary gradient mesh */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,oklch(0.585_0.233_277.117_/_0.08),transparent)]" />

            {/* The Ascension Beam - Central Career Path */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gradient-to-t from-transparent via-active-blue/30 to-transparent blur-[1px]" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[100px] -translate-x-1/2 bg-gradient-to-t from-transparent via-active-blue/5 to-transparent blur-[60px]" />

            {/* Floating Opportunity Fragments (Glass Shards) */}
            <svg
                className="absolute bottom-[10%] left-[15%] w-64 h-64 opacity-[0.06]"
                viewBox="0 0 100 100"
                style={{ animation: 'float 20s ease-in-out infinite' }}
            >
                <defs>
                    <linearGradient id="shard1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="oklch(0.585 0.233 277.117)" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="oklch(0.696 0.17 162.48)" stopOpacity="0.2" />
                    </linearGradient>
                </defs>
                <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="url(#shard1)" />
            </svg>

            <svg
                className="absolute top-[20%] right-[10%] w-96 h-96 opacity-[0.04]"
                viewBox="0 0 100 100"
                style={{ animation: 'float 25s ease-in-out infinite reverse' }}
            >
                <defs>
                    <linearGradient id="shard2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="oklch(0.585 0.233 277.117)" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="oklch(0.696 0.17 162.48)" stopOpacity="0.2" />
                    </linearGradient>
                </defs>
                <path d="M50 0 L100 25 L50 100 L0 75 Z" fill="url(#shard2)" />
            </svg>

            {/* Nano-Banana Bokeh Effects */}
            <div
                className="absolute top-[30%] right-[25%] w-3 h-3 rounded-full bg-active-blue/20 blur-sm"
                style={{ animation: 'pulse 4s ease-in-out infinite' }}
            />
            <div
                className="absolute bottom-[25%] left-[30%] w-4 h-4 rounded-full bg-emerald-green/15 blur-sm"
                style={{ animation: 'pulse 5s ease-in-out infinite 2s' }}
            />
            <div
                className="absolute top-[60%] right-[40%] w-2 h-2 rounded-full bg-active-blue/25 blur-sm"
                style={{ animation: 'pulse 6s ease-in-out infinite 1s' }}
            />

            {/* Premium Texture Grain */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%\" height=\"100%\" filter=\"url(%23noise)\" opacity=\"0.5\"/%3E%3C/svg%3E')" }}
            />

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                }
            `}</style>
        </div>
    );
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const userName = session.user.name || "User";
    const userEmail = session.user.email || "";
    const userInitial = userName[0]?.toUpperCase() || "U";

    return (
        <div className="flex min-h-screen bg-background text-foreground selection:bg-white selection:text-black">
            <AscensionBackground />

            {/* Liquid Glass Sidebar */}
            <aside className="w-56 border-r border-white/10 flex flex-col fixed h-full bg-white/[0.03] backdrop-blur-[40px] z-50">
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
                    <SidebarStatus />
                    <div className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-2 py-1.5 mt-2">Jobs</div>
                    <SidebarLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="My Applications" />
                    <SidebarLink href="/dashboard/criteria" icon={<Search className="h-4 w-4" />} label="Job Criteria" />

                    <div className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-2 py-1.5 mt-4">Me</div>
                    <SidebarLink href="/dashboard/profile" icon={<User className="h-4 w-4" />} label="My Resume" />
                    <SidebarLink href="/dashboard/resumes" icon={<FileText className="h-4 w-4" />} label="Tailored Resumes" />
                </nav>

                {/* Bottom Section */}
                <div className="mt-auto border-t border-white/5 p-3 space-y-2">
                    {/* Settings */}
                    <SidebarLink href="/dashboard/settings" icon={<Settings className="h-4 w-4" />} label="Settings" />

                    {/* User Profile - Compact */}
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-active-blue/30 to-emerald-green/30 border border-white/20 flex items-center justify-center text-xs font-bold">
                                {userInitial}
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-xs font-semibold truncate">{userName}</span>
                                <span className="text-[10px] text-muted-foreground truncate">{userEmail}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sign Out */}
                    <form action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/login" });
                    }}>
                        <button
                            type="submit"
                            className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 font-medium"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-56 h-screen overflow-hidden">
                {/* Glass Content Container */}
                <div className="p-4 h-full">
                    <div className="bg-white/[0.06] backdrop-blur-[40px] rounded-2xl border border-white/10 h-full shadow-2xl shadow-black/20 relative overflow-hidden">
                        {/* Inner refraction border */}
                        <div className="absolute inset-[1px] rounded-[calc(1rem-1px)] border border-white/5 pointer-events-none" />

                        {/* Content - No internal scroll, full height */}
                        <div className="relative z-10 p-4 lg:p-6 h-full flex flex-col">
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            {/* Discovery Progress Overlay */}
            <DiscoveryProgress />

            {/* Dev Tools Panel - Auto-excluded in production builds */}
            <DevToolsPanel />
        </div>
    );
}

function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-white/[0.08] group"
        >
            <span className="transition-transform duration-200 group-hover:scale-110 group-hover:text-active-blue">
                {icon}
            </span>
            {label}
        </Link>
    );
}
