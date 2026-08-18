'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Users, Trophy, Flag, Target, Shield, ChevronRight,
  CheckCircle2, Lock, Zap, LogOut, BookOpen, LayoutList,
  Activity, Star, Map, Terminal, Crosshair, Skull, ShieldAlert,
} from 'lucide-react';
import HalfCircleMenu from '@/components/ui/HalfCircleMenu';

interface Challenge {
  id: string; title: string; points: number; order: number; roundId: string;
}
interface Submission {
  challengeId: string; correct: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser]               = useState<any>(null);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [teamStats, setTeamStats]     = useState<any>(null);
  const [challenges, setChallenges]   = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [scoreboard, setScoreboard]   = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    (async () => {
      try {
        const [profileData, roundData, challengeData, submissionData, scoreData] = await Promise.all([
          api.getProfile(),
          api.getCurrentRound(),
          api.getAllChallenges(),
          api.getMySubmissions().catch(() => []),
          api.getScoreboard().catch(() => []),
        ]);
        setUser(profileData);
        setCurrentRound(roundData);
        setChallenges(challengeData || []);
        setSubmissions(submissionData || []);
        setScoreboard(scoreData || []);
        if (profileData?.team?.id) {
          const stats = await api.getTeamStats(profileData.team.id).catch(() => null);
          setTeamStats(stats);
        }
      } catch { /* silent */ } finally { setLoading(false); }
    })();
  }, [router]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.df'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.06, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [loading]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const solvedIds   = new Set(submissions.filter(s => s.correct).map(s => s.challengeId));
  const totalSolved = solvedIds.size;
  const totalScore  = teamStats?.totalPoints ?? 0;
  const teamName    = user?.team?.name || 'SHADOW_OPERATIVE';
  const member1     = user?.team?.member1Name || user?.username || '';
  const member2     = user?.team?.member2Name || '';
  const members     = [member1, member2].filter(Boolean);
  const roundNum    = currentRound?.order || 1;
  const myTeamId    = user?.team?.id;
  const sortedBoard = [...scoreboard].sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0));
  const myRank      = myTeamId
    ? (sortedBoard.findIndex(t => t.teamId === myTeamId || t.id === myTeamId) + 1) || null
    : null;
  const sorted  = [...challenges].sort((a, b) => a.order - b.order);
  const rounds  = [
    { label: 'Round 1', sub: 'The Breach',    missions: sorted.slice(0, 3), rc: '#ef4444', rn: 1 },
    { label: 'Round 2', sub: 'Infiltration',  missions: sorted.slice(3, 6), rc: '#f59e0b', rn: 2 },
    { label: 'Round 3', sub: 'Final Strike',  missions: sorted.slice(6, 9), rc: '#dc2626', rn: 3 },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexDirection: 'column' }}>
        <div style={{ width: 44, height: 44, border: '3px solid rgba(220,38,38,0.2)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: '#ef4444', letterSpacing: 3, fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>INITIALIZING TACTICAL HQ...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050508', position: 'relative', overflowX: 'hidden', color: '#f1f5f9' }}>
      <HalfCircleMenu />
      {/* Background blood splatter textures */}
      <div className="blood-splatter-bg" />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(220,38,38,0.12) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(138,3,3,0.15) 0%, transparent 50%)' }} />

      {/* -- TOP NAV -- */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', padding: '0 28px', height: 64, borderBottom: '1px solid rgba(220,38,38,0.3)', background: 'rgba(10,4,6,0.95)', backdropFilter: 'blur(20px)', gap: 10 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 6, background: 'linear-gradient(135deg,#7f1d1d,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(220,38,38,0.4)', border: '1px solid rgba(248,113,113,0.5)' }}>
            <Crosshair size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 900, lineHeight: 1.1, letterSpacing: '1px', textTransform: 'uppercase' }}>OPERATION THE EXTRACTION</div>
            <div style={{ color: '#ef4444', fontSize: 10, lineHeight: 1, fontFamily: 'monospace', letterSpacing: '2px' }}>TACTICAL COMMAND HQ</div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Live badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'dpulse 2s infinite' }} />
          <span style={{ color: '#f87171', fontSize: 11, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '1px' }}>OPERATION LIVE</span>
        </div>

        <Link href="/challenges" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6, color: '#fee2e2', fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'all 0.15s' }}>
          <Target size={14} className="text-red-500" /> Missions
        </Link>
        <Link href="/story" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 6, color: '#f1f5f9', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.15s' }}>
          <Map size={14} className="text-red-500" /> Story
        </Link>
        <Link href="/leaderboard" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 6, color: '#f1f5f9', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.15s' }}>
          <Trophy size={14} className="text-red-500" /> Rankings
        </Link>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 6, color: '#fca5a5', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
          <LogOut size={14} /> Extract
        </button>
      </nav>

      {/* -- MAIN CONTAINER -- */}
      <div ref={containerRef} style={{ position: 'relative', zIndex: 5, maxWidth: 1320, margin: '0 auto', padding: '36px 28px 80px' }}>

        {/* -- TEAM HERO -- */}
        <div className="df" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="status-dot active" />
            <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'monospace' }}>// ACTIVE STRIKE TEAM //</span>
          </div>
          <h1 className="font-heading-tactical" style={{ fontSize: 38, fontWeight: 900, color: '#f1f5f9', margin: '0 0 10px', letterSpacing: '1px', lineHeight: 1.15 }}>
            {teamName}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {members.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 14px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6 }}>
                <div style={{ width: 22, height: 22, borderRadius: 4, background: 'linear-gradient(135deg,#7f1d1d,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{m[0]?.toUpperCase()}</div>
                <span style={{ fontSize: 13, color: '#fee2e2', fontWeight: 600, fontFamily: 'monospace' }}>OPERATIVE: {m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* -- STAT CARDS -- */}
        <div className="df" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { icon: Trophy,       label: 'TOTAL SCORE',  value: totalScore.toLocaleString(), sub: 'POINTS SECURED',                          accent: '#dc2626' },
            { icon: Star,         label: 'CURRENT RANK',    value: myRank ? `#${myRank}` : '—', sub: `OUT OF ${sortedBoard.length} SQUADS`,   accent: '#ef4444' },
            { icon: CheckCircle2, label: 'CIPHERS BROKEN',       value: `${totalSolved}`,            sub: `OF ${challenges.length} TARGETS SOLVED`, accent: '#f87171' },
            { icon: Flag,         label: 'ACTIVE OPERATION', value: `ROUND ${roundNum}`,         sub: currentRound?.name || 'IN PROGRESS', accent: '#fca5a5' },
          ].map(stat => (
            <div key={stat.label} className="tactical-box corner-brackets p-5 rounded-md">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div className="reticle-icon-box" style={{ width: 30, height: 30 }}>
                  <stat.icon size={15} color="#ef4444" />
                </div>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: 2, fontFamily: 'monospace' }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#f1f5f9', lineHeight: 1, marginBottom: 4, letterSpacing: '1px', fontFamily: 'var(--font-rajdhani), sans-serif' }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#ef4444', fontFamily: 'monospace', letterSpacing: 1 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* -- MAIN GRID: Mission Board & Quick Actions -- */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }} className="grid-cols-1 lg:grid-cols-[1fr_340px]">

          {/* LEFT — Tactical Mission Board */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div className="df tactical-box p-6 sm:p-7 rounded-md">
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="reticle-icon-box" style={{ width: 36, height: 36 }}>
                    <LayoutList size={18} color="#ef4444" />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', letterSpacing: '1px', textTransform: 'uppercase' }}>MISSION OPERATION BOARD</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{totalSolved} of {challenges.length} security layers dismantled</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                  {[{ c: '#10b981', l: 'SOLVED' }, { c: '#ef4444', l: 'AVAILABLE' }, { c: '#450a0a', l: 'LOCKED' }].map(x => (
                    <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 2, background: x.c, display: 'inline-block', boxShadow: x.c === '#10b981' ? '0 0 6px #10b981' : x.c === '#ef4444' ? '0 0 6px #ef4444' : 'none' }} />
                      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, fontFamily: 'monospace' }}>{x.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {rounds.map((round, ri) => {
                  const isActive = roundNum === round.rn;
                  const isDone   = roundNum > round.rn;
                  const lc = isDone ? '#10b981' : isActive ? '#ef4444' : '#3a1014';
                  return (
                    <div key={ri}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 4, background: `${lc}22`, border: `1px solid ${lc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {isDone ? <CheckCircle2 size={13} color="#10b981" /> : isActive ? <Zap size={13} color="#ef4444" /> : <Lock size={13} color="#6b7280" />}
                        </div>
                        <div>
                          <span style={{ fontSize: 14, fontWeight: 800, color: isDone ? '#10b981' : isActive ? '#f1f5f9' : '#64748b', letterSpacing: '1px', textTransform: 'uppercase' }}>{round.label}</span>
                          <span style={{ fontSize: 13, color: isDone ? '#6ee7b7' : isActive ? '#f87171' : '#475569', marginLeft: 6, fontFamily: 'monospace' }}>— {round.sub}</span>
                        </div>
                        <div style={{ flex: 1, height: 1, background: `${lc}33`, marginLeft: 4 }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                        {round.missions.map(ch => {
                          const solved    = solvedIds.has(ch.id);
                          const available = isActive || isDone;
                          return (
                            <div
                              key={ch.id}
                              onClick={() => available && router.push(`/challenges?level=${ch.order}`)}
                              className={`p-4 rounded-md transition-all duration-200 ${
                                solved
                                  ? 'bg-emerald-950/20 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                  : available
                                  ? 'bg-[#0e0508]/90 border border-red-900/50 hover:border-red-600 hover:shadow-[0_0_20px_rgba(220,38,38,0.25)] cursor-pointer'
                                  : 'bg-black/40 border border-red-950/20 opacity-40 cursor-default'
                              } relative`}
                            >
                              {solved && (
                                <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <CheckCircle2 size={13} color="#10b981" />
                                </div>
                              )}
                              <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 700, letterSpacing: 2, marginBottom: 4, fontFamily: 'monospace' }}>
                                LEVEL {ch.order}
                              </div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
                                {ch.title}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 12, fontWeight: 900, color: '#ef4444', fontFamily: 'monospace' }}>
                                  {ch.points} PTS
                                </span>
                                {available && !solved && (
                                  <span style={{ fontSize: 10, color: '#f87171', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    ENGAGE <ChevronRight size={12} />
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT — Quick Intel & Live Squad Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Direct Launch CTA */}
            <div className="tactical-box corner-brackets p-6 rounded-md">
              <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, letterSpacing: 2, marginBottom: 6, fontFamily: 'monospace' }}>
                // TACTICAL LAUNCH //
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '1px' }}>
                ENTER MISSION INTERFACE
              </h3>
              <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, marginBottom: 18 }}>
                Connect directly to the encrypted mall server terminal and decrypt intercepted ciphers.
              </p>
              <Link
                href="/challenges"
                className="btn-game-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Target size={16} /> LAUNCH TERMINAL
              </Link>
            </div>

            {/* Intel Briefing Card */}
            <div className="tactical-box p-6 rounded-md">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <ShieldAlert size={16} color="#ef4444" />
                <span style={{ fontSize: 12, color: '#f87171', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'monospace' }}>DIRECTIVE SUMMARY</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, margin: '0 0 14px' }}>
                Veera is pinned down in basement maintenance. NSA Althaf provides orbital intel. Solve each level to disarm C4 triggers and free 1,200 civilians.
              </p>
              <Link
                href="/story"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 16px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 6, color: '#fee2e2', fontSize: 12, fontWeight: 700, textDecoration: 'none', letterSpacing: 1, fontFamily: 'monospace' }}
              >
                <BookOpen size={13} /> REVIEW INTEL
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
