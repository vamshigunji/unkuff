"use client";

import React from "react";

export function DigitalBackground() {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden bg-[oklch(0.12_0.02_280)]">
            {/* The Void Fog - Deep Indigo/Charcoal Atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[oklch(0.15_0.05_280)] to-transparent opacity-40 mix-blend-overlay" />

            {/* The Ascension Beam - Central Career Path */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gradient-to-t from-transparent via-blue-400 to-transparent opacity-20 blur-[1px]" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[100px] -translate-x-1/2 bg-gradient-to-t from-transparent via-indigo-500/10 to-transparent blur-[60px]" />

            {/* Floating Opportunity Fragments (Glass Shards) */}
            <div className="absolute inset-0">
                {/* Shard 1 - Bottom Left */}
                <svg
                    className="absolute bottom-[10%] left-[20%] w-64 h-64 opacity-[0.08] animate-[float_20s_ease-in-out_infinite]"
                    viewBox="0 0 100 100"
                >
                    <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="url(#grad1)" />
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#34D399" stopOpacity="0.2" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Shard 2 - Top Right */}
                <svg
                    className="absolute top-[20%] right-[15%] w-96 h-96 opacity-[0.05] animate-[float_25s_ease-in-out_infinite_reverse]"
                    viewBox="0 0 100 100"
                >
                    <path d="M50 0 L100 25 L50 100 L0 75 Z" fill="url(#grad2)" />
                    <defs>
                        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.2" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Shard 3 - Center Rise */}
                <div className="absolute top-[40%] left-[45%] w-4 h-[200px] bg-gradient-to-t from-transparent via-white/20 to-transparent blur-[2px] animate-pulse" />
            </div>

            {/* Premium Texture Grain */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay bg-[url('https://grain-y.vercel.app/noise.svg')]" />

            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
      `}</style>
        </div>
    );
}
