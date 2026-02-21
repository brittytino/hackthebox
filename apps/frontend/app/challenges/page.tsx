'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { api } from '@/lib/api';
import {
  Flag, Lock, CheckCircle, Zap, AlertTriangle, Eye, EyeOff,
  Terminal, Activity, Shield, Clock, X, Map, Users,
  RadioTower, ChevronDown, ChevronUp, Trophy,
  ChevronsLeft, ChevronsRight, ChevronRight, SkipForward,
} from 'lucide-react';

interface MissionMeta {
  order: number; round: number; level: string;
  name: string; type: string;
  difficulty: 'easy' | 'medium' | 'hard'; points: number;
  storyAct: string; storyTime: string; storyStatus: string;
  situation: string;
  intel: string;
  character: string;
  characterImage: string;
  roundLabel: string;
}

/* ─── STORY COMPLETION SCENES ──────────────────────────────────────────── */
const COMPLETION_STORIES: Record<number, {
  title: string; quote: string; subtext: string;
  character: string; characterImage: string;
  bgColor: string; accentColor: string; bgImage: string;
}> = {
  1: { title: 'TRANSMISSION DECODED', quote: '"Command center located — east wing, sub-level 3. Vikram, route the team. We move in 5 minutes."', subtext: 'Server Room ER-42 is the next target. The fragmented access codes await.', character: 'Veera Raghavan', characterImage: '/images/characters/veera_determined.png', bgColor: 'rgba(239,68,68,0.12)', accentColor: '#ef4444', bgImage: '/images/background/1.jpg' },
  2: { title: 'ACCESS CODES ASSEMBLED', quote: '"ER-42 is open. Move, Veera — the patrol returns in 4 minutes. The biometric vault is on sub-level 2."', subtext: 'The time-locked vault holds the complete attack blueprint.', character: 'Vikram Singaravelan', characterImage: '/images/characters/vikram_serious.png', bgColor: 'rgba(234,179,8,0.12)', accentColor: '#f59e0b', bgImage: '/images/background/2.jpg' },
  3: { title: 'VAULT CRACKED — ROUND 1 COMPLETE', quote: '"Attack plans retrieved. The second target is the power grid. Three encrypted databases are our next hurdle."', subtext: 'Round 1 complete. The Infiltration phase begins now.', character: 'Deputy NSA Althaf', characterImage: '/images/characters/althaf_commanding.png', bgColor: 'rgba(16,185,129,0.12)', accentColor: '#10b981', bgImage: '/images/background/3.jpg' },
  4: { title: 'HASH TRAIL BROKEN', quote: '"Databases cracked. Farooq release is blocked. The government has hard evidence. But Saif knows we\'re inside."', subtext: 'The JWT admin token holds the next layer of proof.', character: 'Veera Raghavan', characterImage: '/images/characters/veera_intense.png', bgColor: 'rgba(239,68,68,0.12)', accentColor: '#ef4444', bgImage: '/images/background/4.jpg' },
  5: { title: 'ADMIN ACCESS SECURED', quote: '"Logs confirmed — the minister\'s wife execution was theater. The government is being blackmailed. This changes everything."', subtext: 'One encrypted database remains. The BLACKOUT payload blueprint is inside.', character: 'Vikram Singaravelan', characterImage: '/images/characters/vikram_urgent.png', bgColor: 'rgba(234,179,8,0.12)', accentColor: '#f59e0b', bgImage: '/images/background/5.jpg' },
  6: { title: 'PATTERN LOCK BROKEN — ROUND 2 COMPLETE', quote: '"Operation BLACKOUT is a worm targeting the city grid. Feb 14. Saravana is the mastermind. We need the kill switch — now."', subtext: 'Round 2 complete. The Final Strike begins.', character: 'Deputy NSA Althaf', characterImage: '/images/characters/althaf_concerned.png', bgColor: 'rgba(16,185,129,0.12)', accentColor: '#10b981', bgImage: '/images/background/6.jpg' },
  7: { title: 'PAYLOAD DECODED', quote: '"Now we understand the attack mechanism. Aparna handed us the fragments. The kill switch components are in two final systems."', subtext: 'A logic bomb guards the next layer. One wrong step activates BLACKOUT early.', character: 'Veera Raghavan', characterImage: '/images/characters/veera_concerned.png', bgColor: 'rgba(239,68,68,0.12)', accentColor: '#ef4444', bgImage: '/images/background/7.jpg' },
  8: { title: 'LOGIC BOMB NEUTRALISED', quote: '"Bomb dead. Mall siege ended. Saif is in custody. One target remains — Saravana, The Phantom. The Master Vault holds everything."', subtext: 'Final challenge: The Master Vault. Use every skill you have learned.', character: 'Vikram Singaravelan', characterImage: '/images/characters/vikram_serious.png', bgColor: 'rgba(16,185,129,0.12)', accentColor: '#10b981', bgImage: '/images/background/8.jpg' },
  9: { title: '🎉 OPERATION BLACKOUT — TERMINATED', quote: '"Saravana is arrested. The worm is destroyed. 50,000 jobs saved. Coimbatore is safe. You did it — all of you."', subtext: 'Mission complete. Your team has written history.', character: 'Veera Raghavan', characterImage: '/images/characters/veera_relieved.png', bgColor: 'rgba(16,185,129,0.18)', accentColor: '#10b981', bgImage: '/images/background/9.jpg' },
};

