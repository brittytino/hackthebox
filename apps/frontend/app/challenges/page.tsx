'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
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

  if (loading) {
    return (
      <div className="game-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="game-bg" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070')`, filter: 'brightness(0.15) saturate(0.6)' }} />
        <div className="game-bg-overlay" />
        <div className="scanlines" />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', border: '3px solid rgba(6,182,212,0.3)', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }} />
          <div className="game-label" style={{ color: '#06b6d4' }}>DECRYPTING MISSION DATA...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const rounds = [1, 2, 3];

  return (
    <div className="game-root">
      <div className="game-bg" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070')`, filter: 'brightness(0.15) saturate(0.6)' }} />
      <div className="game-bg-overlay" />
      <div className="scanlines" />
      <HalfCircleMenu />

      {/* LAYOUT: left sidebar | main | right activity */}
      <div style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '260px 1fr 280px', height: '100%', overflow: 'hidden' }}>

        {/* LEFT SIDEBAR — all challenges */}
        <div
          className="game-scroll"
          style={{
            borderRight: '1px solid rgba(109,40,217,0.3)', padding: '20px 14px',
            overflowY: 'auto', background: 'rgba(5,2,20,0.6)', backdropFilter: 'blur(10px)',
          }}
        >
          <div className="game-label" style={{ color: '#06b6d4', marginBottom: '16px', paddingLeft: '4px' }}>
            MISSION TREE
          </div>
          {rounds.map(r => (
            <div key={r} style={{ marginBottom: '18px' }}>
              <div className={`round-badge round-${r}`} style={{ marginBottom: '10px', display: 'block' }}>
                Round {r}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {ALL_CHALLENGES.filter(c => c.round === r).map((c, relIdx) => {
                  const absIdx = ALL_CHALLENGES.indexOf(c);
                  const state = getChallengeState(absIdx);
                  const isSelected = selectedLevel === c.level;
                  return (
                    <div
                      key={c.level}
                      onClick={() => state !== 'locked' && setSelectedLevel(c.level)}
                      style={{
                        padding: '10px 12px', borderRadius: '10px', cursor: state === 'locked' ? 'not-allowed' : 'pointer',
                        border: `1px solid ${isSelected ? 'rgba(6,182,212,0.6)' : state === 'solved' ? 'rgba(16,185,129,0.3)' : state === 'active' ? 'rgba(109,40,217,0.5)' : 'rgba(40,30,70,0.5)'}`,
                        background: isSelected ? 'rgba(6,182,212,0.1)' : state === 'solved' ? 'rgba(16,185,129,0.06)' : state === 'active' ? 'rgba(109,40,217,0.1)' : 'rgba(10,5,20,0.5)',
                        opacity: state === 'locked' ? 0.38 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        {state === 'solved' ? <CheckCircle size={13} color="#10b981" /> : state === 'active' ? <Zap size={13} color="#a78bfa" /> : <Lock size={13} color="#4b5563" />}
                        <span style={{ color: isSelected ? '#67e8f9' : state === 'solved' ? '#6ee7b7' : state === 'active' ? '#e9d5ff' : '#4b5563', fontSize: '12px', fontWeight: 700 }}>
                          {c.level}
                        </span>
                        <DiffBadge diff={c.difficulty} />
                      </div>
                      <div style={{ color: isSelected ? '#e2e8f0' : '#9ca3af', fontSize: '11px', paddingLeft: '21px', lineHeight: 1.4 }}>
                        {c.name}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '10px', paddingLeft: '21px', marginTop: '3px' }}>
                        {c.points} pts
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* MAIN AREA */}
        <div className="game-scroll" style={{ overflowY: 'auto', padding: '24px 28px' }}>
          {selectedMeta ? (
            <>
              {/* Challenge header */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span className={`round-badge round-${selectedMeta.round}`}>Round {selectedMeta.round}</span>
                  <span style={{ color: '#6b7280', fontSize: '12px' }}>{selectedMeta.type}</span>
                  <DiffBadge diff={selectedMeta.difficulty} />
                  {selectedState === 'solved' && <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 700, display:'flex',alignItems:'center',gap:'4px' }}><CheckCircle size={12}/> SOLVED</span>}
                  {selectedState === 'active' && <span style={{ color: '#a78bfa', fontSize: '11px', fontWeight: 700, display:'flex',alignItems:'center',gap:'4px', animation:'pulse-glow 2s infinite' }}><Zap size={12}/> ACTIVE</span>}
                </div>
                <h1 className="game-title glow-purple" style={{ fontSize: '24px', color: '#e9d5ff', marginBottom: '8px' }}>
                  {selectedMeta.level} — {selectedMeta.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="game-label">REWARD:</span>
                  <span className="glow-gold" style={{ color: '#fbbf24', fontWeight: 700, fontSize: '16px' }}>{selectedMeta.points} PTS</span>
                </div>
              </div>

              {/* Character dialogue */}
              <div
                style={{
                  position: 'relative',
                  background: 'linear-gradient(135deg, rgba(5,2,20,0.97), rgba(15,8,40,0.95))',
                  border: `2px solid rgba(109,40,217,0.5)`,
                  borderRadius: '14px', padding: '28px 30px 22px', marginBottom: '20px',
                  boxShadow: '0 0 40px rgba(109,40,217,0.15)',
                }}
              >
                <div
                  style={{
                    position: 'absolute', top: '-18px', left: '24px',
                    padding: '4px 18px',
                    background: `linear-gradient(135deg, #4c1d95, #7c3aed)`,
                    borderRadius: '8px 8px 0 0',
                    fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase',
                    color: getCharColor(selectedMeta.character),
                    border: '1px solid rgba(167,139,250,0.4)',
                  }}
                >
                  {selectedMeta.character}
                </div>
                <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#e2e8f0', marginTop: '6px' }}>
                  "{selectedMeta.characterMsg}"
                </p>
              </div>

              {/* Briefing */}
              <div className="game-panel-bordered" style={{ padding: '22px 26px', marginBottom: '20px' }}>
                <div className="game-label" style={{ color: '#06b6d4', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Terminal size={12} /> MISSION BRIEFING
                </div>
                <p style={{ color: '#c4b5fd', lineHeight: 1.8, fontSize: '15px' }}>{selectedMeta.briefing}</p>

                {selectedState === 'active' && challenge?.hint && (
                  <div style={{ marginTop: '16px' }}>
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="btn-game-secondary"
                      style={{ fontSize: '12px', padding: '8px 16px' }}
                    >
                      <Eye size={13} />
                      {showHint ? 'Hide Hint' : 'Reveal Hint'}
                    </button>
                    {showHint && (
                      <div className="game-alert-info" style={{ marginTop: '12px' }}>
                        <strong style={{ color: '#a78bfa' }}>INTEL: </strong>{challenge.hint}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Flag submission — only for active */}
              {selectedState === 'active' && (
                <div className="game-panel-bordered" style={{ padding: '22px 26px' }}>
                  <div className="game-label" style={{ color: '#a78bfa', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flag size={12} /> SUBMIT INTELLIGENCE
                  </div>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
                    <input
                      className="game-input"
                      type="text"
                      placeholder="HTB{...} or cipher flag"
                      value={flag}
                      onChange={e => setFlag(e.target.value)}
                      disabled={submitting}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="submit"
                      className="btn-game-primary"
                      disabled={submitting || !flag.trim()}
                      style={{ whiteSpace: 'nowrap', opacity: submitting || !flag.trim() ? 0.6 : 1 }}
                    >
                      {submitting ? (
                        <>
                          <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          Transmitting...
                        </>
                      ) : (
                        <><Flag size={14} /> Submit Flag</>
                      )}
                    </button>
                  </form>
                  {message && (
                    <div className={isError ? 'game-alert-error' : 'game-alert-success'} style={{ marginTop: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {isError ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                      {message}
                    </div>
                  )}
                </div>
              )}

              {selectedState === 'solved' && (
                <div className="game-alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px' }}>
                  <CheckCircle size={18} />
                  Mission Complete — This flag has been captured. Proceed to the next challenge.
                </div>
              )}

              {selectedState === 'locked' && (
                <div className="game-alert-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Lock size={16} />
                  This mission is locked. Complete the current active challenge first.
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}>
              <Flag size={40} style={{ marginBottom: '14px', opacity: 0.4 }} />
              <p>Select a mission from the tree</p>
            </div>
          )}
        </div>

        {/* RIGHT — Activity feed */}
        <div
          className="game-scroll"
          style={{
            borderLeft: '1px solid rgba(109,40,217,0.3)', padding: '20px 16px',
            overflowY: 'auto', background: 'rgba(5,2,20,0.6)', backdropFilter: 'blur(10px)',
          }}
        >
          <div className="game-label" style={{ color: '#a78bfa', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={12} /> LIVE INTEL FEED
            <span className="status-dot active" style={{ marginLeft: '4px' }} />
          </div>
          {activity.length === 0 ? (
            <p style={{ color: '#4b5563', fontSize: '13px', textAlign: 'center', marginTop: '30px' }}>
              No activity yet. Be the first to solve!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activity.map((a: any, i: number) => (
                <div
                  key={i}
                  className="game-panel"
                  style={{ padding: '10px 13px', animation: `fadeIn 0.4s ease ${i * 0.05}s both` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span className="status-dot active" />
                    <span style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 600 }}>{a.teamName || a.team?.name || 'Team'}</span>
                  </div>
                  <div style={{ color: '#6ee7b7', fontSize: '11px', marginBottom: '2px' }}>
                    Captured: {a.challengeName || a.challenge?.name || 'flag'}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '10px' }}>
                    +{a.points || a.pointsEarned || '?'} pts
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
