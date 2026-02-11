'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Trophy, Medal, Award, LogOut, ArrowLeft, Crown, Star, Zap, Users, Target } from 'lucide-react';

export default function ScoreboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [scoreboard, setScoreboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
    
    // SSE for real-time updates
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/scoreboard/live`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setScoreboard(data);
      } catch (error) {
        console.error('Failed to parse SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [router]);

  const loadData = async () => {
    try {
      const [profileData, scoreboardData] = await Promise.all([
        api.getProfile(),
        api.getScoreboard(),
      ]);

      setUser(profileData);
      setScoreboard(scoreboardData);
    } catch (error) {
      console.error('Failed to load scoreboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-300" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-orange-600 text-white';
    return 'bg-slate-800/50 text-gray-300 border-2 border-slate-600/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-purple-300 text-lg font-semibold">Loading Rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-purple-500/20 rounded-full animate-pulse"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 2 + 2 + 's',
            }}
          />
        ))}
      </div>

      {/* Header - Game UI Style */}
      <header className="relative z-10 border-b-2 border-purple-500/30 bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 hover:text-purple-200 rounded-lg border border-slate-600/30 hover:border-purple-500/30 transition-all">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-semibold text-sm">Back</span>
                </button>
              </Link>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/50">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  Agent Rankings
                </h1>
                <p className="text-xs text-purple-300 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live Updates
                </p>
              </div>
            </div>
            
            <nav className="flex items-center gap-3">
              <Link href="/dashboard">
                <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 hover:text-white rounded-lg border border-slate-600/30 transition-all font-semibold text-sm">
                  Dashboard
                </button>
              </Link>
              <Link href="/challenges">
                <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 hover:text-white rounded-lg border border-slate-600/30 transition-all font-semibold text-sm">
                  Challenges
                </button>
              </Link>
              {user?.role === 'ADMIN' && (
                <Link href="/admin">
                  <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-500/30 transition-all font-semibold text-sm">
                    Admin
                  </button>
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 hover:text-red-400 rounded-lg border border-slate-600/30 hover:border-red-500/30 transition-all font-semibold text-sm flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Exit
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 relative z-10">
        {/* Top 3 Podium - Game Style */}
        {scoreboard.length > 0 && (
          <div className="mb-12">
            <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* 2nd Place */}
              {scoreboard[1] && (
                <div className="relative mt-12">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl blur opacity-50" />
                  <div className="relative bg-slate-900/90 backdrop-blur-xl border-2 border-gray-400/50 rounded-2xl p-6 text-center hover:scale-105 transition-transform">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-xl">
                      <Medal className="h-10 w-10 text-white" />
                    </div>
                    <div className="text-6xl font-bold text-gray-300 mb-2">#2</div>
                    <h3 className="text-xl font-bold text-white mb-2">{scoreboard[1].teamName}</h3>
                    <div className="text-3xl font-bold bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent mb-2">
                      {scoreboard[1].totalPoints}
                    </div>
                    <p className="text-xs text-gray-400">points</p>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {scoreboard[0] && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl blur opacity-75" />
                  <div className="relative bg-slate-900/90 backdrop-blur-xl border-2 border-yellow-500/50 rounded-2xl p-8 text-center hover:scale-105 transition-transform">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-2xl shadow-yellow-500/50 animate-pulse">
                      <Crown className="h-12 w-12 text-white" />
                    </div>
                    <div className="text-7xl font-bold text-yellow-400 mb-2">#1</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{scoreboard[0].teamName}</h3>
                    <div className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent mb-2">
                      {scoreboard[0].totalPoints}
                    </div>
                    <p className="text-sm text-yellow-400">points</p>
                    <div className="mt-4 flex justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {scoreboard[2] && (
                <div className="relative mt-12">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl blur opacity-50" />
                  <div className="relative bg-slate-900/90 backdrop-blur-xl border-2 border-amber-600/50 rounded-2xl p-6 text-center hover:scale-105 transition-transform">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-xl">
                      <Award className="h-10 w-10 text-white" />
                    </div>
                    <div className="text-6xl font-bold text-amber-500 mb-2">#3</div>
                    <h3 className="text-xl font-bold text-white mb-2">{scoreboard[2].teamName}</h3>
                    <div className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-2">
                      {scoreboard[2].totalPoints}
                    </div>
                    <p className="text-xs text-amber-400">points</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full Rankings Table - Game Style */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 rounded-2xl blur opacity-20" />
          <div className="relative bg-slate-900/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b-2 border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
              <h2 className="text-2xl font-bold text-white mb-2">Complete Rankings</h2>
              <p className="text-purple-300 text-sm">All competing teams • Updated in real-time</p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {scoreboard.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-purple-500/20 bg-slate-800/50">
                      <th className="px-6 py-4 text-left text-sm font-bold text-purple-300 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-purple-300 uppercase tracking-wider">Team</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-purple-300 uppercase tracking-wider">Members</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-purple-300 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-purple-300 uppercase tracking-wider">Last Solve</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreboard.map((team, index) => {
                      const isMyTeam = user?.team?.id === team.teamId;
                      return (
                        <tr 
                          key={team.teamId} 
                          className={`border-b border-purple-500/10 hover:bg-purple-500/10 transition-colors ${
                            isMyTeam ? 'bg-cyan-500/10 border-l-4 border-l-cyan-400' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg font-bold ${getRankBadge(team.rank)}`}>
                              {getRankIcon(team.rank)}
                              <span className="text-xl">#{team.rank}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                {team.teamName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white text-lg">
                                  {team.teamName}
                                  {isMyTeam && (
                                    <span className="ml-2 text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
                                      Your Team
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-300">
                              <Users className="h-4 w-4 text-purple-400" />
                              <span className="text-sm">{team.memberCount || 0} members</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Zap className="h-5 w-5 text-yellow-400" />
                              <span className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                                {team.totalPoints}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-400">
                            {team.lastSolved 
                              ? new Date(team.lastSolved).toLocaleString() 
                              : 'No solves yet'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
                    <Trophy className="h-12 w-12 text-slate-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Rankings Yet</h3>
                  <p className="text-gray-400 mb-6">
                    Be the first team to solve a challenge and claim the top spot!
                  </p>
                  <Link href="/challenges">
                    <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl font-bold text-white hover:scale-105 transition-all shadow-xl shadow-purple-500/50 flex items-center gap-2 mx-auto">
                      <Target className="h-5 w-5" />
                      Start Mission
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        {scoreboard.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/90 backdrop-blur-xl border-2 border-purple-500/30 rounded-xl p-6 text-center">
              <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white mb-1">{scoreboard.length}</div>
              <p className="text-sm text-purple-300">Total Teams</p>
            </div>
            <div className="bg-slate-900/90 backdrop-blur-xl border-2 border-cyan-500/30 rounded-xl p-6 text-center">
              <Zap className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white mb-1">
                {scoreboard.reduce((sum, team) => sum + (team.totalPoints || 0), 0)}
              </div>
              <p className="text-sm text-cyan-300">Total Points</p>
            </div>
            <div className="bg-slate-900/90 backdrop-blur-xl border-2 border-yellow-500/30 rounded-xl p-6 text-center">
              <Target className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white mb-1">
                {user?.team?.rank || 'N/A'}
              </div>
              <p className="text-sm text-yellow-300">Your Rank</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
            {user?.role === 'ADMIN' && (
              <Link href="/admin">
                <Button variant="ghost">Admin</Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Scoreboard</h2>
          <p className="text-muted-foreground">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
            Live rankings • Real-time updates via SSE
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Rankings</CardTitle>
            <CardDescription>
              Sorted by total points, then by time of last solve
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scoreboard.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Rank</TableHead>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">Last Solve</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoreboard.map((team) => {
                    const isMyTeam = user?.team?.id === team.teamId;
                    return (
                      <TableRow 
                        key={team.teamId} 
                        className={isMyTeam ? 'bg-primary/5' : ''}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getRankIcon(team.rank)}
                            <span>#{team.rank}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">
                            {team.teamName}
                            {isMyTeam && (
                              <span className="ml-2 text-xs text-primary">(Your Team)</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {team.members?.slice(0, 3).join(', ')}
                            {team.members?.length > 3 && '...'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-xl font-bold text-primary">
                            {team.totalPoints}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {team.lastSolved 
                            ? new Date(team.lastSolved).toLocaleString() 
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No scores yet. Be the first to solve a challenge!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
