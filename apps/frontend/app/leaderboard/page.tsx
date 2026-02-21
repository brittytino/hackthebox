'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Trophy, Crown, Users, Activity, ArrowLeft,
  Shield, RefreshCw, Lock, Zap, Star,
  CheckCircle2, Target,
} from 'lucide-react';

const POLL_INTERVAL = 15000;

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myTeamId, setMyTeamId]       = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown]     = useState(POLL_INTERVAL / 1000);
  const [refreshing, setRefreshing]   = useState(false);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const data = await api.challenges.getLeaderboard();
      if (Array.isArray(data)) setLeaderboard(data);
      setLastUpdated(new Date());
      setCountdown(POLL_INTERVAL / 1000);
    } catch { /* silent */ } finally {
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  }, []);

  // Get current team id for "your team" highlight
  useEffect(() => {
    api.getProfile().then(p => {
      if (p?.team?.id) setMyTeamId(p.team.id);
    }).catch(() => {});
    loadData();
    const poll = setInterval(() => loadData(), POLL_INTERVAL);
    return () => clearInterval(poll);
  }, [loadData]);

  useEffect(() => {
    const tick = setInterval(() => setCountdown(p => p <= 1 ? POLL_INTERVAL / 1000 : p - 1), 1000);
    return () => clearInterval(tick);
  }, []);

  // SSE live updates
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const base = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl.replace(/\/$/, '')}/api`;
    const es = new EventSource(`${base}/scoreboard/live`);
    es.onmessage = (ev) => {
      try { const d = JSON.parse(ev.data); if (Array.isArray(d)) { setLeaderboard(d); setLastUpdated(new Date()); } } catch { /* ignore */ }
    };
    return () => es.close();
  }, []);

  const sorted   = [...leaderboard].sort((a, b) => (getPoints(b)) - (getPoints(a)));
  const maxPts   = getPoints(sorted[0]) || 1;
  const podium   = sorted.slice(0, 3);   // [0]=1st [1]=2nd [2]=3rd
  const rest     = sorted.slice(3);

  function getPoints(t: any) { return t?.totalPoints ?? t?.points ?? 0; }
  function getLevel(t: any)  { return t?.currentLevel ?? t?.challengesSolved ?? 0; }
  function isMe(t: any)      { return myTeamId && (t?.teamId === myTeamId || t?.id === myTeamId); }

  const PODIUM_ORDER = [1, 0, 2]; // display as: 2nd | 1st | 3rd
  const PODIUM_H     = [160, 210, 130]; // display heights for 2nd | 1st | 3rd
  const PODIUM_CFG = [
    { icon: '', color: '#fbbf24', glow: 'rgba(251,191,36,0.25)', border: 'rgba(251,191,36,0.5)', rank: 1 },
    { icon: '', color: '#94a3b8', glow: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.4)', rank: 2 },
    { icon: '', color: '#ea8c34', glow: 'rgba(234,140,52,0.18)', border: 'rgba(234,140,52,0.4)', rank: 3 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080614', fontFamily: "'Share Tech Mono','Courier New',monospace", position: 'relative', overflow: 'hidden' }}>
      {/* Static BG layers */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.22),rgba(0,0,0,0.22) 1px,transparent 1px,transparent 3px)', opacity: 0.28 }} />
      <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', opacity: 0.015, zIndex: 0, pointerEvents: 'none' }}>
        <defs><pattern id="bg" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0 L0 0 0 60" fill="none" stroke="#7c3aed" strokeWidth="0.5" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#bg)" />
      </svg>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%,transparent 55%), radial-gradient(ellipse at 50% 100%,rgba(6,182,212,0.07) 0%,transparent 55%)' }} />

      {/*  NAV  */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', padding: '10px 28px', borderBottom: '1px solid rgba(109,40,217,0.25)', background: 'rgba(5,2,18,0.97)', backdropFilter: 'blur(24px)', gap: 14 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 11, fontWeight: 700, letterSpacing: 2, textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(55,65,81,0.4)', borderRadius: 7 }}>
          <ArrowLeft size={12} />HQ
        </Link>
        <Link href="/timeline" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 11, fontWeight: 700, letterSpacing: 2, textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(55,65,81,0.4)', borderRadius: 7 }}>
          <Target size={12} />TIMELINE
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={13} color="#fff" />
          </div>
          <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 800, letterSpacing: 3 }}>CIPHER OPS</span>
          <span style={{ color: '#4b5563', fontSize: 11, letterSpacing: 2 }}>/ RANKINGS</span>
        </div>
        <div style={{ flex: 1 }} />
        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 7, padding: '5px 12px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'dopulse 1.5s infinite' }} />
          <span style={{ color: '#10b981', fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>LIVE</span>
          <span style={{ color: '#4b5563', fontSize: 11, letterSpacing: 1 }}>{countdown}s</span>
        </div>
        <button onClick={() => loadData(true)} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(109,40,217,0.35)', borderRadius: 7, cursor: 'pointer', color: '#a78bfa', fontSize: 11, fontWeight: 700, letterSpacing: 1, fontFamily: 'inherit', opacity: refreshing ? 0.6 : 1 }}>
          <RefreshCw size={12} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />REFRESH
        </button>
        {lastUpdated && <span style={{ color: '#374151', fontSize: 11, letterSpacing: 1 }}>{lastUpdated.toLocaleTimeString()}</span>}
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 860, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/*  PAGE HEADER  */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ color: '#4b5563', fontSize: 12, letterSpacing: 6, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' }}>Operation Cipher Strike</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 8 }}>
            <Crown size={26} color="#fbbf24" />
            <h1 style={{ margin: 0, fontSize: 36, fontWeight: 900, color: 'transparent', backgroundImage: 'linear-gradient(135deg,#fbbf24,#f59e0b,#fbbf24)', backgroundClip: 'text', WebkitBackgroundClip: 'text', letterSpacing: 6, textTransform: 'uppercase', filter: 'drop-shadow(0 0 40px rgba(251,191,36,0.4))' }}>LEADERBOARD</h1>
            <Crown size={26} color="#fbbf24" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#4b5563', fontSize: 12 }}>
              <Users size={12} />{leaderboard.length} Teams Competing
            </div>
            <div style={{ width: 1, height: 12, background: 'rgba(109,40,217,0.35)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#4b5563', fontSize: 12 }}>
              <Activity size={12} />Updates every {POLL_INTERVAL / 1000}s via SSE
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: 16 }}>
            <div style={{ width: 44, height: 44, border: '3px solid rgba(124,58,237,0.25)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ color: '#7c3aed', fontSize: 12, letterSpacing: 4, fontWeight: 700 }}>LOADING RANKINGS...</div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', border: '1px dashed rgba(55,65,81,0.35)', borderRadius: 14, color: '#374151' }}>
            <Trophy size={42} style={{ margin: '0 auto 14px', opacity: 0.25 }} />
            <div style={{ fontSize: 14, color: '#4b5563' }}>No teams have scored yet.</div>
            <div style={{ fontSize: 11, marginTop: 6, letterSpacing: 1, color: '#374151' }}>Be the first to complete a mission.</div>
          </div>
        ) : (
          <>
            {/*  PODIUM (2nd | 1st | 3rd)  */}
            {podium.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginBottom: 40, padding: '0 10px' }}>
                {PODIUM_ORDER.map((dataIdx, displayPos) => {
                  const team = podium[dataIdx];
                  if (!team) return null;
                  const cfg  = PODIUM_CFG[dataIdx];
                  const pct  = Math.round((getPoints(team) / maxPts) * 100);
                  const h    = PODIUM_H[displayPos];
                  const me   = isMe(team);
                  return (
                    <div key={team.teamId ?? dataIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                      {/* Card above podium block */}
                      <div style={{
                        width: '100%', padding: '16px 14px 14px',
                        background: `linear-gradient(180deg, rgba(5,2,18,0.98), rgba(10,5,30,0.96))`,
                        border: `1.5px solid ${cfg.border}`,
                        borderBottom: 'none',
                        borderRadius: '14px 14px 0 0',
                        textAlign: 'center',
                        boxShadow: `0 0 ${dataIdx === 0 ? 50 : 30}px ${cfg.glow}`,
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        {me && (
                          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 5, padding: '2px 7px', fontSize: 8, color: '#34d399', fontWeight: 700, letterSpacing: 1 }}>YOU</div>
                        )}
                        <div style={{ fontSize: dataIdx === 0 ? 36 : 28, marginBottom: 6, filter: `drop-shadow(0 0 12px ${cfg.color}60)` }}>{cfg.icon}</div>
                        <div style={{ fontWeight: 900, fontSize: dataIdx === 0 ? 15 : 13, color: '#e9d5ff', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.teamName}</div>
                        <div style={{ fontSize: dataIdx === 0 ? 28 : 22, fontWeight: 900, color: cfg.color, lineHeight: 1, marginBottom: 4, textShadow: `0 0 20px ${cfg.color}80` }}>{getPoints(team).toLocaleString()}</div>
                        <div style={{ fontSize: 8, color: '#4b5563', letterSpacing: 2, marginBottom: 10 }}>POINTS</div>
                        {/* Score bar */}
                        <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${cfg.color},#a78bfa)`, borderRadius: 2 }} />
                        </div>
                        <div style={{ color: '#4b5563', fontSize: 11, letterSpacing: 1 }}>{getLevel(team)} / 9 missions</div>
                      </div>
                      {/* Podium block */}
                      <div style={{
                        width: '100%', height: h,
                        background: `linear-gradient(180deg, ${cfg.color}18, ${cfg.color}06)`,
                        border: `1.5px solid ${cfg.border}`,
                        borderTop: 'none',
                        borderRadius: '0 0 8px 8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 8px 40px ${cfg.glow}`,
                      }}>
                        <span style={{ fontSize: 48, fontWeight: 900, color: `${cfg.color}30`, letterSpacing: -4 }}>
                          #{cfg.rank}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/*  REST OF TABLE  */}
            {rest.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ color: '#374151', fontSize: 9, fontWeight: 700, letterSpacing: 3 }}>FULL RANKINGS</div>
                  <div style={{ flex: 1, height: 1, background: 'rgba(109,40,217,0.15)' }} />
                </div>

                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 100px 180px 80px', gap: 8, padding: '6px 14px', marginBottom: 4 }}>
                  {['RANK','TEAM','PROGRESS','SCORE BAR','SCORE'].map(h => (
                    <div key={h} style={{ fontSize: 11, color: '#374151', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{h}</div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {rest.map((team, i) => {
                    const rank = i + 4;
                    const pts  = getPoints(team);
                    const pct  = Math.round((pts / maxPts) * 100);
                    const lvl  = getLevel(team);
                    const me   = isMe(team);
                    return (
                      <div
                        key={team.teamId ?? i}
                        ref={el => { rowRefs.current[i] = el; }}
                        style={{
                          display: 'grid', gridTemplateColumns: '44px 1fr 100px 180px 80px',
                          gap: 8, alignItems: 'center',
                          padding: '12px 14px',
                          background: me ? 'rgba(16,185,129,0.07)' : 'rgba(5,2,18,0.7)',
                          border: `1px solid ${me ? 'rgba(16,185,129,0.35)' : 'rgba(55,65,81,0.22)'}`,
                          borderRadius: 10, position: 'relative', overflow: 'hidden',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(109,40,217,0.4)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(109,40,217,0.07)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = me ? 'rgba(16,185,129,0.35)' : 'rgba(55,65,81,0.22)'; (e.currentTarget as HTMLDivElement).style.background = me ? 'rgba(16,185,129,0.07)' : 'rgba(5,2,18,0.7)'; }}
                      >
                        {/* Rank */}
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(55,65,81,0.3)', border: '1px solid rgba(55,65,81,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 13, fontWeight: 800 }}>
                          {rank}
                        </div>
                        {/* Team name */}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ color: me ? '#6ee7b7' : '#e2e8f0', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.teamName}</div>
                          {me && <div style={{ fontSize: 10, color: '#34d399', letterSpacing: 2, marginTop: 1 }}>YOUR TEAM</div>}
                        </div>
                        {/* Mission progress bubbles */}
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          {Array.from({ length: 9 }, (_, ii) => (
                            <div key={ii} style={{ width: 7, height: 7, borderRadius: '50%', background: ii < lvl ? '#10b981' : ii === lvl ? '#7c3aed' : '#1f2937', boxShadow: ii === lvl ? '0 0 6px #7c3aed' : 'none' }} />
                          ))}
                        </div>
                        {/* Score bar */}
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,rgba(124,58,237,0.7),rgba(6,182,212,0.5))', borderRadius: 2, transition: 'width 0.6s ease' }} />
                        </div>
                        {/* Score */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#a78bfa', fontSize: 16, fontWeight: 900 }}>{pts.toLocaleString()}</div>
                          <div style={{ color: '#374151', fontSize: 10, letterSpacing: 2 }}>PTS</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{ marginTop: 44, padding: '14px 20px', background: 'rgba(5,2,18,0.5)', border: '1px solid rgba(55,65,81,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#374151', fontSize: 11 }}>
            <Lock size={11} />Real-time via SSE + {POLL_INTERVAL / 1000}s polling fallback
          </div>
          <div style={{ color: '#374151', fontSize: 11, letterSpacing: 2 }}>CIPHER OPS 2026 — COIMBATORE</div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes dopulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}
