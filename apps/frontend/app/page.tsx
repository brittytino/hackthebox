"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Skull,
  Users,
  FolderOpen,
  Trophy,
  X,
  RefreshCw,
  Lock,
  Crosshair,
  ShieldAlert,
} from "lucide-react";

interface MathProblem {
  q: string;
  a: number;
}

function rnd(lo: number, hi: number) {
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function makeProblem(): MathProblem {
  const t = rnd(0, 3);
  if (t === 0) {
    const a = rnd(12, 35);
    const b = rnd(8, 25);
    return { q: `${a} + ${b}`, a: a + b };
  }
  if (t === 1) {
    const a = rnd(4, 9);
    const b = rnd(4, 8);
    return { q: `${a} x ${b}`, a: a * b };
  }
  if (t === 2) {
    const b = rnd(10, 25);
    const a = rnd(b + 10, b + 40);
    return { q: `${a} - ${b}`, a: a - b };
  }
  const a = rnd(4, 8);
  const b = rnd(3, 7);
  const c = rnd(5, 15);
  return { q: `${a} x ${b} + ${c}`, a: a * b + c };
}

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Security Clearance Modal state
  const [showModal, setShowModal] = useState(true);
  const [problem, setProblem] = useState<MathProblem>({ q: "23 + 17", a: 40 });
  const [userAnswer, setUserAnswer] = useState("");
  const [mathError, setMathError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const generateNewProblem = useCallback(() => {
    setProblem(makeProblem());
    setUserAnswer("");
    setMathError(false);
  }, []);

  useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        router.push("/login");
      } else if (e.key === "F2") {
        e.preventDefault();
        setShowModal(true);
      } else if (e.key === "F3") {
        e.preventDefault();
        router.push("/story");
      } else if (e.key === "F4") {
        e.preventDefault();
        router.push("/leaderboard");
      } else if (e.key === "Escape") {
        setShowModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const ans = parseInt(userAnswer.trim(), 10);
    if (isNaN(ans) || ans !== problem.a) {
      setMathError(true);
      setUserAnswer("");
      generateNewProblem();
      return;
    }

    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      router.push("/register");
    }, 450);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#020203] text-[#f1f5f9] flex flex-col justify-between overflow-x-hidden p-4 sm:p-6 lg:p-8 select-none font-sans">
      {/* Heavy Blood Splatter Texture Overlays */}
      <div className="blood-splatter-bg" />
      <div className="blood-corner-tl" />
      <div className="blood-corner-br" />

      {/* Background Military Wireframe Grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none z-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="tactical-world-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,4" />
            <circle cx="60" cy="0" r="1.5" fill="#ef4444" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tactical-world-grid)" />
      </svg>

      {/* =========================================================================
          TOP HEADER BAR: Stencil Title & HUD Telemetry Pills
          ========================================================================= */}
      <header className="relative z-20 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4">
        {/* Left: OPERATION THE EXTRACTION Title */}
        <div className="flex flex-col">
          <span className="font-mono-tech text-[11px] font-bold tracking-[4px] text-red-600 uppercase leading-tight">
            OPERATION
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-red-500 tracking-[3px] uppercase leading-none drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]">
            THE EXTRACTION
          </h1>
          <span className="font-mono-tech text-[9px] sm:text-[10px] font-semibold tracking-[2.5px] text-red-500/80 uppercase mt-0.5">
            LIVE OPERATION TERMINAL
          </span>
        </div>

        {/* Right / Center: 3 Tactical Telemetry Pills */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {/* Pill 1: Sector 7 */}
          <div className="bg-[#090305]/90 border border-red-900/50 rounded px-3 py-1.5 min-w-[110px] shadow-[0_0_10px_rgba(220,38,38,0.15)]">
            <div className="font-mono-tech text-[8px] sm:text-[9px] font-bold tracking-[2px] text-red-500/80 uppercase">
              SECTOR 7
            </div>
            <div className="font-mono-tech text-[11px] sm:text-[12px] font-bold tracking-[1px] text-gray-200 uppercase">
              LOCKDOWN ZONE
            </div>
          </div>

          {/* Pill 2: Coordinates */}
          <div className="bg-[#090305]/90 border border-red-900/50 rounded px-3 py-1.5 min-w-[130px] shadow-[0_0_10px_rgba(220,38,38,0.15)]">
            <div className="font-mono-tech text-[8px] sm:text-[9px] font-bold tracking-[2px] text-red-500/80 uppercase">
              COORDINATES
            </div>
            <div className="font-mono-tech text-[11px] sm:text-[12px] font-bold tracking-[1px] text-gray-200 uppercase">
              13°04&apos;N 80°14&apos;E
            </div>
          </div>

          {/* Pill 3: System Status */}
          <div className="bg-[#090305]/90 border border-red-900/50 rounded px-3 py-1.5 min-w-[130px] shadow-[0_0_10px_rgba(220,38,38,0.15)]">
            <div className="font-mono-tech text-[8px] sm:text-[9px] font-bold tracking-[2px] text-red-500/80 uppercase">
              SYSTEM STATUS
            </div>
            <div className="flex items-center gap-2 font-mono-tech text-[11px] sm:text-[12px] font-bold tracking-[1px] text-red-500 uppercase">
              <span>COMPROMISED</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN WORKSPACE LAYOUT (3 Columns: Left Terminal | Center Modal | Right Feeds)
          ========================================================================= */}
      <main className="relative z-20 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto py-2">
        {/* -----------------------------------------------------------------------
            LEFT COLUMN: Main Terminal Action Cards & Operation Metrics
            ----------------------------------------------------------------------- */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Box 1: MAIN TERMINAL */}
          <div className="bg-[#080305]/95 border border-red-900/50 rounded p-4 shadow-[0_0_20px_rgba(0,0,0,0.8)] relative">
            <div className="flex items-center justify-between border-b border-red-950/70 pb-2.5 mb-3">
              <span className="font-mono-tech text-[11px] font-bold tracking-[3px] text-red-500 uppercase">
                // MAIN TERMINAL //
              </span>
              <button
                type="button"
                className="text-red-600/70 hover:text-red-400 transition-colors"
                aria-label="Terminal options"
              >
                <X size={13} />
              </button>
            </div>

            {/* 4 Action Cards */}
            <div className="flex flex-col gap-2.5">
              {/* F1: Continue Mission */}
              <Link
                href="/login"
                onMouseEnter={() => setHoveredCard("f1")}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group flex items-center justify-between p-2.5 rounded transition-all border ${
                  hoveredCard === "f1"
                    ? "bg-red-950/40 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                    : "bg-[#0d0508]/80 border-red-950/50 hover:border-red-800/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-red-950/50 border border-red-900/70 flex items-center justify-center text-red-500 group-hover:text-red-400 shadow-[0_0_8px_rgba(220,38,38,0.2)]">
                    <Skull size={16} />
                  </div>
                  <div>
                    <div className="font-display font-bold text-xs text-gray-100 uppercase tracking-[1px] group-hover:text-red-400">
                      CONTINUE MISSION
                    </div>
                    <div className="font-sans text-[10px] text-gray-400">
                      Authenticate & Access
                    </div>
                  </div>
                </div>
                <span className="font-mono-tech text-[10px] font-bold text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-900/70">
                  F1
                </span>
              </Link>

              {/* F2: New Operative (Opens Verification Modal) */}
              <button
                type="button"
                onClick={() => setShowModal(true)}
                onMouseEnter={() => setHoveredCard("f2")}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group flex items-center justify-between p-2.5 rounded transition-all border text-left w-full ${
                  showModal || hoveredCard === "f2"
                    ? "bg-red-950/40 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                    : "bg-[#0d0508]/80 border-red-950/50 hover:border-red-800/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-red-950/50 border border-red-900/70 flex items-center justify-center text-red-500 group-hover:text-red-400 shadow-[0_0_8px_rgba(220,38,38,0.2)]">
                    <Users size={16} />
                  </div>
                  <div>
                    <div className="font-display font-bold text-xs text-gray-100 uppercase tracking-[1px] group-hover:text-red-400">
                      NEW OPERATIVE
                    </div>
                    <div className="font-sans text-[10px] text-gray-400">
                      Enlist & Form Strike Team
                    </div>
                  </div>
                </div>
                <span className="font-mono-tech text-[10px] font-bold text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-900/70">
                  F2
                </span>
              </button>

              {/* F3: Mission Briefing */}
              <Link
                href="/story"
                onMouseEnter={() => setHoveredCard("f3")}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group flex items-center justify-between p-2.5 rounded transition-all border ${
                  hoveredCard === "f3"
                    ? "bg-red-950/40 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                    : "bg-[#0d0508]/80 border-red-950/50 hover:border-red-800/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-red-950/50 border border-red-900/70 flex items-center justify-center text-red-500 group-hover:text-red-400 shadow-[0_0_8px_rgba(220,38,38,0.2)]">
                    <FolderOpen size={16} />
                  </div>
                  <div>
                    <div className="font-display font-bold text-xs text-gray-100 uppercase tracking-[1px] group-hover:text-red-400">
                      MISSION BRIEFING
                    </div>
                    <div className="font-sans text-[10px] text-gray-400">
                      Intel & Objectives
                    </div>
                  </div>
                </div>
                <span className="font-mono-tech text-[10px] font-bold text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-900/70">
                  F3
                </span>
              </Link>

              {/* F4: Agent Rankings */}
              <Link
                href="/leaderboard"
                onMouseEnter={() => setHoveredCard("f4")}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group flex items-center justify-between p-2.5 rounded transition-all border ${
                  hoveredCard === "f4"
                    ? "bg-red-950/40 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                    : "bg-[#0d0508]/80 border-red-950/50 hover:border-red-800/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-red-950/50 border border-red-900/70 flex items-center justify-center text-red-500 group-hover:text-red-400 shadow-[0_0_8px_rgba(220,38,38,0.2)]">
                    <Trophy size={16} />
                  </div>
                  <div>
                    <div className="font-display font-bold text-xs text-gray-100 uppercase tracking-[1px] group-hover:text-red-400">
                      AGENT RANKINGS
                    </div>
                    <div className="font-sans text-[10px] text-gray-400">
                      Leaderboard & Stats
                    </div>
                  </div>
                </div>
                <span className="font-mono-tech text-[10px] font-bold text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-900/70">
                  F4
                </span>
              </Link>
            </div>
          </div>

          {/* Box 2: OPERATION METRICS */}
          <div className="bg-[#080305]/95 border border-red-900/50 rounded p-4 shadow-[0_0_20px_rgba(0,0,0,0.8)] relative">
            <div className="flex items-center justify-between border-b border-red-950/70 pb-2 mb-3">
              <span className="font-mono-tech text-[11px] font-bold tracking-[3px] text-red-500 uppercase">
                // OPERATION METRICS //
              </span>
              <button
                type="button"
                className="text-red-600/70 hover:text-red-400 transition-colors"
                aria-label="Metrics options"
              >
                <X size={13} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Rounds */}
              <div className="flex flex-col items-center justify-center">
                <div className="font-display font-black text-2xl sm:text-3xl text-red-500 leading-none">
                  03
                </div>
                <div className="font-mono-tech text-[9px] font-bold tracking-[1.5px] text-gray-400 uppercase mt-1">
                  ROUNDS
                </div>
              </div>

              {/* Missions */}
              <div className="flex flex-col items-center justify-center border-x border-red-950/60 px-1">
                <div className="font-display font-black text-2xl sm:text-3xl text-red-500 leading-none">
                  09
                </div>
                <div className="font-mono-tech text-[9px] font-bold tracking-[1.5px] text-gray-400 uppercase mt-1">
                  MISSIONS
                </div>
              </div>

              {/* Hostages */}
              <div className="flex flex-col items-center justify-center">
                <div className="font-display font-black text-2xl sm:text-3xl text-red-500 leading-none">
                  1,200
                </div>
                <div className="font-mono-tech text-[9px] font-bold tracking-[1.5px] text-gray-400 uppercase mt-1">
                  HOSTAGES
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* -----------------------------------------------------------------------
            CENTER COLUMN: Central Human Verification / Security Clearance Card
            ----------------------------------------------------------------------- */}
        <div className="lg:col-span-6 flex justify-center items-center w-full my-auto">
          {showModal ? (
            <div className="w-full max-w-[560px] bg-[#090305]/98 border-2 border-red-600/80 rounded-lg p-6 sm:p-8 shadow-[0_0_60px_rgba(220,38,38,0.35)] relative overflow-hidden backdrop-blur-xl">
              {/* Side Hazard Warning Stripes */}
              <div
                className="absolute left-0 top-0 bottom-0 w-2.5 opacity-85 pointer-events-none"
                style={{
                  background:
                    "repeating-linear-gradient(45deg, #dc2626, #dc2626 6px, transparent 6px, transparent 12px)",
                }}
              />
              <div
                className="absolute right-0 top-0 bottom-0 w-2.5 opacity-85 pointer-events-none"
                style={{
                  background:
                    "repeating-linear-gradient(-45deg, #dc2626, #dc2626 6px, transparent 6px, transparent 12px)",
                }}
              />

              {/* Modal Top Header */}
              <div className="text-center relative pb-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="absolute right-0 top-0 text-red-500 hover:text-red-300 transition-colors p-1"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>

                <div className="font-mono-tech text-[10px] sm:text-[11px] font-bold tracking-[3.5px] text-red-500 uppercase mb-1">
                  // HUMAN VERIFICATION PROTOCOL //
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-gray-100 tracking-[3px] uppercase leading-tight">
                  SECURITY CLEARANCE
                </h2>
                <p className="font-sans text-xs sm:text-sm text-gray-300 max-w-[420px] mx-auto mt-1">
                  Solve the simple mathematical challenge to verify human presence.
                </p>
              </div>

              {/* Verification Challenge Container with Corner Reticles */}
              <div className="relative border border-red-900/60 bg-[#060103]/90 rounded-md p-5 sm:p-6 text-center my-4 corner-brackets shadow-[inset_0_0_20px_rgba(220,38,38,0.15)]">
                <div className="font-mono-tech text-[10px] font-bold tracking-[2.5px] text-red-500 uppercase mb-3">
                  VERIFICATION CHALLENGE
                </div>

                {/* Big Bold Mathematical Expression */}
                <div className="font-mono-tech font-bold text-3xl sm:text-4xl text-gray-100 tracking-[4px] my-2 drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                  {problem.q} = ?
                </div>

                {/* Input Area */}
                <form onSubmit={handleVerify} className="mt-5 text-left">
                  <label
                    htmlFor="math-answer"
                    className="block font-mono-tech text-[11px] font-bold tracking-[1.5px] text-red-400 mb-1.5"
                  >
                    Your Answer
                  </label>
                  <input
                    id="math-answer"
                    type="number"
                    value={userAnswer}
                    onChange={(e) => {
                      setUserAnswer(e.target.value);
                      setMathError(false);
                    }}
                    placeholder="Enter your answer"
                    className={`w-full bg-[#0e0508] border ${
                      mathError
                        ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                        : "border-red-900/50 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    } rounded px-4 py-2.5 text-sm sm:text-base text-gray-100 placeholder-gray-500 font-mono-tech outline-none transition-all`}
                    autoFocus
                  />

                  {/* Subtext info */}
                  <div className="flex items-center gap-1.5 text-red-400/90 font-mono-tech text-[10px] mt-2">
                    <span className="w-3 h-3 rounded-full border border-red-500 flex items-center justify-center text-[8px]">
                      ⊗
                    </span>
                    <span>Solve to continue mission access</span>
                  </div>
                </form>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={generateNewProblem}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0c0407] hover:bg-red-950/40 border border-red-900/60 hover:border-red-500/80 rounded py-2.5 px-4 text-xs sm:text-sm font-mono-tech font-bold tracking-[1.5px] text-gray-200 uppercase transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                >
                  <RefreshCw size={13} className="text-red-500" />
                  <span>NEW CHALLENGE</span>
                </button>

                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifying || !userAnswer.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-b from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 disabled:opacity-50 border border-red-500 rounded py-2.5 px-4 text-xs sm:text-sm font-mono-tech font-bold tracking-[1.5px] text-white uppercase transition-all shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                >
                  <Lock size={13} />
                  <span>{verifying ? "VERIFYING..." : "VERIFY & PROCEED"}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Closed State: Direct Launch Console */
            <div className="w-full max-w-[500px] bg-[#090305]/90 border border-red-900/50 rounded-lg p-6 sm:p-8 text-center backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.9)] corner-brackets">
              <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3 animate-pulse" />
              <div className="font-mono-tech text-xs font-bold tracking-[3px] text-red-500 uppercase mb-1">
                // SECURITY VERIFICATION REQUIRED //
              </div>
              <h2 className="font-display font-black text-2xl text-gray-100 tracking-[2px] uppercase mb-2">
                CLASSIFIED PORTAL
              </h2>
              <p className="font-sans text-xs text-gray-400 mb-5">
                The East Coast Mall defense network requires authenticated human authorization to access the mainframe.
              </p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 border border-red-500 rounded py-3 text-xs sm:text-sm font-mono-tech font-bold tracking-[2px] text-white uppercase shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all"
              >
                <Lock size={14} />
                <span>OPEN SECURITY CLEARANCE</span>
              </button>
            </div>
          )}
        </div>

        {/* -----------------------------------------------------------------------
            RIGHT COLUMN: Live Intel Feed, Threat Level & System Telemetry Logs
            ----------------------------------------------------------------------- */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Box 1: INTEL FEED */}
          <div className="bg-[#080305]/95 border border-red-900/50 rounded p-4 shadow-[0_0_20px_rgba(0,0,0,0.8)] relative">
            <div className="flex items-center justify-between border-b border-red-950/70 pb-2 mb-2.5">
              <span className="font-mono-tech text-[11px] font-bold tracking-[3px] text-red-500 uppercase">
                // INTEL FEED //
              </span>
              <div className="flex items-center gap-1.5 font-mono-tech text-[9px] font-bold tracking-[1px] text-red-400">
                <span className="text-red-500 text-[10px]">◆</span>
                <span>LIVE</span>
              </div>
            </div>

            {/* Glowing Hex Matrix Payload */}
            <div className="font-mono-tech text-[10px] text-red-500/80 leading-relaxed tracking-wider break-all select-none space-y-1">
              <div>E00E08A02EAECEA1EF506BC00000B</div>
              <div>DE00008C0EB28CC05A0061613801650005606</div>
              <div>BE0A000C30016EAA FE0B06</div>
              <div>1B081AC000AC06900600C 10000CD0000000B</div>
              <div>B00681A656</div>
            </div>
          </div>

          {/* Box 2: THREAT LEVEL */}
          <div className="bg-[#080305]/95 border border-red-900/50 rounded p-4 shadow-[0_0_20px_rgba(0,0,0,0.8)] relative">
            <div className="flex items-center justify-between border-b border-red-950/70 pb-2 mb-3">
              <span className="font-mono-tech text-[11px] font-bold tracking-[3px] text-red-500 uppercase">
                // THREAT LEVEL //
              </span>
              <button
                type="button"
                className="text-red-600/70 hover:text-red-400 transition-colors"
                aria-label="Threat details"
              >
                <X size={13} />
              </button>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded bg-red-950/50 border border-red-700/80 flex items-center justify-center text-red-500 shadow-[0_0_12px_rgba(220,38,38,0.4)]">
                <Skull size={20} className="animate-pulse" />
              </div>
              <div>
                <div className="font-display font-black text-sm text-red-500 uppercase tracking-[2px] leading-tight">
                  CRITICAL
                </div>
                <div className="font-mono-tech text-[10px] text-gray-400 uppercase tracking-[1px]">
                  HIGH RISK OPERATION
                </div>
              </div>
            </div>
          </div>

          {/* Box 3: SYSTEM FEED */}
          <div className="bg-[#080305]/95 border border-red-900/50 rounded p-4 shadow-[0_0_20px_rgba(0,0,0,0.8)] relative">
            <div className="flex items-center justify-between border-b border-red-950/70 pb-2 mb-2.5">
              <span className="font-mono-tech text-[11px] font-bold tracking-[3px] text-red-500 uppercase">
                // SYSTEM FEED //
              </span>
            </div>

            <div className="font-mono-tech text-[10px] text-gray-400 space-y-1.5 tracking-wider">
              <div className="flex items-center gap-2">
                <span className="text-red-500/80">12:45:10</span>
                <span>SYSTEM INITIALIZED</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500/80">12:45:12</span>
                <span>SECURE CHANNEL ESTABLISHED</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500/80">12:45:15</span>
                <span>ENCRYPTION KEY VERIFIED</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500/80">12:45:18</span>
                <span className="text-red-400">AWAITING CLEARANCE</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          FOOTER BAR: Certification Seal & Engine Build Metadata
          ========================================================================= */}
      <footer className="relative z-20 w-full flex flex-col sm:flex-row items-center justify-between border-t border-red-950/60 pt-4 gap-3">
        {/* Left: CERT-IN Tamil Nadu Division Seal */}
        <div className="flex items-center gap-2.5">
          <Crosshair size={15} className="text-red-500" />
          <div className="font-mono-tech text-[10px] text-gray-400 tracking-[2px] uppercase">
            <span>⨀ CERT-IN TAMIL NADU DIVISION</span>
            <span className="mx-2 text-red-900">•</span>
            <span>AUTHORIZED PERSONNEL ONLY</span>
          </div>
        </div>

        {/* Right: Engine Version */}
        <div className="font-mono-tech text-[10px] text-gray-400 tracking-[2px] uppercase text-right">
          BUILD 2024.11.01 • EXTRACTION ENGINE v3.0
        </div>
      </footer>
    </div>
  );
}
