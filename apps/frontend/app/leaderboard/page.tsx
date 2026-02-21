'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Trophy, Crown, Users, Activity, ArrowLeft,
  RadioTower, Zap, Shield, RefreshCw, Lock
} from 'lucide-react';

const POLL_INTERVAL = 15000; // auto-refresh every 15 seconds

const rankColors = [
  { bg: 'rgba(234,179,8,0.14)', border: 'rgba(234,179,8,0.45)', badge: '#ca8a04', badgeBg: 'rgba(234,179,8,0.2)', icon: '🥇' },
  { bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.35)', badge: '#94a3b8', badgeBg: 'rgba(148,163,184,0.15)', icon: '🥈' },
  { bg: 'rgba(234,137,52,0.1)', border: 'rgba(234,137,52,0.35)', badge: '#ea8c34', badgeBg: 'rgba(234,137,52,0.15)', icon: '🥉' },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(POLL_INTERVAL / 1000);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const data = await api.challenges.getLeaderboard();
      if (Array.isArray(data)) setLeaderboard(data);
      setLastUpdated(new Date());
      setCountdown(POLL_INTERVAL / 1000);
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    loadData();
    const pollInterval = setInterval(() => loadData(), POLL_INTERVAL);
    return () => clearInterval(pollInterval);
  }, [loadData]);

  // Countdown timer
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? POLL_INTERVAL / 1000 : prev - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // SSE for real-time updates
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const base = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl.replace(/\/$/, '')}/api`;
    const es = new EventSource(`${base}/scoreboard/live`);
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) { setLeaderboard(data); setLastUpdated(new Date()); }
      } catch { /* ignore */ }
    };
    return () => es.close();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const maxPoints = leaderboard[0]?.totalPoints || leaderboard[0]?.points || 1;

  const getPoints = (team: any) => team.totalPoints ?? team.points ?? 0;
  const getLevel = (team: any) => team.currentLevel ?? team.challengesSolved ?? 0;

  return (
    <div style={{ minHeight: '100vh', background: '#080614', fontFamily: "'Share Tech Mono', 'Courier New', monospace", position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.22),rgba(0,0,0,0.22) 1px,transparent 1px,transparent 3px)', opacity: 0.28 }} />
      <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', opacity: 0.015, zIndex: 0, pointerEvents: 'none' }}>
        <defs><pattern id="bg" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0 L0 0 0 60" fill="none" stroke="#7c3aed" strokeWidth="0.5" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#bg)" />
      </svg>

      {/* Top nav */}
      <div style={{ position: 'relative', zIndex: 20, display: 'flex', alignItems: 'center', padding: '12px 28px', borderBottom: '1px solid rgba(109,40,217,0.25)', background: 'rgba(5,2,18,0.95)', backdropFilter: 'blur(20px)', gap: 14 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 11, fontWeight: 700, letterSpacing: 2, textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(55,65,81,0.4)', borderRadius: 7, transition: 'all 0.15s' }}>
          <ArrowLeft size={13} />HQ
        </Link>
        <Link href="/challenges" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 11, fontWeight: 700, letterSpacing: 2, textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(55,65,81,0.4)', borderRadius: 7, transition: 'all 0.15s' }}>
          MISSIONS
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={13} color="#fff" />
          </div>
          <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 800, letterSpacing: 3 }}>CIPHER OPS</span>
        </div>
        <div style={{ flex: 1 }} />
        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 7, padding: '5px 12px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'dopulse 1.5s infinite' }} />
          <span style={{ color: '#10b981', fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>LIVE</span>
          <span style={{ color: '#4b5563', fontSize: 9, letterSpacing: 1 }}>· {countdown}s</span>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(109,40,217,0.35)', borderRadius: 7, cursor: 'pointer', color: '#a78bfa', fontSize: 11, fontWeight: 700, letterSpacing: 1, fontFamily: 'inherit', opacity: refreshing ? 0.6 : 1, transition: 'all 0.15s' }}
        >
          <RefreshCw size={12} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
          REFRESH
        </button>
        {lastUpdated && (
          <span style={{ color: '#4b5563', fontSize: 9, letterSpacing: 1 }}>Updated {lastUpdated.toLocaleTimeString()}</span>
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
            <Crown size={28} color="#fbbf24" />
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#e9d5ff', letterSpacing: 5, textTransform: 'uppercase', textShadow: '0 0 40px rgba(124,58,237,0.5)' }}>LEADERBOARD</h1>
            <Crown size={28} color="#fbbf24" />
          </div>
          <p style={{ color: '#6b7280', fontSize: 11, letterSpacing: 3, margin: 0 }}>OPERATION BLACKOUT — REAL-TIME RANKINGS</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6b7280', fontSize: 10 }}>
              <Users size={11} />
              <span>{leaderboard.length} Teams Active</span>
            </div>
            <div style={{ width: 1, height: 14, background: 'rgba(109,40,217,0.3)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6b7280', fontSize: 10 }}>
              <Activity size={11} />
              <span>Auto-refreshes every {POLL_INTERVAL / 1000}s</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(124,58,237,0.3)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ color: '#7c3aed', fontSize: 12, letterSpacing: 4, fontWeight: 700 }}>LOADING RANKINGS...</div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed rgba(55,65,81,0.4)', borderRadius: 16, color: '#4b5563' }}>
            <RadioTower size={40} style={{ margin: '0 auto 14px', opacity: 0.3 }} />
            <div style={{ fontSize: 14 }}>No teams have scored yet.</div>
            <div style={{ fontSize: 11, marginTop: 6, letterSpacing: 1 }}>Be the first to complete a mission.</div>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${top3.length}, 1fr)`, gap: 12, marginBottom: 24 }}>
                {top3.map((team, idx) => {
                  const cfg = rankColors[idx];
                  const pts = getPoints(team);
                  const pct = Math.round((pts / maxPoints) * 100);
                  return (
                    <div key={team.teamId || idx} style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: 14, padding: '20px 18px', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: idx === 0 ? '0 0 32px rgba(234,179,8,0.15)' : 'none' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${cfg.badge},transparent)` }} />
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{cfg.icon}</div>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.badgeBg, border: `1px solid ${cfg.badge}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: cfg.badge, fontSize: 14, fontWeight: 900 }}>#{idx + 1}</div>
                      <div style={{ color: '#e2e8f0', fontSize: idx === 0 ? 15 : 13, fontWeight: 800, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.teamName}</div>
                      <div style={{ color: cfg.badge, fontSize: idx === 0 ? 24 : 20, fontWeight: 900, marginBottom: 4 }}>{pts.toLocaleString()}</div>
                      <div style={{ color: '#6b7280', fontSize: 9, letterSpacing: 2, marginBottom: 10 }}>POINTS</div>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${cfg.badge},#a78bfa)`, borderRadius: 2 }} />
                      </div>
                      <div style={{ color: '#6b7280', fontSize: 9, letterSpacing: 1 }}>LEVEL {getLevel(team)} / 9</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rest of teams */}
            {rest.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ color: '#4b5563', fontSize: 9, fontWeight: 700, letterSpacing: 3, padding: '0 4px', marginBottom: 4 }}>
                  FULL RANKINGS
                </div>
                {rest.map((team, i) => {
                  const rank = i + 4;
                  const pts = getPoints(team);
                  const pct = Math.round((pts / maxPoints) * 100);
                  return (
                    <div key={team.teamId || i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'rgba(5,2,18,0.75)', border: '1px solid rgba(55,65,81,0.28)', borderRadius: 10, position: 'relative', overflow: 'hidden', transition: 'all 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(109,40,217,0.35)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(55,65,81,0.28)')}>
                      {/* Progress bar background */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, width: `${pct}%`, background: 'linear-gradient(90deg,rgba(124,58,237,0.4),rgba(6,182,212,0.2))', borderRadius: '0 0 0 10px' }} />
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(55,65,81,0.35)', border: '1px solid rgba(55,65,81,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                        {rank}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{team.teamName}</div>
                        <div style={{ color: '#4b5563', fontSize: 9, letterSpacing: 1 }}>LEVEL {getLevel(team)} / 9</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ color: '#a78bfa', fontSize: 16, fontWeight: 900 }}>{pts.toLocaleString()}</div>
                        <div style={{ color: '#4b5563', fontSize: 9, letterSpacing: 2 }}>PTS</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{ marginTop: 40, padding: '16px 20px', background: 'rgba(5,2,18,0.6)', border: '1px solid rgba(55,65,81,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 10 }}>
            <Lock size={10} />
            <span>Scores update in real-time via SSE + {POLL_INTERVAL/1000}s polling</span>
          </div>
          <div style={{ color: '#4b5563', fontSize: 9, letterSpacing: 1 }}>OPERATION BLACKOUT — CIPHER 2026</div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes dopulse { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }
      `}</style>
    </div>
  );
}

