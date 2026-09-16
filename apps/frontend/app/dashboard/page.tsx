'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Trophy, Flag, Target, ChevronRight,
  CheckCircle2, Lock, Zap, BookOpen, LayoutList,
  Star, ShieldAlert, Radio, Activity, AlertCircle, Compass,
  Flame, Crosshair, Users
} from 'lucide-react';
import AppNavbar from '@/components/ui/AppNavbar';
import FocusScreenAdvisory, { FocusScreenButton } from '@/components/ui/FocusScreenAdvisory';

interface Challenge {
  id: string;
  title: string;
  points: number;
  order: number;
  roundId: string;
  difficulty?: string;
  round?: { id: string; name: string; order: number; type?: string; status?: string };
}

interface Submission {
  challengeId: string;
  isCorrect?: boolean;
  correct?: boolean;
  points?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [teamStats, setTeamStats] = useState<any>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [scoreboard, setScoreboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameWinner, setGameWinner] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    (async () => {
      try {
        const [profileData, roundData, challengeData, submissionData, scoreData] = await Promise.all([
          api.getProfile().catch(() => null),
          api.getCurrentRound().catch(() => null),
          api.getAllChallenges().catch(() => []),
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
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // Poll game conclusion
  useEffect(() => {
    let cancelled = false;
    const check = () => {
      api.game
        .getState()
        .then((state) => {
          if (cancelled) return;
          setGameEnded(Boolean(state?.storyEnded));
          setGameWinner(state?.winnerTeamName || null);
        })
        .catch(() => {});
    };
    check();
    const id = setInterval(check, 20000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // GSAP Entrance
  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.df'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.45, ease: 'power3.out' }
      );
    }
  }, [loading]);

  const userTeam = user?.team;
  const teamLevel = userTeam?.currentLevel ?? 1;

  // Defensive deduplication by (roundOrder, order)
  const canonicalChallenges = useMemo(() => {
    const map = new Map<string, Challenge>();
    challenges.forEach((ch) => {
      const ro = ch.round?.order ?? 1;
      const co = ch.order ?? 1;
      const key = `${ro}-${co}`;
      if (!map.has(key)) {
        map.set(key, ch);
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => (a.round?.order ?? 0) - (b.round?.order ?? 0) || a.order - b.order
    );
  }, [challenges]);

  const totalLevels = canonicalChallenges.length || 9;
  const isCompletedAll = totalLevels > 0 && teamLevel > totalLevels;

  const allSubmissions: Submission[] = useMemo(() => [
    ...(Array.isArray(submissions) ? submissions : []),
    ...(Array.isArray(teamStats?.submissions) ? teamStats.submissions : []),
  ], [submissions, teamStats]);

  const solvedIds = useMemo(() => {
    const set = new Set<string>(
      allSubmissions
        .filter((s) => s.isCorrect === true || s.correct === true)
        .map((s) => s.challengeId)
    );
    canonicalChallenges.forEach((ch, i) => {
      if (i + 1 < teamLevel) {
        set.add(ch.id);
      }
    });
    return set;
  }, [allSubmissions, canonicalChallenges, teamLevel]);

  const totalSolved = isCompletedAll ? totalLevels : Math.min(solvedIds.size, totalLevels);
  const progressPercent = Math.min(100, Math.round((totalSolved / (totalLevels || 9)) * 100));

  const totalScore = teamStats?.totalPoints ?? (userTeam?.scores?.[0]?.totalPoints ?? 0);
  const teamName = userTeam?.name || 'SHADOW_OPERATIVE';
  const member1 = userTeam?.member1Name || user?.username || '';
  const member2 = userTeam?.member2Name || '';
  const members = [member1, member2].filter(Boolean);
  const myTeamId = userTeam?.id;

  const sortedBoard = useMemo(() => {
    return [...scoreboard].sort(
      (a, b) => (b.totalPoints ?? b.points ?? 0) - (a.totalPoints ?? a.points ?? 0)
    );
  }, [scoreboard]);

  const myRank = myTeamId
    ? (sortedBoard.findIndex((t) => t.teamId === myTeamId || t.id === myTeamId) + 1) || null
    : null;

  // Group unique challenges into rounds
  const roundGroups = useMemo(() => {
    const groups: { order: number; name: string; missions: Challenge[] }[] = [];
    canonicalChallenges.forEach((ch) => {
      const order = ch.round?.order ?? 1;
      const name = ch.round?.name || `Round ${order}`;
      let group = groups.find((g) => g.order === order);
      if (!group) {
        group = { order, name, missions: [] };
        groups.push(group);
      }
      group.missions.push(ch);
    });
    groups.sort((a, b) => a.order - b.order);

    let levelCursor = 0;
    return groups.map((g) => {
      const startLevel = levelCursor + 1;
      levelCursor += g.missions.length;
      return {
        order: g.order,
        label: g.name,
        missions: g.missions,
        startLevel,
        endLevel: levelCursor,
      };
    });
  }, [canonicalChallenges]);

  const currentRoundLabel = isCompletedAll
    ? 'COMPLETED'
    : (roundGroups.find((r) => teamLevel >= r.startLevel && teamLevel <= r.endLevel)?.label ?? currentRound?.name ?? 'Round 1: The Breach Discovery');

  // Currently active mission to solve
  const activeMissionIndex = Math.min(Math.max(0, teamLevel - 1), canonicalChallenges.length - 1);
  const activeMission = canonicalChallenges[activeMissionIndex] || null;

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
      <FocusScreenAdvisory />
      <div className="blood-splatter-bg" />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(220,38,38,0.12) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(138,3,3,0.15) 0%, transparent 50%)' }} />

      <AppNavbar
        active="dashboard"
        isAdmin={user?.role === 'ADMIN'}
        right={
          <>
            <div className="app-nav-hide-narrow" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'dpulse 2s infinite' }} />
              <span style={{ color: '#f87171', fontSize: 11, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '1px' }}>OPERATION LIVE</span>
            </div>
            <FocusScreenButton className="app-nav-hide-narrow" />
          </>
        }
      />

      {/* -- MAIN CONTAINER -- */}
      <div ref={containerRef} style={{ position: 'relative', zIndex: 5, maxWidth: 1320, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* -- FINALE BANNER (shown when event concludes) -- */}
        {gameEnded && (
          <Link href="/victory" className="df" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            marginBottom: 24, padding: '16px 22px', borderRadius: 10, textDecoration: 'none',
            background: 'linear-gradient(135deg, rgba(127,29,29,0.5), rgba(220,38,38,0.3))',
            border: '1px solid rgba(239,68,68,0.7)', boxShadow: '0 0 35px rgba(220,38,38,0.3)',
            animation: 'dpulse 2.4s infinite',
          }}>
            <div>
              <div style={{ color: '#fee2e2', fontSize: 16, fontWeight: 900, letterSpacing: 1 }}>
                🎬 OPERATION COMPLETE — {gameWinner ? `${gameWinner} SECURED THE MASTER VAULT` : 'THE MASTER VAULT HAS BEEN CRACKED'}
              </div>
              <div style={{ color: '#fca5a5', fontSize: 12, fontFamily: 'monospace', marginTop: 3 }}>
                The mission is accomplished. Watch the cinematic finale & credits.
              </div>
            </div>
            <ChevronRight size={22} color="#fee2e2" />
          </Link>
        )}

        {/* -- TACTICAL OPERATIVE HERO & CLEARANCE PROGRESS -- */}
        <div className="df tactical-box corner-brackets p-6 sm:p-7 rounded-lg" style={{ marginBottom: 28, background: 'linear-gradient(135deg, rgba(16,7,10,0.95), rgba(28,10,14,0.92))', border: '1px solid rgba(220,38,38,0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18, marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span className="status-dot active" />
                <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  // TACTICAL OPERATIVE COMMAND //
                </span>
                <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', fontSize: 10, fontWeight: 800, fontFamily: 'monospace' }}>
                  CLEARANCE LEVEL {teamLevel}
                </span>
              </div>
              <h1 className="font-heading-tactical" style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: '#f1f5f9', margin: '0 0 10px', letterSpacing: '1px', lineHeight: 1.15 }}>
                {teamName}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {members.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 14px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 4, background: 'linear-gradient(135deg,#7f1d1d,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
                      {m[0]?.toUpperCase() || 'A'}
                    </div>
                    <span style={{ fontSize: 12, color: '#fee2e2', fontWeight: 600, fontFamily: 'monospace' }}>
                      OPERATIVE: {m}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Engage Button */}
            {!isCompletedAll && activeMission && (
              <Link
                href="/timeline"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px',
                  background: 'linear-gradient(135deg, #b91c1c, #ef4444)',
                  border: '1px solid #f87171', borderRadius: 6, color: '#fff',
                  fontSize: 13, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase',
                  textDecoration: 'none', boxShadow: '0 0 20px rgba(220,38,38,0.4)',
                  fontFamily: 'monospace'
                }}
              >
                <Crosshair size={16} /> ENGAGE LEVEL {teamLevel} <ChevronRight size={16} />
              </Link>
            )}
          </div>

