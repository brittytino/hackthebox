'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { api } from '@/lib/api';
import GameLayout from '@/components/game/GameLayout';
import Character from '@/components/game/Character';
import HalfCircleMenu from '@/components/ui/HalfCircleMenu';
import { Flag, Lock, CheckCircle, ChevronRight, Zap, AlertTriangle, Eye, Terminal, Activity } from 'lucide-react';

const ALL_CHALLENGES = [
  { round: 1, level: '1.1', name: 'The Intercepted Transmission', type: 'CRYPTOGRAPHY', difficulty: 'easy', points: 100, briefing: 'Decode the triple-layer encrypted intercepted terrorist message (Base64  ROT13  Reverse).', character: 'VEERA', characterMsg: "I've tapped into their network. They're using predictable encoding. Decode this transmission." },
  { round: 1, level: '1.2', name: 'The Fragmented Server Map', type: 'FORENSICS', difficulty: 'medium', points: 150, briefing: 'Three encrypted fragments hold the server room access code (Hex, Binary, Caesar cipher). Decode all three.', character: 'VIKRAM', characterMsg: 'Decode them all and assemble in order: Fragment A, Fragment B, Fragment C.' },
  { round: 1, level: '1.3', name: 'The Time-Locked Vault', type: 'MATH', difficulty: 'hard', points: 200, briefing: 'A biometric time-locked vault uses a mathematical formula based on event timestamps.', character: 'ALTHAF', characterMsg: 'This is personalized security — every team calculates their own code. We need this NOW.' },
  { round: 2, level: '2.1', name: 'The Corrupted Hash Trail', type: 'CRYPTOGRAPHY', difficulty: 'medium', points: 250, briefing: 'Crack three password hashes simultaneously (MD5, SHA-1, SHA-256) to access the terrorist database.', character: 'VEERA', characterMsg: 'Crack those hashes. I need the first 3 letters of each password, combined with "42".' },
  { round: 2, level: '2.2', name: 'The JWT Inception', type: 'WEB', difficulty: 'hard', points: 300, briefing: 'The admin panel requires JWT authentication. Decode hex  extract JWT payload  retrieve and reverse the secret.', character: 'VIKRAM', characterMsg: 'Decode that JWT — I need admin access to their systems to prove it.' },
  { round: 2, level: '2.3', name: 'The Pattern Lock', type: 'CRYPTOGRAPHY', difficulty: 'hard', points: 350, briefing: 'Team-specific pattern lock: calculate your unique SHA-256 hash using team name + progress + salt "CIPHER2026".', character: 'ALTHAF', characterMsg: 'This lock is personalized to prevent teams from sharing answers. Calculate YOUR hash.' },
  { round: 3, level: '3.1', name: 'Payload Deconstruction', type: 'REVERSE ENG', difficulty: 'hard', points: 400, briefing: 'Analyze the BLACKOUT malware payload to understand its activation sequence.', character: 'VEERA', characterMsg: 'The worm triggers at February 14, 23:59:59. We need to understand its structure.' },
  { round: 3, level: '3.2', name: 'Logic Bomb Neutralization', type: 'PWN', difficulty: 'hard', points: 450, briefing: 'Locate and neutralize the logic bomb trigger before it activates the city-wide cyber attack.', character: 'VIKRAM', characterMsg: 'The kill switch is hidden within 50,000 lines of obfuscated code. Find it.' },
  { round: 3, level: '3.3', name: "MASTER KEY: The Phantom's Identity", type: 'OSINT', difficulty: 'hard', points: 500, briefing: 'Final mission: identify "The Phantom" — the hacker behind Operation BLACKOUT — and extract the kill switch.', character: 'VEERA', characterMsg: 'This is it. Everything comes down to this moment. Find Saravana. Save the city.' },
];

function getCharColor(character: string) {
  if (character === 'VEERA') return '#a78bfa';
  if (character === 'VIKRAM') return '#67e8f9';
  return '#fbbf24';
}

