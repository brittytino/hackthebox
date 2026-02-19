'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import Link from 'next/link';
import { api } from '@/lib/api';
import GameLayout from '@/components/game/GameLayout';
import Character from '@/components/game/Character';
import HalfCircleMenu from '@/components/ui/HalfCircleMenu';
import { Users, Trophy, Flag, Target, Zap, Clock, Award, Shield, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [teamStats, setTeamStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

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
      } catch {
        // silent
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

  const statsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Animate stat cards on mount
  useEffect(() => {
    if (statsRef.current.length > 0 && !loading) {
      gsap.fromTo(
        statsRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: 'power2.out',
        }
      );
    }
  }, [loading]);

  const roundNum = currentRound?.number || 1;
  const totalScore = teamStats?.score ?? user?.team?.score ?? 0;
  const members: any[] = user?.team?.members ?? [];

  if (loading) {
    return (
      <GameLayout backgroundImage="/images/background/command-center.jpg" showScanlines>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-15 h-15 border-3 border-purple-600/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4" />
            <div className="text-sm font-bold tracking-widest text-purple-400 uppercase">
              Loading Mission Control...
            </div>
          </div>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout backgroundImage="/images/background/command-center.jpg" showScanlines>
      <HalfCircleMenu />
      
      {/* Character Display */}
      <Character
        character="veera"
        expression="determined"
        position="left"
        active={true}
      />
      
      <div className="relative z-10 w-full h-full overflow-y-auto px-10 py-8 pb-10">
        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <div className="game-label" style={{ color: '#06b6d4', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-dot active" />
              MISSION CONTROL — ACTIVE
            </div>
            <h1 className="game-title glow-purple" style={{ fontSize: '32px', color: '#e9d5ff', marginBottom: '6px' }}>
              Welcome back, {user?.participant1Name || user?.name || 'Operative'}
            </h1>
            {user?.team && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={14} color="#a78bfa" />
                <span style={{ color: '#a78bfa', fontSize: '15px', fontWeight: 600 }}>
                  {user.team.name}
                </span>
                <span className="round-badge round-1" style={{ fontSize: '10px' }}>
                  TEAM ACTIVE
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/challenges" className="btn-game-primary" style={{ fontSize: '12px', padding: '10px 20px' }}>
              <Target size={14} /> Start Mission
            </Link>
            <button onClick={handleLogout} className="btn-game-danger" style={{ fontSize: '12px', padding: '10px 18px' }}>
              Logout
            </button>
          </div>
        </div>

        {/* TOP accent line */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(109,40,217,0.6), rgba(6,182,212,0.4), transparent)', marginBottom: '32px' }} />

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '28px' }}>
          <div className="stat-card">
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
            <div className="game-label" style={{ color: '#6b7280', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={11} /> TEAM NAME
            </div>
            <div className="stat-card-value glow-purple" style={{ fontSize: '22px', color: '#e9d5ff', wordBreak: 'break-word' }}>
              {user?.team?.name || '—'}
            </div>
            <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '6px' }}>
              {members.length} operative{members.length !== 1 ? 's' : ''} enlisted
            </div>
          </div>

          <div className="stat-card">
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
            <div className="game-label" style={{ color: '#6b7280', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trophy size={11} /> TOTAL POINTS
            </div>
            <div className="stat-card-value glow-gold" style={{ color: '#fbbf24' }}>
              {totalScore.toLocaleString()}
            </div>
            <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '6px' }}>Score accumulated</div>
          </div>

          <div className="stat-card">
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #06b6d4, #67e8f9)' }} />
            <div className="game-label" style={{ color: '#6b7280', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={11} /> CURRENT ROUND
            </div>
            <div className="stat-card-value glow-cyan" style={{ color: '#67e8f9' }}>
              {roundNum} / 3
            </div>
            <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '6px' }}>
              {currentRound?.name || 'Loading...'}
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
          {/* LEFT — Round progress + current round details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Round Progress */}
            <div className="game-panel-bordered" style={{ padding: '24px 28px' }}>
              <div className="game-heading" style={{ fontSize: '14px', color: '#e9d5ff', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} color="#fbbf24" /> OPERATION PROGRESS
              </div>
              <div style={{ display: 'flex', gap: '0', position: 'relative' }}>
                {/* connector line */}
                <div style={{ position: 'absolute', top: '20px', left: '40px', right: '40px', height: '2px', background: 'rgba(109,40,217,0.3)', zIndex: 0 }} />
                {[
                  { n: 1, label: 'THE BREACH DISCOVERY', color: roundNum >= 1 ? '#7c3aed' : '#2a1a5e' },
                  { n: 2, label: 'INFILTRATION', color: roundNum >= 2 ? '#7c3aed' : '#2a1a5e' },
                  { n: 3, label: 'THE FINAL STRIKE', color: roundNum >= 3 ? '#7c3aed' : '#2a1a5e' },
                ].map(r => (
                  <div key={r.n} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div
                      style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: roundNum > r.n ? 'linear-gradient(135deg,#10b981,#059669)' : roundNum === r.n ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : 'rgba(20,10,50,0.9)',
                        border: `2px solid ${r.color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: roundNum === r.n ? '0 0 20px rgba(124,58,237,0.6)' : 'none',
                        fontSize: '15px', fontWeight: 800, color: roundNum >= r.n ? '#fff' : '#4b5563',
                      }}
                    >
                      {roundNum > r.n ? '' : r.n}
                    </div>
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                      <div className={`round-badge round-${r.n}`} style={{ fontSize: '9px' }}>ROUND {r.n}</div>
                      <div style={{ color: roundNum >= r.n ? '#c4b5fd' : '#4b5563', fontSize: '11px', marginTop: '6px', lineHeight: 1.4, maxWidth: '100px' }}>
                        {r.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                  <span className="game-label">Overall Completion</span>
                  <span style={{ color: '#a78bfa', fontSize: '12px', fontWeight: 700 }}>
                    {Math.round(((roundNum - 1) / 3) * 100)}%
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.round(((roundNum - 1) / 3) * 100)}%` }} />
                </div>
              </div>
            </div>

            {/* Current Round Details */}
            {currentRound ? (
              <div className="game-panel-bordered" style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <div>
                    <div className={`round-badge round-${roundNum}`} style={{ marginBottom: '10px' }}>
                      ROUND {roundNum} — ACTIVE
                    </div>
                    <h2 className="game-heading" style={{ fontSize: '18px', color: '#e9d5ff' }}>
                      {currentRound.name || 'Current Round'}
                    </h2>
                  </div>
                  <Clock size={24} color="#6b7280" />
                </div>

                <p style={{ color: '#a78bfa', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>
                  {currentRound.description || 'Your team is currently engaged in active cyber operations. Complete all challenges to advance to the next round.'}
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link href="/challenges" className="btn-game-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    <Flag size={15} /> Start Mission <ChevronRight size={14} />
                  </Link>
                  <Link href="/story" className="btn-game-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                    Mission Briefing
                  </Link>
                </div>
              </div>
            ) : (
              <div className="game-panel" style={{ padding: '24px 28px', textAlign: 'center' }}>
                <Target size={32} color="#4b5563" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#6b7280' }}>No active round at the moment. Stand by...</p>
              </div>
            )}
          </div>

          {/* RIGHT — Team members */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="game-panel-bordered" style={{ padding: '22px 22px' }}>
              <div className="game-heading" style={{ fontSize: '13px', color: '#e9d5ff', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={14} color="#a78bfa" /> TEAM ROSTER
              </div>
              {user?.team ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {members.length > 0 ? members.map((m: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 14px', background: 'rgba(109,40,217,0.08)',
                        border: '1px solid rgba(109,40,217,0.2)', borderRadius: '10px',
                      }}
                    >
                      <div
                        style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: `linear-gradient(135deg, ${i === 0 ? '#7c3aed,#a78bfa' : '#064e3b,#10b981'})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}
                      >
                        {(m.name || m.participant1Name || '?')[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.name || m.participant1Name || `Operative ${i + 1}`}
                        </div>
                        <div className="game-label" style={{ color: '#6b7280', fontSize: '10px' }}>
                          {i === 0 ? 'LEAD AGENT' : 'AGENT'}
                        </div>
                      </div>
                      <span className="status-dot active" />
                    </div>
                  )) : (
                    <>
                      {user?.participant1Name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)', borderRadius: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                            {user.participant1Name[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600 }}>{user.participant1Name}</div>
                            <div className="game-label" style={{ color: '#6b7280', fontSize: '10px' }}>LEAD AGENT</div>
                          </div>
                          <span className="status-dot active" />
                        </div>
                      )}
                      {user?.participant2Name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)', borderRadius: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#064e3b,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                            {user.participant2Name[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600 }}>{user.participant2Name}</div>
                            <div className="game-label" style={{ color: '#6b7280', fontSize: '10px' }}>AGENT</div>
                          </div>
                          <span className="status-dot active" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Users size={28} color="#4b5563" style={{ margin: '0 auto 10px' }} />
                  <p style={{ color: '#6b7280', fontSize: '13px' }}>Join a team to begin operations</p>
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="game-panel" style={{ padding: '20px 22px' }}>
              <div className="game-label" style={{ marginBottom: '14px', color: '#6b7280' }}>QUICK ACCESS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { href: '/challenges', icon: Target, label: 'Active Missions', color: '#06b6d4' },
                  { href: '/leaderboard', icon: Trophy, label: 'Agent Rankings', color: '#fbbf24' },
                  { href: '/story', icon: Shield, label: 'Mission Briefing', color: '#f9a8d4' },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="menu-btn"
                    style={{ textDecoration: 'none' }}
                  >
                    <item.icon size={15} color={item.color} />
                    <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>{item.label}</span>
                    <ChevronRight size={13} color="#6b7280" style={{ marginLeft: 'auto' }} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
