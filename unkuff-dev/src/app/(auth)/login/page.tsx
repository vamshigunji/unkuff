"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        startTransition(async () => {
            try {
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.error) {
                    setError("Invalid email or password. Please try again.");
                } else {
                    router.push("/dashboard");
                    router.refresh();
                }
            } catch {
                setError("An unexpected error occurred. Please try again.");
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background selection:bg-white selection:text-black">
            {/* Animated Background - Ascension Theme */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Primary gradient mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,oklch(0.585_0.233_277.117_/_0.15),transparent)]" />

                {/* Ascending geometric shards */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-active-blue/10 to-transparent rotate-45 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-tr from-emerald-green/8 to-transparent -rotate-12 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />

                {/* Nano-Banana bokeh effects */}
                <div className="absolute top-20 right-1/3 w-4 h-4 rounded-full bg-active-blue/30 blur-sm animate-bounce" style={{ animationDuration: '3s' }} />
                <div className="absolute top-1/3 left-20 w-3 h-3 rounded-full bg-emerald-green/25 blur-sm animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                <div className="absolute bottom-1/4 right-20 w-5 h-5 rounded-full bg-active-blue/20 blur-sm animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }} />

                {/* Success Pipeline conduits */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="oklch(0.585 0.233 277.117)" />
                            <stop offset="100%" stopColor="oklch(0.696 0.17 162.48)" />
                        </linearGradient>
                    </defs>
                    <path d="M0 100 Q 200 50, 400 100 T 800 100" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
                    <path d="M0 200 Q 300 150, 600 200 T 1200 200" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
                    <path d="M0 400 Q 400 350, 800 400 T 1600 400" stroke="url(#lineGrad)" strokeWidth="1" fill="none" />
                </svg>
            </div>

            {/* Login Card - Liquid Glass */}
            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Glow effect behind card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-active-blue/20 via-emerald-green/10 to-active-blue/20 rounded-3xl blur-2xl opacity-50" />

                {/* Glass Card */}
                <div className="relative bg-glass-lg rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/50">
                    {/* Refraction border effect */}
                    <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />
                    <div className="absolute inset-[1px] rounded-3xl border border-white/5 pointer-events-none" />

                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white mb-4 shadow-lg shadow-white/10 transform hover:scale-105 transition-transform duration-300">
                            <span className="text-black font-black text-2xl italic select-none">U</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                            Welcome back
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Sign in to track your job applications
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center animate-in slide-in-from-top-2 duration-300">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-foreground/80 block">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                disabled={isPending}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium text-foreground/80 block">
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-active-blue hover:text-active-blue/80 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    disabled={isPending}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="group w-full py-3.5 px-4 rounded-xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-3 bg-card text-muted-foreground">or continue with</span>
                        </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm font-medium hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-active-blue/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={() => signIn("linkedin", { callbackUrl: "/dashboard" })}
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm font-medium hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-active-blue/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            LinkedIn
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="font-semibold text-active-blue hover:text-active-blue/80 transition-colors inline-flex items-center gap-1 group"
                        >
                            Create one
                            <Sparkles className="h-3 w-3 group-hover:rotate-12 transition-transform" />
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-muted-foreground/50">
                    By signing in, you agree to our{" "}
                    <Link href="/terms" className="underline hover:text-muted-foreground transition-colors">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="underline hover:text-muted-foreground transition-colors">Privacy Policy</Link>
                </p>
            </div>
        </div>
    );
}
