'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Users, Trophy, FileText, LogOut, Download,
  Lock, Unlock, Shield, Activity, RefreshCw, Search,
  CheckCircle2, XCircle, Eye, Clock, Zap, Crown, UserX, UserCheck,
  TrendingUp, BarChart2, Radio, Settings, ShieldAlert,
  Snowflake, HelpCircle, AlertTriangle, Play, Flame, Send
} from 'lucide-react';
import HalfCircleMenu from '@/components/ui/HalfCircleMenu';

type TabType = 'overview' | 'teams' | 'hints' | 'submissions';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [hintsData, setHintsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scoreboardFrozen, setScoreboardFrozen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<'all' | 'active' | 'disqualified' | 'frozen'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Modals
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showDisqualifyModal, setShowDisqualifyModal] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [adjustPoints, setAdjustPoints] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [disqualifyReason, setDisqualifyReason] = useState('');

  // Game override states
  const [gameState, setGameState] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [
        profileData,
        statsData,
        submissionsData,
        teamsData,
        scoreboardStatus,
        currentGameState,
        hintsOverviewData
      ] = await Promise.all([
        api.getProfile(),
        api.admin.getStats().catch(() => null),
        api.admin.getAllSubmissions().catch(() => []),
        api.getAllTeams().catch(() => []),
        api.getScoreboardStatus().catch(() => ({ frozen: false })),
        api.game.getState().catch(() => null),
        api.admin.getHints().catch(() => null),
      ]);

      if (profileData.role !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }

      setUser(profileData);
      setStats(statsData);
      setSubmissions(submissionsData || []);
      setTeams(teamsData || []);
      setScoreboardFrozen(Boolean(scoreboardStatus?.frozen));
      setGameState(currentGameState);
      setHintsData(hintsOverviewData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load admin data:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router, loadData]);

  // GSAP Animation
  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.df'),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, stagger: 0.04, duration: 0.35, ease: 'power3.out' }
      );
    }
  }, [loading, activeTab]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadData();
      }, 10000);
    }
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [autoRefresh, loadData]);

  // Actions
  const handleAdjustScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !adjustReason) return alert('Please provide an adjustment reason');
    try {
      await api.admin.adjustTeamScore(selectedTeam.id, { points: adjustPoints, reason: adjustReason });
      await loadData();
      setShowAdjustModal(false);
      setSelectedTeam(null);
      setAdjustPoints(0);
      setAdjustReason('');
    } catch (error: any) {
      alert(error.message || 'Failed to adjust score');
    }
  };

  const handleDisqualifyTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !disqualifyReason) return alert('Please provide a reason for disqualification');
    try {
      await api.admin.disqualifyTeam(selectedTeam.id, { reason: disqualifyReason });
      await loadData();
      setShowDisqualifyModal(false);
      setSelectedTeam(null);
      setDisqualifyReason('');
    } catch (error: any) {
      alert(error.message || 'Failed to disqualify team');
    }
  };

  const handleReEnableTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Re-enable team "${teamName}" and restore to active competition?`)) return;
    try {
      await api.admin.reEnableTeam(teamId);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to re-enable team');
    }
  };

  const handleToggleFreezeTeamScore = async (teamId: string, teamName: string, currentlyFrozen: boolean) => {
    const action = currentlyFrozen ? 'UNFREEZE' : 'FREEZE';
    if (!confirm(`${action} score for team "${teamName}"? While frozen, newly solved challenges do not increase their scoreboard total.`)) return;
    try {
      await api.admin.freezeTeamScore(teamId, { freeze: !currentlyFrozen });
      await loadData();
    } catch (error: any) {
      alert(error.message || `Failed to ${action.toLowerCase()} team score`);
    }
  };

  const handleGrantHint = async (teamId: string, teamName: string, free: boolean = true) => {
    try {
      const res = await api.admin.grantHint(teamId, { free });
      alert(`✅ ${res.message || 'Hint dispatched!'}\n\nIntel dispatched:\n"${res.hint}"`);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to grant hint');
    }
  };

  const handleResetHints = async (teamId: string, teamName: string) => {
    if (!confirm(`Reset all hint penalties and hint uses for "${teamName}"? This will refund any points previously lost to hint penalties.`)) return;
    try {
      const res = await api.admin.resetHints(teamId, { refundPoints: true });
      alert(`✅ ${res.message || 'Hints reset successfully'}`);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to reset hints');
    }
  };

  const handleToggleFreezeScoreboard = async () => {
    const action = scoreboardFrozen ? 'UNFREEZE' : 'FREEZE';
    if (!confirm(`${action} the global game scoreboard? While frozen, public standings are locked at this snapshot.`)) return;
    try {
      await api.admin.freezeScoreboard({ freeze: !scoreboardFrozen });
      setScoreboardFrozen(!scoreboardFrozen);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to toggle scoreboard freeze');
    }
  };

  const handleEndGame = async () => {
    if (!confirm('🚨 CRITICAL ACTION: Are you sure you want to END THE GAME FOR ALL OPERATIVES?\n\nThis will broadcast the mission conclusion to all connected teams, crown the winner based on current scores, and activate the cinematic ending screen for everyone.')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.admin.endGame();
      alert(`✅ ${res.message || 'Game ended successfully!'}\nWinner: ${res.winner || 'Leader'}`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to end game');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeGame = async () => {
    if (!confirm('Reopen live missions and resume competition for all teams?')) return;
    setActionLoading(true);
    try {
      const res = await api.admin.resumeGame();
      alert(res.message || 'Game resumed.');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to resume game');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await api.admin.exportResultsCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `theextraction-results-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.message || 'Failed to export CSV');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Filtered teams
  const filteredTeams = useMemo(() => {
    return teams
      .filter((team) => {
        const matchesSearch =
          team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.members?.some((m: any) => (m.username || m.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        if (teamFilter === 'active') return !team.disqualified;
        if (teamFilter === 'disqualified') return Boolean(team.disqualified);
        if (teamFilter === 'frozen') return Boolean(team.scoreFrozen);
        return true;
      })
      .sort((a, b) => (b.scores?.[0]?.totalPoints || 0) - (a.scores?.[0]?.totalPoints || 0));
  }, [teams, searchQuery, teamFilter]);

  const activeTeamsCount = teams.filter((t) => !t.disqualified).length;
  const disqualifiedTeamsCount = teams.filter((t) => t.disqualified).length;
  const frozenTeamsCount = teams.filter((t) => t.scoreFrozen).length;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexDirection: 'column' }}>
        <div style={{ width: 44, height: 44, border: '3px solid rgba(220,38,38,0.2)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: '#ef4444', letterSpacing: 3, fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>
          INITIALIZING SYS_ADMIN COMMAND...
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(10,4,6,0.95)',
    border: '1px solid rgba(220,38,38,0.4)',
    borderRadius: 6,
    color: '#fee2e2',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'monospace',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    color: '#fca5a5',
    fontWeight: 700,
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    fontFamily: 'monospace',
  };

  const cardStyle = {
    background: 'linear-gradient(135deg, rgba(10,4,6,0.95), rgba(18,6,9,0.92))',
    border: '1px solid rgba(220,38,38,0.3)',
    borderRadius: 8,
    padding: '22px',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050508', position: 'relative', overflowX: 'hidden', color: '#f1f5f9' }}>
      <HalfCircleMenu isAdmin={true} />
      <div className="blood-splatter-bg" />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(220,38,38,0.14) 0%, transparent 60%)' }} />

      {/* -- NAV -- */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 66, borderBottom: '1px solid rgba(220,38,38,0.3)', background: 'rgba(10,4,6,0.95)', backdropFilter: 'blur(20px)', gap: 12 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 6, background: 'linear-gradient(135deg,#7f1d1d,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(220,38,38,0.4)' }}>
            <ShieldAlert size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 900, lineHeight: 1.1, letterSpacing: '1px', textTransform: 'uppercase' }}>THE EXTRACTION</div>
            <div style={{ color: '#ef4444', fontSize: 10, lineHeight: 1, fontFamily: 'monospace', letterSpacing: '2px' }}>SYS_ADMIN HQ</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'overview', icon: BarChart2, label: 'Overview' },
            { id: 'teams', icon: Users, label: `Teams (${teams.length})` },
            { id: 'hints', icon: HelpCircle, label: 'Manage Hints' },
            { id: 'submissions', icon: Activity, label: 'Live Submissions' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px',
                  borderRadius: 6, fontSize: 12, fontWeight: 800, cursor: 'pointer',
                  border: isActive ? '1px solid #ef4444' : '1px solid rgba(220,38,38,0.2)',
                  background: isActive ? 'rgba(220,38,38,0.22)' : 'rgba(10,4,6,0.6)',
                  color: isActive ? '#fee2e2' : '#94a3b8',
                  fontFamily: 'monospace', letterSpacing: '1px', transition: 'all 0.15s ease',
                }}
              >
                <tab.icon size={14} color={isActive ? '#ef4444' : '#64748b'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Global Scoreboard Freeze Toggle */}
          <button
            onClick={handleToggleFreezeScoreboard}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace',
              border: scoreboardFrozen ? '1px solid #38bdf8' : '1px solid rgba(220,38,38,0.4)',
              background: scoreboardFrozen ? 'rgba(14,165,233,0.2)' : 'rgba(220,38,38,0.1)',
              color: scoreboardFrozen ? '#7dd3fc' : '#f87171',
              boxShadow: scoreboardFrozen ? '0 0 12px rgba(56,189,248,0.3)' : 'none',
            }}
          >
            {scoreboardFrozen ? <Snowflake size={13} color="#38bdf8" /> : <Unlock size={13} color="#ef4444" />}
            {scoreboardFrozen ? 'SCOREBOARD FROZEN' : 'SCOREBOARD LIVE'}
          </button>

          {/* End Game Quick Action */}
          {!gameState?.storyEnded ? (
            <button
              onClick={handleEndGame}
              disabled={actionLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace',
                border: '1px solid #dc2626', background: 'linear-gradient(135deg, #7f1d1d, #b91c1c)', color: '#fff',
                boxShadow: '0 0 14px rgba(220,38,38,0.4)',
              }}
            >
              <Flame size={13} /> END GAME FOR ALL
            </button>
          ) : (
            <button
              onClick={handleResumeGame}
              disabled={actionLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace',
                border: '1px solid #10b981', background: 'rgba(16,185,129,0.2)', color: '#6ee7b7',
              }}
            >
              <Play size={13} /> RESUME GAME
            </button>
          )}

          <button
            onClick={() => loadData()}
            title="Refresh data"
            style={{ padding: '7px 10px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6, color: '#fca5a5', cursor: 'pointer' }}
          >
            <RefreshCw size={14} />
          </button>

          <button
            onClick={handleLogout}
            title="Logout"
            style={{ padding: '7px 10px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6, color: '#f87171', cursor: 'pointer' }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </nav>

      {/* -- CONTENT AREA -- */}
      <div ref={containerRef} style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px 80px', position: 'relative', zIndex: 5 }}>

        {/* Status Alerts */}
        {gameState?.storyEnded && (
          <div className="df" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderRadius: 8, background: 'linear-gradient(135deg, rgba(127,29,29,0.5), rgba(220,38,38,0.3))', border: '1px solid rgba(239,68,68,0.7)', marginBottom: 20 }}>
            <div>
              <div style={{ color: '#fee2e2', fontSize: 15, fontWeight: 900 }}>
                🚨 GAME FINALE IS CURRENTLY BROADCASTED FOR ALL TEAMS
              </div>
              <div style={{ color: '#fca5a5', fontSize: 12, fontFamily: 'monospace', marginTop: 2 }}>
                Winner: <strong style={{ color: '#fff' }}>{gameState.winnerTeamName || 'None'}</strong> — Clients are redirected to post-credits screen.
              </div>
            </div>
            <button
              onClick={handleResumeGame}
              style={{ padding: '6px 14px', background: '#10b981', border: 'none', borderRadius: 5, color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}
            >
              RESUME COMPETITION
            </button>
          </div>
        )}

        {/* -- OVERVIEW TAB -- */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* KPI Cards */}
            <div className="df" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {[
                { label: 'REGISTERED TEAMS', val: teams.length, sub: `${activeTeamsCount} Active • ${disqualifiedTeamsCount} Disqualified`, icon: Users },
                { label: 'FROZEN TEAMS', val: frozenTeamsCount, sub: `${teams.length - frozenTeamsCount} Live scoring`, icon: Snowflake },
                { label: 'TOTAL SOLVES', val: stats?.correctSubmissions ?? 0, sub: `Out of ${stats?.totalSubmissions ?? 0} attempts`, icon: CheckCircle2 },
                { label: 'GLOBAL SCOREBOARD', val: scoreboardFrozen ? 'FROZEN' : 'LIVE', sub: scoreboardFrozen ? 'Snapshot locked' : 'Real-time updates', icon: scoreboardFrozen ? Snowflake : Zap },
              ].map((kpi, idx) => (
                <div key={idx} className="tactical-box corner-brackets p-5 rounded-md" style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, fontFamily: 'monospace', letterSpacing: 1 }}>{kpi.label}</span>
                    <kpi.icon size={16} color="#ef4444" />
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', fontFamily: 'var(--font-rajdhani), sans-serif', marginBottom: 4 }}>
                    {kpi.val}
                  </div>
                  <div style={{ fontSize: 11, color: '#f87171', fontFamily: 'monospace' }}>{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Global Control Authority */}
            <div className="df tactical-box p-6 rounded-md" style={cardStyle}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', marginBottom: 16, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                // GLOBAL EVENT AUTHORITY //
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {/* End Game Card */}
                <div style={{ padding: 18, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Flame size={18} color="#ef4444" />
                    <span style={{ fontWeight: 800, color: '#fee2e2', fontSize: 14 }}>END GAME FOR ALL</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 16 }}>
                    Instantly declare mission completion for all teams. Ranks are finalized, and every client receives the cinematic ending sequence.
                  </p>
                  {!gameState?.storyEnded ? (
                    <button
                      onClick={handleEndGame}
                      style={{ padding: '9px 18px', background: '#dc2626', border: '1px solid #f87171', borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', width: '100%' }}
                    >
                      END COMPETITION NOW
                    </button>
                  ) : (
                    <button
                      onClick={handleResumeGame}
                      style={{ padding: '9px 18px', background: '#059669', border: '1px solid #34d399', borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', width: '100%' }}
                    >
                      RESUME LIVE MISSIONS
                    </button>
                  )}
                </div>

                {/* Scoreboard Freeze Card */}
                <div style={{ padding: 18, background: scoreboardFrozen ? 'rgba(14,165,233,0.08)' : 'rgba(220,38,38,0.06)', border: scoreboardFrozen ? '1px solid rgba(56,189,248,0.4)' : 'rgba(220,38,38,0.3)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Snowflake size={18} color={scoreboardFrozen ? '#38bdf8' : '#ef4444'} />
                    <span style={{ fontWeight: 800, color: '#fee2e2', fontSize: 14 }}>FREEZE WHOLE GAME SCOREBOARD</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 16 }}>
                    Freeze the public leaderboard at the current standings. Useful for the final 30 minutes of the competition to keep winners a suspense.
                  </p>
                  <button
                    onClick={handleToggleFreezeScoreboard}
                    style={{
                      padding: '9px 18px', borderRadius: 6, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', width: '100%',
                      background: scoreboardFrozen ? 'linear-gradient(135deg, #0284c7, #38bdf8)' : 'rgba(220,38,38,0.2)',
                      border: scoreboardFrozen ? '1px solid #7dd3fc' : '1px solid rgba(220,38,38,0.5)',
                      color: scoreboardFrozen ? '#0f172a' : '#fee2e2',
                    }}
                  >
                    {scoreboardFrozen ? 'UNFREEZE SCOREBOARD (RESTORE LIVE)' : 'FREEZE SCOREBOARD NOW'}
                  </button>
                </div>

                {/* Export Data */}
                <div style={{ padding: 18, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Download size={18} color="#ef4444" />
                    <span style={{ fontWeight: 800, color: '#fee2e2', fontSize: 14 }}>EXPORT EVENT DATA</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 16 }}>
                    Download certified scoreboards, team solve timelines, and submission audits for grading and documentation.
                  </p>
                  <button
                    onClick={handleExportCSV}
                    style={{ padding: '9px 18px', background: 'rgba(220,38,38,0.25)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: 6, color: '#fee2e2', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', width: '100%' }}
                  >
                    DOWNLOAD RESULTS (CSV)
                  </button>
                </div>
              </div>
            </div>

            {/* Live Submissions Feed Preview */}
            <div className="df tactical-box p-6 rounded-md" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  // LIVE SUBMISSIONS STREAM //
                </div>
                <button
                  onClick={() => setActiveTab('submissions')}
                  style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'monospace' }}
                >
                  VIEW ALL &rarr;
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {submissions.slice(0, 8).map((sub: any) => (
                  <div
                    key={sub.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 12px', background: 'rgba(0,0,0,0.35)', borderRadius: 6,
                      borderLeft: `3px solid ${sub.isCorrect ? '#10b981' : '#ef4444'}`,
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: 'monospace', color: '#64748b' }}>
                        {new Date(sub.createdAt).toLocaleTimeString()}
                      </span>
                      <strong style={{ color: '#f1f5f9' }}>{sub.team?.name || 'Operative'}</strong>
                      <span style={{ color: '#94a3b8' }}>&rarr; {sub.challenge?.title || 'Mission Level'}</span>
                    </div>
                    <div>
                      {sub.isCorrect ? (
                        <span style={{ color: '#6ee7b7', fontFamily: 'monospace', fontWeight: 800, background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: 4 }}>
                          +{sub.points} PTS (CORRECT)
                        </span>
                      ) : (
                        <span style={{ color: '#fca5a5', fontFamily: 'monospace', background: 'rgba(220,38,38,0.15)', padding: '2px 8px', borderRadius: 4 }}>
                          INCORRECT
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {submissions.length === 0 && (
                  <div style={{ color: '#64748b', fontSize: 12, fontFamily: 'monospace', padding: 12 }}>
                    No submissions recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* -- TEAMS TAB -- */}
        {activeTab === 'teams' && (
          <div className="df" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Search & Filter Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { id: 'all', label: `ALL (${teams.length})` },
                  { id: 'active', label: `ACTIVE (${activeTeamsCount})` },
                  { id: 'frozen', label: `FROZEN (${frozenTeamsCount})` },
                  { id: 'disqualified', label: `DISQUALIFIED (${disqualifiedTeamsCount})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTeamFilter(f.id as any)}
                    style={{
                      padding: '6px 12px', borderRadius: 5, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace',
                      background: teamFilter === f.id ? 'rgba(220,38,38,0.25)' : 'rgba(10,4,6,0.6)',
                      border: teamFilter === f.id ? '1px solid #ef4444' : '1px solid rgba(220,38,38,0.25)',
                      color: teamFilter === f.id ? '#fee2e2' : '#94a3b8',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', minWidth: 260 }}>
                <Search size={14} color="#ef4444" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Filter teams or operatives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 32, fontSize: 12 }}
                />
              </div>
            </div>

            {/* Teams Table */}
            <div className="tactical-box" style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontFamily: 'monospace', fontSize: 11, letterSpacing: 1 }}>
                      <th style={{ padding: '12px 16px' }}>RANK</th>
                      <th style={{ padding: '12px 16px' }}>TEAM CALLSIGN</th>
                      <th style={{ padding: '12px 16px' }}>OPERATIVES</th>
                      <th style={{ padding: '12px 16px' }}>LEVEL</th>
                      <th style={{ padding: '12px 16px' }}>SCORE</th>
                      <th style={{ padding: '12px 16px' }}>SCORE STATUS</th>
                      <th style={{ padding: '12px 16px' }}>TEAM STATUS</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>COMMAND ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.map((team, idx) => {
                      const isDisqualified = Boolean(team.disqualified);
                      const isScoreFrozen = Boolean(team.scoreFrozen);
                      const totalPoints = team.scores?.[0]?.totalPoints || 0;

                      return (
                        <tr
                          key={team.id}
                          style={{
                            borderBottom: '1px solid rgba(220,38,38,0.15)',
                            background: isDisqualified
                              ? 'rgba(127,29,29,0.1)'
                              : isScoreFrozen
                              ? 'rgba(14,165,233,0.04)'
                              : 'transparent',
                          }}
                        >
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 800, color: idx === 0 ? '#fbbf24' : '#ef4444' }}>
                            #{idx + 1}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 800, color: '#f1f5f9' }}>
                            {team.name}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 12 }}>
                            {team.members?.map((m: any) => m.name || m.username).join(', ') || 'Solo Operative'}
                          </td>
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#fca5a5' }}>
                            Level {team.currentLevel ?? 1}
                          </td>
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 900, color: '#fee2e2' }}>
                            {totalPoints} PTS
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <button
                              onClick={() => handleToggleFreezeTeamScore(team.id, team.name, isScoreFrozen)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 4,
                                fontSize: 10, fontWeight: 800, fontFamily: 'monospace', cursor: 'pointer',
                                background: isScoreFrozen ? 'rgba(56,189,248,0.2)' : 'rgba(0,0,0,0.3)',
                                border: isScoreFrozen ? '1px solid #38bdf8' : '1px solid rgba(220,38,38,0.3)',
                                color: isScoreFrozen ? '#7dd3fc' : '#94a3b8',
                              }}
                            >
                              <Snowflake size={11} color={isScoreFrozen ? '#38bdf8' : '#64748b'} />
                              {isScoreFrozen ? 'SCORE FROZEN' : 'FREEZE SCORE'}
                            </button>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800, fontFamily: 'monospace',
                                background: isDisqualified ? 'rgba(220,38,38,0.2)' : 'rgba(16,185,129,0.15)',
                                color: isDisqualified ? '#f87171' : '#6ee7b7',
                                border: `1px solid ${isDisqualified ? 'rgba(220,38,38,0.5)' : 'rgba(16,185,129,0.4)'}`,
                              }}
                            >
                              {isDisqualified ? 'DISQUALIFIED' : 'ACTIVE'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => { setSelectedTeam(team); setShowAdjustModal(true); }}
                                style={{ padding: '5px 9px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 4, color: '#fee2e2', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}
                              >
                                ADJUST PTS
                              </button>

                              <button
                                onClick={() => { setSelectedTeam(team); setShowHintModal(true); }}
                                style={{ padding: '5px 9px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 4, color: '#fde68a', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}
                              >
                                HINTS
                              </button>

                              {isDisqualified ? (
                                <button
                                  onClick={() => handleReEnableTeam(team.id, team.name)}
                                  style={{ padding: '5px 10px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.6)', borderRadius: 4, color: '#6ee7b7', fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', boxShadow: '0 0 10px rgba(16,185,129,0.2)' }}
                                >
                                  RE-ENABLE
                                </button>
                              ) : (
                                <button
                                  onClick={() => { setSelectedTeam(team); setShowDisqualifyModal(true); }}
                                  style={{ padding: '5px 10px', background: 'rgba(127,29,29,0.3)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: 4, color: '#fca5a5', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}
                                >
                                  DISQUALIFY
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -- HINTS TAB -- */}
        {activeTab === 'hints' && (
          <div className="df" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header info */}
            <div className="tactical-box p-6 rounded-md" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                    // TEAM HINT & ORBITAL INTEL MANAGEMENT //
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: 12, margin: '6px 0 0', lineHeight: 1.5 }}>
                    Monitor team hints used, dispatch orbital assistance without penalty, or refund mistakenly deducted hint penalties.
                  </p>
                </div>
              </div>
            </div>

            {/* Team Hint Table */}
            <div className="tactical-box" style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontFamily: 'monospace', fontSize: 11, letterSpacing: 1 }}>
                      <th style={{ padding: '12px 16px' }}>TEAM CALLSIGN</th>
                      <th style={{ padding: '12px 16px' }}>CURRENT TARGET</th>
                      <th style={{ padding: '12px 16px' }}>HINTS ON TARGET</th>
                      <th style={{ padding: '12px 16px' }}>TOTAL HINTS USED</th>
                      <th style={{ padding: '12px 16px' }}>TOTAL PENALTY DEDUCTED</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>INTEL ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(hintsData?.teams || []).map((t: any) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid rgba(220,38,38,0.15)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#f1f5f9' }}>
                          {t.name}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#fee2e2', fontSize: 12 }}>
                          {t.currentChallenge ? `${t.currentChallenge.title}` : `Level ${t.currentLevel}`}
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: t.hintsOnCurrent > 0 ? '#f59e0b' : '#94a3b8' }}>
                          {t.hintsOnCurrent} hint(s)
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#cbd5e1' }}>
                          {t.totalHintsUsed} total
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: t.totalHintPenalty > 0 ? '#ef4444' : '#10b981', fontWeight: 800 }}>
                          -{t.totalHintPenalty} PTS
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleGrantHint(t.id, t.name, true)}
                              style={{ padding: '5px 12px', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.4)', borderRadius: 4, color: '#7dd3fc', fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}
                            >
                              GRANT FREE HINT
                            </button>
                            <button
                              onClick={() => handleResetHints(t.id, t.name)}
                              style={{ padding: '5px 12px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 4, color: '#6ee7b7', fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}
                            >
                              REFUND & RESET HINTS
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hint Catalog Reference Accordion */}
            <div className="tactical-box p-6 rounded-md" style={cardStyle}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', marginBottom: 14, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                // CHALLENGE INTEL CATALOG (READ-ONLY) //
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(hintsData?.catalog || []).map((ch: any) => (
                  <div key={ch.id} style={{ padding: 14, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, color: '#f1f5f9', fontSize: 13 }}>
                        Round {ch.roundOrder}.{ch.order} — {ch.title}
                      </span>
                      <span style={{ color: '#ef4444', fontFamily: 'monospace', fontSize: 11 }}>
                        Penalty per use: {ch.hintPenalty} pts
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                      {ch.hints?.map((h: string, hi: number) => (
                        <div key={hi} style={{ padding: '6px 10px', background: 'rgba(220,38,38,0.06)', borderRadius: 4, fontSize: 12, color: '#fca5a5', fontFamily: 'monospace' }}>
                          <strong style={{ color: '#ef4444' }}>Tier {hi + 1}:</strong> {h}
                        </div>
                      ))}
                      {(!ch.hints || ch.hints.length === 0) && (
                        <div style={{ color: '#64748b', fontSize: 11, fontFamily: 'monospace' }}>No hints configured.</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* -- SUBMISSIONS TAB -- */}
        {activeTab === 'submissions' && (
          <div className="df tactical-box" style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(220,38,38,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                // AUDIT LOG: ALL SUBMISSIONS ({submissions.length}) //
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontFamily: 'monospace', fontSize: 11 }}>
                    <th style={{ padding: '10px 14px' }}>TIMESTAMP</th>
                    <th style={{ padding: '10px 14px' }}>TEAM</th>
                    <th style={{ padding: '10px 14px' }}>OPERATIVE</th>
                    <th style={{ padding: '10px 14px' }}>MISSION TARGET</th>
                    <th style={{ padding: '10px 14px' }}>STATUS</th>
                    <th style={{ padding: '10px 14px' }}>POINTS</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s: any) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(220,38,38,0.1)' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#64748b' }}>
                        {new Date(s.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#f1f5f9' }}>
                        {s.team?.name || 'Unknown'}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#94a3b8' }}>
                        {s.user?.username || '—'}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#fee2e2' }}>
                        {s.challenge?.title || 'Challenge'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          style={{
                            padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800, fontFamily: 'monospace',
                            background: s.isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(220,38,38,0.15)',
                            color: s.isCorrect ? '#6ee7b7' : '#fca5a5',
                            border: `1px solid ${s.isCorrect ? 'rgba(16,185,129,0.4)' : 'rgba(220,38,38,0.4)'}`,
                          }}
                        >
                          {s.isCorrect ? 'CORRECT' : 'INCORRECT'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 800, color: s.isCorrect ? '#10b981' : '#64748b' }}>
                        {s.points ? `+${s.points}` : '0'} PTS
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* -- MODALS -- */}

      {/* Adjust Score Modal */}
      {showAdjustModal && selectedTeam && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ ...cardStyle, width: '100%', maxWidth: 440, position: 'relative' }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#f1f5f9', margin: '0 0 4px', textTransform: 'uppercase' }}>
              ADJUST TEAM SCORE
            </h3>
            <p style={{ color: '#ef4444', fontSize: 12, fontFamily: 'monospace', margin: '0 0 16px' }}>
              TEAM: {selectedTeam.name}
            </p>
            <form onSubmit={handleAdjustScore} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Points to Add / Subtract</label>
                <input
                  type="number"
                  style={inputStyle}
                  value={adjustPoints}
                  onChange={(e) => setAdjustPoints(parseInt(e.target.value) || 0)}
                  placeholder="e.g. 50 or -50"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Reason</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Hint refund / Penalty / Bonus"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => { setShowAdjustModal(false); setSelectedTeam(null); }}
                  style={{ padding: '8px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 5, color: '#94a3b8', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#dc2626', border: '1px solid #f87171', borderRadius: 5, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}
                >
                  CONFIRM ADJUSTMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disqualify Modal */}
      {showDisqualifyModal && selectedTeam && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ ...cardStyle, width: '100%', maxWidth: 440, position: 'relative' }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#f87171', margin: '0 0 4px', textTransform: 'uppercase' }}>
              DISQUALIFY OPERATIVE TEAM
            </h3>
            <p style={{ color: '#ef4444', fontSize: 12, fontFamily: 'monospace', margin: '0 0 16px' }}>
              TARGET: {selectedTeam.name}
            </p>
            <form onSubmit={handleDisqualifyTeam} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Reason for Disqualification</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  value={disqualifyReason}
                  onChange={(e) => setDisqualifyReason(e.target.value)}
                  placeholder="e.g. Flag sharing / Credential sharing violation"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => { setShowDisqualifyModal(false); setSelectedTeam(null); }}
                  style={{ padding: '8px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 5, color: '#94a3b8', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#991b1b', border: '1px solid #ef4444', borderRadius: 5, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace' }}
                >
                  DISQUALIFY TEAM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hint Management Quick Modal */}
      {showHintModal && selectedTeam && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ ...cardStyle, width: '100%', maxWidth: 480, position: 'relative' }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#f1f5f9', margin: '0 0 4px', textTransform: 'uppercase' }}>
              MANAGE HINTS FOR {selectedTeam.name}
            </h3>
            <p style={{ color: '#ef4444', fontSize: 12, fontFamily: 'monospace', margin: '0 0 16px' }}>
              CLEARANCE LEVEL: {selectedTeam.currentLevel} • SCORE: {selectedTeam.scores?.[0]?.totalPoints || 0} PTS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: 12, background: 'rgba(0,0,0,0.4)', borderRadius: 6, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                Choose an action below to either transmit classified intel immediately without score penalty, or refund previously incurred hint penalties.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => {
                    handleGrantHint(selectedTeam.id, selectedTeam.name, true);
                    setShowHintModal(false);
                  }}
                  style={{ padding: '10px 16px', background: 'rgba(56,189,248,0.2)', border: '1px solid #38bdf8', borderRadius: 6, color: '#7dd3fc', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', textAlign: 'left' }}
                >
                  🚀 GRANT FREE INTEL HINT (0 PTS PENALTY)
                </button>
                <button
                  onClick={() => {
                    handleResetHints(selectedTeam.id, selectedTeam.name);
                    setShowHintModal(false);
                  }}
                  style={{ padding: '10px 16px', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', borderRadius: 6, color: '#6ee7b7', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', textAlign: 'left' }}
                >
                  🔄 REFUND & RESET ALL HINTS FOR THIS TEAM
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => { setShowHintModal(false); setSelectedTeam(null); }}
                  style={{ padding: '8px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 5, color: '#94a3b8', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