const MISSIONS: MissionMeta[] = [
  {
    order: 1, round: 1, level: '1.1',
    name: 'The Intercepted Transmission',
    type: 'CRYPTOGRAPHY', difficulty: 'easy', points: 100,
    storyAct: 'ACT II — THE SIEGE BEGINS',
    storyTime: '03:47 AM  Basement Server Room',
    storyStatus: ' 1,200 HOSTAGES  NEXT EXECUTION IN 28 MIN',
    situation: 'Veera has gone dark inside the mall and found a backup server room in the basement. He taps the terrorist comms relay and intercepts an encrypted transmission addressed to Saif\'s inner circle. Decode it before they relocate the command center.',
    intel: '"Intercepted a transmission from their encrypted relay. It\'s been through multiple encoding passes — figure out what they used and reverse it. Every second counts."',
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
    situation: 'Vikram\'s cyber unit intercepts three encrypted files from the terrorist relay — the server room access code has been split into fragments. Veera is 50 meters away with armed patrols closing in. He needs the complete code now.',
    intel: '"Three fragments, three different encodings. Identify each, decode them all, and assemble in order — A then B then C. No room for error. Veera is exposed."',
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
    situation: 'Veera reaches the biometric vault inside ER-42. The lock uses a team-personalised mathematical formula — every team computes a different answer. Anti-sharing security. Inside is Saif\'s full attack blueprint and proof of a second, larger threat.',
    intel: '"Personalised vault lock — your code depends on your team\'s registration data. Compute it precisely or we\'re stuck. I cannot wait."',
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
    situation: 'The hard drive from the vault holds three password-protected databases — sleeper cell identities, financial backers, and the BLACKOUT payload. If Veera can crack these before Farooq is released, the transfer can be blocked.',
    intel: '"Three locked databases, three hashed passwords. Crack them all and assemble the master key. This is the evidence that stops Farooq\'s release."',
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
    situation: 'Veera is inside the admin panel — but the authentication token has been obfuscated to evade scanners. Vikram spotted that the Home Minister\'s "wife execution" was theater staged for compliance. Decode the token to prove the conspiracy.',
    intel: '"The token is encoded and buried inside a wrapper. Strip the layers, find the hidden credential, and reverse it. That\'s our proof the Home Minister is a traitor."',
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
    situation: 'The final database — containing the BLACKOUT worm payload and Feb 14 activation details — has a team-specific lock designed to prevent answer sharing. Althaf demands it cracked before Farooq crosses the border.',
    intel: '"This lock is unique to your team. Compute your personalised code using the formula provided. No shared answers exist. Calculate yours and unlock the BLACKOUT blueprint."',
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
    situation: 'Veera was captured but escaped with help from Aparna — the Home Minister\'s daughter who chose the right side. The BLACKOUT payload is split across four encrypted fragments. Decode them all to understand the activation mechanism and build the kill switch.',
    intel: '"Four fragments, four different encodings. Identify what each one is, decode them, and combine in exact order 1 through 4. We need the full payload to build the kill switch."',
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
    situation: 'A logic bomb is embedded in Saif\'s attack script. If it triggers, Operation BLACKOUT goes live immediately — 13 days early. The defusal code is buried under multiple nested encoding layers. One wrong step and 50,000 jobs vanish tonight.',
    intel: '"Multiple encoding layers protecting the defusal code. Strip every layer carefully until you reach the plaintext. The fully decoded output is what you submit."',
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
    situation: 'Veera recaptured Farooq and extracted the name of the cyber-mastermind: Saravana "The Phantom". A joint RAW-Police raid seized his server. The MASTER KILL SWITCH for Operation BLACKOUT is inside — protected by every technique you have encountered.',
    intel: '"This is everything. Every technique, every skill you\'ve learned leads here. The kill switch is buried in that vault. Crack it and this is over. First team wins it all."',
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

function ChallengesInner() {
  const router = useRouter();
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [flag, setFlag] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [showHintConfirm, setShowHintConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [revealingHint, setRevealingHint] = useState(false);
  const [activity, setActivity] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [feedOpen, setFeedOpen] = useState(true);
  const [storyModal, setStoryModal] = useState<{ level: number } | null>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  // Hint cache: maps challengeId → { text, shown }
  const [hintCache, setHintCache] = useState<Record<string, { text: string; shown: boolean }>>({})

  const searchParams = useSearchParams();
  const levelParam = searchParams.get('level');;

  // VN story state
  const [vnDisplayText, setVnDisplayText] = useState('');
  const [vnIsTyping, setVnIsTyping] = useState(false);
  const vnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const vnBgRef = useRef<HTMLDivElement>(null);
  const vnPortraitRef = useRef<HTMLDivElement>(null);
  const vnDialogueRef = useRef<HTMLDivElement>(null);
  const vnNameRef = useRef<HTMLDivElement>(null);

  const centerRef = useRef<HTMLDivElement | null>(null);
  const prevLevelRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentLevel = apiResponse?.progress?.currentLevel ?? 1;
  const totalLevels = apiResponse?.progress?.totalLevels ?? 9;

  const formatPayloadText = (rawText: string) =>
    rawText.replace(/\r\n/g, '\n').replace(/```/g, '').replace(/\*\*(.*?)\*\*/g, '$1').trim();

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
      setActivity(Array.isArray(act) ? act.slice(0, 20) : []);
      if (!selectedLevel) {
        // If URL has ?level=N, use that; otherwise use current level
        if (levelParam) {
          const order = parseInt(levelParam, 10);
          const found = MISSIONS[Math.min(Math.max(order, 1), 9) - 1];
          setSelectedLevel(found?.level ?? '1.1');
        } else {
          const lvl = ch?.progress?.currentLevel ?? 1;
          setSelectedLevel(MISSIONS[Math.min(lvl, 9) - 1]?.level ?? '1.1');
        }
      }
    } catch {
      if (!selectedLevel) setSelectedLevel(levelParam ? MISSIONS[parseInt(levelParam, 10) - 1]?.level ?? '1.1' : '1.1');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    // Redirect admin users to admin panel (they shouldn't play challenges)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.role === 'ADMIN') {
          router.push('/admin');
          return;
        }
      } catch { /* ignore parse errors */ }
    }
    loadData();
  }, [router, loadData]);

  // GSAP entrance animations
  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-g="topbar"]', { y: -48, opacity: 0, duration: 0.5, ease: 'power3.out' });
      gsap.from('[data-g="left"]', { x: -60, opacity: 0, duration: 0.65, ease: 'power3.out', delay: 0.1 });
      gsap.from('[data-g="center"]', { y: 28, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.18 });
      gsap.from('[data-g="right"]', { x: 60, opacity: 0, duration: 0.65, ease: 'power3.out', delay: 0.12 });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  // Reset message/flag on level switch; preserve hints
  useEffect(() => {
    if (prevLevelRef.current === selectedLevel) return;
    prevLevelRef.current = selectedLevel;
    setMessage('');
    setFlag('');
  }, [selectedLevel]);

  const meta = selectedLevel ? MISSIONS.find(m => m.level === selectedLevel) : null;
  const state = meta ? getState(meta.order) : 'locked';
  const rc = ROUND_CONFIG[meta?.round ?? 1];
  const challengeId = apiResponse?.challenge?.id;
  const currentHint = challengeId ? hintCache[challengeId] : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag.trim() || !challengeId) return;
    setSubmitting(true); setMessage('');
    try {
      const res = await api.challenges.submitFlag({ challengeId, flag: flag.trim() });
      if (res.correct || res.success || res.isCorrect) {
        const solvedOrder = meta?.order ?? 0;
        setFlag('');
        // Redirect to story page with challenge context
        router.push(`/story?challenge=${solvedOrder}`);
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
    if (!challengeId) return;
    setRevealingHint(true);
    try {
      const res = await api.challenges.useHint(challengeId);
      const hintText = res.hint || '';
      setHintCache(prev => ({ ...prev, [challengeId]: { text: hintText, shown: true } }));
      setShowHintConfirm(false);
      setMessage(res.alreadyUsed ? 'Intel already unlocked (no further deduction).' : `Intel unlocked. ${res.penaltyApplied} pts deducted.`);
      setIsError(false);
      await loadData();
    } catch (err: any) {
      setMessage(err.message || 'Failed to reveal intel.');
      setIsError(true); setShowHintConfirm(false);
    } finally { setRevealingHint(false); }
  };

  const toggleHintDisplay = () => {
    if (!challengeId) return;
    const existing = hintCache[challengeId];
    if (existing) {
      setHintCache(prev => ({ ...prev, [challengeId]: { ...prev[challengeId], shown: !prev[challengeId].shown } }));
    } else {
      setShowHintConfirm(true);
    }
  };

  // VN story helpers
  const vnTypeText = useCallback((text: string) => {
    setVnDisplayText('');
    setVnIsTyping(true);
    let i = 0;
    if (vnTimerRef.current) clearInterval(vnTimerRef.current);
    vnTimerRef.current = setInterval(() => {
      i++;
      setVnDisplayText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(vnTimerRef.current!);
        setVnIsTyping(false);
      }
    }, 18);
  }, []);

  const vnAnimateScene = useCallback((story: typeof COMPLETION_STORIES[1]) => {
    if (vnBgRef.current) {
      gsap.fromTo(vnBgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.inOut' });
    }
    if (vnPortraitRef.current) {
      gsap.fromTo(vnPortraitRef.current, { opacity: 0, x: 60, scale: 0.95 }, { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: 'power3.out', delay: 0.15 });
    }
    if (vnDialogueRef.current) {
      gsap.fromTo(vnDialogueRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.25 });
    }
    if (vnNameRef.current) {
      gsap.fromTo(vnNameRef.current, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out', delay: 0.3 });
    }
    // Build VN text combining quote + next objective
    const nextMission = MISSIONS[story === COMPLETION_STORIES[9] ? 9 : Object.keys(COMPLETION_STORIES).findIndex(k => COMPLETION_STORIES[Number(k)] === story) + 1];
    vnTypeText(story.quote.replace(/^"|"$/g, ''));
  }, [vnTypeText]);

  // Trigger VN animation when story modal opens
  useEffect(() => {
    if (!storyModal) return;
    const story = COMPLETION_STORIES[storyModal.level];
    if (story) {
      setTimeout(() => vnAnimateScene(story), 50);
    }
    return () => { if (vnTimerRef.current) clearInterval(vnTimerRef.current); };
  }, [storyModal, vnAnimateScene]);

  const handleStoryAdvance = () => {
    if (vnIsTyping) {
      // Complete typing instantly
      if (vnTimerRef.current) clearInterval(vnTimerRef.current);
      const story = COMPLETION_STORIES[storyModal?.level ?? 0];
      if (story) setVnDisplayText(story.quote.replace(/^"|"$/g, ''));
      setVnIsTyping(false);
      return;
    }
    // Navigate to timeline
    setStoryModal(null);
    router.push('/timeline');
  };

  const handleStorySkip = () => {
    if (vnTimerRef.current) clearInterval(vnTimerRef.current);
    setStoryModal(null);
    router.push('/timeline');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080614', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: 'monospace' }}>
      <div style={{ width: 48, height: 48, border: '3px solid rgba(124,58,237,0.3)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ color: '#7c3aed', letterSpacing: 4, fontSize: 12, fontWeight: 700 }}>DECRYPTING MISSION DATA</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const rescued = HOSTAGE[meta?.order ?? 1] ?? 0;
  const rescuePct = Math.round((rescued / 1200) * 100);
  const scored = Math.max(currentLevel - 1, 0);
  const teamPoints = apiResponse?.team?.currentPoints ?? 0;
  const teamName = apiResponse?.team?.name ?? '—';

  return (
    <div ref={containerRef} style={{ height: '100vh', background: '#080614', display: 'flex', flexDirection: 'column', fontFamily: "'Share Tech Mono', 'Courier New', monospace", position: 'relative', overflow: 'hidden' }}>
      {/* Scanlines */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.22),rgba(0,0,0,0.22) 1px,transparent 1px,transparent 3px)', opacity: 0.3 }} />
      {/* Grid bg */}
      <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', opacity: 0.018, zIndex: 0, pointerEvents: 'none' }}>
        <defs><pattern id="cg" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0 L0 0 0 60" fill="none" stroke="#7c3aed" strokeWidth="0.5" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#cg)" />
      </svg>

      {/* ── TOP BAR ── */}
      <div data-g="topbar" style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid rgba(109,40,217,0.25)', background: 'rgba(5,2,18,0.97)', backdropFilter: 'blur(24px)', gap: 14, flexShrink: 0 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', cursor: 'pointer' }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={15} color="#fff" />
          </div>
          <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase' }}>CIPHER OPS</span>
        </Link>
        <div style={{ flex: 1 }} />
        {/* Navigation links */}
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6b7280', fontSize: 12, fontWeight: 700, letterSpacing: 2, textDecoration: 'none', padding: '7px 13px', border: '1px solid rgba(55,65,81,0.4)', borderRadius: 7, transition: 'all 0.15s' }}>
          <Activity size={13} />HQ
        </Link>
        <Link href="/leaderboard" style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6b7280', fontSize: 12, fontWeight: 700, letterSpacing: 2, textDecoration: 'none', padding: '7px 13px', border: '1px solid rgba(55,65,81,0.4)', borderRadius: 7, transition: 'all 0.15s' }}>
          <Trophy size={13} />RANKS
        </Link>
        <Link href="/story" style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6b7280', fontSize: 12, fontWeight: 700, letterSpacing: 2, textDecoration: 'none', padding: '7px 13px', border: '1px solid rgba(55,65,81,0.4)', borderRadius: 7, transition: 'all 0.15s' }}>
          <Map size={13} />STORY
        </Link>
        <div style={{ color: '#6b7280', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ color: '#a78bfa', fontWeight: 700 }}>{scored}</span>/<span>{totalLevels}</span>
          <span style={{ letterSpacing: 2, marginLeft: 2 }}>MISSIONS</span>
        </div>
        <div style={{ width: 1, height: 22, background: 'rgba(109,40,217,0.35)' }} />
        {/* Score badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.38)', borderRadius: 8, padding: '6px 16px' }}>
          <Trophy size={14} color="#fbbf24" />
          <span style={{ color: '#fbbf24', fontWeight: 900, fontSize: 18, letterSpacing: 1 }}>{teamPoints.toLocaleString()}</span>
          <span style={{ color: '#92400e', fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>PTS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'dopulse 2s infinite' }} />
          <span style={{ color: '#94a3b8', fontSize: 11, letterSpacing: 1, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teamName}</span>
        </div>
      </div>

      {/* ── 3-COL LAYOUT ── */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', minHeight: 0, height: 'calc(100vh - 54px)' }}>

        {/* LEFT: ZIG-ZAG TIMELINE (collapsible) */}
        <div data-g="left" style={{ width: leftOpen ? 288 : 48, minWidth: leftOpen ? 288 : 48, borderRight: '1px solid rgba(109,40,217,0.2)', background: 'rgba(3,1,14,0.88)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease, min-width 0.3s ease', overflow: 'hidden', position: 'relative', height: 'calc(100vh - 54px)', flexShrink: 0 }}>
          {/* Toggle button — sits at right edge */}
          <button
            onClick={() => setLeftOpen(o => !o)}
            title={leftOpen ? 'Collapse timeline' : 'Expand timeline'}
            style={{ position: 'absolute', top: '50%', right: -1, transform: 'translateY(-50%)', zIndex: 30, width: 18, height: 64, background: 'linear-gradient(180deg,rgba(109,40,217,0.7),rgba(6,182,212,0.5))', border: 'none', borderRadius: '0 8px 8px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 0 12px rgba(124,58,237,0.5)' }}
          >
            {leftOpen ? <ChevronsLeft size={11} color="#e9d5ff" /> : <ChevronsRight size={11} color="#e9d5ff" />}
          </button>

          {/* Collapsed icon strip */}
          {!leftOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 14, gap: 14 }}>
              <RadioTower size={16} color="#06b6d4" />
              {MISSIONS.map(m => {
                const s = getState(m.order);
                return (
                  <div key={m.level} onClick={() => { setSelectedLevel(m.level); setLeftOpen(true); }}
                    title={m.name}
                    style={{ width: 10, height: 10, borderRadius: '50%', cursor: 'pointer', background: s === 'solved' ? '#10b981' : s === 'active' ? '#7c3aed' : '#374151', boxShadow: s === 'active' ? '0 0 8px #7c3aed' : 'none' }}
                  />
                );
              })}
            </div>
          )}

          {/* Expanded content */}
          {leftOpen && (
            <div className="game-scroll" style={{ overflowY: 'auto', flex: 1, padding: '14px 0' }}>
              <div style={{ padding: '0 14px 8px' }}>
                <div style={{ color: '#06b6d4', fontSize: 12, fontWeight: 700, letterSpacing: 3, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                  <RadioTower size={12} />MISSION TIMELINE
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 6px #a78bfa' }} />
                  <span style={{ color: '#a78bfa', fontSize: 12, letterSpacing: 1, fontWeight: 600 }}>{scored} / {totalLevels} COMPLETE</span>
                </div>
                <div style={{ height: 3, background: 'rgba(109,40,217,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round((scored / 9) * 100)}%`, background: 'linear-gradient(90deg,#7c3aed,#06b6d4)', transition: 'width 0.5s ease', boxShadow: '0 0 6px rgba(6,182,212,0.5)' }} />
                </div>
              </div>

              {/* Zig-zag groups */}
              {[
                { act: 'ROUND 1 — THE BREACH', color: '#fca5a5', rgb: '239,68,68', orders: [1,2,3] },
                { act: 'ROUND 2 — INFILTRATION', color: '#fde68a', rgb: '245,158,11', orders: [4,5,6] },
                { act: 'ROUND 3 — FINAL STRIKE', color: '#6ee7b7', rgb: '16,185,129', orders: [7,8,9] },
              ].map(group => (
                <div key={group.act} style={{ marginTop: 6 }}>
                  <div style={{ padding: '5px 14px 3px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 1, background: `rgba(${group.rgb},0.22)` }} />
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: group.color, whiteSpace: 'nowrap' }}>{group.act}</span>
                    <div style={{ flex: 1, height: 1, background: `rgba(${group.rgb},0.22)` }} />
                  </div>
                  {group.orders.map((order, idx) => {
                    const m = MISSIONS[order - 1];
                    const s = getState(m.order);
                    const sel = selectedLevel === m.level;
                    const can = s !== 'locked';
                    const rc2 = ROUND_CONFIG[m.round];
                    const isAlt = idx % 2 === 1;
                    return (
                      <div key={m.level} style={{ padding: '3px 8px', position: 'relative' }}>
                        <div
                          onClick={() => can && setSelectedLevel(m.level)}
                          style={{
                            marginLeft: isAlt ? 6 : 28, marginRight: isAlt ? 28 : 6,
                            padding: '10px 12px 10px 14px', borderRadius: 10,
                            cursor: can ? 'pointer' : 'default',
                            border: `1px solid ${sel ? 'rgba(6,182,212,0.65)' : s === 'solved' ? 'rgba(16,185,129,0.32)' : s === 'active' ? 'rgba(124,58,237,0.45)' : 'rgba(55,65,81,0.22)'}`,
                            background: sel ? 'rgba(6,182,212,0.09)' : s === 'solved' ? 'rgba(16,185,129,0.05)' : s === 'active' ? 'rgba(109,40,217,0.12)' : 'rgba(6,3,18,0.72)',
                            opacity: s === 'locked' ? 0.37 : 1,
                            transition: 'all 0.18s ease',
                            boxShadow: sel ? `0 0 16px ${rc2.glow}` : 'none',
                            borderLeft: `3px solid ${sel ? '#06b6d4' : s === 'solved' ? '#10b981' : s === 'active' ? '#7c3aed' : '#374151'}`,
                            position: 'relative',
                          }}
                        >
                          {/* Zigzag dot */}
                          <div style={{
                            position: 'absolute', [isAlt ? 'right' : 'left']: -20,
                            top: '50%', transform: 'translateY(-50%)',
                            width: 9, height: 9, borderRadius: '50%',
                            background: s === 'solved' ? '#10b981' : s === 'active' ? '#7c3aed' : '#374151',
                            border: `2px solid ${s === 'solved' ? '#6ee7b7' : s === 'active' ? '#a78bfa' : '#4b5563'}`,
                            boxShadow: s === 'active' ? '0 0 10px rgba(124,58,237,0.9)' : s === 'solved' ? '0 0 6px rgba(16,185,129,0.6)' : 'none',
                            zIndex: 2,
                          }} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                            {s === 'solved' ? <CheckCircle size={12} color="#10b981" /> : s === 'active' ? <Zap size={12} color="#a78bfa" /> : <Lock size={12} color="#4b5563" />}
                            <span style={{ fontWeight: 800, fontSize: 12, color: '#cbd5e1' }}>{m.level}</span>
                            <span className={`diff-badge diff-${m.difficulty}`} style={{ fontSize: 9, padding: '1px 5px' }}>{m.difficulty[0].toUpperCase()}</span>
                          </div>
                          <div style={{ fontSize: 13, color: sel ? '#e2e8f0' : '#9ca3af', lineHeight: 1.35, fontWeight: 600 }}>{m.name}</div>
                          <div style={{ marginTop: 4, color: '#f59e0b', fontSize: 11, fontWeight: 700 }}>{m.points} pts · {m.type}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CENTER: CHALLENGE CONTENT */}
        <div data-g="center" className="game-scroll" ref={centerRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '24px 28px 80px', display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0, height: 'calc(100vh - 54px)' }}>

          {apiResponse?.progress?.completedAll && (
            <div style={{ background: 'linear-gradient(135deg,rgba(6,78,59,0.28),rgba(16,185,129,0.1))', border: '2px solid rgba(16,185,129,0.55)', borderRadius: 14, padding: '24px 28px', textAlign: 'center', boxShadow: '0 0 60px rgba(16,185,129,0.2)' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
              <div className="game-title" style={{ color: '#6ee7b7', fontSize: 20, marginBottom: 8, textShadow: '0 0 28px rgba(16,185,129,0.8)' }}>OPERATION BLACKOUT — TERMINATED</div>
              <p style={{ color: '#a7f3d0', fontSize: 14, lineHeight: 1.7 }}>All 9 missions complete. Saravana arrested. The malware is destroyed. 50,000 jobs saved. Coimbatore is safe.</p>
              <div style={{ marginTop: 14, color: '#34d399', fontWeight: 900, fontSize: 16 }}>FINAL SCORE: {teamPoints.toLocaleString()} pts</div>
            </div>
          )}

          {meta ? (
            <>
              {/* Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className={`round-badge ${rc.badge}`}>{meta.roundLabel}</span>
                <span className={`diff-badge diff-${meta.difficulty}`}>{meta.difficulty}</span>
                <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{meta.type}</span>
                <span style={{ color: '#fbbf24', fontSize: 16, fontWeight: 900 }}>{meta.points} pts</span>
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: state === 'solved' ? '#10b981' : state === 'active' ? '#a78bfa' : '#4b5563', letterSpacing: 1 }}>
                  {state === 'solved' ? <CheckCircle size={14} /> : state === 'active' ? <Zap size={14} /> : <Lock size={14} />}
                  {state.toUpperCase()}
                </span>
              </div>

              {/* Title */}
              <div>
                <div style={{ color: '#6b7280', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 5 }}>{meta.storyAct}</div>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: '#e9d5ff', letterSpacing: 2, textTransform: 'uppercase', lineHeight: 1.2, margin: 0, textShadow: '0 0 30px rgba(124,58,237,0.35)' }}>{meta.level} — {meta.name}</h1>
              </div>

              {/* Character Intel Banner */}
              <div style={{ background: 'linear-gradient(135deg,rgba(2,1,12,0.98),rgba(12,7,36,0.97))', border: `1px solid ${rc.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: `0 0 50px ${rc.glow}, 0 8px 40px rgba(0,0,0,0.6)`, position: 'relative' }}>
                {/* Top accent */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${rc.primary},transparent)`, zIndex: 3 }} />
                {/* Background scene image */}
                <div style={{ position: 'relative', height: 140, overflow: 'hidden', background: `linear-gradient(135deg, rgba(${meta.round===1?'239,68,68':meta.round===2?'245,158,11':'16,185,129'},0.06) 0%, rgba(2,1,12,0.98) 100%)` }}>
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(109,40,217,0.04) 0px,rgba(109,40,217,0.04) 1px,transparent 1px,transparent 14px)' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(2,1,12,0.1) 0%, rgba(2,1,12,0.05) 40%, rgba(2,1,12,0.6) 100%)' }} />
                  {/* Character portrait */}
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 110, overflow: 'hidden' }}>
                    <Image src={meta.characterImage} alt={meta.character} fill style={{ objectFit: 'cover', objectPosition: 'top center', filter: 'drop-shadow(8px 0 16px rgba(0,0,0,0.8))' }} priority />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(2,1,12,0.1), transparent 50%, rgba(2,1,12,0.4) 100%)' }} />
                  </div>
                  {/* Status info overlay */}
                  <div style={{ position: 'absolute', bottom: 0, left: 118, right: 0, padding: '12px 16px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <div style={{ padding: '2px 8px', background: `rgba(${meta.round === 1 ? '239,68,68' : meta.round === 2 ? '245,158,11' : '16,185,129'},0.12)`, border: `1px solid ${rc.border}`, borderRadius: 5, fontSize: 8, fontWeight: 800, color: rc.primary, letterSpacing: 2 }}>OPERATIVE</div>
                      <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 800, letterSpacing: 1 }}>{meta.character}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <Clock size={10} color="#6b7280" />
                      <span style={{ color: '#94a3b8', fontSize: 11 }}>{meta.storyTime}</span>
                    </div>
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, padding: '5px 10px', display: 'inline-block' }}>
                      <span style={{ color: '#fca5a5', fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>{meta.storyStatus}</span>
                    </div>
                  </div>
                </div>
                {/* Hostage rescue bar */}
                <div style={{ padding: '10px 16px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Users size={10} color="#6b7280" />
                      <span style={{ color: '#6b7280', fontSize: 9, letterSpacing: 2, fontWeight: 700 }}>HOSTAGES RESCUED</span>
                    </div>
                    <span style={{ color: rescuePct >= 100 ? '#10b981' : rescuePct >= 60 ? '#f59e0b' : '#ef4444', fontSize: 11, fontWeight: 900 }}>{rescued.toLocaleString()} / 1,200</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ height: '100%', width: `${rescuePct}%`, background: rescuePct >= 100 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#ef4444,#f59e0b,#7c3aed)', transition: 'width 0.8s ease', borderRadius: 3 }} />
                  </div>
                </div>
              </div>

              {/* Situation */}
              <div style={{ background: 'rgba(3,1,14,0.72)', border: '1px solid rgba(109,40,217,0.18)', borderRadius: 12, padding: '16px 20px' }}>
                <div className="game-label" style={{ color: '#6b7280', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                  <Shield size={11} />SITUATION REPORT
                </div>
                <p style={{ color: '#cbd5e1', fontSize: 15, lineHeight: 1.85, margin: 0 }}>{meta.situation}</p>
              </div>

              {/* Cipher payload — raw challenge data only, no how-to hints */}
              <div className="game-panel-bordered" style={{ padding: '18px 22px' }}>
                <div className="game-label" style={{ color: '#06b6d4', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                  <Terminal size={12} />CIPHER PAYLOAD
                </div>
                {state === 'active' && (
                  <div className="game-scroll" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(109,40,217,0.28)', borderRadius: 10, padding: '16px 18px', fontFamily: "'Share Tech Mono','Courier New',monospace", fontSize: 14, color: '#c4b5fd', lineHeight: 1.9, whiteSpace: 'pre-wrap', maxHeight: 320, overflowY: 'auto' }}>
                    {apiResponse?.challenge?.description
                      ? formatPayloadText(apiResponse.challenge.description)
                      : 'Loading payload data...'}
                  </div>
                )}
                {state === 'solved' && (
                  <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '16px 18px', color: '#6ee7b7', fontSize: 14, fontFamily: "'Courier New',monospace", display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle size={16} />Payload decoded and archived. Mission complete.
                  </div>
                )}
                {state === 'locked' && (
                  <div style={{ background: 'rgba(55,65,81,0.12)', border: '1px solid rgba(55,65,81,0.28)', borderRadius: 10, padding: '16px 18px', color: '#6b7280', fontSize: 14, fontFamily: "'Courier New',monospace", display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Lock size={16} />Payload encrypted — complete the active mission to unlock.
                  </div>
                )}

                {/* Hint — persists once unlocked. Intel is behind the reveal button (not free). */}
                {state === 'active' && apiResponse?.challenge?.hints && (
                  <div style={{ marginTop: 14 }}>
                    <button
                      onClick={toggleHintDisplay}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: currentHint ? 'rgba(245,158,11,0.1)' : 'rgba(109,40,217,0.09)', border: `1px solid ${currentHint ? 'rgba(245,158,11,0.42)' : 'rgba(109,40,217,0.3)'}`, borderRadius: 8, cursor: 'pointer', color: currentHint ? '#fbbf24' : '#c4b5fd', fontSize: 12, fontWeight: 700, letterSpacing: 1, transition: 'all 0.15s', fontFamily: 'inherit' }}
                    >
                      {currentHint?.shown ? <EyeOff size={13} /> : <Eye size={13} />}
                      {currentHint ? (currentHint.shown ? 'HIDE INTEL' : 'SHOW INTEL') : 'REVEAL INTEL'}
                      {!currentHint && <span style={{ color: '#ef4444', fontSize: 10, marginLeft: 4 }}>−{apiResponse?.challenge?.hintPenalty ?? 50} pts</span>}
                      {currentHint && <span style={{ color: '#10b981', fontSize: 10, marginLeft: 4 }}>ALREADY UNLOCKED</span>}
                    </button>
                    {currentHint?.shown && currentHint.text && (
                      <div className="game-alert-info" style={{ marginTop: 10, fontSize: 14, lineHeight: 1.8 }}>
                        <strong style={{ color: '#a78bfa', display: 'block', marginBottom: 5, fontSize: 11, letterSpacing: 2 }}>MISSION INTEL:</strong>{currentHint.text}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Flag submit */}
              {state === 'active' && (
                <div style={{ background: 'linear-gradient(135deg,rgba(109,40,217,0.14),rgba(2,1,12,0.98))', border: '1.5px solid rgba(109,40,217,0.45)', borderRadius: 14, padding: '20px 22px', boxShadow: '0 0 50px rgba(109,40,217,0.15), 0 4px 40px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,rgba(167,139,250,0.8),rgba(6,182,212,0.6),transparent)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#5b21b6,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Flag size={13} color="#fff" />
                    </div>
                    <span style={{ color: '#c4b5fd', fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const }}>Submit Intelligence</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 6, padding: '3px 10px' }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 6px #a78bfa', animation: 'dopulse 1.5s infinite' }} />
                      <span style={{ color: '#7c6fa0', fontSize: 9, letterSpacing: 2 }}>AWAITING FLAG</span>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10 }}>
                    <input
                      className="game-input"
                      type="text"
                      placeholder="CTF{your_decoded_flag}"
                      value={flag}
                      onChange={e => setFlag(e.target.value)}
                      disabled={submitting}
                      autoComplete="off"
                      spellCheck={false}
                      style={{ flex: 1, fontSize: 14, letterSpacing: 2, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(109,40,217,0.35)', borderRadius: 9, padding: '13px 16px', color: '#c4b5fd', fontFamily: 'inherit', outline: 'none' }}
                    />
                    <button
                      type="submit"
                      disabled={submitting || !flag.trim() || !challengeId}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '13px 22px',
                        background: submitting || !flag.trim() ? 'rgba(109,40,217,0.25)' : 'linear-gradient(135deg,#5b21b6,#7c3aed)',
                        border: '1px solid rgba(167,139,250,0.4)',
                        borderRadius: 9, cursor: submitting || !flag.trim() ? 'not-allowed' : 'pointer',
                        color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: 2,
                        fontFamily: 'inherit', whiteSpace: 'nowrap',
                        boxShadow: !submitting && flag.trim() ? '0 0 28px rgba(109,40,217,0.4)' : 'none',
                        transition: 'all 0.2s',
                        animation: !submitting && flag.trim() ? 'submitPulse 2s ease-in-out infinite' : 'none',
                      }}
                    >
                      <Flag size={14} />{submitting ? 'SENDING...' : 'TRANSMIT'}
                    </button>
                  </form>
                  {apiResponse?.progress?.maxAttempts && (
                    <div style={{ marginTop: 8, color: '#4b5563', fontSize: 10, letterSpacing: 1 }}>ATTEMPTS: {apiResponse.progress.attemptsUsed} / {apiResponse.progress.maxAttempts}</div>
                  )}
                  {message && (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: isError ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${isError ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: 9, fontSize: 13, color: isError ? '#fca5a5' : '#6ee7b7' }}>
                      {isError ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}{message}
                    </div>
                  )}
                </div>
              )}
              {state === 'solved' && <div className="game-alert-success" style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14 }}><CheckCircle size={16} />Mission complete. Select the next level from the timeline.</div>}
              {state === 'locked' && <div className="game-alert-info" style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14 }}><Lock size={16} />This mission is locked. Solve the active level first.</div>}
            </>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: '#4b5563' }}>
                <RadioTower size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <div style={{ fontSize: 13 }}>Select a mission from the timeline.</div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL (collapsible) */}
        <div data-g="right" style={{ width: rightOpen ? 300 : 48, minWidth: rightOpen ? 300 : 48, borderLeft: '1px solid rgba(109,40,217,0.2)', background: 'rgba(3,1,14,0.88)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease, min-width 0.3s ease', overflow: 'hidden', position: 'relative', height: 'calc(100vh - 54px)', flexShrink: 0 }}>
          {/* Toggle button — left edge */}
          <button
            onClick={() => setRightOpen(o => !o)}
            title={rightOpen ? 'Collapse panel' : 'Expand panel'}
            style={{ position: 'absolute', top: '50%', left: -1, transform: 'translateY(-50%)', zIndex: 30, width: 18, height: 64, background: 'linear-gradient(180deg,rgba(6,182,212,0.5),rgba(109,40,217,0.7))', border: 'none', borderRadius: '8px 0 0 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '-2px 0 12px rgba(6,182,212,0.4)' }}
          >
            {rightOpen ? <ChevronsRight size={11} color="#e9d5ff" /> : <ChevronsLeft size={11} color="#e9d5ff" />}
          </button>

          {/* Collapsed icon strip */}
          {!rightOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, gap: 18 }}>
              <Shield size={16} color="#a78bfa" />
              <Activity size={16} color="#a78bfa" />
              <Trophy size={16} color="#fbbf24" />
            </div>
          )}

          {/* Expanded content */}
          {rightOpen && (
            <div className="game-scroll" style={{ overflowY: 'auto', flex: 1, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Team stats */}
              <div style={{ background: 'linear-gradient(135deg,rgba(109,40,217,0.14),rgba(109,40,217,0.04))', border: '1px solid rgba(109,40,217,0.32)', borderRadius: 12, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#7c3aed,#06b6d4)' }} />
                <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 700, letterSpacing: 3, marginBottom: 7 }}>TEAM STATUS</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: 1 }}>{teamName}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#e2e8f0', lineHeight: 1, marginBottom: 3 }}>{scored}<span style={{ color: '#4b5563', fontSize: 20 }}> / {totalLevels}</span></div>
                <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 10 }}>missions solved</div>
                <div style={{ height: 5, background: 'rgba(109,40,217,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                  <div className="progress-fill" style={{ width: `${Math.round((scored / totalLevels) * 100)}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.22)', borderRadius: 9, padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Trophy size={14} color="#fbbf24" />
                    <span style={{ color: '#6b7280', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>SCORE</span>
                  </div>
                  <span style={{ color: '#fbbf24', fontSize: 20, fontWeight: 900 }}>{teamPoints.toLocaleString()}</span>
                </div>
              </div>

              {/* Op status */}
              <div style={{ background: 'rgba(5,2,18,0.82)', border: '1px solid rgba(55,65,81,0.28)', borderRadius: 11, padding: '14px 16px' }}>
                <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 10 }}>OPERATION STATUS</div>
                {[
                  { label: 'CODISSIA MALL', val: currentLevel >= 9 ? 'SECURED' : 'ACTIVE SIEGE', c: currentLevel >= 9 ? '#10b981' : '#ef4444' },
                  { label: 'OP BLACKOUT', val: currentLevel >= 9 ? 'TERMINATED' : 'ARMED FEB 14', c: currentLevel >= 9 ? '#10b981' : '#f59e0b' },
                  { label: 'UMAR SAIF', val: currentLevel >= 8 ? 'NEUTRALIZED' : 'HOSTILE', c: currentLevel >= 8 ? '#10b981' : '#ef4444' },
                  { label: 'FAROOQ', val: currentLevel >= 7 ? 'RECAPTURED' : 'AT LARGE', c: currentLevel >= 7 ? '#10b981' : '#ef4444' },
                ].map(x => (
                  <div key={x.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#94a3b8', fontSize: 13, letterSpacing: 1 }}>{x.label}</span>
                    <span style={{ color: x.c, fontSize: 13, fontWeight: 700 }}>{x.val}</span>
                  </div>
                ))}
              </div>

              {/* Live Ops Feed — collapsible */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <button
                  onClick={() => setFeedOpen(o => !o)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0 10px', width: '100%', fontFamily: 'inherit' }}
                >
                  <Activity size={11} color="#a78bfa" />
                  <span style={{ color: '#a78bfa', fontSize: 12, fontWeight: 700, letterSpacing: 2, flex: 1, textAlign: 'left' }}>LIVE OPS FEED</span>
                  {feedOpen ? <ChevronUp size={13} color="#6b7280" /> : <ChevronDown size={13} color="#6b7280" />}
                </button>
                {feedOpen && (
                  <div className="game-scroll" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {activity.length === 0 ? (
                      <div style={{ color: '#374151', fontSize: 12, textAlign: 'center', padding: '16px 0', border: '1px dashed rgba(55,65,81,0.35)', borderRadius: 9 }}>
                        <RadioTower size={20} style={{ margin: '0 auto 7px', opacity: 0.25 }} />
                        No transmissions yet.
                      </div>
                    ) : activity.map((item: any, i: number) => (
                      <div key={i} style={{ padding: '10px 13px', background: 'rgba(8,5,22,0.75)', border: '1px solid rgba(55,65,81,0.28)', borderRadius: 8, borderLeft: `2px solid ${item.actionType === 'SOLVED' ? '#10b981' : item.actionType === 'HINT_USED' ? '#f59e0b' : '#7c3aed'}`, flexShrink: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{item.teamName || 'Team'}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: item.actionType === 'SOLVED' ? '#10b981' : item.actionType === 'HINT_USED' ? '#f59e0b' : '#a78bfa' }}>{item.actionType}</span>
                        </div>
                        <div style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.4, marginBottom: 4 }}>{item.storyMessage || item.challengeTitle || 'Operation update'}</div>
                        <div style={{ color: (item.points ?? 0) >= 0 ? '#6ee7b7' : '#fca5a5', fontSize: 12, fontWeight: 700 }}>{(item.points ?? 0) >= 0 ? '+' : ''}{item.points ?? 0} pts</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* HINT CONFIRM MODAL */}
      {showHintConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="game-panel-bordered" style={{ width: 440, maxWidth: '90vw', padding: '24px 24px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: '#e9d5ff', fontSize: 17, fontWeight: 900, letterSpacing: 2 }}>REVEAL INTEL?</h3>
              <button onClick={() => setShowHintConfirm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4 }}><X size={15} /></button>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>Mission intel is classified. Accessing it deducts points from your team score. Once revealed, intel stays visible for this mission at no further cost — you can hide/show it freely.</p>
            <div className="game-alert-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <AlertTriangle size={13} />One-time penalty: −{apiResponse?.challenge?.hintPenalty ?? 50} points
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn-game-secondary" style={{ padding: '9px 16px', fontSize: 12 }} onClick={() => setShowHintConfirm(false)}>Abort</button>
              <button className="btn-game-danger" style={{ padding: '9px 16px', fontSize: 12 }} onClick={confirmHint} disabled={revealingHint}>
                {revealingHint ? 'Applying...' : <><Eye size={12} style={{ marginRight: 4 }} />Reveal Intel</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── FULL-SCREEN VISUAL NOVEL STORY ─── */}
      {storyModal && (() => {
        const story = COMPLETION_STORIES[storyModal.level];
        if (!story) return null;
        const completedMission = MISSIONS[storyModal.level - 1];
        const nextMission = MISSIONS[storyModal.level];
        const isLastMission = !nextMission;
        return (
          <div
            onClick={handleStoryAdvance}
            style={{ position: 'fixed', inset: 0, zIndex: 500, cursor: 'pointer', userSelect: 'none', fontFamily: "'Share Tech Mono','Courier New',monospace", background: '#000' }}
          >
            {/* Background */}
            <div ref={vnBgRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
              <Image src={story.bgImage} alt="background" fill style={{ objectFit: 'cover', filter: 'brightness(0.4) saturate(0.85)' }} priority />
              {/* Vignette */}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)' }} />
              {/* Scanlines */}
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)', zIndex: 1, pointerEvents: 'none' }} />
            </div>

            {/* HUD top bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: '14px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg,rgba(0,0,0,0.7) 0%,transparent 100%)' }}>
              {/* Mission complete badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={16} color={story.accentColor} />
                <span style={{ color: story.accentColor, fontSize: 11, fontWeight: 700, letterSpacing: 4 }}>MISSION COMPLETE</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: 2, marginLeft: 8 }}>+{completedMission?.points ?? 0} PTS</span>
              </div>

              {/* Title */}
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
                {story.title}
              </div>

              {/* Skip */}
              <button
                onClick={e => { e.stopPropagation(); handleStorySkip(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 13px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 7, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}
              >
                <SkipForward size={12} />SKIP
              </button>
            </div>

            {/* Character portrait */}
            <div
              ref={vnPortraitRef}
              style={{
                position: 'absolute', bottom: 0, right: '5vw', zIndex: 10,
                width: 'clamp(240px, 30vw, 440px)',
                height: 'clamp(360px, 72vh, 720px)',
                pointerEvents: 'none',
              }}
            >
              <Image
                src={story.characterImage}
                alt={story.character}
                fill
                style={{ objectFit: 'contain', objectPosition: 'bottom', filter: `drop-shadow(0 0 40px ${story.accentColor}55) drop-shadow(0 0 80px rgba(0,0,0,0.9))` }}
                priority
              />
            </div>

            {/* Dialogue box */}
            <div
              ref={vnDialogueRef}
              style={{ position: 'absolute', bottom: '3vh', left: '4vw', right: '4vw', zIndex: 15, pointerEvents: 'none' }}
            >
              {/* Name tag */}
              <div
                ref={vnNameRef}
                style={{
                  display: 'inline-block', marginBottom: 8, marginLeft: 4,
                  padding: '6px 20px',
                  background: `linear-gradient(90deg, ${story.accentColor}dd, ${story.accentColor}60)`,
                  border: `1px solid ${story.accentColor}88`,
                  borderRadius: '8px 8px 0 0',
                  fontSize: 12, fontWeight: 900, letterSpacing: 4, textTransform: 'uppercase',
                  color: '#fff',
                  boxShadow: `0 0 24px ${story.accentColor}55`,
                }}
              >
                {story.character.toUpperCase()}
              </div>

              {/* Dialogue panel */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(2,1,12,0.93), rgba(14,8,40,0.91))',
                border: `1px solid ${story.accentColor}55`,
                borderRadius: '0 14px 14px 14px',
                padding: '22px 28px 24px',
                backdropFilter: 'blur(24px)',
                boxShadow: `0 8px 60px rgba(0,0,0,0.7), 0 0 40px ${story.accentColor}15`,
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Top accent line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${story.accentColor}99, transparent)` }} />

                <p style={{ margin: 0, fontSize: 'clamp(14px, 1.8vw, 18px)', color: '#e2e8f0', lineHeight: 1.8, minHeight: '3.2em', fontWeight: 400 }}>
                  {vnDisplayText}
                  {vnIsTyping && <span style={{ opacity: 0.7, animation: 'blink 0.7s steps(1) infinite' }}>|</span>}
                </p>

                {/* Next objective preview (shown when typing is complete) */}
                {!vnIsTyping && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${story.accentColor}22` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Zap size={13} color={story.accentColor} />
                      <span style={{ color: story.accentColor, fontSize: 10, fontWeight: 700, letterSpacing: 3 }}>NEXT OBJECTIVE</span>
                    </div>
                    <div style={{ color: '#e9d5ff', fontSize: 15, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
                      {nextMission ? `${nextMission.level} — ${nextMission.name}` : 'All missions complete. Operation terminated.'}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.6 }}>{story.subtext}</div>
                  </div>
                )}

                {/* Advance hint */}
                {!vnIsTyping && (
                  <div style={{ position: 'absolute', bottom: 16, right: 22, display: 'flex', alignItems: 'center', gap: 5, color: `${story.accentColor}99`, fontSize: 11, fontWeight: 700, letterSpacing: 2, animation: 'pulse 1.5s ease-in-out infinite' }}>
                    {isLastMission ? 'VIEW TIMELINE' : 'VIEW TIMELINE'} <ChevronRight size={14} />
                  </div>
                )}
              </div>
            </div>

            {/* Scene counter */}
            <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 20, color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: 2, fontWeight: 700 }}>
              LEVEL {completedMission?.level} COMPLETE
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes dopulse { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:0.6;transform:translateX(0)} 50%{opacity:1;transform:translateX(3px)} }
        @keyframes submitPulse { 0%,100%{box-shadow:0 0 20px rgba(109,40,217,0.35)} 50%{box-shadow:0 0 40px rgba(109,40,217,0.65),0 0 60px rgba(109,40,217,0.2)} }
      `}</style>
    </div>
  );
}

export default function ChallengesPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#080614', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontFamily: "'Share Tech Mono','Courier New',monospace" }}>
        Loading mission data...
      </div>
    }>
      <ChallengesInner />
    </Suspense>
  );
}
