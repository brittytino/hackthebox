'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import Link from 'next/link';
import { api } from '@/lib/api';
import { 
  Users, Trophy, Flag, FileText, LogOut, Download, 
  Lock, Unlock, Shield, Activity, RefreshCw, Search, 
  CheckCircle2, XCircle, Eye, Clock, Zap, Crown, UserX, UserCheck,
  TrendingUp, BarChart2, Terminal, Radio, Settings, Map, Crosshair, Skull, ShieldAlert
} from 'lucide-react';
import HalfCircleMenu from '@/components/ui/HalfCircleMenu';

type TabType = 'overview' | 'teams' | 'rounds';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [rounds, setRounds] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoreboardFrozen, setScoreboardFrozen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Team modal states
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showDisqualifyModal, setShowDisqualifyModal] = useState(false);
  const [adjustPoints, setAdjustPoints] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [disqualifyReason, setDisqualifyReason] = useState('');
  
  // Game override states
  const [gameState, setGameState] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Creation states
  const [newRound, setNewRound] = useState({ name: '', type: 'DECODE_THE_SECRET', order: 1, description: '' });
  const [newChallenge, setNewChallenge] = useState({ roundId: '', title: '', description: '', points: 100, flag: '', order: 1, maxAttempts: 0, hints: '' });

  const loadData = useCallback(async () => {
    try {
      const [profileData, statsData, roundsData, submissionsData, teamsData, scoreboardStatus, currentGameState] = await Promise.all([
        api.getProfile(),
        api.admin.getStats(),
        api.getAllRounds(),
        api.admin.getAllSubmissions(),
        api.getAllTeams(),
        api.getScoreboardStatus().catch(() => ({ frozen: false })),
        api.game.getState().catch(() => null),
      ]);

      if (profileData.role !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }

      setUser(profileData);
      setStats(statsData);
      setRounds(roundsData);
      setSubmissions(submissionsData);
      setTeams(teamsData);
      setScoreboardFrozen(Boolean(scoreboardStatus?.frozen));
      setGameState(currentGameState);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load admin data:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router, loadData]);

  // GSAP Animation when loading finishes or tab changes
  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.df'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: 'power3.out' }
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

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createRound(newRound);
      await loadData();
      setNewRound({ name: '', type: 'DECODE_THE_SECRET', order: rounds.length + 1, description: '' });
    } catch (error: any) {
      alert(error.message || 'Failed to create round');
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChallenge.roundId) return alert('Please select a round');
    try {
      await api.admin.createChallenge({ ...newChallenge, maxAttempts: newChallenge.maxAttempts || undefined });
      await loadData();
      setNewChallenge({ roundId: '', title: '', description: '', points: 100, flag: '', order: 1, maxAttempts: 0, hints: '' });
    } catch (error: any) { alert(error.message || 'Failed to create challenge'); }
  };

  const handleUpdateRoundStatus = async (roundId: string, status: string) => {
    try {
      await api.admin.updateRoundStatus(roundId, { status });
      await loadData();
    } catch (error: any) { alert(error.message || 'Failed to update round status'); }
  };

  const handleDeleteRound = async (roundId: string, name: string) => {
    if (!confirm(`Delete round "${name}"? This also deletes all its challenges and submissions.`)) return;
    try {
      await api.admin.deleteRound(roundId);
      await loadData();
    } catch (error: any) { alert(error.message || 'Failed to delete round'); }
  };

  const handleToggleChallengeActive = async (challengeId: string, isActive: boolean) => {
    try {
      await api.admin.updateChallenge(challengeId, { isActive: !isActive });
      await loadData();
    } catch (error: any) { alert(error.message || 'Failed to update challenge'); }
  };

  const handleDeleteChallenge = async (challengeId: string, title: string) => {
    if (!confirm(`Delete challenge "${title}"? This also deletes its submissions.`)) return;
    try {
      await api.admin.deleteChallenge(challengeId);
      await loadData();
    } catch (error: any) { alert(error.message || 'Failed to delete challenge'); }
  };

  const handleAdjustScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !adjustReason) return alert('Please provide a reason');
    try {
      await api.admin.adjustTeamScore(selectedTeam.id, { points: adjustPoints, reason: adjustReason });
      await loadData();
      setShowAdjustModal(false); setSelectedTeam(null); setAdjustPoints(0); setAdjustReason('');
    } catch (error: any) { alert(error.message || 'Failed to adjust score'); }
  };

  const handleDisqualifyTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !disqualifyReason) return alert('Please provide a reason');
    try {
      await api.admin.disqualifyTeam(selectedTeam.id, { reason: disqualifyReason });
      await loadData();
      setShowDisqualifyModal(false); setSelectedTeam(null); setDisqualifyReason('');
    } catch (error: any) { alert(error.message || 'Failed to disqualify team'); }
  };

  const handleQualifyTeam = async (teamId: string) => {
    try {
      await api.admin.qualifyTeam(teamId);
      await loadData();
    } catch (error: any) { alert(error.message || 'Failed to qualify team'); }
  };

  const handleToggleFreezeScoreboard = async () => {
    try {
      await api.admin.freezeScoreboard({ freeze: !scoreboardFrozen });
      setScoreboardFrozen(!scoreboardFrozen);
    } catch (error: any) { alert(error.message || 'Failed to toggle scoreboard freeze'); }
  };

  const handleExportResults = async () => {
    try {
      const results = await api.admin.exportResults();
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `theextraction-results-${new Date().toISOString()}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (error: any) { alert(error.message || 'Failed to export results'); }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await api.admin.exportResultsCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `theextraction-results-${new Date().toISOString()}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (error: any) { alert(error.message || 'Failed to export CSV'); }
  };

  const handleEndGame = async () => {
    if (!confirm('🚨 CRITICAL ACTION: Are you sure you want to END THE GAME FOR ALL OPERATIVES?\n\nThis will broadcast the conclusion to all connected teams, determine the winner from current scores, and trigger the Marvel post-credits ending screen on all client devices.')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.admin.endGame();
      alert(`✅ ${res.message || 'Game ended successfully!'}\nWinner: ${res.winner || 'Current Leader'}`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to end game');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeGame = async () => {
    if (!confirm('Reopen live missions and resume the competition?')) return;
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

  const handleActivateAllRounds = async () => {
    if (!confirm('Ensure all rounds (Round 1, Round 2, Round 3) are active in database so teams face no artificial roadblocks?')) return;
    setActionLoading(true);
    try {
      const res = await api.admin.activateAllRounds();
      alert(res.message || 'All rounds activated.');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to activate all rounds');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const filteredTeams = teams.filter(team => team.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (b.scores?.[0]?.totalPoints || 0) - (a.scores?.[0]?.totalPoints || 0));

  const activeTeams = teams.filter(t => t.members?.length > 0).length;
  const disqualifiedTeams = teams.filter(t => t.disqualified).length;
  const lastHourSubmissions = submissions.filter(s => new Date(s.createdAt).getTime() > Date.now() - 3600000).length;
  const recentSubmissions = submissions.slice(0, 50);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexDirection: 'column' }}>
        <div style={{ width: 44, height: 44, border: '3px solid rgba(220,38,38,0.2)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: '#ef4444', letterSpacing: 3, fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>INITIALIZING ADMIN CLEARANCE...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const inputStyle = { width: '100%', padding: '10px 14px', background: 'rgba(10,4,6,0.95)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 6, color: '#fee2e2', fontSize: 14, outline: 'none', fontFamily: 'monospace' };
  const labelStyle = { display: 'block', fontSize: 11, color: '#fca5a5', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' as const, fontFamily: 'monospace' };
  const cardStyle = { background: 'linear-gradient(135deg,rgba(10,4,6,0.95),rgba(18,6,9,0.92))', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '22px' };

  return (
    <div style={{ minHeight: '100vh', background: '#050508', position: 'relative', overflowX: 'hidden', color: '#f1f5f9' }}>
      <HalfCircleMenu isAdmin={true} />
      <div className="blood-splatter-bg" />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(220,38,38,0.12) 0%, transparent 60%)' }} />

      {/* -- NAV -- */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', padding: '0 28px', height: 64, borderBottom: '1px solid rgba(220,38,38,0.3)', background: 'rgba(10,4,6,0.95)', backdropFilter: 'blur(20px)', gap: 12 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 6, background: 'linear-gradient(135deg,#7f1d1d,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(220,38,38,0.4)' }}>
            <ShieldAlert size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 900, lineHeight: 1.1, letterSpacing: '1px', textTransform: 'uppercase' }}>THE EXTRACTION</div>
            <div style={{ color: '#ef4444', fontSize: 10, lineHeight: 1, fontFamily: 'monospace', letterSpacing: '2px' }}>SYS_ADMIN COMMAND</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'overview', icon: BarChart2, label: 'Overview' },
            { id: 'teams', icon: Users, label: `Teams (${teams.length})` },
            { id: 'rounds', icon: Flag, label: 'Manage Rounds' },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                  background: isActive ? 'rgba(220,38,38,0.22)' : 'transparent',
                  border: '1px solid', borderColor: isActive ? '#ef4444' : 'rgba(220,38,38,0.2)',
                  borderRadius: 6, color: isActive ? '#fee2e2' : '#94a3b8',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                  fontFamily: 'monospace',
                }}
              >
                <tab.icon size={14} color={isActive ? '#ef4444' : 'inherit'} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div style={{ flex: 1 }} />

        {/* Live badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 6, marginRight: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'dpulse 2s infinite' }} />
          <span style={{ color: '#f87171', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>SECURE LIVE</span>
        </div>

        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 6, color: '#fca5a5', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'monospace' }}>
          <LogOut size={14} /> LOGOUT
        </button>
      </nav>

      {/* -- MAIN CONTAINER -- */}
      <div ref={containerRef} style={{ position: 'relative', zIndex: 5, maxWidth: 1320, margin: '0 auto', padding: '32px 28px 80px' }}>
        
        {/* Top Controls */}
        <div className="df" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => loadData()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6, color: '#fee2e2', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
              <RefreshCw size={13} /> Refresh
            </button>
            <button onClick={() => setAutoRefresh(!autoRefresh)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: autoRefresh ? 'rgba(220,38,38,0.2)' : 'rgba(0,0,0,0.3)', border: `1px solid ${autoRefresh ? '#ef4444' : 'rgba(220,38,38,0.2)'}`, borderRadius: 6, color: autoRefresh ? '#fee2e2' : '#94a3b8', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>
              {autoRefresh ? <Eye size={13} /> : <XCircle size={13} />} Auto-Sync: {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>Last sync: {lastRefresh.toLocaleTimeString()}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleExportResults} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6, color: '#fee2e2', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}><Download size={13} /> JSON</button>
            <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6, color: '#fee2e2', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}><Download size={13} /> CSV</button>
          </div>
        </div>

        {/* -- OVERVIEW TAB -- */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { icon: Users, label: 'TOTAL TEAMS', value: stats?.totalTeams || 0, color: '#ef4444' },
                { icon: Activity, label: 'ACTIVE STRIKE TEAMS', value: activeTeams, color: '#dc2626' },
                { icon: UserX, label: 'DISQUALIFIED', value: disqualifiedTeams, color: '#991b1b' },
                { icon: FileText, label: 'ALL SUBMISSIONS', value: stats?.totalSubmissions || 0, color: '#f87171' },
                { icon: Clock, label: 'LAST HOUR TRAFFIC', value: lastHourSubmissions, color: '#fca5a5' }
              ].map(s => (
                <div key={s.label} className="df tactical-box corner-brackets" style={{ ...cardStyle, padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div className="reticle-icon-box" style={{ width: 28, height: 28 }}>
                      <s.icon size={14} color="#ef4444" />
                    </div>
                    <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: 2, fontFamily: 'monospace' }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: '#f1f5f9', letterSpacing: '1px', fontFamily: 'var(--font-rajdhani), sans-serif' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* -- MISSION COMMAND OVERRIDE & FINALE BROADCAST -- */}
            <div
              className="df tactical-box corner-brackets"
              style={{
                ...cardStyle,
                border: gameState?.storyEnded ? '2px solid #ef4444' : '1px solid rgba(239,68,68,0.4)',
                background: gameState?.storyEnded
                  ? 'linear-gradient(135deg, rgba(30,6,12,0.95), rgba(18,4,8,0.95))'
                  : 'linear-gradient(135deg, rgba(14,4,7,0.95), rgba(20,5,10,0.95))',
                boxShadow: gameState?.storyEnded ? '0 0 40px rgba(239,68,68,0.25)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 800, letterSpacing: 3, fontFamily: 'monospace' }}>
                    // CENTRAL COMMAND OVERRIDE & POST-CREDITS FINALE //
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', letterSpacing: 1, marginTop: 4 }}>
                    TACTICAL GAME STATE CONTROLLER
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
                      borderRadius: 6, fontFamily: 'monospace', fontSize: 11, fontWeight: 800,
                      background: gameState?.storyEnded ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.15)',
                      border: `1px solid ${gameState?.storyEnded ? '#ef4444' : '#10b981'}`,
                      color: gameState?.storyEnded ? '#fca5a5' : '#6ee7b7',
                    }}
                  >
                    <div
                      style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: gameState?.storyEnded ? '#ef4444' : '#10b981',
                        boxShadow: `0 0 10px ${gameState?.storyEnded ? '#ef4444' : '#10b981'}`,
                      }}
                    />
                    {gameState?.storyEnded ? '🚨 FINALE BROADCAST ACTIVE' : '🟢 LIVE MISSIONS ACTIVE'}
                  </div>
                </div>
              </div>

              <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5, margin: '0 0 20px', maxWidth: 840 }}>
                Ending the game triggers an immediate, synchronized emergency command broadcast across all active participant screens and automatically navigates them to the cinematic Marvel-style post-credits finale. You can also re-open operations or activate all mission rounds below.
              </p>

              {/* Action Buttons Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                {/* 1. End Game for All */}
                <button
                  type="button"
                  onClick={handleEndGame}
                  disabled={actionLoading || Boolean(gameState?.storyEnded)}
                  style={{
                    padding: '14px 18px',
                    background: gameState?.storyEnded ? 'rgba(127,29,29,0.25)' : 'linear-gradient(135deg, #7f1d1d, #dc2626)',
                    border: '1.5px solid #ef4444',
                    borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 900,
                    cursor: gameState?.storyEnded ? 'not-allowed' : 'pointer',
                    fontFamily: 'monospace', letterSpacing: 1.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: gameState?.storyEnded ? 'none' : '0 0 25px rgba(220,38,38,0.4)',
                    opacity: gameState?.storyEnded ? 0.6 : 1,
                  }}
                >
                  <ShieldAlert size={16} /> END GAME FOR ALL
                </button>

                {/* 2. Activate All Rounds */}
                <button
                  type="button"
                  onClick={handleActivateAllRounds}
                  disabled={actionLoading}
                  style={{
                    padding: '14px 18px',
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.5)',
                    borderRadius: 8, color: '#6ee7b7', fontSize: 13, fontWeight: 800,
                    cursor: 'pointer', fontFamily: 'monospace', letterSpacing: 1.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <Zap size={15} color="#10b981" /> ACTIVATE ALL ROUNDS (1, 2, 3)
                </button>

                {/* 3. Resume Live Game */}
                <button
                  type="button"
                  onClick={handleResumeGame}
                  disabled={actionLoading || !Boolean(gameState?.storyEnded)}
                  style={{
                    padding: '14px 18px',
                    background: !gameState?.storyEnded ? 'rgba(0,0,0,0.3)' : 'rgba(245,158,11,0.18)',
                    border: `1px solid ${!gameState?.storyEnded ? 'rgba(255,255,255,0.1)' : 'rgba(245,158,11,0.5)'}`,
                    borderRadius: 8, color: !gameState?.storyEnded ? '#6b7280' : '#fef08a',
                    fontSize: 13, fontWeight: 800,
                    cursor: !gameState?.storyEnded ? 'not-allowed' : 'pointer',
                    fontFamily: 'monospace', letterSpacing: 1.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <RefreshCw size={14} /> RESUME LIVE GAME
                </button>

                {/* 4. Preview Marvel Credits */}
                <Link
                  href="/credits"
                  target="_blank"
                  style={{
                    padding: '14px 18px',
                    background: 'rgba(59,130,246,0.12)',
                    border: '1px solid rgba(59,130,246,0.45)',
                    borderRadius: 8, color: '#93c5fd', fontSize: 13, fontWeight: 800,
                    fontFamily: 'monospace', letterSpacing: 1.5,
                    textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <Trophy size={15} color="#60a5fa" /> PREVIEW MARVEL CREDITS
                </Link>
              </div>

              {/* Admin Credentials Reference Note */}
              <div style={{ marginTop: 18, padding: '10px 16px', background: 'rgba(0,0,0,0.4)', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                  <span style={{ color: '#ef4444', fontWeight: 800 }}>ADMIN CLEARANCE:</span> Username: <code style={{ color: '#fee2e2' }}>admin</code> | Password: <code style={{ color: '#fee2e2' }}>admin123</code> | Direct Route: <code style={{ color: '#fee2e2' }}>/admin</code>
                </div>
                <div style={{ fontSize: 11, color: '#fca5a5', fontFamily: 'monospace' }}>
                  Post-Credits URL: <Link href="/credits" target="_blank" style={{ color: '#ef4444', textDecoration: 'underline' }}>/credits</Link>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="grid-cols-1 lg:grid-cols-2">
              {/* Scoreboard Control & Active Rounds */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="df tactical-box" style={{ ...cardStyle, border: scoreboardFrozen ? '1.5px solid #ef4444' : '1px solid rgba(220,38,38,0.4)', background: scoreboardFrozen ? 'rgba(220,38,38,0.12)' : 'rgba(10,4,6,0.95)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 4, letterSpacing: 2, fontFamily: 'monospace' }}>SCOREBOARD VISIBILITY</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: scoreboardFrozen ? '#ef4444' : '#10b981', fontFamily: 'monospace' }}>{scoreboardFrozen ? 'LOCKED / FROZEN' : 'LIVE & VISIBLE'}</div>
                    </div>
                    {scoreboardFrozen ? <Lock size={30} className="text-red-500" /> : <Unlock size={30} className="text-emerald-500" />}
                  </div>
                  <button onClick={handleToggleFreezeScoreboard} style={{ width: '100%', padding: '12px', background: scoreboardFrozen ? 'linear-gradient(135deg,#7f1d1d,#dc2626)' : 'linear-gradient(135deg,#064e3b,#10b981)', borderRadius: 6, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', border: 'none', letterSpacing: 2, fontFamily: 'monospace' }}>
                    {scoreboardFrozen ? 'UNFREEZE SCOREBOARD' : 'FREEZE SCOREBOARD'}
                  </button>
                </div>

                <div className="df tactical-box" style={cardStyle}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 14, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace' }}>// LEADING SQUADS //</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filteredTeams.slice(0, 5).map((team, i) => (
                      <div key={team.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(220,38,38,0.08)', borderRadius: 6, border: '1px solid rgba(220,38,38,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 900, color: i===0 ? '#ef4444' : '#94a3b8', fontFamily: 'monospace' }}>#{i+1}</span>
                          <span style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>{team.name}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 900, color: '#ef4444', fontFamily: 'monospace' }}>{team.scores?.[0]?.totalPoints || 0} PTS</span>
                      </div>
                    ))}
                    {filteredTeams.length === 0 && <div style={{ fontSize: 13, color: '#6b7280', fontFamily: 'monospace' }}>No teams registered yet.</div>}
                  </div>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="df tactical-box" style={cardStyle}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 14, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace' }}>// LIVE MISSION LOGS //</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
                  {recentSubmissions.map((sub: any) => (
                    <div key={sub.id} style={{ padding: '10px 12px', background: 'rgba(12,4,6,0.85)', borderRadius: 6, border: '1px solid rgba(220,38,38,0.2)', borderLeft: `3px solid ${sub.correct ? '#10b981' : '#dc2626'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 700 }}>{sub.team?.name || 'OPERATIVE'}</span>
                        <span style={{ color: sub.correct ? '#10b981' : '#ef4444', fontSize: 10, fontWeight: 800, fontFamily: 'monospace' }}>{sub.correct ? 'DECRYPTED' : 'FAILED ATTEMPT'}</span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}>{sub.challenge?.title || 'Cipher Target'} • {new Date(sub.createdAt).toLocaleTimeString()}</div>
                    </div>
                  ))}
                  {recentSubmissions.length === 0 && <div style={{ fontSize: 13, color: '#6b7280', fontFamily: 'monospace' }}>No submissions recorded yet.</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -- TEAMS TAB -- */}
        {activeTab === 'teams' && (
          <div className="df tactical-box" style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                // REGISTERED TEAMS ({teams.length}) //
              </div>
              <div style={{ position: 'relative', width: 280 }}>
                <Search size={14} color="#ef4444" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 34, fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(220,38,38,0.3)', color: '#ef4444', fontFamily: 'monospace', textAlign: 'left', fontSize: 11, letterSpacing: 2 }}>
                    <th style={{ padding: '10px 14px' }}>RANK</th>
                    <th style={{ padding: '10px 14px' }}>TEAM NAME</th>
                    <th style={{ padding: '10px 14px' }}>MEMBERS</th>
                    <th style={{ padding: '10px 14px' }}>SCORE</th>
                    <th style={{ padding: '10px 14px' }}>STATUS</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((team, i) => {
                    const isDisqualified = Boolean(team.disqualified);
                    return (
                      <tr key={team.id} style={{ borderBottom: '1px solid rgba(220,38,38,0.15)', background: i % 2 === 0 ? 'rgba(220,38,38,0.03)' : 'transparent' }}>
                        <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 800, color: '#ef4444' }}>#{i+1}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f1f5f9' }}>{team.name}</td>
                        <td style={{ padding: '12px 14px', color: '#94a3b8' }}>
                          {team.members?.map((m: any) => m.name || m.username).join(', ') || 'Solo Agent'}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 900, color: '#ef4444', fontFamily: 'monospace' }}>
                          {team.scores?.[0]?.totalPoints || 0} PTS
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800, fontFamily: 'monospace', background: isDisqualified ? 'rgba(220,38,38,0.2)' : 'rgba(16,185,129,0.15)', color: isDisqualified ? '#f87171' : '#6ee7b7', border: `1px solid ${isDisqualified ? 'rgba(220,38,38,0.5)' : 'rgba(16,185,129,0.4)'}` }}>
                            {isDisqualified ? 'DISQUALIFIED' : 'ACTIVE'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => { setSelectedTeam(team); setShowAdjustModal(true); }}
                              style={{ padding: '5px 10px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 4, color: '#fee2e2', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}
                            >
                              ADJUST
                            </button>
                            {isDisqualified ? (
                              <button
                                onClick={() => handleQualifyTeam(team.id)}
                                style={{ padding: '5px 10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 4, color: '#6ee7b7', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}
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
        )}

        {/* -- ROUNDS & CHALLENGES TAB -- */}
        {activeTab === 'rounds' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Manage Existing Rounds & Challenges — this is the control that actually
                gates gameplay: a challenge is only solvable while its round's
                status here is ACTIVE. Nothing about progression is static. */}
            <div className="df tactical-box" style={cardStyle}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 14, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                // MANAGE ROUNDS & CHALLENGES //
              </div>
              {[...rounds].sort((a, b) => a.order - b.order).map(round => (
                <div key={round.id} style={{ marginBottom: 16, padding: 14, background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                    <div>
                      <span style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 14 }}>R{round.order}: {round.name}</span>
                      <span style={{ marginLeft: 10, color: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}>{round.type}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <select
                        value={round.status}
                        onChange={e => handleUpdateRoundStatus(round.id, e.target.value)}
                        style={{ ...inputStyle, width: 'auto', padding: '6px 10px', fontSize: 12 }}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="LOCKED">LOCKED</option>
                      </select>
                      <button
                        onClick={() => handleDeleteRound(round.id, round.name)}
                        style={{ padding: '6px 10px', background: 'rgba(127,29,29,0.3)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: 4, color: '#fca5a5', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}
                      >
                        DELETE ROUND
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(round.challenges || []).map((ch: any) => (
                      <div key={ch.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 6, gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ color: ch.isActive === false ? '#6b7280' : '#e2e8f0', fontSize: 12, textDecoration: ch.isActive === false ? 'line-through' : 'none' }}>
                          {round.order}.{ch.order} — {ch.title} <span style={{ color: '#ef4444', fontFamily: 'monospace' }}>({ch.points} pts)</span>
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => handleToggleChallengeActive(ch.id, ch.isActive !== false)}
                            style={{ padding: '4px 8px', background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 4, color: '#fee2e2', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}
                          >
                            {ch.isActive === false ? 'ACTIVATE' : 'DEACTIVATE'}
                          </button>
                          <button
                            onClick={() => handleDeleteChallenge(ch.id, ch.title)}
                            style={{ padding: '4px 8px', background: 'rgba(127,29,29,0.3)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: 4, color: '#fca5a5', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!round.challenges || round.challenges.length === 0) && (
                      <div style={{ color: '#6b7280', fontSize: 12, fontFamily: 'monospace' }}>No challenges in this round yet.</div>
                    )}
                  </div>
                </div>
              ))}
              {rounds.length === 0 && <div style={{ color: '#6b7280', fontSize: 13, fontFamily: 'monospace' }}>No rounds created yet.</div>}
            </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="grid-cols-1 lg:grid-cols-2">
            {/* Create Round */}
            <div className="df tactical-box" style={cardStyle}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 14, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                // CREATE SECURITY ROUND //
              </div>
              <form onSubmit={handleCreateRound} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Round Title</label>
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="e.g. Round 4 — Overlord Breach"
                    value={newRound.name}
                    onChange={e => setNewRound({ ...newRound, name: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Sequence Order</label>
                    <input
                      type="number"
                      style={inputStyle}
                      value={newRound.order}
                      onChange={e => setNewRound({ ...newRound, order: parseInt(e.target.value, 10) })}
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Round Type</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={newRound.type}
                      onChange={e => setNewRound({ ...newRound, type: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Tactical Briefing</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
                    placeholder="Sector brief..."
                    value={newRound.description}
                    onChange={e => setNewRound({ ...newRound, description: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-game-primary" style={{ marginTop: 4 }}>
                  <Flag size={14} /> CREATE ROUND
                </button>
              </form>
            </div>

            {/* Create Challenge */}
            <div className="df tactical-box" style={cardStyle}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 14, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                // DEPLOY CIPHER CHALLENGE //
              </div>
              <form onSubmit={handleCreateChallenge} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Target Round</label>
                    <select
                      style={inputStyle}
                      value={newChallenge.roundId}
                      onChange={e => setNewChallenge({ ...newChallenge, roundId: e.target.value })}
                      required
                    >
                      <option value="">Select Round</option>
                      {rounds.map(r => (
                        <option key={r.id} value={r.id}>{r.name} (R{r.order})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Points Value</label>
                    <input
                      type="number"
                      style={inputStyle}
                      value={newChallenge.points}
                      onChange={e => setNewChallenge({ ...newChallenge, points: parseInt(e.target.value, 10) })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Challenge Title</label>
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="e.g. The Quantum Cipher"
                    value={newChallenge.title}
                    onChange={e => setNewChallenge({ ...newChallenge, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Flag Solution</label>
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="CTF{exact_flag_string}"
                    value={newChallenge.flag}
                    onChange={e => setNewChallenge({ ...newChallenge, flag: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Payload Description</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
                    placeholder="Encoded payload data..."
                    value={newChallenge.description}
                    onChange={e => setNewChallenge({ ...newChallenge, description: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn-game-primary" style={{ marginTop: 4 }}>
                  <Zap size={14} /> DEPLOY TARGET
                </button>
              </form>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      {showAdjustModal && selectedTeam && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...cardStyle, maxWidth: 420, width: '90vw', border: '1.5px solid rgba(220,38,38,0.6)' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fee2e2', marginBottom: 6, fontFamily: 'monospace' }}>ADJUST SCORE: {selectedTeam.name}</div>
            <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 16 }}>Apply score penalties or bonus points with classified audit logs.</p>
            <form onSubmit={handleAdjustScore} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Points Offset (+/-)</label>
                <input type="number" style={inputStyle} value={adjustPoints} onChange={e => setAdjustPoints(parseInt(e.target.value, 10))} required />
              </div>
              <div>
                <label style={labelStyle}>Justification / Reason</label>
                <input type="text" style={inputStyle} placeholder="e.g. Hint penalty waiver" value={adjustReason} onChange={e => setAdjustReason(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowAdjustModal(false)} className="btn-game-secondary" style={{ padding: '8px 16px', fontSize: 12 }}>CANCEL</button>
                <button type="submit" className="btn-game-primary" style={{ padding: '8px 16px', fontSize: 12 }}>APPLY SCORE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disqualify Modal */}
      {showDisqualifyModal && selectedTeam && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...cardStyle, maxWidth: 420, width: '90vw', border: '1.5px solid #dc2626' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fca5a5', marginBottom: 6, fontFamily: 'monospace' }}>DISQUALIFY TEAM: {selectedTeam.name}</div>
            <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 16 }}>Disqualifying a team removes them from the competitive rankings.</p>
            <form onSubmit={handleDisqualifyTeam} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Infraction Reason</label>
                <input type="text" style={inputStyle} placeholder="e.g. Flag sharing violation" value={disqualifyReason} onChange={e => setDisqualifyReason(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowDisqualifyModal(false)} className="btn-game-secondary" style={{ padding: '8px 16px', fontSize: 12 }}>CANCEL</button>
                <button type="submit" className="btn-game-danger" style={{ padding: '8px 16px', fontSize: 12 }}>CONFIRM DISQUALIFICATION</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
