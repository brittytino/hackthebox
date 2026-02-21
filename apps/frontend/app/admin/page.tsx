'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from '@/components/ui/table';
import { api } from '@/lib/api';
import { 
  Users, Trophy, Flag, FileText, LogOut, AlertTriangle, Download, 
  Lock, Unlock, Ban, Shield, Activity, RefreshCw, Search, 
  CheckCircle, XCircle, Eye, Clock, Zap, Crown, UserX, UserCheck,
  TrendingUp, BarChart2, Terminal, Radio
} from 'lucide-react';

type TabType = 'overview' | 'teams' | 'rounds' | 'activity' | 'settings';

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
  
  // Team modal states
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showDisqualifyModal, setShowDisqualifyModal] = useState(false);
  const [adjustPoints, setAdjustPoints] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [disqualifyReason, setDisqualifyReason] = useState('');
  
  // Round creation
  const [newRound, setNewRound] = useState({
    name: '',
    type: 'DECODE_THE_SECRET',
    order: 1,
    description: '',
  });
  
  // Challenge creation
  const [newChallenge, setNewChallenge] = useState({
    roundId: '',
    title: '',
    description: '',
    points: 100,
    flag: '',
    order: 1,
    maxAttempts: 0,
    hints: '',
  });

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

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadData();
      }, 10000);
    }
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, loadData]);

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createRound(newRound);
      await loadData();
      setNewRound({ name: '', type: 'DECODE_THE_SECRET', order: 1, description: '' });
    } catch (error: any) {
      alert(error.message || 'Failed to create round');
    }
  };

  const handleUpdateRoundStatus = async (roundId: string, status: string) => {
    try {
      await api.admin.updateRoundStatus(roundId, { status });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to update round status');
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChallenge.roundId) {
      alert('Please select a round');
      return;
    }
    try {
      await api.admin.createChallenge({
        ...newChallenge,
        maxAttempts: newChallenge.maxAttempts || undefined,
      });
      await loadData();
      setNewChallenge({
        roundId: '',
        title: '',
        description: '',
        points: 100,
        flag: '',
        order: 1,
        maxAttempts: 0,
        hints: '',
      });
    } catch (error: any) {
      alert(error.message || 'Failed to create challenge');
    }
  };

  const handleResetCompetition = async () => {
    if (!confirm('⚠️ DANGER: This will DELETE ALL submissions and scores! Are you absolutely sure?')) {
      return;
    }
    if (!confirm('This action is IRREVERSIBLE. Type "RESET" in the next prompt to confirm.')) {
      return;
    }
    try {
      await api.admin.resetCompetition();
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to reset competition');
    }
  };

  const handleAdjustScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !adjustReason) {
      alert('Please provide a reason');
      return;
    }
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
    if (!selectedTeam || !disqualifyReason) {
      alert('Please provide a reason');
      return;
    }
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

  const handleQualifyTeam = async (teamId: string) => {
    try {
      await api.admin.qualifyTeam(teamId);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to qualify team');
    }
  };

  const handleToggleFreezeScoreboard = async () => {
    try {
      await api.admin.freezeScoreboard({ freeze: !scoreboardFrozen });
      setScoreboardFrozen(!scoreboardFrozen);
    } catch (error: any) {
      alert(error.message || 'Failed to toggle scoreboard freeze');
    }
  };

  const handleExportResults = async () => {
    try {
      const results = await api.admin.exportResults();
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ctf-results-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.message || 'Failed to export results');
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await api.admin.exportResultsCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ctf-results-${new Date().toISOString()}.csv`;
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

  // Filter teams based on search
  const filteredTeams = teams
    .filter(team => 
      team.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b.scores?.[0]?.totalPoints || 0) - (a.scores?.[0]?.totalPoints || 0));

  // Calculate live stats
  const activeTeams = teams.filter(t => t.members?.length > 0).length;
  const disqualifiedTeams = teams.filter(t => t.members?.some((m: any) => m.role === 'JUDGE')).length;
  const recentSubmissions = submissions.slice(0, 50);
  const lastHourSubmissions = submissions.filter(s => 
    new Date(s.createdAt).getTime() > Date.now() - 3600000
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <Terminal className="h-12 w-12 text-cyan-400 animate-pulse mx-auto mb-4" />
          <p className="text-cyan-400 font-mono">INITIALIZING COMMAND CENTER...</p>
        </div>
      </div>
    );
  }

  const tabClasses = (tab: TabType) => 
    `px-4 py-2 font-mono text-sm transition-all border-b-2 ${
      activeTab === tab 
        ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10' 
        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
    }`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header - Command Center style */}
      <header className="border-b border-cyan-900/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-cyan-400" />
            <div>
              <h1 className="text-xl font-bold font-mono text-cyan-400">COMMAND CENTER</h1>
              <p className="text-xs text-slate-500 font-mono">CTF ADMIN CONTROL PANEL</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Live Status */}
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-emerald-500/20 border border-emerald-500/30">
              <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400">LIVE</span>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-slate-500 font-mono">OPERATOR</p>
              <p className="text-sm font-mono text-cyan-400">{user?.username}</p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="border-red-600 text-red-400 hover:bg-red-600/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              LOGOUT
            </Button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 flex gap-0 border-t border-slate-800">
          <button onClick={() => setActiveTab('overview')} className={tabClasses('overview')}>
            <BarChart2 className="h-4 w-4 inline mr-2" />OVERVIEW
          </button>
          <button onClick={() => setActiveTab('teams')} className={tabClasses('teams')}>
            <Users className="h-4 w-4 inline mr-2" />TEAMS ({teams.length})
          </button>
          <button onClick={() => setActiveTab('rounds')} className={tabClasses('rounds')}>
            <Flag className="h-4 w-4 inline mr-2" />ROUNDS
          </button>
          <button onClick={() => setActiveTab('activity')} className={tabClasses('activity')}>
            <Activity className="h-4 w-4 inline mr-2" />ACTIVITY
          </button>
          <button onClick={() => setActiveTab('settings')} className={tabClasses('settings')}>
            <AlertTriangle className="h-4 w-4 inline mr-2" />SETTINGS
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Auto-refresh controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData()}
              className="border-slate-700 hover:border-cyan-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              REFRESH
            </Button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded ${
                autoRefresh 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {autoRefresh ? <Eye className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              AUTO-REFRESH {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <span className="text-xs text-slate-500 font-mono">
              Last update: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportResults}
              className="border-slate-700 hover:border-cyan-500"
            >
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="border-slate-700 hover:border-cyan-500"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-mono">TEAMS</p>
                      <p className="text-2xl font-bold text-cyan-400">{stats?.totalTeams || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-slate-700" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-mono">ACTIVE</p>
                      <p className="text-2xl font-bold text-emerald-400">{activeTeams}</p>
                    </div>
                    <Activity className="h-8 w-8 text-slate-700" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-mono">DISQUALIFIED</p>
                      <p className="text-2xl font-bold text-red-400">{disqualifiedTeams}</p>
                    </div>
                    <Ban className="h-8 w-8 text-slate-700" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-mono">SUBMISSIONS</p>
                      <p className="text-2xl font-bold text-purple-400">{stats?.totalSubmissions || 0}</p>
                    </div>
                    <FileText className="h-8 w-8 text-slate-700" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-mono">SUCCESS RATE</p>
                      <p className="text-2xl font-bold text-amber-400">{stats?.successRate?.toFixed(1) || 0}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-slate-700" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-mono">LAST HOUR</p>
                      <p className="text-2xl font-bold text-orange-400">{lastHourSubmissions}</p>
                    </div>
                    <Clock className="h-8 w-8 text-slate-700" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scoreboard Control + Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={`border-2 ${scoreboardFrozen ? 'border-red-500 bg-red-950/20' : 'border-emerald-500 bg-emerald-950/20'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-mono text-slate-400">SCOREBOARD STATUS</p>
                      <p className={`text-xl font-bold ${scoreboardFrozen ? 'text-red-400' : 'text-emerald-400'}`}>
                        {scoreboardFrozen ? 'FROZEN' : 'LIVE'}
                      </p>
                    </div>
                    {scoreboardFrozen ? <Lock className="h-8 w-8 text-red-400" /> : <Unlock className="h-8 w-8 text-emerald-400" />}
                  </div>
                  <Button 
                    onClick={handleToggleFreezeScoreboard}
                    className={`w-full ${scoreboardFrozen ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {scoreboardFrozen ? 'UNFREEZE' : 'FREEZE'} SCOREBOARD
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                  <p className="text-sm font-mono text-slate-400 mb-2">ACTIVE ROUNDS</p>
                  <div className="space-y-2">
                    {rounds.filter(r => r.status === 'ACTIVE').map(round => (
                      <div key={round.id} className="flex items-center justify-between text-sm">
                        <span className="text-cyan-400">{round.name}</span>
                        <span className="text-emerald-400 text-xs font-mono px-2 py-0.5 bg-emerald-500/20 rounded">
                          ACTIVE
                        </span>
                      </div>
                    ))}
                    {rounds.filter(r => r.status === 'ACTIVE').length === 0 && (
                      <p className="text-slate-500 text-sm">No active rounds</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                  <p className="text-sm font-mono text-slate-400 mb-2">TOP 3 TEAMS</p>
                  <div className="space-y-2">
                    {filteredTeams.slice(0, 3).map((team, i) => (
                      <div key={team.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {i === 0 && <Crown className="h-4 w-4 text-amber-400" />}
                          {i === 1 && <Crown className="h-4 w-4 text-slate-400" />}
                          {i === 2 && <Crown className="h-4 w-4 text-orange-700" />}
                          <span className="text-slate-200">{team.name}</span>
                        </div>
                        <span className="text-cyan-400 font-mono">{team.scores?.[0]?.totalPoints || 0}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Activity Feed */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono text-slate-400 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  LIVE ACTIVITY FEED
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {recentSubmissions.slice(0, 10).map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-800 last:border-0">
                      <div className="flex items-center gap-3">
                        {sub.isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="text-slate-400">{sub.team?.name || sub.user.username}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-cyan-400">{sub.challenge.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {sub.isCorrect && <span className="text-emerald-400 font-mono">+{sub.points}</span>}
                        <span className="text-xs text-slate-500">{new Date(sub.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TEAMS TAB */}
        {activeTab === 'teams' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-700 text-slate-100"
                />
              </div>
              <span className="text-sm text-slate-500 font-mono">
                {filteredTeams.length} teams
              </span>
            </div>

            {/* Teams Table */}
            <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-cyan-400 font-mono">#</TableHead>
                      <TableHead className="text-cyan-400 font-mono">TEAM</TableHead>
                      <TableHead className="text-cyan-400 font-mono">MEMBERS</TableHead>
                      <TableHead className="text-cyan-400 font-mono text-right">POINTS</TableHead>
                      <TableHead className="text-cyan-400 font-mono text-right">SOLVES</TableHead>
                      <TableHead className="text-cyan-400 font-mono">STATUS</TableHead>
                      <TableHead className="text-cyan-400 font-mono text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeams.map((team, index) => {
                      const isDisqualified = team.members?.some((m: any) => m.role === 'JUDGE');
                      return (
                        <TableRow key={team.id} className="border-slate-800">
                          <TableCell className="font-mono text-slate-400">{index + 1}</TableCell>
                          <TableCell className="font-semibold text-slate-100">{team.name}</TableCell>
                          <TableCell className="text-slate-400">{team.members?.length || 0}</TableCell>
                          <TableCell className="text-right font-mono text-cyan-400">
                            {team.scores?.[0]?.totalPoints || 0}
                          </TableCell>
                          <TableCell className="text-right text-slate-400">
                            {team.scores?.[0]?.challengesSolved || 0}
                          </TableCell>
                          <TableCell>
                            {isDisqualified ? (
                              <span className="px-2 py-1 text-xs font-mono bg-red-500/20 text-red-400 rounded">
                                DISQUALIFIED
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-mono bg-emerald-500/20 text-emerald-400 rounded">
                                ACTIVE
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-amber-600 text-amber-400 hover:bg-amber-600/20"
                                onClick={() => {
                                  setSelectedTeam(team);
                                  setShowAdjustModal(true);
                                }}
                              >
                                ± PTS
                              </Button>
                              {isDisqualified ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-emerald-600 text-emerald-400 hover:bg-emerald-600/20"
                                  onClick={() => handleQualifyTeam(team.id)}
                                >
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  QUALIFY
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-red-600 text-red-400 hover:bg-red-600/20"
                                  onClick={() => {
                                    setSelectedTeam(team);
                                    setShowDisqualifyModal(true);
                                  }}
                                >
                                  <UserX className="h-3 w-3 mr-1" />
                                  DQ
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}

        {/* ROUNDS TAB */}
        {activeTab === 'rounds' && (
          <div className="space-y-6">
            {/* Rounds Management */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-mono text-slate-400">MANAGE ROUNDS</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-cyan-400 font-mono">NAME</TableHead>
                      <TableHead className="text-cyan-400 font-mono">TYPE</TableHead>
                      <TableHead className="text-cyan-400 font-mono">ORDER</TableHead>
                      <TableHead className="text-cyan-400 font-mono">STATUS</TableHead>
                      <TableHead className="text-cyan-400 font-mono">CHALLENGES</TableHead>
                      <TableHead className="text-cyan-400 font-mono text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rounds.map((round) => (
                      <TableRow key={round.id} className="border-slate-800">
                        <TableCell className="font-semibold text-slate-100">{round.name}</TableCell>
                        <TableCell className="text-slate-400 text-sm">{round.type}</TableCell>
                        <TableCell className="font-mono text-slate-400">{round.order}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs font-mono rounded ${
                            round.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                            round.status === 'COMPLETED' ? 'bg-slate-500/20 text-slate-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {round.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-400">{round.challenges?.length || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-7 text-xs border-emerald-600 text-emerald-400 hover:bg-emerald-600/20"
                              onClick={() => handleUpdateRoundStatus(round.id, 'ACTIVE')}
                            >
                              ACTIVATE
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-7 text-xs border-slate-600 text-slate-400 hover:bg-slate-600/20"
                              onClick={() => handleUpdateRoundStatus(round.id, 'COMPLETED')}
                            >
                              COMPLETE
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Create Round */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-mono text-slate-400">CREATE ROUND</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateRound} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-slate-400 text-xs">NAME</Label>
                    <Input
                      value={newRound.name}
                      onChange={(e) => setNewRound({ ...newRound, name: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs">TYPE</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                      value={newRound.type}
                      onChange={(e) => setNewRound({ ...newRound, type: e.target.value })}
                    >
                      <option value="DECODE_THE_SECRET">Decode the Secret</option>
                      <option value="FIND_AND_CRACK">Find & Crack</option>
                      <option value="CATCH_THE_FLAG">Catch the Flag</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs">ORDER</Label>
                    <Input
                      type="number"
                      value={newRound.order}
                      onChange={(e) => setNewRound({ ...newRound, order: parseInt(e.target.value) })}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700">
                      CREATE ROUND
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Create Challenge */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-mono text-slate-400">CREATE CHALLENGE</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateChallenge} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-400 text-xs">ROUND</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                        value={newChallenge.roundId}
                        onChange={(e) => setNewChallenge({ ...newChallenge, roundId: e.target.value })}
                        required
                      >
                        <option value="">Select a round</option>
                        {rounds.map((round) => (
                          <option key={round.id} value={round.id}>{round.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">TITLE</Label>
                      <Input
                        value={newChallenge.title}
                        onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">POINTS</Label>
                      <Input
                        type="number"
                        value={newChallenge.points}
                        onChange={(e) => setNewChallenge({ ...newChallenge, points: parseInt(e.target.value) })}
                        className="bg-slate-800 border-slate-700 text-slate-100"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs">DESCRIPTION</Label>
                    <Input
                      value={newChallenge.description}
                      onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-400 text-xs">FLAG (will be hashed)</Label>
                      <Input
                        type="password"
                        value={newChallenge.flag}
                        onChange={(e) => setNewChallenge({ ...newChallenge, flag: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">ORDER</Label>
                      <Input
                        type="number"
                        value={newChallenge.order}
                        onChange={(e) => setNewChallenge({ ...newChallenge, order: parseInt(e.target.value) })}
                        className="bg-slate-800 border-slate-700 text-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">MAX ATTEMPTS (0 = unlimited)</Label>
                      <Input
                        type="number"
                        value={newChallenge.maxAttempts}
                        onChange={(e) => setNewChallenge({ ...newChallenge, maxAttempts: parseInt(e.target.value) })}
                        className="bg-slate-800 border-slate-700 text-slate-100"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                    CREATE CHALLENGE
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-mono text-slate-400 flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                ALL SUBMISSIONS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-cyan-400 font-mono">TIME</TableHead>
                    <TableHead className="text-cyan-400 font-mono">USER</TableHead>
                    <TableHead className="text-cyan-400 font-mono">TEAM</TableHead>
                    <TableHead className="text-cyan-400 font-mono">CHALLENGE</TableHead>
                    <TableHead className="text-cyan-400 font-mono">STATUS</TableHead>
                    <TableHead className="text-cyan-400 font-mono text-right">POINTS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.slice(0, 100).map((sub) => (
                    <TableRow key={sub.id} className="border-slate-800">
                      <TableCell className="text-sm text-slate-400">
                        {new Date(sub.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-slate-100">{sub.user.username}</TableCell>
                      <TableCell className="text-slate-400">{sub.team?.name || 'No Team'}</TableCell>
                      <TableCell className="text-cyan-400">{sub.challenge.title}</TableCell>
                      <TableCell>
                        {sub.isCorrect ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle className="h-4 w-4" />
                            CORRECT
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400">
                            <XCircle className="h-4 w-4" />
                            INCORRECT
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-cyan-400">{sub.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card className="bg-red-950/30 border-red-900">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2 font-mono">
                  <AlertTriangle className="h-5 w-5" />
                  DANGER ZONE
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-400">
                  These actions are <strong className="text-red-400">IRREVERSIBLE</strong>. Proceed with extreme caution.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={handleResetCompetition}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  RESET ENTIRE COMPETITION
                </Button>
                <p className="text-xs text-slate-500">
                  This will delete all submissions and reset all scores. Rounds and challenges will remain.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Adjust Score Modal */}
      {showAdjustModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <Card className="w-full max-w-md bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-cyan-400 font-mono">ADJUST SCORE</CardTitle>
              <p className="text-slate-400 text-sm">Team: {selectedTeam.name}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdjustScore} className="space-y-4">
                <div>
                  <Label className="text-slate-400 text-xs">POINTS (negative to deduct)</Label>
                  <Input
                    type="number"
                    value={adjustPoints}
                    onChange={(e) => setAdjustPoints(parseInt(e.target.value))}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                    placeholder="e.g., 100 or -50"
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-400 text-xs">REASON</Label>
                  <Textarea
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-slate-100 resize-none"
                    placeholder="e.g., Bonus for creativity"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                    APPLY
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 border-slate-600"
                    onClick={() => {
                      setShowAdjustModal(false);
                      setSelectedTeam(null);
                      setAdjustPoints(0);
                      setAdjustReason('');
                    }}
                  >
                    CANCEL
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Disqualify Modal */}
      {showDisqualifyModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <Card className="w-full max-w-md bg-slate-900 border-red-900">
            <CardHeader>
              <CardTitle className="text-red-400 font-mono flex items-center gap-2">
                <Ban className="h-5 w-5" />
                DISQUALIFY TEAM
              </CardTitle>
              <p className="text-slate-400 text-sm">Team: {selectedTeam.name}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDisqualifyTeam} className="space-y-4">
                <p className="text-sm text-red-400/80">
                  This will set the team's score to 0 and mark all members as JUDGE (disqualified).
                </p>
                <div>
                  <Label className="text-slate-400 text-xs">REASON FOR DISQUALIFICATION</Label>
                  <Textarea
                    value={disqualifyReason}
                    onChange={(e) => setDisqualifyReason(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-slate-100 resize-none"
                    placeholder="e.g., Code of conduct violation"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
                    DISQUALIFY
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 border-slate-600"
                    onClick={() => {
                      setShowDisqualifyModal(false);
                      setSelectedTeam(null);
                      setDisqualifyReason('');
                    }}
                  >
                    CANCEL
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


