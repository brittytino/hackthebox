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
  TrendingUp, BarChart2, Terminal, Radio, Settings, Map
} from 'lucide-react';

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
  
  // Creation states
  const [newRound, setNewRound] = useState({ name: '', type: 'DECODE_THE_SECRET', order: 1, description: '' });
  const [newChallenge, setNewChallenge] = useState({ roundId: '', title: '', description: '', points: 100, flag: '', order: 1, maxAttempts: 0, hints: '' });

  const loadData = useCallback(async () => {
    try {
      const [profileData, statsData, roundsData, submissionsData, teamsData] = await Promise.all([
        api.getProfile(),
        api.admin.getStats(),
        api.getAllRounds(),
        api.admin.getAllSubmissions(),
        api.getAllTeams(),
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
      setNewRound({ name: '', type: 'DECODE_THE_SECRET', order: 1, description: '' });
    } catch (error: any) { alert(error.message || 'Failed to create round'); }
  };

  const handleUpdateRoundStatus = async (roundId: string, status: string) => {
    try {
      await api.admin.updateRoundStatus(roundId, { status });
      await loadData();
    } catch (error: any) { alert(error.message || 'Failed to update round status'); }
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
      const a = document.createElement('a'); a.href = url; a.download = `ctf-results-${new Date().toISOString()}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (error: any) { alert(error.message || 'Failed to export results'); }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await api.admin.exportResultsCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `ctf-results-${new Date().toISOString()}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (error: any) { alert(error.message || 'Failed to export CSV'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const filteredTeams = teams.filter(team => team.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (b.scores?.[0]?.totalPoints || 0) - (a.scores?.[0]?.totalPoints || 0));

  const activeTeams = teams.filter(t => t.members?.length > 0).length;
  const disqualifiedTeams = teams.filter(t => t.members?.some((m: any) => m.role === 'JUDGE')).length;
  const lastHourSubmissions = submissions.filter(s => new Date(s.createdAt).getTime() > Date.now() - 3600000).length;
  const recentSubmissions = submissions.slice(0, 50);

  const F = "'Inter','Segoe UI',system-ui,-apple-system,sans-serif";

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: F, flexDirection: 'column' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(9,205,114,0.2)', borderTopColor: '#09cd72', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: '#09cd72', letterSpacing: 2, fontSize: 14, fontWeight: 600 }}>Loading Admin Data...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Common styles
  const inputStyle = { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e6edf3', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' };
  const labelStyle = { display: 'block', fontSize: 12, color: '#6e7681', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' as const };
  const cardStyle = { background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '24px' };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', fontFamily: F, position: 'relative', overflowX: 'hidden', color: '#e6edf3' }}>
      {/* Subtle radial glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(14,165,233,0.07) 0%, transparent 60%)' }} />

      {/* -- NAV -- */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', padding: '0 32px', height: 64, borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(13,17,23,0.96)', backdropFilter: 'blur(20px)', gap: 8 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0ea5e9,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(14,165,233,0.3)' }}>
            <Shield size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ color: '#e6edf3', fontSize: 16, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.3px' }}>The Extraction</div>
            <div style={{ color: '#6e7681', fontSize: 11, lineHeight: 1 }}>Admin Control</div>
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
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                  background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                  border: '1px solid', borderColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  borderRadius: 8, color: isActive ? '#e6edf3' : '#6e7681',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <tab.icon size={15} color={isActive ? '#0ea5e9' : 'inherit'} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div style={{ flex: 1 }} />

        {/* Live badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(9,205,114,0.08)', border: '1px solid rgba(9,205,114,0.2)', borderRadius: 8, marginRight: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#09cd72', boxShadow: '0 0 8px #09cd72', animation: 'dpulse 2s infinite' }} />
          <span style={{ color: '#09cd72', fontSize: 13, fontWeight: 600 }}>Live Data</span>
        </div>

        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: 'rgba(248,81,73,0.07)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 8, color: '#f85149', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
          <LogOut size={15} /> Logout
        </button>
      </nav>

      {/* -- MAIN -- */}
      <div ref={containerRef} style={{ position: 'relative', zIndex: 5, maxWidth: 1280, margin: '0 auto', padding: '32px 32px 80px' }}>
        
        {/* Top Controls */}
        <div className="df" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => loadData()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#c9d1d9', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={() => setAutoRefresh(!autoRefresh)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: autoRefresh ? 'rgba(9,205,114,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${autoRefresh ? 'rgba(9,205,114,0.25)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, color: autoRefresh ? '#09cd72' : '#c9d1d9', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {autoRefresh ? <Eye size={14} /> : <XCircle size={14} />} Auto-Refresh: {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <span style={{ fontSize: 12, color: '#6e7681' }}>Last sync: {lastRefresh.toLocaleTimeString()}</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleExportResults} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#c9d1d9', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}><Download size={14} /> JSON</button>
            <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#c9d1d9', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}><Download size={14} /> CSV</button>
          </div>
        </div>

        {/* -- OVERVIEW TAB -- */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
              {[
                { icon: Users, label: 'Total Teams', value: stats?.totalTeams || 0, color: '#0ea5e9' },
                { icon: Activity, label: 'Active Teams', value: activeTeams, color: '#09cd72' },
                { icon: UserX, label: 'Disqualified', value: disqualifiedTeams, color: '#f85149' },
                { icon: FileText, label: 'Submissions', value: stats?.totalSubmissions || 0, color: '#a78bfa' },
                { icon: Clock, label: 'Last Hour Subs', value: lastHourSubmissions, color: '#f59e0b' }
              ].map(s => (
                <div key={s.label} className="df" style={{ ...cardStyle, padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <s.icon size={16} color={s.color} />
                    </div>
                    <span style={{ fontSize: 13, color: '#6e7681', fontWeight: 600 }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#e6edf3', letterSpacing: '-0.5px' }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Scoreboard Control & Active Rounds */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="df" style={{ ...cardStyle, border: scoreboardFrozen ? '1px solid rgba(248,81,73,0.3)' : '1px solid rgba(9,205,114,0.3)', background: scoreboardFrozen ? 'rgba(248,81,73,0.05)' : 'rgba(9,205,114,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#6e7681', fontWeight: 600, marginBottom: 4 }}>SCOREBOARD STATUS</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: scoreboardFrozen ? '#f85149' : '#09cd72' }}>{scoreboardFrozen ? 'FROZEN' : 'LIVE'}</div>
                    </div>
                    {scoreboardFrozen ? <Lock size={32} color="#f85149" /> : <Unlock size={32} color="#09cd72" />}
                  </div>
                  <button onClick={handleToggleFreezeScoreboard} style={{ width: '100%', padding: '12px', background: scoreboardFrozen ? '#f85149' : '#09cd72', borderRadius: 8, color: '#0d1117', fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'opacity 0.2s' }}>
                    {scoreboardFrozen ? 'UNFREEZE SCOREBOARD' : 'FREEZE SCOREBOARD'}
                  </button>
                </div>

                <div className="df" style={cardStyle}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>Top 5 Teams</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filteredTeams.slice(0, 5).map((team, i) => (
                      <div key={team.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: i===0 ? '#f59e0b' : i===1 ? '#c9d1d9' : i===2 ? '#b45309' : '#6e7681' }}>#{i+1}</span>
                          <span style={{ fontSize: 14, color: '#e6edf3', fontWeight: 500 }}>{team.name}</span>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#0ea5e9' }}>{team.scores?.[0]?.totalPoints || 0} pts</span>
                      </div>
                    ))}
                    {filteredTeams.length === 0 && <div style={{ fontSize: 13, color: '#6e7681' }}>No teams found.</div>}
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="df" style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Zap size={16} color="#f59e0b" />
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3' }}>Live Activity Feed</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', maxHeight: 420, display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 8 }}>
                  {recentSubmissions.length === 0 ? <div style={{ fontSize: 13, color: '#6e7681' }}>No submissions yet.</div> : null}
                  {recentSubmissions.map(sub => (
                    <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${sub.isCorrect ? '#09cd72' : '#f85149'}`, borderRadius: '0 8px 8px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {sub.isCorrect ? <CheckCircle2 size={16} color="#09cd72" /> : <XCircle size={16} color="#f85149" />}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{sub.team?.name || sub.user.username}</div>
                          <div style={{ fontSize: 12, color: '#6e7681', marginTop: 2 }}>{sub.challenge.title}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {sub.isCorrect && <div style={{ fontSize: 13, fontWeight: 700, color: '#09cd72' }}>+{sub.points}</div>}
                        <div style={{ fontSize: 11, color: '#6e7681' }}>{new Date(sub.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -- TEAMS TAB -- */}
        {activeTab === 'teams' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="df" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                <Search size={16} color="#6e7681" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 38 }}
                />
              </div>
            </div>

            <div className="df" style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Rank', 'Team Name', 'Members', 'Points', 'Solves', 'Status', 'Actions'].map((h, i) => (
                      <th key={h} style={{ padding: '14px 20px', fontSize: 12, color: '#6e7681', fontWeight: 600, textTransform: 'uppercase', textAlign: i >= 3 && i < 5 ? 'right' : i === 6 ? 'right' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((team, index) => {
                    const isDisqualified = team.members?.some((m: any) => m.role === 'JUDGE');
                    return (
                      <tr key={team.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700, color: '#6e7681' }}>#{index + 1}</td>
                        <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#e6edf3' }}>{team.name}</td>
                        <td style={{ padding: '14px 20px', fontSize: 14, color: '#c9d1d9' }}>{team.members?.length || 0}</td>
                        <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700, color: '#0ea5e9', textAlign: 'right' }}>{team.scores?.[0]?.totalPoints || 0}</td>
                        <td style={{ padding: '14px 20px', fontSize: 14, color: '#c9d1d9', textAlign: 'right' }}>{team.scores?.[0]?.challengesSolved || 0}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ display: 'inline-block', padding: '4px 10px', background: isDisqualified ? 'rgba(248,81,73,0.1)' : 'rgba(9,205,114,0.1)', color: isDisqualified ? '#f85149' : '#09cd72', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
                            {isDisqualified ? 'DISQUALIFIED' : 'ACTIVE'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                            <button onClick={() => { setSelectedTeam(team); setShowAdjustModal(true); }} style={{ padding: '6px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, color: '#f59e0b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                              ± Points
                            </button>
                            {isDisqualified ? (
                              <button onClick={() => handleQualifyTeam(team.id)} style={{ padding: '6px 12px', background: 'rgba(9,205,114,0.1)', border: '1px solid rgba(9,205,114,0.2)', borderRadius: 6, color: '#09cd72', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <UserCheck size={14} /> Qualify
                              </button>
                            ) : (
                              <button onClick={() => { setSelectedTeam(team); setShowDisqualifyModal(true); }} style={{ padding: '6px 12px', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 6, color: '#f85149', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <UserX size={14} /> DQ
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

        {/* -- ROUNDS TAB -- */}
        {activeTab === 'rounds' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            <div className="df" style={cardStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3', marginBottom: 20 }}>Existing Rounds</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {rounds.map(round => (
                  <div key={round.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>{round.name}</div>
                        <div style={{ fontSize: 12, color: '#6e7681' }}>Type: {round.type} | Order: {round.order}</div>
                      </div>
                      <span style={{ display: 'inline-block', padding: '4px 8px', background: round.status === 'ACTIVE' ? 'rgba(9,205,114,0.1)' : 'rgba(255,255,255,0.05)', color: round.status === 'ACTIVE' ? '#09cd72' : '#6e7681', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                        {round.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                      <button onClick={() => handleUpdateRoundStatus(round.id, 'ACTIVE')} style={{ flex: 1, padding: '8px', background: 'rgba(9,205,114,0.1)', border: '1px solid rgba(9,205,114,0.2)', borderRadius: 6, color: '#09cd72', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Activate</button>
                      <button onClick={() => handleUpdateRoundStatus(round.id, 'COMPLETED')} style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#c9d1d9', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Complete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Create Round */}
              <div className="df" style={cardStyle}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3', marginBottom: 20 }}>Create New Round</div>
                <form onSubmit={handleCreateRound} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div><label style={labelStyle}>Name</label><input type="text" value={newRound.name} onChange={e => setNewRound({...newRound, name: e.target.value})} style={inputStyle} required /></div>
                  <div>
                    <label style={labelStyle}>Type</label>
                    <select value={newRound.type} onChange={e => setNewRound({...newRound, type: e.target.value})} style={inputStyle}>
                      <option value="DECODE_THE_SECRET">Decode the Secret</option>
                      <option value="FIND_AND_CRACK">Find & Crack</option>
                      <option value="CATCH_THE_FLAG">Catch the Flag</option>
                    </select>
                  </div>
                  <div><label style={labelStyle}>Order</label><input type="number" value={newRound.order} onChange={e => setNewRound({...newRound, order: parseInt(e.target.value)})} style={inputStyle} required /></div>
                  <button type="submit" style={{ padding: '12px', background: 'linear-gradient(135deg,#0ea5e9,#a78bfa)', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8 }}>Create Round</button>
                </form>
              </div>

              {/* Create Challenge */}
              <div className="df" style={cardStyle}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e6edf3', marginBottom: 20 }}>Create New Challenge</div>
                <form onSubmit={handleCreateChallenge} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Round</label>
                      <select value={newChallenge.roundId} onChange={e => setNewChallenge({...newChallenge, roundId: e.target.value})} style={inputStyle} required>
                        <option value="">Select Round...</option>
                        {rounds.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                    <div><label style={labelStyle}>Title</label><input type="text" value={newChallenge.title} onChange={e => setNewChallenge({...newChallenge, title: e.target.value})} style={inputStyle} required /></div>
                  </div>
                  <div><label style={labelStyle}>Description</label><input type="text" value={newChallenge.description} onChange={e => setNewChallenge({...newChallenge, description: e.target.value})} style={inputStyle} required /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div><label style={labelStyle}>Flag</label><input type="password" value={newChallenge.flag} onChange={e => setNewChallenge({...newChallenge, flag: e.target.value})} style={inputStyle} required /></div>
                    <div><label style={labelStyle}>Points</label><input type="number" value={newChallenge.points} onChange={e => setNewChallenge({...newChallenge, points: parseInt(e.target.value)})} style={inputStyle} required /></div>
                  </div>
                  <button type="submit" style={{ padding: '12px', background: 'linear-gradient(135deg,#09cd72,#0ea5e9)', borderRadius: 8, color: '#0d1117', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8 }}>Create Challenge</button>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      {showAdjustModal && selectedTeam && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div style={{ width: 400, ...cardStyle }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>Adjust Score</div>
            <div style={{ fontSize: 13, color: '#6e7681', marginBottom: 20 }}>Team: {selectedTeam.name}</div>
            <form onSubmit={handleAdjustScore} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><label style={labelStyle}>Points (Negative to deduct)</label><input type="number" value={adjustPoints} onChange={e => setAdjustPoints(parseInt(e.target.value))} style={inputStyle} required /></div>
              <div><label style={labelStyle}>Reason</label><input type="text" value={adjustReason} onChange={e => setAdjustReason(e.target.value)} style={inputStyle} required /></div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#0ea5e9', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Apply</button>
                <button type="button" onClick={() => setShowAdjustModal(false)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, color: '#c9d1d9', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDisqualifyModal && selectedTeam && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div style={{ width: 400, ...cardStyle, border: '1px solid rgba(248,81,73,0.3)' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f85149', marginBottom: 4 }}>Disqualify Team</div>
            <div style={{ fontSize: 13, color: '#6e7681', marginBottom: 16 }}>Team: {selectedTeam.name}</div>
            <p style={{ fontSize: 13, color: '#f85149', marginBottom: 20 }}>This sets the team's score to 0 and blocks them from playing.</p>
            <form onSubmit={handleDisqualifyTeam} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><label style={labelStyle}>Reason</label><input type="text" value={disqualifyReason} onChange={e => setDisqualifyReason(e.target.value)} style={inputStyle} required /></div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#f85149', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Disqualify</button>
                <button type="button" onClick={() => setShowDisqualifyModal(false)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, color: '#c9d1d9', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dpulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        .df { opacity: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
