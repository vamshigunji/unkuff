import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, Zap, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  // Redirect to dashboard if logged in
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background selection:bg-active-blue/30 overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-active-blue/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-green/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 bg-background/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-active-blue to-emerald-green flex items-center justify-center shadow-lg shadow-active-blue/20">
              <span className="text-white font-bold text-xl italic">u</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white italic">unkuff</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Sign In</Link>
            <Link href="/login">
              <Button className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[13px] font-medium text-active-blue animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The AI-First Career Grounding Platform</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Unkuff Your <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-active-blue via-active-blue/80 to-emerald-green">Career Journey.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Tired of ghosting? unkuff turns your resume into a high-fidelity truth anchor, automatically discovering relevant roles and tailoring your output with explainable AI logic.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link href="/login">
              <Button size="lg" className="h-14 px-10 rounded-full bg-active-blue hover:bg-active-blue/90 text-white font-bold text-lg shadow-xl shadow-active-blue/25 group">
                Start Your Real Experiment
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-10 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-lg backdrop-blur-sm">
              How it Works
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-7xl mx-auto mt-40 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Truth Anchoring */}
          <div className="group relative p-8 rounded-3xl bg-glass-md border border-white/5 hover:border-active-blue/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-active-blue/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-active-blue/10 flex items-center justify-center text-active-blue">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Truth Anchoring</h3>
              <p className="text-muted-foreground leading-relaxed">
                We ingest your Master Resume and extract deep-fidelity accomplishments. No hallucinations—only factual grounding for every application.
              </p>
            </div>
          </div>

          {/* Card 2: Live Discovery */}
          <div className="group relative p-8 rounded-3xl bg-glass-md border border-white/5 hover:border-emerald-green/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-green/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-green/10 flex items-center justify-center text-emerald-green">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Live Discovery</h3>
              <p className="text-muted-foreground leading-relaxed">
                Set your Job Criteria and let our engine scrape Jooble and Arbeitnow in real-time. Full job descriptions, no more clicking away.
              </p>
            </div>
          </div>

          {/* Card 3: Explainable Logic */}
          <div className="group relative p-8 rounded-3xl bg-glass-md border border-white/5 hover:border-active-blue/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-active-blue/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-active-blue/10 flex items-center justify-center text-active-blue">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Explainable Logic</h3>
              <p className="text-muted-foreground leading-relaxed">
                Watch our AI tailor your resume with real-time feedback. See the "Mapping", "Grounding", and "Refining" steps as they happen.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Footer */}
        <div className="max-w-7xl mx-auto mt-40 pt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 opacity-60">
          <div className="text-sm text-muted-foreground">© 2026 unkuff. Fully PII-compliant. Built for high-precision candidates.</div>
          <div className="flex gap-8">
            <span className="text-xs uppercase tracking-widest font-bold">Privacy First</span>
            <span className="text-xs uppercase tracking-widest font-bold">Local Sovereignty</span>
            <span className="text-xs uppercase tracking-widest font-bold">No AI BS</span>
          </div>
        </div>
      </main>
    </div>
  );
}
