'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Users, Trophy, Flag, LogOut, Target, Zap, Clock, Award, Shield } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [teamStats, setTeamStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [profileData, roundData] = await Promise.all([
          api.getProfile(),
          api.getCurrentRound(),
        ]);

        setUser(profileData);
        setCurrentRound(roundData);

        if (profileData.team) {
          const stats = await api.getTeamStats(profileData.team.id);
          setTeamStats(stats);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-purple-300 text-lg font-semibold">Loading Mission Control...</p>
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Operation Cipher Strike
                </h1>
                <p className="text-xs text-purple-300">Mission Control Interface</p>
              </div>
            </div>
            
            <nav className="flex items-center gap-3">
              <Link href="/dashboard">
                <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg border border-purple-500/30 transition-all font-semibold text-sm">
                  Dashboard
                </button>
              </Link>
              <Link href="/challenges">
                <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 hover:text-white rounded-lg border border-slate-600/30 transition-all font-semibold text-sm">
                  Challenges
                </button>
              </Link>
              <Link href="/scoreboard">
                <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 hover:text-white rounded-lg border border-slate-600/30 transition-all font-semibold text-sm">
                  Scoreboard
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
        {/* Welcome Header - Visual Novel Style */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-2 border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">
                  Welcome back, <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{user?.username}</span>!
                </h2>
                <p className="text-purple-300 flex items-center gap-2">
                  {user?.team ? (
                    <>
                      <Users className="h-4 w-4" />
                      <span className="font-semibold">{user.team.name}</span>
                      <span className="text-purple-400">• Team Status: Active</span>
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" />
                      <span className="text-yellow-400 font-semibold">No team assigned - Join a team to begin!</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Game UI Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Team Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl p-6 hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <div className="px-3 py-1 bg-purple-500/20 rounded-full text-xs font-semibold text-purple-300">
                  SQUAD
                </div>
              </div>
              <h3 className="text-sm font-semibold text-purple-300 mb-2">Your Team</h3>
              <div className="text-3xl font-bold text-white mb-4">
                {user?.team ? user.team.name : 'No Team'}
              </div>
              {!user?.team && (
                <Link href="/challenges">
                  <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:scale-105 transition-all text-sm">
                    Join Team
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Points Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border-2 border-cyan-500/50 rounded-2xl p-6 hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full text-xs font-semibold text-cyan-300">
                  SCORE
                </div>
              </div>
              <h3 className="text-sm font-semibold text-cyan-300 mb-2">Total Points</h3>
              <div className="text-3xl font-bold text-white mb-1">
                {teamStats?.totalPoints || 0}
              </div>
              <p className="text-xs text-cyan-300/70 flex items-center gap-1">
                <Award className="h-3 w-3" />
                {teamStats?.solvedChallenges || 0} challenges completed
              </p>
            </div>
          </div>

          {/* Round Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border-2 border-yellow-500/50 rounded-2xl p-6 hover:scale-105 transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Flag className="h-6 w-6 text-yellow-400" />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${currentRound ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                  {currentRound ? 'ACTIVE' : 'PENDING'}
                </div>
              </div>
              <h3 className="text-sm font-semibold text-yellow-300 mb-2">Current Round</h3>
              <div className="text-xl font-bold text-white mb-1">
                {currentRound ? currentRound.name : 'No Active Round'}
              </div>
              {currentRound && (
                <p className="text-xs text-yellow-300/70 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {currentRound.challenges?.length || 0} missions available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Current Round Details - Visual Novel Style */}
        {currentRound && (
          <div className="relative group mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-2xl blur opacity-30" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <Flag className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{currentRound.name}</h3>
                      <p className="text-sm text-purple-300">Active Mission</p>
                    </div>
                  </div>
                  <p className="text-gray-300 max-w-2xl">{currentRound.description}</p>
                </div>
                <div className="px-4 py-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
                  <p className="text-xs text-purple-300 mb-1">Round Type</p>
                  <p className="text-sm font-bold text-white">{currentRound.type}</p>
                </div>
              </div>
              
              <Link href="/challenges">
                <button className="px-8 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-xl font-bold text-white hover:scale-105 transition-all shadow-xl shadow-purple-500/50 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Start Mission
                </button>
              </Link>
            </div>
          </div>
        )}

        {!currentRound && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-slate-500 rounded-2xl blur opacity-20" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border-2 border-slate-600/50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Active Mission</h3>
              <p className="text-gray-400 mb-6">
                The operation hasn't started yet. Prepare your team and check back soon!
              </p>
              <Link href="/scoreboard">
                <button className="px-6 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 rounded-lg border border-slate-600/30 transition-all font-semibold">
                  View Scoreboard
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
