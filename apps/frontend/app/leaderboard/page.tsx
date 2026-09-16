'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import {
  Trophy, Users, Activity,
  RefreshCw, Lock, Skull,
} from 'lucide-react';
import AppNavbar from '@/components/ui/AppNavbar';

// SSE ('/scoreboard/live') is the primary real-time channel; this is just a
// safety-net poll in case SSE is blocked by a proxy, so it can be infrequent.
const POLL_INTERVAL = 45000;

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myTeamId, setMyTeamId]       = useState<string | null>(null);
  const [totalLevels, setTotalLevels] = useState(9);
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
    api.getAllChallenges().then(list => {
      if (Array.isArray(list) && list.length > 0) setTotalLevels(list.length);
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
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

  function getPoints(t: Record<string, any>) { return t?.totalPoints ?? t?.points ?? 0; }
  function getLevel(t: Record<string, any>) {
    if (typeof t?.challengesSolved === 'number') return t.challengesSolved;
    if (typeof t?.solvedChallenges === 'number') return t.solvedChallenges;
    if (typeof t?.currentLevel === 'number') return Math.max(0, Math.min(totalLevels, t.currentLevel - 1));
    return 0;
  }
  function isMe(t: Record<string, any>)      { return myTeamId && (t?.teamId === myTeamId || t?.id === myTeamId); }

  const PODIUM_ORDER = [1, 0, 2]; // display as: 2nd | 1st | 3rd
  const PODIUM_H     = [150, 200, 120]; // display heights for 2nd | 1st | 3rd
  const PODIUM_CFG = [
    { icon: '🥇', color: '#dc2626', glow: 'rgba(220,38,38,0.45)', border: 'rgba(239,68,68,0.7)', rank: 1 },
    { icon: '🥈', color: '#94a3b8', glow: 'rgba(148,163,184,0.2)', border: 'rgba(148,163,184,0.4)', rank: 2 },
    { icon: '🥉', color: '#b91c1c', glow: 'rgba(185,28,28,0.25)', border: 'rgba(185,28,28,0.5)', rank: 3 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#050508', position: 'relative', overflowX: 'hidden', color: '#f1f5f9' }}>
      {/* Blood texture overlays */}
      <div className="blood-splatter-bg" />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.12) 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(138,3,3,0.15) 0%, transparent 55%)' }} />

      <AppNavbar
        active="leaderboard"
        right={
          <>
            <div className="app-nav-hide-narrow" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 6, padding: '5px 12px' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'dopulse 1.5s infinite' }} />
              <span style={{ color: '#f87171', fontSize: 11, fontWeight: 700, letterSpacing: 2, fontFamily: 'monospace' }}>LIVE FEED</span>
              <span style={{ color: '#6b7280', fontSize: 10, letterSpacing: 1, fontFamily: 'monospace' }}>{countdown}s</span>
            </div>
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              title={lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 6, cursor: 'pointer', color: '#fee2e2', fontSize: 11, fontWeight: 700, letterSpacing: 1, fontFamily: 'monospace', opacity: refreshing ? 0.6 : 1 }}
            >
              <RefreshCw size={12} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
              <span className="app-nav-hide-narrow">REFRESH</span>
            </button>
          </>
        }
      />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 940, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/*  PAGE HEADER  */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ color: '#ef4444', fontSize: 11, letterSpacing: 5, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', fontFamily: 'monospace' }}>
            // CLASSIFIED OPERATIVE LEADERBOARD //
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 8 }}>
            <Trophy size={28} className="text-red-500 animate-pulse" />
            <h1 className="blood-crimson-title" style={{ margin: 0, fontSize: 36, fontWeight: 900, letterSpacing: 5, textTransform: 'uppercase' }}>
              LEADERBOARD
            </h1>
            <Trophy size={28} className="text-red-500 animate-pulse" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94a3b8', fontSize: 11 }}>
              <Users size={12} className="text-red-500" />{leaderboard.length} Teams Registered
            </div>
            <div style={{ width: 1, height: 12, background: 'rgba(220,38,38,0.4)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94a3b8', fontSize: 11 }}>
              <Activity size={12} className="text-red-500" />Real-time live sync
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: 16 }}>
            <div style={{ width: 44, height: 44, border: '3px solid rgba(220,38,38,0.2)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ color: '#ef4444', fontSize: 12, letterSpacing: 4, fontWeight: 700, fontFamily: 'monospace' }}>SYNCING LIVE SCOREBOARD...</div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', border: '1px dashed rgba(220,38,38,0.3)', borderRadius: 12, color: '#6b7280' }}>
            <Skull size={42} style={{ margin: '0 auto 14px', opacity: 0.35, color: '#ef4444' }} />
            <div style={{ fontSize: 14, color: '#94a3b8', fontFamily: 'monospace' }}>No teams have scored points yet.</div>
            <div style={{ fontSize: 11, marginTop: 6, letterSpacing: 1, color: '#ef4444', fontFamily: 'monospace' }}>Be the first team to solve a challenge.</div>
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
                        background: 'linear-gradient(180deg, rgba(12,4,7,0.98), rgba(20,5,8,0.96))',
                        border: `1.5px solid ${cfg.border}`,
                        borderBottom: 'none',
                        borderRadius: '12px 12px 0 0',
                        textAlign: 'center',
                        boxShadow: `0 0 ${dataIdx === 0 ? 50 : 30}px ${cfg.glow}`,
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        {me && (
                          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(239,68,68,0.6)', borderRadius: 4, padding: '2px 7px', fontSize: 8, color: '#fca5a5', fontWeight: 800, letterSpacing: 1, fontFamily: 'monospace' }}>YOUR OP</div>
                        )}
                        <div style={{ fontSize: dataIdx === 0 ? 32 : 26, marginBottom: 6, filter: `drop-shadow(0 0 12px ${cfg.color}80)` }}>{cfg.icon}</div>
                        <div style={{ fontWeight: 800, fontSize: dataIdx === 0 ? 15 : 13, color: '#f1f5f9', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{team.teamName}</div>
                        <div style={{ fontSize: dataIdx === 0 ? 28 : 22, fontWeight: 900, color: cfg.color, lineHeight: 1, marginBottom: 4, textShadow: `0 0 20px ${cfg.color}80`, fontFamily: 'var(--font-rajdhani), sans-serif' }}>{getPoints(team).toLocaleString()}</div>
                        <div style={{ fontSize: 9, color: '#ef4444', letterSpacing: 2, marginBottom: 10, fontFamily: 'monospace' }}>POINTS</div>
                        {/* Score bar */}
                        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#7f1d1d,#dc2626,#ef4444)', borderRadius: 2 }} />
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: 10, letterSpacing: 1, fontFamily: 'monospace' }}>{getLevel(team)} / {totalLevels} TARGETS SOLVED</div>
                      </div>
                      {/* Podium block */}
                      <div style={{
                        width: '100%', height: h,
                        background: `linear-gradient(180deg, ${cfg.color}22, ${cfg.color}08)`,
                        border: `1.5px solid ${cfg.border}`,
                        borderTop: 'none',
                        borderRadius: '0 0 8px 8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 8px 40px ${cfg.glow}`,
                      }}>
                        <span style={{ fontSize: 44, fontWeight: 900, color: `${cfg.color}40`, letterSpacing: -2, fontFamily: 'var(--font-rajdhani), sans-serif' }}>
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
                  <div style={{ color: '#ef4444', fontSize: 10, fontWeight: 700, letterSpacing: 3, fontFamily: 'monospace' }}>// FULL AGENT ROSTER //</div>
                  <div style={{ flex: 1, height: 1, background: 'rgba(220,38,38,0.2)' }} />
                </div>

                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 110px 180px 90px', gap: 8, padding: '6px 14px', marginBottom: 4 }}>
                  {['RANK','SQUAD','TARGETS','EFFICIENCY','SCORE'].map(h => (
                    <div key={h} style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace' }}>{h}</div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                          display: 'grid', gridTemplateColumns: '50px 1fr 110px 180px 90px',
                          gap: 8, alignItems: 'center',
                          padding: '12px 16px',
                          background: me ? 'rgba(220,38,38,0.16)' : 'rgba(10,4,6,0.85)',
                          border: `1px solid ${me ? 'rgba(239,68,68,0.6)' : 'rgba(220,38,38,0.25)'}`,
                          borderRadius: 8, position: 'relative', overflow: 'hidden',
                          transition: 'all 0.15s',
                        }}
                      >
                        {/* Rank */}
                        <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', fontSize: 13, fontWeight: 900, fontFamily: 'monospace' }}>
                          {rank}
                        </div>
                        {/* Team name */}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ color: me ? '#fee2e2' : '#f1f5f9', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.teamName}</div>
                          {me && <div style={{ fontSize: 9, color: '#ef4444', letterSpacing: 2, marginTop: 1, fontFamily: 'monospace', fontWeight: 800 }}>YOUR SQUAD</div>}
                        </div>
                        {/* Mission progress bubbles */}
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          {Array.from({ length: totalLevels }, (_, ii) => (
                            <div key={ii} style={{ width: 7, height: 7, borderRadius: '2px', background: ii < lvl ? '#10b981' : ii === lvl ? '#ef4444' : '#1f0d12', boxShadow: ii === lvl ? '0 0 6px #ef4444' : 'none' }} />
                          ))}
                        </div>
                        {/* Score bar */}
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#7f1d1d,#dc2626,#ef4444)', borderRadius: 2, transition: 'width 0.6s ease' }} />
                        </div>
                        {/* Score */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#ef4444', fontSize: 15, fontWeight: 900, fontFamily: 'monospace' }}>{pts.toLocaleString()}</div>
                          <div style={{ color: '#64748b', fontSize: 9, letterSpacing: 2, fontFamily: 'monospace' }}>PTS</div>
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
        <div style={{ marginTop: 40, padding: '12px 18px', background: 'rgba(10,4,6,0.6)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6b7280', fontSize: 11, fontFamily: 'monospace' }}>
            <Lock size={11} className="text-red-500" />Real-time SSE encrypted sync active
          </div>
          <div style={{ color: '#ef4444', fontSize: 10, letterSpacing: 2, fontFamily: 'monospace' }}>THE EXTRACTION — CLASSIFIED COMMAND</div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes dopulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}
