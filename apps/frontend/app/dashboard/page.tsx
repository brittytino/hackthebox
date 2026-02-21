'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Users, Trophy, Flag, Target, Shield, ChevronRight,
  CheckCircle2, Lock, Zap, LogOut, BookOpen, LayoutList,
  Activity, Star, Map,
} from 'lucide-react';

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
  const teamName    = user?.team?.name || '—';
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
    { label: 'Round 3', sub: 'Final Strike',  missions: sorted.slice(6, 9), rc: '#10b981', rn: 3 },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080614', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: "'Share Tech Mono','Courier New',monospace", flexDirection: 'column' }}>
        <div style={{ width: 44, height: 44, border: '3px solid rgba(124,58,237,0.3)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: '#7c3aed', letterSpacing: 4, fontSize: 13, fontWeight: 700 }}>LOADING COMMAND CENTER</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080614', fontFamily: "'Share Tech Mono','Courier New',monospace", position: 'relative', overflowX: 'hidden' }}>
      {/* bg overlays */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.18),rgba(0,0,0,0.18) 1px,transparent 1px,transparent 3px)', opacity: 0.25 }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse at 30% 0%, rgba(124,58,237,0.12) 0%,transparent 55%), radial-gradient(ellipse at 70% 100%,rgba(6,182,212,0.07) 0%,transparent 55%)' }} />
      <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', opacity: 0.016, zIndex: 0, pointerEvents: 'none' }}>
        <defs><pattern id="dg" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0 L0 0 0 60" fill="none" stroke="#7c3aed" strokeWidth="0.5" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#dg)" />
      </svg>

      {/*  HEADER NAV  */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', padding: '12px 32px', borderBottom: '1px solid rgba(109,40,217,0.22)', background: 'rgba(5,2,18,0.97)', backdropFilter: 'blur(24px)', gap: 10 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 4 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={17} color="#fff" />
          </div>
          <div>
            <div style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 900, letterSpacing: 3, lineHeight: 1 }}>CIPHER OPS</div>
            <div style={{ color: '#4b5563', fontSize: 10, letterSpacing: 2, lineHeight: 1.4 }}>COMMAND CENTER</div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {/* Status dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'dpulse 2s infinite' }} />
          <span style={{ color: '#6ee7b7', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>LIVE</span>
        </div>
        <Link href="/story" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: 'rgba(109,40,217,0.09)', border: '1px solid rgba(109,40,217,0.28)', borderRadius: 8, color: '#a78bfa', fontSize: 12, fontWeight: 700, letterSpacing: 1, textDecoration: 'none' }}>
          <Map size={13} /> Story
        </Link>
        <Link href="/leaderboard" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.22)', borderRadius: 8, color: '#fbbf24', fontSize: 12, fontWeight: 700, letterSpacing: 1, textDecoration: 'none' }}>
          <Trophy size={13} /> Rankings
        </Link>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: 'pointer' }}>
          <LogOut size={13} /> Logout
        </button>
      </nav>

      {/*  MAIN CONTENT  */}
      <div ref={containerRef} style={{ position: 'relative', zIndex: 5, maxWidth: 1400, margin: '0 auto', padding: '32px 32px 60px' }}>

        {/*  TEAM HEADER  */}
        <div className="df" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <span style={{ color: '#6b7280', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase' as const, fontWeight: 700 }}>Operation Cipher Strike</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f1f5f9', margin: '0 0 8px', letterSpacing: 1 }}>{teamName}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={14} color="#7c3aed" />
            <span style={{ color: '#94a3b8', fontSize: 14 }}>{members.join('    ')}</span>
          </div>
        </div>

        {/*  STAT CARDS  */}
        <div className="df" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { icon: Trophy,      label: 'Total Score',     value: totalScore.toLocaleString(), sub: 'points',                      accent: '#fbbf24', bg: 'rgba(251,191,36,0.07)' },
            { icon: Star,        label: 'Team Rank',       value: myRank ? `#${myRank}` : '—', sub: `of ${sortedBoard.length} teams`, accent: '#67e8f9', bg: 'rgba(6,182,212,0.07)' },
            { icon: CheckCircle2,label: 'Solved',          value: `${totalSolved}`,            sub: `of ${challenges.length} missions`, accent: '#34d399', bg: 'rgba(16,185,129,0.07)' },
            { icon: Flag,        label: 'Active Round',    value: `Round ${roundNum}`,         sub: currentRound?.name || 'In Progress', accent: '#c4b5fd', bg: 'rgba(109,40,217,0.07)' },
          ].map(stat => (
            <div key={stat.label} style={{ background: stat.bg, border: `1px solid ${stat.accent}30`, borderRadius: 14, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${stat.accent}cc,transparent)`, borderRadius: '14px 14px 0 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <stat.icon size={15} color={stat.accent} />
                <span style={{ fontSize: 12, color: '#6b7280', letterSpacing: 2, fontWeight: 700 }}>{stat.label.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: stat.accent, lineHeight: 1, marginBottom: 5 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/*  MAIN GRID  */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

          {/* LEFT — Mission Board */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Board header */}
            <div className="df" style={{ background: 'rgba(5,2,18,0.9)', border: '1px solid rgba(109,40,217,0.22)', borderRadius: 16, padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <LayoutList size={16} color="#a78bfa" />
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#e9d5ff', letterSpacing: 2 }}>MISSION BOARD</span>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[{ c: '#34d399', l: 'Solved' }, { c: '#a78bfa', l: 'Available' }, { c: '#374151', l: 'Locked' }].map(x => (
                    <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: x.c, display: 'inline-block' }} />
                      <span style={{ fontSize: 11, color: '#6b7280', letterSpacing: 1 }}>{x.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {rounds.map((round, ri) => {
                  const isActive = roundNum === round.rn;
                  const isDone   = roundNum > round.rn;
                  const labelColor = isDone ? '#34d399' : isActive ? round.rc : '#374151';
                  return (
                    <div key={ri}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        {isDone ? <CheckCircle2 size={13} color="#34d399" /> : isActive ? <Zap size={13} color={round.rc} /> : <Lock size={13} color="#374151" />}
                        <span style={{ fontSize: 13, fontWeight: 800, color: labelColor, letterSpacing: 2 }}>{round.label.toUpperCase()} — {round.sub.toUpperCase()}</span>
                        <div style={{ flex: 1, height: 1, background: `${labelColor}30`, marginLeft: 4 }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                        {round.missions.map(ch => {
                          const solved    = solvedIds.has(ch.id);
                          const available = isActive || isDone;
                          return (
                            <div
                              key={ch.id}
                              onClick={() => available && router.push(`/challenges?level=${ch.order}`)}
                              style={{
                                padding: '14px 16px',
                                borderRadius: 12,
                                border: solved ? '1px solid rgba(52,211,153,0.35)' : available ? '1px solid rgba(109,40,217,0.28)' : '1px solid rgba(55,65,81,0.2)',
                                background: solved ? 'rgba(16,185,129,0.08)' : available ? 'rgba(109,40,217,0.07)' : 'rgba(0,0,0,0.3)',
                                cursor: available ? 'pointer' : 'default',
                                opacity: available ? 1 : 0.45,
                                position: 'relative',
                                transition: 'all 0.18s',
                              }}
                            >
                              {solved && <CheckCircle2 size={11} color="#34d399" style={{ position: 'absolute', top: 10, right: 10 }} />}
                              <div style={{ fontSize: 11, color: solved ? '#34d399' : available ? '#7c6fa0' : '#374151', letterSpacing: 1, marginBottom: 5, fontWeight: 700 }}>
                                M{ch.order}
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: solved ? '#a7f3d0' : available ? '#c4b5fd' : '#4b5563', lineHeight: 1.4, marginBottom: 5 }}>
                                {ch.title}
                              </div>
                              <div style={{ fontSize: 12, color: solved ? '#6ee7b7' : available ? '#6b7280' : '#374151', fontWeight: 700 }}>
                                {ch.points} pts
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

            {/* CTA */}
            <Link
              href="/timeline"
              className="df"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                padding: '18px', background: 'linear-gradient(135deg,#4c1d95,#6d28d9,#0891b2)',
                border: '1px solid rgba(167,139,250,0.35)', borderRadius: 14,
                color: '#fff', fontSize: 15, fontWeight: 800, letterSpacing: 3,
                textDecoration: 'none', textTransform: 'uppercase' as const,
                boxShadow: '0 0 40px rgba(109,40,217,0.3)', transition: 'all 0.2s',
              }}
            >
              <Target size={18} />
              Enter Operations Terminal
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* RIGHT: sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Team card */}
            <div className="df" style={{ background: 'rgba(5,2,18,0.9)', border: '1px solid rgba(109,40,217,0.22)', borderRadius: 16, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Users size={14} color="#a78bfa" />
                <span style={{ fontSize: 13, fontWeight: 800, color: '#e9d5ff', letterSpacing: 2 }}>TEAM ROSTER</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {members.map((name, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', background: 'rgba(109,40,217,0.07)', border: '1px solid rgba(109,40,217,0.14)', borderRadius: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg,#4c1d95,#a78bfa)' : 'linear-gradient(135deg,#064e3b,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                      {name[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                      <div style={{ fontSize: 10, color: '#6b7280', letterSpacing: 2, textTransform: 'uppercase' as const, marginTop: 2 }}>{i === 0 ? 'Lead Agent' : 'Agent'}</div>
                    </div>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Current round */}
            {currentRound && (
              <div className="df" style={{ background: 'rgba(5,2,18,0.9)', border: '1px solid rgba(109,40,217,0.22)', borderRadius: 16, padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Flag size={14} color="#fbbf24" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#e9d5ff', letterSpacing: 2 }}>ACTIVE ROUND</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 12px', background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(109,40,217,0.32)', borderRadius: 20, fontSize: 11, fontWeight: 800, color: '#a78bfa', letterSpacing: 2, marginBottom: 10 }}>
                  ROUND {roundNum}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#e9d5ff', marginBottom: 8 }}>{currentRound.name}</div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>
                  {currentRound.description || 'Active cyber operation in progress. Complete all challenges to advance.'}
                </p>
              </div>
            )}

            {/* Quick nav */}
            <div className="df" style={{ background: 'rgba(5,2,18,0.9)', border: '1px solid rgba(109,40,217,0.18)', borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ fontSize: 12, color: '#6b7280', letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 12 }}>Quick Access</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { href: '/challenges',  icon: Target,    label: 'Challenges',       color: '#06b6d4' },
                  { href: '/leaderboard', icon: Trophy,    label: 'Leaderboard',      color: '#fbbf24' },
                  { href: '/story',       icon: BookOpen,  label: 'Mission Briefing', color: '#a78bfa' },
                  { href: '/timeline',    icon: Activity,  label: 'Mission Timeline', color: '#34d399' },
                ].map(item => (
                  <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 9, textDecoration: 'none', transition: 'all 0.15s' }}>
                    <item.icon size={14} color={item.color} />
                    <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600, flex: 1 }}>{item.label}</span>
                    <ChevronRight size={13} color="#374151" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dpulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.85)} }
        .df { opacity: 0; }
        a:hover { opacity: 0.85 !important; }
      `}</style>
    </div>
  );
}
