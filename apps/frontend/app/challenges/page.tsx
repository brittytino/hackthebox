'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { gsap } from 'gsap';
import { api } from '@/lib/api';
import GameLayout from '@/components/game/GameLayout';
import {
  Flag, Lock, CheckCircle, Zap, AlertTriangle, Eye,
  Terminal, Activity, Shield, Clock, X, ChevronRight,
  RadioTower, Crosshair, Skull, Key,
} from 'lucide-react';

interface MissionMeta {
  order: number; round: number; level: string;
  name: string; type: string;
  difficulty: 'easy' | 'medium' | 'hard'; points: number;
  storyAct: string; storyTime: string; storyStatus: string;
  situation: string;
  intel: string;
  objective: string;
  character: string;
  characterImage: string;
  roundLabel: string;
}

const MISSIONS: MissionMeta[] = [
  {
    order: 1, round: 1, level: '1.1',
    name: 'The Intercepted Transmission',
    type: 'CRYPTOGRAPHY', difficulty: 'easy', points: 100,
    storyAct: 'ACT II — THE SIEGE BEGINS',
    storyTime: '03:47 AM  Basement Server Room',
    storyStatus: ' 1,200 HOSTAGES  NEXT EXECUTION IN 28 MIN',
    situation: 'Veera has gone dark inside the mall and found a backup server room in the basement. He taps the terrorist network and intercepts an encrypted transmission — but it has triple-layer encoding. He needs your team to break it before Saif moves his command center.',
    intel: '"Triple-layer encoding — Base64, then ROT13, then reversed. Overconfident idiots. Decode it and tell me where their command center is. Every second counts."',
    objective: 'Decode Base64 → apply ROT13 → reverse the output. Submit the final location as the flag.',
    character: 'Veera Raghavan',
    characterImage: '/images/characters/veera_determined.png',
    roundLabel: 'ROUND 1  BREACH',
  },
  {
    order: 2, round: 1, level: '1.2',
    name: 'The Fragmented Server Map',
    type: 'FORENSICS', difficulty: 'medium', points: 150,
    storyAct: 'ACT II — THE SIEGE BEGINS',
    storyTime: '04:15 AM  Approaching Server Room ER-42',
    storyStatus: ' PATROLS ACTIVE  NEXT EXECUTION IN 15 MIN',
    situation: 'Vikram\'s cyber unit intercepts three encrypted files from the terrorist relay — each fragment of the server room access code is encoded differently. Veera is 50 meters away with armed patrols closing in. He needs the complete code now.',
    intel: '"Three fragments. Hex, Binary, Caesar cipher shift-7. Decode every piece and assemble them in order — A then B then C. No mistakes. Veera is exposed if you get this wrong."',
    objective: 'Decode Fragment A (Hex) + Fragment B (Binary) + Fragment C (Caesar -7), then combine strictly as A+B+C.',
    character: 'Vikram Singaravelan',
    characterImage: '/images/characters/vikram_serious.png',
    roundLabel: 'ROUND 1  BREACH',
  },
  {
    order: 3, round: 1, level: '1.3',
    name: 'The Time-Locked Vault',
    type: 'MATH/HASH', difficulty: 'hard', points: 200,
    storyAct: 'ROUND 1 FINALE',
    storyTime: '04:45 AM  Server Room ER-42',
    storyStatus: ' FIRST HOSTAGE EXECUTED ON LIVE TV',
    situation: 'Veera reaches the biometric time-locked vault inside ER-42. The lock uses a team-personalised mathematical formula — every team computes a different answer. This is anti-sharing security. Inside the vault is Saif\'s full attack blueprint and proof of a second larger threat.',
    intel: '"Personalized vault. The formula uses YOUR team name, member count, round number, and salt. Calculate your unique MD5. First 8 hex chars. I cannot wait — open it."',
    objective: 'Compute MD5(teamName|2|1|CIPHER2026). Take first 8 hex chars. Submit in CTF{...}.',
    character: 'Deputy NSA Althaf',
    characterImage: '/images/characters/althaf_commanding.png',
    roundLabel: 'ROUND 1  BREACH',
  },
  {
    order: 4, round: 2, level: '2.1',
    name: 'The Corrupted Hash Trail',
    type: 'HASH CRACKING', difficulty: 'medium', points: 250,
    storyAct: 'ACT III — THE COUNTERATTACK',
    storyTime: '05:12 AM  Vault Terminal',
    storyStatus: ' GOVT CAVING  FAROOQ RELEASE PREP STARTED',
    situation: 'The hard drive from the vault holds three password-protected databases — sleeper cell identities, financial backers, and the BLACKOUT payload. If Veera can crack these before Farooq is released, the government will have no choice but to hold the transfer.',
    intel: '"MD5, SHA-1, SHA-256. Crack all three. Take first 3 letters of each cracked password, combine them, and add \'42\' at the end. That\'s the master decryption key. Move."',
    objective: 'Crack all three hashes, take first 3 letters from each plaintext password, append "42", then submit as CTF{...}.',
    character: 'Veera Raghavan',
    characterImage: '/images/characters/veera_intense.png',
    roundLabel: 'ROUND 2  INFILTRATION',
  },
  {
    order: 5, round: 2, level: '2.2',
    name: 'The JWT Inception',
    type: 'WEB/TOKEN', difficulty: 'hard', points: 300,
    storyAct: 'ACT IV — THE BETRAYAL',
    storyTime: '05:50 AM  Terrorist Admin Panel',
    storyStatus: ' BREAKING: HOME MINISTER\'S EXECUTION STAGED',
    situation: 'Veera is inside the admin panel — but the authentication token is hex-encoded to evade scanners. Vikram has just spotted that the Home Minister\'s "wife execution" was theater, staged to force government compliance. Decode the JWT to pull admin logs proving the treachery.',
    intel: '"The JWT is inside a hex-encoded wrapper. Decode hex to get the JWT. Base64 decode the payload. Find the \'secret\' field. Reverse it. That\'s your admin key."',
    objective: 'Hex decode → parse JWT → Base64 decode payload → extract secret → reverse it. Submit CTF{reversed_secret}.',
    character: 'Vikram Singaravelan',
    characterImage: '/images/characters/vikram_urgent.png',
    roundLabel: 'ROUND 2  INFILTRATION',
  },
  {
    order: 6, round: 2, level: '2.3',
    name: 'The Pattern Lock',
    type: 'CRYPTOGRAPHY', difficulty: 'hard', points: 350,
    storyAct: 'ROUND 2 FINALE',
    storyTime: '06:15 AM  Final Encrypted Database',
    storyStatus: ' FAROOQ BORDER CROSSING IN 3 HOURS',
    situation: 'The final database — containing the BLACKOUT worm payload and Feb 14 activation details — has a team-specific pattern lock. Saif designed it so teams cannot share answers. Althaf is demanding the database cracked before Farooq leaves India.',
    intel: '"This lock is unique to your team. SHA-256 of your team name + progress number + salt. First 8 chars of the hash. No shared answers exist. Calculate yours and unlock Operation BLACKOUT\'s full blueprint."',
    objective: 'SHA256(teamName + "5" + "CIPHER2026"). First 8 chars. Submit CTF{first8chars}.',
    character: 'Deputy NSA Althaf',
    characterImage: '/images/characters/althaf_concerned.png',
    roundLabel: 'ROUND 2  INFILTRATION',
  },
  {
    order: 7, round: 3, level: '3.1',
    name: 'The Payload Hunt',
    type: 'REVERSE ENG', difficulty: 'hard', points: 400,
    storyAct: 'ACT IV — ESCAPE PHASE',
    storyTime: '07:10 AM  BLACKOUT Payload Analysis',
    storyStatus: ' VEERA INJURED  FAROOQ CROSSED BORDER',
    situation: 'Veera was captured but escaped with help from Aparna — the Home Minister\'s daughter who chose the right side. The BLACKOUT payload is split across four encoding methods. Decoding it reveals the exact activation mechanism, necessary to build the kill switch.',
    intel: '"Four fragments. Binary, Hex, Base64, ROT13. Decode each one separately, then combine in exact order — Fragment 1 + 2 + 3 + 4. Understand the payload or we cannot build the kill switch."',
    objective: 'Decode 4 fragments (Binary, Hex, Base64, ROT13). Concatenate in order. Submit combined flag.',
    character: 'Veera Raghavan',
    characterImage: '/images/characters/veera_concerned.png',
    roundLabel: 'ROUND 3  FINAL STRIKE',
  },
  {
    order: 8, round: 3, level: '3.2',
    name: 'The Logic Bomb Defusal',
    type: 'NESTED DECODE', difficulty: 'hard', points: 450,
    storyAct: 'ROUND 3 CRITICAL',
    storyTime: '07:35 AM  Script Defusal Window',
    storyStatus: ' LOGIC BOMB TRIGGER IN 10 MINUTES',
    situation: 'A logic bomb is embedded in Saif\'s attack script. If it triggers, Operation BLACKOUT goes live immediately — 13 days early. The defusal sequence is 5 encoding layers deep and ends with a mathematical validity check. One wrong step and 50,000 jobs vanish tonight.',
    intel: '"Five layers. Follow in order: Hex → Base64 → ROT13 → Binary → ASCII. The final decoded output is the submit-ready flag text. One wrong step triggers the bomb."',
    objective: 'Decode in order: Hex → Base64 → ROT13 → Binary → ASCII and submit the final CTF{...} output.',
    character: 'Vikram Singaravelan',
    characterImage: '/images/characters/vikram_serious.png',
    roundLabel: 'ROUND 3  FINAL STRIKE',
  },
  {
    order: 9, round: 3, level: '3.3',
    name: 'The Master Vault',
    type: 'FINAL BOSS', difficulty: 'hard', points: 1000,
    storyAct: 'EPILOGUE — OPERATION COMPLETE',
    storyTime: '08:00 AM  Saravana\'s Encrypted Server',
    storyStatus: ' HOSTAGES FREED  ONE TARGET REMAINS',
    situation: 'Veera recaptured Farooq in Pakistan and extracted the name of the cyber-mastermind: Saravana "The Phantom". A joint RAW-Police raid seized his server. The MASTER KILL SWITCH for Operation BLACKOUT is inside — but the vault uses every technique you have learned.',
    intel: '"Everything leads here: decode layer1 hex, decode Base64 JSON, extract JWT token, decode payload, and ROT13 the vault_key. That 6-character code is the master key."',
    objective: 'Decode all layers in order and submit exactly as: CTF{MASTER_code_VAULT}.',
    character: 'Veera Raghavan',
    characterImage: '/images/characters/veera_relieved.png',
    roundLabel: 'ROUND 3  FINAL STRIKE',
  },
];

