"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight, Check, X } from "lucide-react";
import { registerUser } from "./actions";

export default function RegisterPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState("");

    // Password strength requirements
    const passwordRequirements = [
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "One uppercase letter", met: /[A-Z]/.test(password) },
        { label: "One lowercase letter", met: /[a-z]/.test(password) },
        { label: "One number", met: /\d/.test(password) },
    ];

    const allRequirementsMet = passwordRequirements.every(req => req.met);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!allRequirementsMet) {
            setError("Please meet all password requirements.");
            return;
        }

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        startTransition(async () => {
            const result = await registerUser({ name, email, password });

            if (result.error) {
                setError(result.error);
            } else {
                router.push("/login?registered=true");
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background selection:bg-white selection:text-black py-10">
            {/* Animated Background - Ascension Theme */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Primary gradient mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,oklch(0.696_0.17_162.48_/_0.12),transparent)]" />

                {/* Ascending geometric shards */}
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-bl from-emerald-green/10 to-transparent -rotate-45 blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
                <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-tr from-active-blue/8 to-transparent rotate-12 blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '3s' }} />

                {/* Nano-Banana bokeh effects */}
                <div className="absolute top-32 left-1/3 w-4 h-4 rounded-full bg-emerald-green/30 blur-sm animate-bounce" style={{ animationDuration: '4s' }} />
                <div className="absolute top-1/2 right-20 w-3 h-3 rounded-full bg-active-blue/25 blur-sm animate-bounce" style={{ animationDuration: '5s', animationDelay: '1.5s' }} />
                <div className="absolute bottom-1/3 left-24 w-5 h-5 rounded-full bg-emerald-green/20 blur-sm animate-bounce" style={{ animationDuration: '6s', animationDelay: '2.5s' }} />
            </div>

            {/* Register Card - Liquid Glass */}
            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Glow effect behind card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-green/20 via-active-blue/10 to-emerald-green/20 rounded-3xl blur-2xl opacity-50" />

                {/* Glass Card */}
                <div className="relative bg-glass-lg rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/50">
                    {/* Refraction border effect */}
                    <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />
                    <div className="absolute inset-[1px] rounded-3xl border border-white/5 pointer-events-none" />

                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-green to-active-blue mb-4 shadow-lg shadow-emerald-green/20 transform hover:scale-105 transition-transform duration-300">
                            <span className="text-white font-black text-2xl italic select-none">U</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                            Create your account
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Start managing your job search today
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center animate-in slide-in-from-top-2 duration-300">
                            {error}
                        </div>
                    )}

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-foreground/80 block">
                                Full name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                disabled={isPending}
                                placeholder="Your name"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-green/50 focus:border-emerald-green/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

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
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-green/50 focus:border-emerald-green/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-foreground/80 block">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    disabled={isPending}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-green/50 focus:border-emerald-green/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

                            {/* Password Requirements */}
                            {password && (
                                <div className="mt-3 p-3 rounded-lg bg-white/5 space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                    {passwordRequirements.map((req, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-2 text-xs transition-colors ${req.met ? 'text-emerald-green' : 'text-muted-foreground'}`}
                                        >
                                            {req.met ? (
                                                <Check className="h-3.5 w-3.5" />
                                            ) : (
                                                <X className="h-3.5 w-3.5" />
                                            )}
                                            {req.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/80 block">
                                Confirm password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                disabled={isPending}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-green/50 focus:border-emerald-green/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPending || !allRequirementsMet}
                            className="group w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-green to-active-blue text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-emerald-green/50 focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-green/20 hover:shadow-emerald-green/30 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create account
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-active-blue hover:text-active-blue/80 transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-muted-foreground/50">
                    By creating an account, you agree to our{" "}
                    <Link href="/terms" className="underline hover:text-muted-foreground transition-colors">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="underline hover:text-muted-foreground transition-colors">Privacy Policy</Link>
                </p>
            </div>
        </div>
    );
}
