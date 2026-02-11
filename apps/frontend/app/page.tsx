"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, RotateCcw, Settings, User } from "lucide-react";

// Simple background component (replaced missing ParticleBackground)
const SimpleBackground = () => (
  <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1605218427306-635b277d33b4?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay">
    <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-900/80 to-slate-900/40" />
  </div>
);

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center vn-root">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-slate-950 z-[-2]" />
      <SimpleBackground />

      {/* Main Content */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Title Logo Area */}
        <div className="mb-12 text-center group cursor-default">
          <h2 className="text-blue-500 font-bold tracking-[0.5em] text-sm md:text-lg mb-2 animate-pulse">HACK THE BOX 2026</h2>
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-white to-purple-500 drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]">
            OPERATION
            <br />
            <span className="text-stroke-3 text-stroke-blue-500 md:text-9xl italic">
              CIPHER STRIKE
            </span>
          </h1>
        </div>

        {/* Game Menu */}
        <div className="flex flex-col gap-4 w-full max-w-md px-4">
          <Link href="/login" className="group relative overflow-hidden bg-blue-900/40 hover:bg-blue-800/60 border border-blue-500/30 backdrop-blur-sm rounded-lg p-4 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-lg group-hover:rotate-12 transition-transform shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-wide">LOGIN</h3>
                    <p className="text-blue-300 text-xs">Access Your Mission</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 font-bold text-2xl">
                  &gt;
                </div>
             </div>
          </Link>

          <Link href="/register" className="group relative overflow-hidden bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 backdrop-blur-sm rounded-lg p-4 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-600 rounded-lg group-hover:rotate-12 transition-transform shadow-lg">
                    <Play className="w-6 h-6 text-white text-fill-white" fill="currentColor" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white tracking-wide">NEW AGENT</h3>
                    <p className="text-purple-300 text-xs">Register for the Mission</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400 font-bold text-2xl">
                  &gt;
                </div>
             </div>
          </Link>

          <div className="grid grid-cols-2 gap-4">
            <Link href="/story" className="bg-slate-800/40 hover:bg-slate-700/60 border border-slate-600/30 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center gap-2 hover:text-blue-400 transition-colors group">
              <RotateCcw className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="font-bold">STORY</span>
            </Link>
            <Link href="/scoreboard" className="bg-slate-800/40 hover:bg-slate-700/60 border border-slate-600/30 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center gap-2 hover:text-pink-400 transition-colors group">
              <Settings className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="font-bold">RANKINGS</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer Version */}
      <div className="absolute bottom-4 right-6 text-slate-500 text-sm font-mono">
        v2.4.0-BETA | OPERATOR: GUEST
      </div>
    </main>
  );
}
