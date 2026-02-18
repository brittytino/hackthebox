'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Trophy, Medal, Award, LogOut, ArrowLeft, Crown, Star, Zap, Users, Target, Activity } from 'lucide-react';

export default function LeaderboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth but allow public viewing?
    // User said "only frontend in working" and implied public access or participant access.
    // Usually leaderboards are public or require login. Let's assume login for now as per previous code.
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      // router.push('/login'); // Maybe public? User said "participants".
      // Let's allow public access for leaderboard
    }

    loadData();

    // SSE for real-time updates
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    // Ensure correct URL without double /api if present in base but backend expects simple
    // Backend prefix is /api. Front env is /api.
    // If backend route is /api/scoreboard/live
    // And apiUrl is .../api
    // Then we need .../api/scoreboard/live
    // So just apiUrl + '/scoreboard/live' is correct if apiUrl ends with /api
    // If apiUrl does NOT end with /api (e.g. localhost:3001), then we need /api/scoreboard/live
    
    const eventSourceUrl = apiUrl.endsWith('/api') 
      ? `${apiUrl}/scoreboard/live` 
      : `${apiUrl}/api/scoreboard/live`;

    const eventSource = new EventSource(eventSourceUrl);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Ensure data is array
        if (Array.isArray(data)) {
            setLeaderboard(data);
        }
      } catch (error) {
        console.error('Failed to parse SSE data:', error);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.challenges.getLeaderboard();
      if (Array.isArray(data)) {
        setLeaderboard(data);
      }
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2d1b4e] font-sans selection:bg-pink-500 overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(#ff69b4 1px, transparent 1px)', 
             backgroundSize: '30px 30px' 
           }} 
      />

      {/* Summertime Saga Style Layout */}
      <div className="container mx-auto px-4 py-8 relative z-10 h-full flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar / Phone UI */}
        <div className="w-full md:w-1/4 flex flex-col gap-4">
           {/* Phone Frame */}
           <div className="bg-gradient-to-b from-[#4a2c7a] to-[#2d1b4e] rounded-[30px] p-4 border-4 border-[#ff69b4] shadow-[0_0_20px_rgba(255,105,180,0.5)]">
              <div className="flex items-center justify-between mb-6 px-2">
                 <Link href="/dashboard" className="text-pink-300 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                 </Link>
                 <span className="text-white font-bold tracking-widest uppercase">Leaderboard</span>
                 <Activity size={24} className="text-pink-400 animate-pulse" />
              </div>

              {/* Stats Summary */}
              <div className="bg-black/30 rounded-xl p-4 mb-4 backdrop-blur-sm border border-white/10">
                 <h3 className="text-pink-300 text-xs font-bold uppercase mb-2">Competition Status</h3>
                 <div className="flex items-center gap-2 text-white">
                    <Users size={16} className="text-blue-400" />
                    <span className="text-sm">{leaderboard.length} Teams Active</span>
                 </div>
                 <div className="mt-2 text-xs text-gray-400">
                    Live updates enabled
                 </div>
              </div>

              {/* Decorative Character Art (Placeholder) */}
              <div className="hidden md:block relative h-64 w-full rounded-xl overflow-hidden bg-black/20 border border-white/5">
                 <div className="absolute inset-0 flex items-center justify-center text-pink-500/20">
                    <Trophy size={64} />
                 </div>
                 {/* 
                 <img 
                    src="/images/character_art.png" 
                    alt="Character" 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-full object-contain drop-shadow-lg"
                 />
                 */}
              </div>
           </div>
        </div>

        {/* Main Content / Scoreboard List */}
        <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-[30px] border border-white/10 p-6 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
               <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-full shadow-lg transform rotate-12">
                  <Trophy size={32} className="text-white" />
               </div>
               <div>
                  <h1 className="text-3xl font-black text-white italic drop-shadow-md tracking-tight uppercase" style={{ textShadow: '2px 2px 0px #ff00ff' }}>
                     Top Agents
                  </h1>
                  <p className="text-pink-300 font-medium tracking-wide">
                     Real-time Ranking
                  </p>
               </div>
            </div>

            {/* List */}
            <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
               {loading ? (
                  <div className="text-center py-20 text-pink-300 animate-pulse">
                     Loading Mission Data...
                  </div>
               ) : leaderboard.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 bg-black/20 rounded-xl">
                     <p>No teams have scored yet.</p>
                     <p className="text-sm mt-2">Be the first to strike!</p>
                  </div>
               ) : (
                  leaderboard.map((team, index) => (
                    <div 
                      key={team.id || index}
                      className={`group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-lg border border-transparent hover:border-pink-500/30 ${
                         index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/30' :
                         index === 1 ? 'bg-gradient-to-r from-gray-400/20 to-transparent border-gray-400/30' :
                         index === 2 ? 'bg-gradient-to-r from-orange-500/20 to-transparent border-orange-500/30' :
                         'bg-black/20 hover:bg-black/30 border-white/5'
                      }`}
                    >
                       {/* Rank Badge */}
                       <div className={`
                          w-12 h-12 flex items-center justify-center rounded-xl font-black text-xl shadow-inner
                          ${index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                            index === 1 ? 'bg-gray-300 text-gray-800' :
                            index === 2 ? 'bg-orange-400 text-orange-900' :
                            'bg-[#2d1b4e] text-gray-400 border border-white/10'}
                       `}>
                          {index + 1}
                       </div>

                       {/* Team Info */}
                       <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-lg truncate ${index < 3 ? 'text-white' : 'text-gray-200'}`}>
                             {team.teamName}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                             <Users size={12} />
                             {/* Display members or just count */}
                             <span className="truncate max-w-[200px]">
                                {Array.isArray(team.members) ? team.members.join(', ') : 'Unknown Squad'}
                             </span>
                          </div>
                       </div>

                       {/* Score */}
                       <div className="flex flex-col items-end">
                          <span className="text-2xl font-black text-white tabular-nums tracking-tighter" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                             {team.totalPoints.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold uppercase text-pink-400 tracking-wider">Points</span>
                       </div>

                       {/* Progress Bar (Visual flair) */}
                       <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl" 
                            style={{ width: `${Math.min((team.totalPoints / (leaderboard[0]?.totalPoints || 1)) * 100, 100)}%` }} 
                       />
                    </div>
                  ))
               )}
            </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 105, 180, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 105, 180, 0.6);
        }
      `}</style>
    </div>
  );
}