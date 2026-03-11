'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Users, Trophy, Flag, Target, Shield, ChevronRight,
  CheckCircle2, Lock, Zap, LogOut, BookOpen, LayoutList,
  Activity, Star, Map, Terminal,
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

  const F = "'Inter','Segoe UI',system-ui,-apple-system,sans-serif";

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: F, flexDirection: 'column' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(9,205,114,0.2)', borderTopColor: '#09cd72', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: '#09cd72', letterSpacing: 2, fontSize: 14, fontWeight: 600 }}>Loading...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', fontFamily: F, position: 'relative', overflowX: 'hidden', color: '#e6edf3' }}>
      {/* Subtle radial glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(9,205,114,0.07) 0%, transparent 60%)' }} />

      {/* -- NAV -- */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', padding: '0 32px', height: 64, borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(13,17,23,0.96)', backdropFilter: 'blur(20px)', gap: 8 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#09cd72,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(9,205,114,0.35)' }}>
            <Terminal size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ color: '#e6edf3', fontSize: 16, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.3px' }}>Hack The Box</div>
            <div style={{ color: '#6e7681', fontSize: 11, lineHeight: 1 }}>Command Center</div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Live badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(9,205,114,0.08)', border: '1px solid rgba(9,205,114,0.2)', borderRadius: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#09cd72', boxShadow: '0 0 8px #09cd72', animation: 'dpulse 2s infinite' }} />
          <span style={{ color: '#09cd72', fontSize: 13, fontWeight: 600 }}>Live</span>
        </div>

        <Link href="/story" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#c9d1d9', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'all 0.15s' }}>
          <Map size={15} /> Story
        </Link>
        <Link href="/leaderboard" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#c9d1d9', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'all 0.15s' }}>
          <Trophy size={15} /> Rankings
        </Link>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: 'rgba(248,81,73,0.07)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, color: '#f85149', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
          <LogOut size={15} /> Logout
        </button>
      </nav>

      {/* -- MAIN -- */}
      <div ref={containerRef} style={{ position: 'relative', zIndex: 5, maxWidth: 1280, margin: '0 auto', padding: '40px 32px 80px' }}>

        {/* -- TEAM HERO -- */}
        <div className="df" style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#09cd72', boxShadow: '0 0 10px #09cd72' }} />
            <span style={{ color: '#6e7681', fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const }}>Operation Cipher Strike</span>
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: '#e6edf3', margin: '0 0 10px', letterSpacing: '-0.5px', lineHeight: 1.15 }}>{teamName}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {members.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg,#09cd72,#0ea5e9)' : 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>{m[0]?.toUpperCase()}</div>
                <span style={{ fontSize: 14, color: '#c9d1d9', fontWeight: 500 }}>{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* -- STAT CARDS -- */}
        <div className="df" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { icon: Trophy,       label: 'Total Score',  value: totalScore.toLocaleString(), sub: 'points',                          accent: '#f59e0b' },
            { icon: Star,         label: 'Team Rank',    value: myRank ? `#${myRank}` : '—', sub: `of ${sortedBoard.length} teams`,   accent: '#0ea5e9' },
            { icon: CheckCircle2, label: 'Solved',       value: `${totalSolved}`,            sub: `of ${challenges.length} missions`, accent: '#09cd72' },
            { icon: Flag,         label: 'Active Round', value: `Round ${roundNum}`,         sub: currentRound?.name || 'In Progress', accent: '#a78bfa' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${stat.accent},transparent)` }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${stat.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <stat.icon size={16} color={stat.accent} />
                </div>
                <span style={{ fontSize: 13, color: '#6e7681', fontWeight: 600 }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#e6edf3', lineHeight: 1, marginBottom: 4, letterSpacing: '-0.5px' }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: '#6e7681' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* -- MAIN GRID -- */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

          {/* LEFT — Mission Board */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div className="df" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 28px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(167,139,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LayoutList size={18} color="#a78bfa" />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', letterSpacing: '-0.2px' }}>Mission Board</div>
                    <div style={{ fontSize: 13, color: '#6e7681' }}>{totalSolved} of {challenges.length} completed</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 18 }}>
                  {[{ c: '#09cd72', l: 'Solved' }, { c: '#a78bfa', l: 'Available' }, { c: '#30363d', l: 'Locked' }].map(x => (
                    <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: x.c, display: 'inline-block' }} />
                      <span style={{ fontSize: 13, color: '#6e7681' }}>{x.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {rounds.map((round, ri) => {
                  const isActive = roundNum === round.rn;
                  const isDone   = roundNum > round.rn;
                  const lc = isDone ? '#09cd72' : isActive ? round.rc : '#30363d';
                  return (
                    <div key={ri}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: `${lc}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {isDone ? <CheckCircle2 size={14} color="#09cd72" /> : isActive ? <Zap size={14} color={round.rc} /> : <Lock size={14} color="#30363d" />}
                        </div>
                        <div>
                          <span style={{ fontSize: 15, fontWeight: 700, color: isDone ? '#09cd72' : isActive ? '#e6edf3' : '#484f58', letterSpacing: '-0.1px' }}>{round.label}</span>
                          <span style={{ fontSize: 14, color: isDone ? '#09cd7299' : isActive ? '#6e7681' : '#30363d', marginLeft: 6 }}>— {round.sub}</span>
                        </div>
                        <div style={{ flex: 1, height: 1, background: `${lc}25`, marginLeft: 4 }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                        {round.missions.map(ch => {
                          const solved    = solvedIds.has(ch.id);
                          const available = isActive || isDone;
                          return (
                            <div
                              key={ch.id}
                              onClick={() => available && router.push(`/challenges?level=${ch.order}`)}
                              style={{
                                padding: '16px 18px',
                                borderRadius: 12,
                                border: solved ? '1px solid rgba(9,205,114,0.3)' : available ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(48,54,61,0.5)',
                                background: solved ? 'rgba(9,205,114,0.07)' : available ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.2)',
                                cursor: available ? 'pointer' : 'default',
                                opacity: available ? 1 : 0.4,
                                position: 'relative',
                                transition: 'border-color 0.15s, background 0.15s',
                              }}
                            >
                              {solved && (
                                <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: '50%', background: 'rgba(9,205,114,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <CheckCircle2 size={12} color="#09cd72" />
                                </div>
                              )}
                              <div style={{ fontSize: 12, color: solved ? '#09cd72' : available ? '#6e7681' : '#30363d', fontWeight: 600, marginBottom: 6 }}>
                                Mission {ch.order}
                              </div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: solved ? '#aff5c5' : available ? '#e6edf3' : '#484f58', lineHeight: 1.35, marginBottom: 8 }}>
                                {ch.title}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <div style={{ width: 16, height: 16, borderRadius: 4, background: solved ? 'rgba(9,205,114,0.15)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Star size={9} color={solved ? '#09cd72' : '#6e7681'} />
                                </div>
                                <span style={{ fontSize: 13, color: solved ? '#09cd72' : '#6e7681', fontWeight: 600 }}>{ch.points} pts</span>
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
                padding: '20px', background: 'linear-gradient(135deg,#09cd72,#0ea5e9)',
                borderRadius: 14, color: '#0d1117', fontSize: 16, fontWeight: 800,
                textDecoration: 'none', boxShadow: '0 0 40px rgba(9,205,114,0.25)',
                transition: 'all 0.2s', letterSpacing: '-0.2px',
              }}
            >
              <Terminal size={20} />
              Enter Operations Terminal
              <ChevronRight size={18} />
            </Link>
          </div>

          {/* RIGHT sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Team roster */}
            <div className="df" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(9,205,114,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} color="#09cd72" />
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3' }}>Team Roster</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {members.map((name, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg,#09cd72,#0ea5e9)' : 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                      {name[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                      <div style={{ fontSize: 12, color: '#6e7681', marginTop: 2 }}>{i === 0 ? 'Lead Agent' : 'Agent'}</div>
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#09cd72', boxShadow: '0 0 6px #09cd72' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Active round */}
            {currentRound && (
              <div className="df" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Flag size={16} color="#f59e0b" />
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3' }}>Active Round</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', background: 'rgba(9,205,114,0.1)', border: '1px solid rgba(9,205,114,0.25)', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#09cd72', letterSpacing: 0.5, marginBottom: 12 }}>
                  Round {roundNum}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>{currentRound.name}</div>
                <p style={{ fontSize: 14, color: '#6e7681', lineHeight: 1.65, margin: 0 }}>
                  {currentRound.description || 'Active cyber operation in progress. Complete all challenges to advance.'}
                </p>
              </div>
            )}

            {/* Quick access */}
            <div className="df" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '22px' }}>
              <div style={{ fontSize: 14, color: '#6e7681', fontWeight: 600, marginBottom: 14 }}>Quick Access</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { href: '/challenges',  icon: Target,   label: 'Challenges',       color: '#0ea5e9' },
                  { href: '/leaderboard', icon: Trophy,   label: 'Leaderboard',      color: '#f59e0b' },
                  { href: '/story',       icon: BookOpen, label: 'Mission Briefing', color: '#a78bfa' },
                  { href: '/timeline',    icon: Activity, label: 'Mission Timeline', color: '#09cd72' },
                ].map(item => (
                  <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, textDecoration: 'none', transition: 'all 0.15s' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${item.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.icon size={15} color={item.color} />
                    </div>
                    <span style={{ fontSize: 14, color: '#c9d1d9', fontWeight: 500, flex: 1 }}>{item.label}</span>
                    <ChevronRight size={15} color="#30363d" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dpulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        .df { opacity: 0; }
        a:hover { opacity: 0.82 !important; }
      `}</style>
    </div>
  );
}