          {/* Tactical Clearance Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontFamily: 'monospace', fontSize: 11 }}>
              <span style={{ color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>
                DEFUSAL PROGRESSION ({totalSolved} / {totalLevels} SECURITY LAYERS DISMANTLED)
              </span>
              <span style={{ color: progressPercent === 100 ? '#10b981' : '#ef4444', fontWeight: 800, letterSpacing: 1 }}>
                {progressPercent}% COMPLETE
              </span>
            </div>
            <div style={{ width: '100%', height: 10, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 5, overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: progressPercent === 100
                    ? 'linear-gradient(90deg, #059669, #10b981)'
                    : 'linear-gradient(90deg, #7f1d1d, #ef4444)',
                  boxShadow: progressPercent === 100 ? '0 0 12px #10b981' : '0 0 12px #ef4444',
                  transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          </div>
        </div>

        {/* -- STAT CARDS -- */}
        <div className="df" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { icon: Trophy,       label: 'TOTAL SCORE',  value: totalScore.toLocaleString(), sub: 'POINTS EARNED', accent: '#dc2626' },
            { icon: Star,         label: 'CURRENT RANK', value: myRank ? `#${myRank}` : '—', sub: `OUT OF ${sortedBoard.length} ACTIVE TEAMS`, accent: '#ef4444' },
            { icon: CheckCircle2, label: 'CHALLENGES SOLVED', value: `${totalSolved} / ${totalLevels}`, sub: `${totalLevels - totalSolved} TARGETS REMAINING`, accent: '#f87171' },
            { icon: Flag,         label: 'CURRENT ROUND', value: currentRoundLabel, sub: isCompletedAll ? 'ALL TARGETS CLEARED' : 'LIVE OPERATION', accent: '#fca5a5' },
          ].map((stat) => (
            <div key={stat.label} className="tactical-box corner-brackets p-5 rounded-md" style={{ background: 'linear-gradient(135deg, rgba(14,5,8,0.95), rgba(20,7,11,0.92))', border: '1px solid rgba(220,38,38,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div className="reticle-icon-box" style={{ width: 30, height: 30 }}>
                  <stat.icon size={15} color="#ef4444" />
                </div>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: 2, fontFamily: 'monospace' }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#f1f5f9', lineHeight: 1, marginBottom: 4, letterSpacing: '1px', fontFamily: 'var(--font-rajdhani), sans-serif' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: '#ef4444', fontFamily: 'monospace', letterSpacing: 1 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* -- MAIN GRID: Mission Board & Tactical Intel -- */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }} className="grid-cols-1 lg:grid-cols-[1fr_340px]">

          {/* LEFT — Tactical Mission Board */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Current Objective Spotlight Banner */}
            {!isCompletedAll && activeMission && (
              <div className="df tactical-box p-5 sm:p-6 rounded-md" style={{ background: 'linear-gradient(135deg, rgba(30,10,14,0.95), rgba(18,6,9,0.95))', border: '1px solid rgba(239,68,68,0.5)', boxShadow: '0 0 24px rgba(220,38,38,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'dpulse 1.8s infinite' }} />
                    <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                      // CURRENT ACTIVE TARGET //
                    </span>
                  </div>
                  <span style={{ padding: '3px 9px', borderRadius: 4, background: 'rgba(239,68,68,0.2)', color: '#fee2e2', fontSize: 11, fontWeight: 800, fontFamily: 'monospace' }}>
                    +{activeMission.points} PTS
                  </span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#f87171', margin: '0 0 6px', letterSpacing: '0.5px' }}>
                  Level {activeMission.order}: {activeMission.title}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 16px', lineHeight: 1.5 }}>
                  {activeMission.round?.name || 'Classified Objective'} — Breach security layer to advance your team clearance.
                </p>
                <Link
                  href="/timeline"
                  className="btn-game-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', textDecoration: 'none' }}
                >
                  <Crosshair size={14} /> LAUNCH MISSION INTERFACE <ChevronRight size={14} />
                </Link>
              </div>
            )}

            {/* Mission Board Cards */}
            <div className="df tactical-box p-6 sm:p-7 rounded-md" style={{ background: 'linear-gradient(135deg, rgba(10,4,6,0.95), rgba(18,6,9,0.92))', border: '1px solid rgba(220,38,38,0.3)' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="reticle-icon-box" style={{ width: 36, height: 36 }}>
                    <LayoutList size={18} color="#ef4444" />
                  </div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 900, color: '#f1f5f9', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      MISSION OPERATION BOARD
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
                      {totalSolved} of {totalLevels} security layers dismantled
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                  {[
                    { c: '#10b981', l: 'SOLVED' },
                    { c: '#ef4444', l: 'AVAILABLE' },
                    { c: '#450a0a', l: 'LOCKED' },
                  ].map((x) => (
                    <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span
                        style={{
                          width: 7, height: 7, borderRadius: 2, background: x.c,
                          display: 'inline-block',
                          boxShadow: x.c === '#10b981' ? '0 0 6px #10b981' : x.c === '#ef4444' ? '0 0 6px #ef4444' : 'none',
                        }}
                      />
                      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, fontFamily: 'monospace' }}>{x.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Round Accordions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {roundGroups.map((round) => {
                  const isDone = isCompletedAll || teamLevel > round.endLevel;
                  const isActive = !isCompletedAll && (teamLevel >= round.startLevel && teamLevel <= round.endLevel);
                  const lc = isDone ? '#10b981' : isActive ? '#ef4444' : '#3a1014';

                  return (
                    <div key={round.order} style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${lc}33`, borderRadius: 8, padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div
                          style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: `${lc}22`, border: `1px solid ${lc}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}
                        >
                          {isDone ? <CheckCircle2 size={15} color="#10b981" /> : isActive ? <Zap size={15} color="#ef4444" /> : <Lock size={13} color="#6b7280" />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 900, color: isDone ? '#10b981' : isActive ? '#f1f5f9' : '#64748b', letterSpacing: '1px', textTransform: 'uppercase' }}>
                              {round.label}
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 800, fontFamily: 'monospace', padding: '2px 6px', borderRadius: 3, background: isDone ? 'rgba(16,185,129,0.15)' : isActive ? 'rgba(239,68,68,0.15)' : 'rgba(0,0,0,0.3)', color: isDone ? '#6ee7b7' : isActive ? '#fca5a5' : '#64748b', border: `1px solid ${lc}44` }}>
                              {isDone ? 'CLEARED' : isActive ? 'IN PROGRESS' : 'LOCKED'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 3 Challenges Grid (Strictly Canonical 3 Per Round) */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
                        {round.missions.map((ch, chIdx) => {
                          const levelNum = round.startLevel + chIdx;
                          const solved = solvedIds.has(ch.id) || levelNum < teamLevel;
                          const available = isActive || isDone || solved || levelNum === teamLevel;

                          return (
                            <div
                              key={ch.id}
                              onClick={() => available && router.push('/timeline')}
                              style={{
                                position: 'relative',
                                padding: '14px 16px',
                                borderRadius: 6,
                                cursor: available ? 'pointer' : 'not-allowed',
                                background: solved
                                  ? 'rgba(6, 44, 30, 0.35)'
                                  : available
                                  ? 'rgba(20, 6, 9, 0.85)'
                                  : 'rgba(5, 2, 4, 0.5)',
                                border: solved
                                  ? '1px solid rgba(16,185,129,0.4)'
                                  : available
                                  ? '1px solid rgba(220,38,38,0.45)'
                                  : '1px solid rgba(220,38,38,0.15)',
                                boxShadow: solved
                                  ? '0 0 15px rgba(16,185,129,0.1)'
                                  : available && levelNum === teamLevel
                                  ? '0 0 18px rgba(220,38,38,0.2)'
                                  : 'none',
                                transition: 'all 0.2s ease',
                                opacity: available ? 1 : 0.45,
                              }}
                            >
                              {/* Status Icon Top Right */}
                              {solved && (
                                <div style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <CheckCircle2 size={14} color="#10b981" />
                                </div>
                              )}
                              {!available && (
                                <div style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Lock size={12} color="#6b7280" />
                                </div>
                              )}

                              <div style={{ fontSize: 10, color: solved ? '#34d399' : '#ef4444', fontWeight: 800, letterSpacing: 2, marginBottom: 4, fontFamily: 'monospace' }}>
                                LEVEL {round.order}.{ch.order}
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: solved ? '#a7f3d0' : '#f1f5f9', marginBottom: 10, lineHeight: 1.35, minHeight: 36 }}>
                                {ch.title}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                <span style={{ fontSize: 12, fontWeight: 900, color: solved ? '#10b981' : '#ef4444', fontFamily: 'monospace' }}>
                                  {ch.points} PTS
                                </span>
                                {available && !solved && (
                                  <span style={{ fontSize: 10, color: '#f87171', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 3 }}>
                                    ENGAGE <ChevronRight size={12} />
                                  </span>
                                )}
                                {solved && (
                                  <span style={{ fontSize: 10, color: '#10b981', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                                    DISARMED
                                  </span>
                                )}
                                {!available && (
                                  <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 3 }}>
                                    LOCKED
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

          {/* RIGHT — Tactical Intel & Squad Briefing */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Launch Timeline Card */}
            <div className="tactical-box corner-brackets p-6 rounded-md" style={{ background: 'linear-gradient(135deg, rgba(18,6,9,0.95), rgba(28,9,13,0.92))', border: '1px solid rgba(220,38,38,0.35)' }}>
              <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 800, letterSpacing: 2, marginBottom: 6, fontFamily: 'monospace' }}>
                // TACTICAL LAUNCH //
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#f1f5f9', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '1px' }}>
                MISSION TIMELINE
              </h3>
              <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, marginBottom: 18 }}>
                Access interactive terminal protocols, orbital hints, and live payload submission portals.
              </p>
              <Link
                href="/timeline"
                className="btn-game-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Target size={16} /> OPEN TIMELINE
              </Link>
            </div>

            {/* Mini Squad Standing */}
            <div className="tactical-box p-6 rounded-md" style={{ background: 'linear-gradient(135deg, rgba(14,5,8,0.95), rgba(20,7,11,0.92))', border: '1px solid rgba(220,38,38,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={16} color="#ef4444" />
                  <span style={{ fontSize: 12, color: '#f87171', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                    TOP SQUADS
                  </span>
                </div>
                <Link href="/rankings" style={{ fontSize: 10, color: '#94a3b8', textDecoration: 'none', fontFamily: 'monospace' }}>
                  VIEW ALL &rarr;
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sortedBoard.slice(0, 4).map((t, idx) => {
                  const isMe = t.teamId === myTeamId || t.id === myTeamId;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '7px 10px', borderRadius: 4,
                        background: isMe ? 'rgba(220,38,38,0.2)' : 'rgba(0,0,0,0.3)',
                        border: isMe ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(220,38,38,0.1)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 900, color: idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#b45309' : '#94a3b8', fontSize: 11 }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: isMe ? 800 : 600, color: isMe ? '#fee2e2' : '#e2e8f0' }}>
                          {t.teamName || t.name} {isMe && '(YOU)'}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 900, color: '#ef4444', fontFamily: 'monospace' }}>
                        {t.totalPoints ?? t.points ?? 0} PTS
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Intel Briefing Card */}
            <div className="tactical-box p-6 rounded-md" style={{ background: 'linear-gradient(135deg, rgba(14,5,8,0.95), rgba(20,7,11,0.92))', border: '1px solid rgba(220,38,38,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <ShieldAlert size={16} color="#ef4444" />
                <span style={{ fontSize: 12, color: '#f87171', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  DIRECTIVE SUMMARY
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, margin: '0 0 14px' }}>
                Veera Raghavan is holding tactical basement perimeter. Althaf Hussain provides orbital communications intel. Complete sequence decryption before explosive timer detonation.
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