const ROUND_CONFIG: Record<number, { badge: string; primary: string; glow: string; border: string }> = {
  1: { badge: 'round-1', primary: '#ef4444', glow: 'rgba(239,68,68,0.35)', border: 'rgba(239,68,68,0.45)' },
  2: { badge: 'round-2', primary: '#f59e0b', glow: 'rgba(245,158,11,0.35)', border: 'rgba(245,158,11,0.45)' },
  3: { badge: 'round-3', primary: '#10b981', glow: 'rgba(16,185,129,0.35)', border: 'rgba(16,185,129,0.45)' },
};

const HOSTAGE: Record<number, number> = { 1: 0, 2: 20, 3: 250, 4: 480, 5: 680, 6: 920, 7: 1115, 8: 1180, 9: 1200 };

interface ApiResponse {
  challenge: {
    id: string; title: string; description: string;
    storyContext: string; characterMessage: string;
    points: number; difficulty: string; order: number;
    hints?: string; hintPenalty?: number;
  } | null;
  progress: {
    currentLevel: number; totalLevels: number;
    attemptsUsed: number; maxAttempts: number | null;
    isSolved: boolean; completedAll?: boolean;
  };
  team: { name: string; currentPoints: number };
}

export default function ChallengesPage() {
  const router = useRouter();
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [flag, setFlag] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState('');
  const [showHintConfirm, setShowHintConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [revealingHint, setRevealingHint] = useState(false);
  const [activity, setActivity] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineFillRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);
  const charRef = useRef<HTMLDivElement | null>(null);
  const prevLevelRef = useRef<string | null>(null);

  const currentLevel = apiResponse?.progress?.currentLevel ?? 1;
  const totalLevels = apiResponse?.progress?.totalLevels ?? 9;

  const formatPayloadText = (rawText: string) =>
    rawText
      .replace(/\r\n/g, '\n')
      .replace(/```/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .trim();

  const getState = (order: number): 'solved' | 'active' | 'locked' => {
    if (order < currentLevel) return 'solved';
    if (order === currentLevel) return 'active';
    return 'locked';
  };

  const loadData = useCallback(async () => {
    try {
      const [ch, act] = await Promise.all([
        api.challenges.getCurrent(),
        api.challenges.getActivity().catch(() => []),
      ]);
      setApiResponse(ch);
      setActivity(Array.isArray(act) ? act.slice(0, 15) : []);
      if (!selectedLevel) {
        const lvl = ch?.progress?.currentLevel ?? 1;
        setSelectedLevel(MISSIONS[Math.min(lvl, 9) - 1]?.level ?? '1.1');
      }
    } catch {
      if (!selectedLevel) setSelectedLevel('1.1');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    loadData();
  }, [router, loadData]);

  useEffect(() => {
    const valid = cardRefs.current.filter(Boolean);
    if (valid.length > 0 && !loading) {
      gsap.fromTo(valid, { opacity: 0, x: -14 }, { opacity: 1, x: 0, stagger: 0.04, duration: 0.28, ease: 'power2.out' });
    }
  }, [loading]);

  useEffect(() => {
    if (!timelineFillRef.current) return;
    const solved = Math.max(0, Math.min(currentLevel - 1, totalLevels));
    const pct = totalLevels <= 1 ? 100 : (solved / (totalLevels - 1)) * 100;
    gsap.to(timelineFillRef.current, { height: `${pct}%`, duration: 0.5, ease: 'power2.out' });
  }, [currentLevel, totalLevels]);

  useEffect(() => {
    if (prevLevelRef.current === selectedLevel) return;
    prevLevelRef.current = selectedLevel;
    if (centerRef.current) gsap.fromTo(centerRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.26, ease: 'power2.out' });
    if (charRef.current) gsap.fromTo(charRef.current, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.32, ease: 'back.out(1.3)' });
    setShowHint(false);
    setMessage('');
  }, [selectedLevel]);

  const meta = selectedLevel ? MISSIONS.find(m => m.level === selectedLevel) : null;
  const state = meta ? getState(meta.order) : 'locked';
  const rc = ROUND_CONFIG[meta?.round ?? 1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cid = apiResponse?.challenge?.id;
    if (!flag.trim() || !cid) return;
    setSubmitting(true); setMessage('');
    try {
      const res = await api.challenges.submitFlag({ challengeId: cid, flag: flag.trim() });
      if (res.correct || res.success || res.isCorrect) {
        setMessage(' Flag accepted. Mission progressed.');
        setIsError(false); setFlag(''); setShowHint(false);
        setSelectedLevel(null);
        await loadData();
      } else {
        setMessage(res.message || 'Incorrect flag. Analyse and retry.');
        setIsError(true);
      }
    } catch (err: any) {
      setMessage(err.message || 'Submission failed.');
      setIsError(true);
    } finally { setSubmitting(false); }
  };

  const confirmHint = async () => {
    const cid = apiResponse?.challenge?.id;
    if (!cid) return;
    setRevealingHint(true);
    try {
      const res = await api.challenges.useHint(cid);
      setHintText(res.hint || '');
      setShowHint(true); setShowHintConfirm(false);
      setMessage(res.alreadyUsed ? 'Intel already unlocked.' : `Intel unlocked. ${res.penaltyApplied} pts deducted.`);
      setIsError(false);
      await loadData();
    } catch (err: any) {
      setMessage(err.message || 'Failed to reveal intel.');
      setIsError(true); setShowHintConfirm(false);
    } finally { setRevealingHint(false); }
  };

  if (loading) return (
    <GameLayout backgroundImage="/images/background/2.jpg" showScanlines>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(124,58,237,0.3)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div className="game-label" style={{ color: '#7c3aed', letterSpacing: 4 }}>DECRYPTING MISSION DATA</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </GameLayout>
  );

  const rescued = HOSTAGE[meta?.order ?? 1] ?? 0;
  const rescuePct = Math.round((rescued / 1200) * 100);

  return (
    <GameLayout backgroundImage="/images/background/2.jpg" showScanlines>
      {/* Grid overlay */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.022, zIndex: 1, pointerEvents: 'none' }}>
        <defs><pattern id="cg" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0 L0 0 0 60" fill="none" stroke="#7c3aed" strokeWidth="0.5" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#cg)" />
      </svg>

      <div style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '272px 1fr 288px', height: '100%', overflow: 'hidden' }}>

        {/*  LEFT: MISSION TIMELINE  */}
        <div className="game-scroll" style={{ borderRight: '1px solid rgba(109,40,217,0.2)', padding: '16px 12px', background: 'rgba(3,1,14,0.84)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ marginBottom: 12 }}>
            <div className="game-label" style={{ color: '#06b6d4', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <RadioTower size={10} />MISSION TIMELINE
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="status-dot active" />
              <span style={{ color: '#a78bfa', fontSize: 10, letterSpacing: 1, fontWeight: 600 }}>
                {Math.max(currentLevel - 1, 0)} / {totalLevels} COMPLETE
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ height: 3, background: 'rgba(109,40,217,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round(((currentLevel - 1) / 9) * 100)}%`, background: 'linear-gradient(90deg,#7c3aed,#06b6d4)', transition: 'width 0.5s ease', boxShadow: '0 0 8px rgba(6,182,212,0.4)' }} />
            </div>
          </div>

          {/* Vertical timeline */}
          <div style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'absolute', top: 10, bottom: 10, left: 10, width: 2, background: 'rgba(55,65,81,0.4)' }} />
            <div ref={timelineFillRef} style={{ position: 'absolute', top: 10, left: 10, width: 2, height: '0%', background: 'linear-gradient(180deg,#7c3aed,#06b6d4)', boxShadow: '0 0 10px rgba(124,58,237,0.7)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {MISSIONS.map((m, i) => {
                const s = getState(m.order);
                const sel = selectedLevel === m.level;
                const can = s !== 'locked';
                const rc2 = ROUND_CONFIG[m.round];
                return (
                  <div
                    key={m.level}
                    ref={el => { cardRefs.current[i] = el; }}
                    onClick={() => can && setSelectedLevel(m.level)}
                    style={{
                      position: 'relative', marginLeft: 26,
                      padding: '8px 9px 8px 10px', borderRadius: 8,
                      cursor: can ? 'pointer' : 'default',
                      border: `1px solid ${sel ? 'rgba(6,182,212,0.55)' : s === 'solved' ? 'rgba(16,185,129,0.28)' : s === 'active' ? 'rgba(124,58,237,0.38)' : 'rgba(55,65,81,0.28)'}`,
                      background: sel ? 'rgba(6,182,212,0.06)' : s === 'solved' ? 'rgba(16,185,129,0.04)' : s === 'active' ? 'rgba(109,40,217,0.09)' : 'rgba(6,3,18,0.7)',
                      opacity: s === 'locked' ? 0.35 : 1,
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div style={{ position: 'absolute', top: 11, left: -17, width: 10, height: 10, borderRadius: '50%', background: s === 'solved' ? '#10b981' : s === 'active' ? '#7c3aed' : '#374151', border: `2px solid ${s === 'solved' ? '#6ee7b7' : s === 'active' ? '#a78bfa' : '#4b5563'}`, boxShadow: s === 'active' ? '0 0 12px rgba(124,58,237,0.9)' : s === 'solved' ? '0 0 8px rgba(16,185,129,0.6)' : 'none' }} />
                    <div style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 2, borderRadius: 2, background: rc2.primary, opacity: sel || s === 'active' ? 1 : 0.3 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                      {s === 'solved' ? <CheckCircle size={10} color="#10b981" /> : s === 'active' ? <Zap size={10} color="#a78bfa" /> : <Lock size={10} color="#4b5563" />}
                      <span style={{ fontWeight: 800, fontSize: 10, color: '#cbd5e1' }}>{m.level}</span>
                      <span className={`diff-badge diff-${m.difficulty}`} style={{ fontSize: 7, padding: '1px 4px' }}>{m.difficulty[0].toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: 10, color: sel ? '#e2e8f0' : '#9ca3af', lineHeight: 1.3, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ marginTop: 2, color: '#f59e0b', fontSize: 9, fontWeight: 700 }}>{m.points} pts  {m.type}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/*  CENTER: CHALLENGE CONTENT  */}
        <div className="game-scroll" ref={centerRef} style={{ overflowY: 'auto', padding: '18px 20px 24px', display: 'flex', flexDirection: 'column', gap: 13 }}>

          {/* Victory banner */}
          {apiResponse?.progress?.completedAll && (
            <div style={{ background: 'linear-gradient(135deg,rgba(6,78,59,0.28),rgba(16,185,129,0.1))', border: '2px solid rgba(16,185,129,0.55)', borderRadius: 14, padding: '20px 24px', textAlign: 'center', boxShadow: '0 0 50px rgba(16,185,129,0.18)' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}></div>
              <div className="game-title" style={{ color: '#6ee7b7', fontSize: 17, marginBottom: 6, textShadow: '0 0 28px rgba(16,185,129,0.8)' }}>OPERATION BLACKOUT — TERMINATED</div>
              <p style={{ color: '#a7f3d0', fontSize: 12, lineHeight: 1.7 }}>All 9 missions complete. Saravana arrested. The malware is destroyed. 50,000 jobs saved. Coimbatore is safe.</p>
              <div style={{ marginTop: 10, color: '#34d399', fontWeight: 700, fontSize: 13 }}>FINAL SCORE: {apiResponse.team.currentPoints.toLocaleString()} pts</div>
            </div>
          )}

          {meta ? (
            <>
              {/* Top badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className={`round-badge ${rc.badge}`}>{meta.roundLabel}</span>
                <span className={`diff-badge diff-${meta.difficulty}`}>{meta.difficulty}</span>
                <span style={{ color: '#6b7280', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{meta.type}</span>
                <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 800 }}>{meta.points} pts</span>
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: state === 'solved' ? '#10b981' : state === 'active' ? '#a78bfa' : '#4b5563' }}>
                  {state === 'solved' ? <CheckCircle size={12} /> : state === 'active' ? <Zap size={12} /> : <Lock size={12} />}
                  {state.toUpperCase()}
                </span>
              </div>

              {/* Title */}
              <div>
                <div style={{ color: '#4b5563', fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 3 }}>{meta.storyAct}</div>
                <h1 style={{ fontSize: 19, fontWeight: 900, color: '#e9d5ff', letterSpacing: 2, textTransform: 'uppercase', lineHeight: 1.2, margin: 0 }}>{meta.level} — {meta.name}</h1>
              </div>

              {/* Character briefing card */}
              <div ref={charRef} style={{ display: 'grid', gridTemplateColumns: '152px 1fr', gap: 14, background: 'linear-gradient(135deg,rgba(2,1,12,0.97),rgba(12,7,36,0.96))', border: `1px solid ${rc.border}`, borderRadius: 13, padding: '13px 16px', boxShadow: `0 0 38px ${rc.glow}`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${rc.primary},transparent)` }} />
                <div style={{ position: 'relative', height: 200, borderRadius: 9, overflow: 'hidden', border: `1px solid ${rc.border}`, background: 'rgba(0,0,0,0.35)' }}>
                  <Image src={meta.characterImage} alt={meta.character} fill style={{ objectFit: 'cover', objectPosition: 'top center' }} priority />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(0deg,rgba(2,1,12,0.96) 55%,transparent)', padding: '18px 8px 7px' }}>
                    <div style={{ color: rc.primary, fontSize: 8, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>OPERATIVE</div>
                    <div style={{ color: '#e2e8f0', fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>{meta.character}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                      <Clock size={10} color="#6b7280" />
                      <span style={{ color: '#6b7280', fontSize: 10 }}>{meta.storyTime}</span>
                    </div>
                    <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '5px 9px', marginBottom: 7 }}>
                      <div style={{ color: '#fca5a5', fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>{meta.storyStatus}</div>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ color: '#6b7280', fontSize: 8, letterSpacing: 2, fontWeight: 700 }}>HOSTAGE RESCUE</span>
                        <span style={{ color: rescuePct === 100 ? '#10b981' : '#f59e0b', fontSize: 8, fontWeight: 700 }}>{rescued} / 1,200</span>
                      </div>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${rescuePct}%`, background: 'linear-gradient(90deg,#7c3aed,#10b981)', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(109,40,217,0.07)', border: '1px solid rgba(109,40,217,0.22)', borderRadius: 8, padding: '9px 11px', fontStyle: 'italic', color: '#d4c0ff', fontSize: 12, lineHeight: 1.6 }}>
                    {meta.intel}
                  </div>
                </div>
              </div>

              {/* Situation */}
              <div style={{ background: 'rgba(3,1,14,0.7)', border: '1px solid rgba(109,40,217,0.18)', borderRadius: 10, padding: '13px 16px' }}>
                <div className="game-label" style={{ color: '#4b5563', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Shield size={9} />SITUATION REPORT
                </div>
                <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.75, margin: 0 }}>{meta.situation}</p>
              </div>

              {/* Payload */}
              <div className="game-panel-bordered" style={{ padding: '14px 18px' }}>
                <div className="game-label" style={{ color: '#06b6d4', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Terminal size={10} />CIPHER PAYLOAD
                </div>
                <p style={{ color: '#c4b5fd', fontSize: 12, lineHeight: 1.7, marginBottom: 9 }}>
                  <strong style={{ color: '#a78bfa' }}>Objective:</strong> {meta.objective}
                </p>
                {state === 'active' && (
                  <div className="game-scroll" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(109,40,217,0.18)', borderRadius: 7, padding: '12px 14px', fontFamily: "'Courier New',monospace", fontSize: 11, color: '#9ca3af', lineHeight: 1.8, whiteSpace: 'pre-wrap', maxHeight: 220, overflowY: 'auto' }}>
                    {apiResponse?.challenge?.description
                      ? formatPayloadText(apiResponse.challenge.description)
                      : 'Loading payload data...'}
                  </div>
                )}
                {state === 'solved' && (
                  <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.28)', borderRadius: 7, padding: '11px 14px', color: '#6ee7b7', fontSize: 11, fontFamily: "'Courier New',monospace", display: 'flex', alignItems: 'center', gap: 7 }}>
                    <CheckCircle size={13} />Payload decoded and archived. Mission complete.
                  </div>
                )}
                {state === 'locked' && (
                  <div style={{ background: 'rgba(55,65,81,0.12)', border: '1px solid rgba(55,65,81,0.28)', borderRadius: 7, padding: '11px 14px', color: '#4b5563', fontSize: 11, fontFamily: "'Courier New',monospace", display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Lock size={13} />Payload encrypted until prior mission is solved.
                  </div>
                )}
                {state === 'active' && apiResponse?.challenge?.hints && (
                  <div style={{ marginTop: 10 }}>
                    <button onClick={() => showHint ? setShowHint(false) : setShowHintConfirm(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'rgba(109,40,217,0.09)', border: '1px solid rgba(109,40,217,0.3)', borderRadius: 6, cursor: 'pointer', color: '#c4b5fd', fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
                      <Eye size={11} />{showHint ? 'HIDE INTEL' : 'REVEAL INTEL'}
                    </button>
                    {showHint && hintText && (
                      <div className="game-alert-info" style={{ marginTop: 8 }}>
                        <strong style={{ color: '#a78bfa' }}>MISSION INTEL:</strong> {hintText}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Flag submit */}
              {state === 'active' && (
                <div className="game-panel-bordered" style={{ padding: '16px 18px' }}>
                  <div className="game-label" style={{ color: '#a78bfa', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Flag size={10} />SUBMIT INTELLIGENCE
                  </div>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 9 }}>
                    <input className="game-input" type="text" placeholder="CTF{your_decoded_flag_here}" value={flag} onChange={e => setFlag(e.target.value)} disabled={submitting} style={{ flex: 1, fontSize: 13 }} />
                    <button type="submit" className="btn-game-primary" disabled={submitting || !flag.trim() || !apiResponse?.challenge?.id} style={{ opacity: submitting || !flag.trim() || !apiResponse?.challenge?.id ? 0.5 : 1, whiteSpace: 'nowrap', padding: '12px 18px', fontSize: 12 }}>
                      {submitting ? 'Transmitting...' : <><Flag size={12} style={{ marginRight: 5 }} />Submit</>}
                    </button>
                  </form>
                  {apiResponse?.progress?.maxAttempts && (
                    <div style={{ marginTop: 5, color: '#4b5563', fontSize: 9, letterSpacing: 1 }}>ATTEMPTS: {apiResponse.progress.attemptsUsed} / {apiResponse.progress.maxAttempts}</div>
                  )}
                  {message && (
                    <div className={isError ? 'game-alert-error' : 'game-alert-success'} style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
                      {isError ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}{message}
                    </div>
                  )}
                </div>
              )}
              {state === 'solved' && <div className="game-alert-success" style={{ display: 'flex', alignItems: 'center', gap: 7 }}><CheckCircle size={13} />Mission complete. Proceed to the next unlocked level.</div>}
              {state === 'locked' && <div className="game-alert-info" style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Lock size={13} />This mission is locked until the active level is solved.</div>}
            </>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: '#4b5563' }}>
                <Crosshair size={36} style={{ margin: '0 auto 10px', opacity: 0.35 }} />
                <div style={{ fontSize: 12 }}>Select a mission from the timeline.</div>
              </div>
            </div>
          )}
        </div>

        {/*  RIGHT: LIVE OPS  */}
        <div className="game-scroll" style={{ borderLeft: '1px solid rgba(109,40,217,0.2)', padding: '16px 13px', overflowY: 'auto', background: 'rgba(3,1,14,0.84)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', gap: 13 }}>
          {/* Team stats */}
          <div style={{ background: 'linear-gradient(135deg,rgba(109,40,217,0.11),rgba(109,40,217,0.04))', border: '1px solid rgba(109,40,217,0.28)', borderRadius: 11, padding: '13px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#7c3aed,#06b6d4)' }} />
            <div className="game-label" style={{ color: '#6b7280', marginBottom: 7, fontSize: 8 }}>TEAM STATUS</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#e2e8f0', lineHeight: 1 }}>{Math.max(currentLevel - 1, 0)}<span style={{ color: '#4b5563', fontSize: 14 }}> / {totalLevels}</span></div>
            <div style={{ color: '#6b7280', fontSize: 10, marginTop: 1, marginBottom: 9 }}>missions solved</div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.round(((currentLevel - 1) / totalLevels) * 100)}%` }} /></div>
            <div style={{ marginTop: 9, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: 9 }}>SCORE</span>
              <span style={{ color: '#fbbf24', fontSize: 13, fontWeight: 800 }}>{(apiResponse?.team?.currentPoints ?? 0).toLocaleString()} pts</span>
            </div>
          </div>

          {/* Cast grid */}
          <div>
            <div className="game-label" style={{ color: '#06b6d4', marginBottom: 7, fontSize: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Skull size={8} />OPERATIVE CAST
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 3 }}>
              {[
                '/images/characters/veera_determined.png',
                '/images/characters/veera_intense.png',
                '/images/characters/vikram_urgent.png',
                '/images/characters/vikram_serious.png',
                '/images/characters/althaf_commanding.png',
                '/images/characters/althaf_concerned.png',
                '/images/characters/preethi_hopeful.png',
                '/images/characters/umar_angry.png',
              ].map(img => (
                <div key={img} style={{ position: 'relative', paddingBottom: '130%', borderRadius: 5, overflow: 'hidden', border: '1px solid rgba(109,40,217,0.22)', background: 'rgba(0,0,0,0.35)' }}>
                  <Image src={img} alt="" fill style={{ objectFit: 'cover', objectPosition: 'top' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Live feed */}
          <div style={{ flex: 1 }}>
            <div className="game-label" style={{ color: '#a78bfa', marginBottom: 7, fontSize: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Activity size={8} />LIVE OPS FEED
            </div>
            {activity.length === 0 ? (
              <div style={{ color: '#374151', fontSize: 11, textAlign: 'center', padding: '20px 0', border: '1px dashed rgba(55,65,81,0.35)', borderRadius: 9 }}>
                <RadioTower size={20} style={{ margin: '0 auto 7px', opacity: 0.25 }} />
                No transmissions yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {activity.map((item: any, i: number) => (
                  <div key={i} style={{ padding: '8px 10px', background: 'rgba(8,5,22,0.7)', border: '1px solid rgba(55,65,81,0.28)', borderRadius: 7, borderLeft: `2px solid ${item.actionType === 'SOLVED' ? '#10b981' : item.actionType === 'HINT_USED' ? '#f59e0b' : '#7c3aed'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ color: '#e2e8f0', fontSize: 10, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>{item.teamName || 'Team'}</span>
                      <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: 1, color: item.actionType === 'SOLVED' ? '#10b981' : item.actionType === 'HINT_USED' ? '#f59e0b' : '#a78bfa' }}>{item.actionType}</span>
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 9, lineHeight: 1.4, marginBottom: 1 }}>{item.storyMessage || item.challengeTitle || 'Operation update'}</div>
                    <div style={{ color: (item.points ?? 0) >= 0 ? '#6ee7b7' : '#fca5a5', fontSize: 9, fontWeight: 700 }}>{(item.points ?? 0) >= 0 ? '+' : ''}{item.points ?? 0} pts</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Op status */}
          <div style={{ background: 'rgba(5,2,18,0.8)', border: '1px solid rgba(55,65,81,0.28)', borderRadius: 9, padding: '11px' }}>
            <div className="game-label" style={{ color: '#4b5563', marginBottom: 7, fontSize: 8 }}>OPERATION STATUS</div>
            {[
              { label: 'CODISSIA MALL', val: currentLevel >= 9 ? 'SECURED' : 'ACTIVE SIEGE', c: currentLevel >= 9 ? '#10b981' : '#ef4444' },
              { label: 'OP BLACKOUT', val: currentLevel >= 9 ? 'TERMINATED' : 'ARMED FEB 14', c: currentLevel >= 9 ? '#10b981' : '#f59e0b' },
              { label: 'UMAR SAIF', val: currentLevel >= 8 ? 'NEUTRALIZED' : 'HOSTILE', c: currentLevel >= 8 ? '#10b981' : '#ef4444' },
            ].map(x => (
              <div key={x.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#6b7280', fontSize: 8, letterSpacing: 1 }}>{x.label}</span>
                <span style={{ color: x.c, fontSize: 8, fontWeight: 700 }}>{x.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hint confirm modal */}
      {showHintConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.76)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="game-panel-bordered" style={{ width: 420, maxWidth: '90vw', padding: '22px 22px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ margin: 0, color: '#e9d5ff', fontSize: 16, fontWeight: 900, letterSpacing: 2 }}>REVEAL INTEL?</h3>
              <button onClick={() => setShowHintConfirm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 3 }}><X size={14} /></button>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, marginBottom: 12 }}>Mission intelligence will be revealed immediately. Your team score will be permanently reduced.</p>
            <div className="game-alert-error" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
              <AlertTriangle size={12} />Score penalty: {apiResponse?.challenge?.hintPenalty ?? 50} points
            </div>
            <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
              <button className="btn-game-secondary" style={{ padding: '8px 14px', fontSize: 11 }} onClick={() => setShowHintConfirm(false)}>Abort</button>
              <button className="btn-game-danger" style={{ padding: '8px 14px', fontSize: 11 }} onClick={confirmHint} disabled={revealingHint}>
                {revealingHint ? 'Applying...' : <><Eye size={11} style={{ marginRight: 4 }} />Reveal Intel</>}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </GameLayout>
  );
}