function DiffBadge({ diff }: { diff: string }) {
  return <span className={`diff-badge diff-${diff}`}>{diff}</span>;
}

export default function ChallengesPage() {
  const router = useRouter();
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [flag, setFlag] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activity, setActivity] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const getCurrentIndex = useCallback((currentName: string) => {
    return ALL_CHALLENGES.findIndex(c => c.name === currentName);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [ch, act] = await Promise.all([
        api.challenges.getCurrent(),
        api.challenges.getActivity().catch(() => []),
      ]);
      setChallenge(ch);
      setActivity(Array.isArray(act) ? act.slice(0, 12) : []);
      if (!selectedLevel) {
        const idx = getCurrentIndex(ch?.name);
        setSelectedLevel(idx >= 0 ? ALL_CHALLENGES[idx].level : '1.1');
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [getCurrentIndex, selectedLevel]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    loadData();
  }, [router, loadData]);

  const currentApiIndex = challenge ? getCurrentIndex(challenge.name) : -1;

  const getChallengeState = (idx: number): 'solved' | 'active' | 'locked' => {
    if (idx < currentApiIndex) return 'solved';
    if (idx === currentApiIndex) return 'active';
    return 'locked';
  };

  const selectedMeta = selectedLevel ? ALL_CHALLENGES.find(c => c.level === selectedLevel) : null;
  const selectedIdx = selectedMeta ? ALL_CHALLENGES.indexOf(selectedMeta) : -1;
  const selectedState = selectedIdx >= 0 ? getChallengeState(selectedIdx) : 'locked';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag.trim()) return;
    setSubmitting(true);
    setMessage('');
    try {
      const result = await api.challenges.submitFlag({ flag: flag.trim() });
      if (result.correct || result.success) {
        setMessage('FLAG ACCEPTED — Mission Complete!');
        setIsError(false);
        setFlag('');
        await loadData();
      } else {
        setMessage(result.message || 'Incorrect flag. Try again.');
        setIsError(true);
      }
    } catch (err: any) {
      setMessage(err.message || 'Submission failed.');
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Animate challenge cards on mount
  useEffect(() => {
    if (cardRefs.current.length > 0) {
      gsap.fromTo(
        cardRefs.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.4,
          ease: 'power2.out',
        }
      );
    }
  }, [selectedLevel]);

  if (loading) {
    return (
      <GameLayout backgroundImage="/images/background/cyber-warfare.jpg" showScanlines>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-14 h-14 border-3 border-cyan-600/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3.5" />
            <div className="text-sm font-bold tracking-widest text-cyan-500 uppercase">
              DECRYPTING MISSION DATA...
            </div>
          </div>
        </div>
      </GameLayout>
    );
  }

  const rounds = [1, 2, 3];

  return (
    <GameLayout backgroundImage="/images/background/cyber-warfare.jpg" showScanlines>
      <HalfCircleMenu />
      
      {/* Character Display - Dynamic based on selected challenge */}
      {selectedMeta && (
        <Character
          character={selectedMeta.character.toLowerCase() as any}
          expression={selectedState === 'active' ? 'determined' : 'neutral'}
          position="left"
          active={selectedState === 'active'}
        />
      )}

      {/* Three-column layout: Mission Tree | Main Content | Activity Feed */}
      <div className="relative z-10 grid grid-cols-[260px,1fr,280px] h-full overflow-hidden">
        
        {/* LEFT SIDEBAR — Mission Tree */}
        <div className="border-r border-purple-600/30 p-5 overflow-y-auto bg-slate-950/60 backdrop-blur-md">
          <div className="text-xs font-bold tracking-widest text-cyan-500 uppercase mb-4 px-1">
            Mission Tree
          </div>
          
          {rounds.map(r => (
            <div key={r} className="mb-4.5">
              <div className={`round-badge round-${r} mb-2.5 block`}>
                Round {r}
              </div>
              
              <div className="flex flex-col gap-1.5">
                {ALL_CHALLENGES.filter(c => c.round === r).map((c, relIdx) => {
                  const absIdx = ALL_CHALLENGES.indexOf(c);
                  const state = getChallengeState(absIdx);
                  const isSelected = selectedLevel === c.level;
                  const idx = cardRefs.current.length;
                  
                  return (
                    <div
                      key={c.level}
                      ref={(el) => { cardRefs.current[idx] = el; }}
                      onClick={() => state !== 'locked' && setSelectedLevel(c.level)}
                      className={`
                        p-2.5 px-3 rounded-lg transition-all duration-200 cursor-pointer
                        ${isSelected ? 'border-cyan-500/60 bg-cyan-500/10' : ''}
                        ${state === 'solved' ? 'border-emerald-500/30 bg-emerald-500/5' : ''}
                        ${state === 'active' ? 'border-purple-600/50 bg-purple-600/10' : ''}
                        ${state === 'locked' ? 'border-slate-700/50 bg-slate-950/50 opacity-40 cursor-not-allowed' : ''}
                        ${state !== 'locked' ? 'hover:brightness-125' : ''}
                      `}
                      style={isSelected || state !== 'locked' ? { border: '1px solid' } : { border: '1px solid rgba(40,30,70,0.5)' }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {state === 'solved' ? (
                          <CheckCircle size={13} className="text-emerald-500" />
                        ) : state === 'active' ? (
                          <Zap size={13} className="text-purple-400" />
                        ) : (
                          <Lock size={13} className="text-gray-600" />
                        )}
                        
                        <span className={`text-xs font-bold ${
                          isSelected ? 'text-cyan-400' :
                          state === 'solved' ? 'text-emerald-300' :
                          state === 'active' ? 'text-purple-200' :
                          'text-gray-600'
                        }`}>
                          {c.level}
                        </span>
                        
                        <DiffBadge diff={c.difficulty} />
                      </div>
                      
                      <div className={`text-[11px] pl-5 leading-snug ${
                        isSelected ? 'text-slate-200' : 'text-gray-400'
                      }`}>
                        {c.name}
                      </div>
                      
                      <div className="text-[10px] text-gray-500 pl-5 mt-0.5">
                        {c.points} pts
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="overflow-y-auto p-6 px-7">
          {selectedMeta ? (
            <>
              {/* Challenge Header */}
              <div className="mb-5">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className={`round-badge round-${selectedMeta.round}`}>
                    Round {selectedMeta.round}
                  </span>
                  <span className="text-gray-500 text-xs">{selectedMeta.type}</span>
                  <DiffBadge diff={selectedMeta.difficulty} />
                  
                  {selectedState === 'solved' && (
                    <span className="text-emerald-500 text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle size={12} /> SOLVED
                    </span>
                  )}
                  
                  {selectedState === 'active' && (
                    <span className="text-purple-400 text-[11px] font-bold flex items-center gap-1 animate-pulse">
                      <Zap size={12} /> ACTIVE
                    </span>
                  )}
                </div>
                
                <h1 className="text-2xl font-bold text-purple-200 mb-2 glow-purple">
                  {selectedMeta.level} — {selectedMeta.name}
                </h1>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Reward:
                  </span>
                  <span className="text-amber-500 font-bold text-base glow-gold">
                    {selectedMeta.points} PTS
                  </span>
                </div>
              </div>

              {/* Character Dialogue */}
              <div className="relative bg-gradient-to-br from-slate-950/95 to-purple-950/90 border-2 border-purple-600/50 rounded-xl p-7 pb-5.5 mb-5 shadow-lg shadow-purple-900/15">
                <div
                  className="absolute -top-4.5 left-6 px-4.5 py-1 rounded-t-lg text-[11px] font-bold tracking-[3px] uppercase border border-purple-400/40"
                  style={{
                    background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
                    color: getCharColor(selectedMeta.character),
                  }}
                >
                  {selectedMeta.character}
                </div>
                
                <p className="text-base leading-relaxed text-slate-200 mt-1.5">
                  "{selectedMeta.characterMsg}"
                </p>
              </div>

              {/* Mission Briefing */}
              <div className="game-panel-bordered p-5.5 px-6.5 mb-5">
                <div className="text-xs font-bold tracking-widest text-cyan-500 uppercase mb-3 flex items-center gap-1.5">
                  <Terminal size={12} /> Mission Briefing
                </div>
                
                <p className="text-purple-200 leading-relaxed text-[15px]">
                  {selectedMeta.briefing}
                </p>

                {selectedState === 'active' && challenge?.hint && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="btn-game-secondary text-xs px-4 py-2"
                    >
                      <Eye size={13} />
                      {showHint ? 'Hide Hint' : 'Reveal Hint'}
                    </button>
                    
                    {showHint && (
                      <div className="game-alert-info mt-3">
                        <strong className="text-purple-400">INTEL: </strong>
                        {challenge.hint}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Flag Submission - Only for Active Challenges */}
              {selectedState === 'active' && (
                <div className="game-panel-bordered p-5.5 px-6.5">
                  <div className="text-xs font-bold tracking-widest text-purple-400 uppercase mb-3.5 flex items-center gap-1.5">
                    <Flag size={12} /> Submit Intelligence
                  </div>
                  
                  <form onSubmit={handleSubmit} className="flex gap-3">
                    <input
                      className="game-input flex-1"
                      type="text"
                      placeholder="HTB{...} or cipher flag"
                      value={flag}
                      onChange={e => setFlag(e.target.value)}
                      disabled={submitting}
                    />
                    
                    <button
                      type="submit"
                      className="btn-game-primary whitespace-nowrap"
                      disabled={submitting || !flag.trim()}
                      style={{ opacity: submitting || !flag.trim() ? 0.6 : 1 }}
                    >
                      {submitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Transmitting...
                        </>
                      ) : (
                        <>
                          <Flag size={14} /> Submit Flag
                        </>
                      )}
                    </button>
                  </form>
                  
                  {message && (
                    <div className={`${isError ? 'game-alert-error' : 'game-alert-success'} mt-3.5 flex gap-2 items-center`}>
                      {isError ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                      {message}
                    </div>
                  )}
                </div>
              )}

              {/* Challenge Status Messages */}
              {selectedState === 'solved' && (
                <div className="game-alert-success flex items-center gap-2.5 text-[15px]">
                  <CheckCircle size={18} />
                  Mission Complete — This flag has been captured. Proceed to the next challenge.
                </div>
              )}

              {selectedState === 'locked' && (
                <div className="game-alert-info flex items-center gap-2.5">
                  <Lock size={16} />
                  This mission is locked. Complete the current active challenge first.
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Flag size={40} className="mb-3.5 opacity-40" />
              <p>Select a mission from the tree</p>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR — Activity Feed */}
        <div className="border-l border-purple-600/30 p-5 px-4 overflow-y-auto bg-slate-950/60 backdrop-blur-md">
          <div className="text-xs font-bold tracking-widest text-purple-400 uppercase mb-4 flex items-center gap-1.5">
            <Activity size={12} /> Live Intel Feed
            <span className="status-dot active ml-1" />
          </div>
          
          {activity.length === 0 ? (
            <p className="text-gray-600 text-[13px] text-center mt-7.5">
              No activity yet. Be the first to solve!
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {activity.map((a: any, i: number) => (
                <div
                  key={i}
                  className="game-panel p-2.5 px-3.5"
                  style={{ animation: `fadeIn 0.4s ease ${i * 0.05}s both` }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="status-dot active" />
                    <span className="text-slate-200 text-xs font-semibold">
                      {a.teamName || a.team?.name || 'Team'}
                    </span>
                  </div>
                  
                  <div className="text-emerald-300 text-[11px] mb-0.5">
                    Captured: {a.challengeName || a.challenge?.name || 'flag'}
                  </div>
                  
                  <div className="text-gray-500 text-[10px]">
                    +{a.points || a.pointsEarned || '?'} pts
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
