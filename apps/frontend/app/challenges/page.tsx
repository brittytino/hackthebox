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
  ChevronsLeft, ChevronsRight, ChevronRight, SkipForward, Menu,
} from 'lucide-react';

interface MissionMeta {
  order: number; round: number; level: string;
  name: string; type: string;
  difficulty: 'medium' | 'hard'; points: number;
  storyAct: string; storyTime: string; storyStatus: string;
  situation: string;
  intel: string;
  character: string;
  characterImage: string;
  roundLabel: string;
}

/* --- STORY COMPLETION SCENES -------------------------------------------- */
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
  9: { title: '?? OPERATION BLACKOUT — TERMINATED', quote: '"Saravana is arrested. The worm is destroyed. 50,000 jobs saved. Coimbatore is safe. You did it — all of you."', subtext: 'Mission complete. Your team has written history.', character: 'Veera Raghavan', characterImage: '/images/characters/veera_relieved.png', bgColor: 'rgba(16,185,129,0.18)', accentColor: '#10b981', bgImage: '/images/background/9.jpg' },
};

const MISSIONS: MissionMeta[] = [
  {
    order: 1, round: 1, level: '1.1',
    name: 'The Intercepted Transmission',
    type: 'CRYPTOGRAPHY', difficulty: 'medium', points: 100,
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
    type: 'WEB/TOKEN', difficulty: 'medium', points: 300,
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
    type: 'REVERSE ENG', difficulty: 'medium', points: 400,
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
  const [focusMode, setFocusMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  // Hint cache: maps challengeId ? { texts, shown, revealed, total }
  const [hintCache, setHintCache] = useState<Record<string, { texts: string[]; shown: boolean; revealed: number; total: number }>>({})
  // Mobile panel overlay: 'missions' | 'intel' | null
  const [mobilePanel, setMobilePanel] = useState<'missions' | 'intel' | null>(null);

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
        const current = Math.min(Math.max(ch?.progress?.currentLevel ?? 1, 1), 9);
        const requested = levelParam ? parseInt(levelParam, 10) : current;
        const safeRequested = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), current) : current;
        const found = MISSIONS[safeRequested - 1];
        setSelectedLevel(found?.level ?? '1.1');
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

  useEffect(() => {
    const onResize = () => setCompactMode(window.innerWidth <= 1500);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
  const nextHintPenalty = (() => {
    if (!meta) return apiResponse?.challenge?.hintPenalty ?? 50;
    if (meta.difficulty !== 'hard') return apiResponse?.challenge?.hintPenalty ?? 50;
    const revealed = currentHint?.revealed ?? 0;
    const roundPenalties: Record<number, number[]> = {
      1: [40, 80],
      2: [80, 120],
      3: [120, 180],
    };
    const penalties = roundPenalties[meta.round] || [80, 120];
    const idx = Math.max(0, Math.min(revealed, penalties.length - 1));
    return penalties[idx];
  })();

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
      const unlockedHints = Array.isArray(res.unlockedHints)
        ? res.unlockedHints
        : (res.hint ? [res.hint] : []);
      const totalHints = res.totalHints || unlockedHints.length || 1;
      const hintIndex = res.hintIndex || unlockedHints.length || 1;
      setHintCache(prev => ({
        ...prev,
        [challengeId]: {
          texts: unlockedHints,
          shown: true,
          revealed: hintIndex,
          total: totalHints,
        },
      }));
      setShowHintConfirm(false);
      setMessage(
        res.alreadyUsed
          ? 'All available intel for this mission is already unlocked (no further deduction).'
          : `Intel tier ${hintIndex}/${totalHints} unlocked. ${res.penaltyApplied} pts deducted.`,
      );
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
      if (existing.shown) {
        setHintCache(prev => ({ ...prev, [challengeId]: { ...prev[challengeId], shown: false } }));
        return;
      }

      if (existing.revealed < existing.total) {
        setShowHintConfirm(true);
        return;
      }

      setHintCache(prev => ({ ...prev, [challengeId]: { ...prev[challengeId], shown: true } }));
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
    <div className="ch-loading-screen">
      <div className="ch-spin-ring" />
      <div className="ch-loading-title">DECRYPTING MISSION DATA</div>
      <div className="ch-loading-sub">Please stand by…</div>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .ch-loading-screen{min-height:100vh;background:#070813;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;font-family:'Inter', system-ui, sans-serif;}
        .ch-spin-ring{width:52px;height:52px;border:3px solid rgba(124,58,237,0.22);border-top-color:#7c3aed;border-radius:50%;animation:spin 0.85s linear infinite;}
        .ch-loading-title{color:#7c3aed;letter-spacing:4px;font-size:12px;font-weight:700;text-transform:uppercase;}
        .ch-loading-sub{color:#374151;font-size:11px;letter-spacing:2px;}
      `}</style>
    </div>
  );

  const rescued = HOSTAGE[meta?.order ?? 1] ?? 0;
  const rescuePct = Math.round((rescued / 1200) * 100);
  const scored = Math.max(currentLevel - 1, 0);
  const teamPoints = apiResponse?.team?.currentPoints ?? 0;
  const teamName = apiResponse?.team?.name ?? '—';
  const storyChallenge = Math.min(Math.max(meta?.order ?? currentLevel, 1), 9);
  const storyHref = `/story?challenge=${storyChallenge}`;
  const masterVaultUrl = (() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
    if (/^https?:\/\//i.test(apiBase)) {
      return `${apiBase.replace(/\/api\/?$/, '')}/public/challenges/master-vault.html`;
    }
    return '/public/challenges/master-vault.html';
  })();

  return (
    <div ref={containerRef} className="ch-root">
      {/* Background grid */}
      <div className="ch-bg-grid" aria-hidden />

      {/* -- TOP BAR -- */}
      <header data-g="topbar" className="ch-topbar">
        {/* Brand */}
        <Link href="/dashboard" className="ch-brand">
          <span className="ch-brand-name">Hack The Box</span>
        </Link>

        {/* Nav */}
        <nav className="ch-topbar-nav">
          <Link href="/dashboard" className="ch-nav-link"><Activity size={13} /><span>HQ</span></Link>
          <Link href="/leaderboard" className="ch-nav-link"><Trophy size={13} /><span>RANKS</span></Link>
          <Link href={storyHref} className="ch-nav-link"><Map size={13} /><span>STORY</span></Link>
          <button
            type="button"
            className={`ch-focus-btn ${focusMode ? 'active' : ''}`}
            onClick={() => setFocusMode(v => !v)}
            aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
            title={focusMode ? 'Exit focus mode' : 'Focus mode'}
          >
            {focusMode ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{focusMode ? 'EXIT FOCUS' : 'FOCUS'}</span>
          </button>
        </nav>

        <div className="ch-topbar-divider" />

        {/* Mission counter */}
        <div className="ch-topbar-missions">
          <span className="ch-tb-done">{scored}</span>
          <span className="ch-tb-sep"> / {totalLevels}</span>
          <span className="ch-tb-label">MISSIONS</span>
        </div>

        {/* Score */}
        <div className="ch-score-badge">
          <Trophy size={14} color="#fbbf24" />
          <span className="ch-score-num">{teamPoints.toLocaleString()}</span>
          <span className="ch-score-unit">PTS</span>
        </div>

        {/* Team */}
        <div className="ch-team-tag">
          <span className="ch-team-dot" />
          <span className="ch-team-name">{teamName}</span>
        </div>

        {/* Mobile toggles */}
        <button className="ch-mob-btn" onClick={() => setMobilePanel(p => p === 'missions' ? null : 'missions')} aria-label="Missions">
          <RadioTower size={15} />
        </button>
        <button className="ch-mob-btn" onClick={() => setMobilePanel(p => p === 'intel' ? null : 'intel')} aria-label="Intel">
          <Menu size={15} />
        </button>
      </header>

      {/* -- 3-COL LAYOUT -- */}
      <div className={`ch-body ${focusMode ? 'ch-focus-mode' : ''} ${compactMode ? 'ch-compact' : ''}`}>

        {/* LEFT: ZIG-ZAG TIMELINE (collapsible) */}
        <aside
          data-g="left"
          className={`ch-left-panel ${leftOpen ? 'ch-panel-open' : 'ch-panel-collapsed'}${mobilePanel === 'missions' ? ' ch-mobile-slide' : ''}`}
        >
          {/* Toggle button */}
          <button
            onClick={() => setLeftOpen(o => !o)}
            className="ch-panel-toggle ch-panel-toggle-r"
            title={leftOpen ? 'Collapse timeline' : 'Expand timeline'}
          >
            {leftOpen ? <ChevronsLeft size={10} color="#c4b5fd" /> : <ChevronsRight size={10} color="#c4b5fd" />}
          </button>

          {/* Collapsed icon strip */}
          {!leftOpen && (
            <div className="ch-collapsed-strip">
              <RadioTower size={15} color="#06b6d4" />
              {MISSIONS.map(m => {
                const s = getState(m.order);
                return (
                  <div key={m.level}
                    className="ch-dot-pip"
                    onClick={() => { setSelectedLevel(m.level); setLeftOpen(true); }}
                    title={m.name}
                    style={{
                      background: s === 'solved' ? '#10b981' : s === 'active' ? '#7c3aed' : '#374151',
                      boxShadow: s === 'active' ? '0 0 8px #7c3aed' : 'none',
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Expanded timeline */}
          {leftOpen && (
            <div className="game-scroll ch-tl-scroll">
              <div className="ch-tl-head">
                <RadioTower size={12} color="#06b6d4" />
                <span className="ch-tl-title">MISSION TIMELINE</span>
              </div>

              <div className="ch-tl-prog-wrap">
                <div className="ch-tl-prog-info">
                  <span className="ch-tl-done">{scored}</span>
                  <span className="ch-tl-total"> / {totalLevels} complete</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.round((scored / 9) * 100)}%` }} />
                </div>
              </div>

              {/* Round groups */}
              {[
                { act: 'ROUND 1 — THE BREACH',   color: '#fca5a5', rgb: '239,68,68',  orders: [1,2,3] },
                { act: 'ROUND 2 — INFILTRATION', color: '#fde68a', rgb: '245,158,11', orders: [4,5,6] },
                { act: 'ROUND 3 — FINAL STRIKE', color: '#6ee7b7', rgb: '16,185,129', orders: [7,8,9] },
              ].map(group => (
                <div key={group.act} className="ch-round-group">
                  <div className="ch-round-label" style={{ color: group.color }}>
                    <span className="ch-round-line" style={{ background: `rgba(${group.rgb},0.25)` }} />
                    {group.act}
                    <span className="ch-round-line" style={{ background: `rgba(${group.rgb},0.25)` }} />
                  </div>
                  {group.orders.map((order, idx) => {
                    const m = MISSIONS[order - 1];
                    const s = getState(m.order);
                    const sel = selectedLevel === m.level;
                    const can = s !== 'locked';
                    const rc2 = ROUND_CONFIG[m.round];
                    const isAlt = idx % 2 === 1;
                    return (
                      <div key={m.level} className="ch-mc-row">
                        {/* Zigzag dot */}
                        <div className="ch-zz-dot" style={{
                          [isAlt ? 'right' : 'left']: 6,
                          background: s === 'solved' ? '#10b981' : s === 'active' ? '#7c3aed' : '#374151',
                          borderColor: s === 'solved' ? '#6ee7b7' : s === 'active' ? '#a78bfa' : '#4b5563',
                          boxShadow: s === 'active' ? '0 0 12px rgba(124,58,237,0.9)' : s === 'solved' ? '0 0 6px rgba(16,185,129,0.5)' : 'none',
                        }} />
                        <div
                          onClick={() => can && setSelectedLevel(m.level)}
                          className={`ch-mc-card ${sel ? 'ch-mc-sel' : ''} ${s === 'locked' ? 'ch-mc-locked' : ''}`}
                          style={{
                            marginLeft: isAlt ? 22 : 26, marginRight: isAlt ? 26 : 22,
                            borderColor: sel ? 'rgba(6,182,212,0.7)' : s === 'solved' ? 'rgba(16,185,129,0.35)' : s === 'active' ? 'rgba(124,58,237,0.5)' : 'rgba(55,65,81,0.22)',
                            background: sel ? 'rgba(6,182,212,0.08)' : s === 'solved' ? 'rgba(16,185,129,0.05)' : s === 'active' ? 'rgba(109,40,217,0.1)' : 'rgba(4,2,14,0.65)',
                            opacity: s === 'locked' ? 0.37 : 1,
                            boxShadow: sel ? `0 0 18px ${rc2.glow}` : s === 'active' ? `0 2px 14px ${rc2.glow}` : 'none',
                            borderLeft: `3px solid ${sel ? '#06b6d4' : s === 'solved' ? '#10b981' : s === 'active' ? '#7c3aed' : '#374151'}`,
                            cursor: can ? 'pointer' : 'default',
                          }}
                        >
                          <div className="ch-mci-row">
                            <span className="ch-mc-icon">
                              {s === 'solved' ? <CheckCircle size={12} color="#10b981" /> : s === 'active' ? <Zap size={12} color="#a78bfa" /> : <Lock size={12} color="#4b5563" />}
                            </span>
                            <span className="ch-mc-lvl">{m.level}</span>
                            <span className={`diff-badge diff-${m.difficulty}`} style={{ fontSize: 9, padding: '1px 5px' }}>{m.difficulty[0].toUpperCase()}</span>
                          </div>
                          <div className={`ch-mc-name ${sel ? 'ch-mc-name-sel' : ''}`}>{m.name}</div>
                          <div className="ch-mc-pts">
                            <span style={{ color: '#f59e0b' }}>{m.points} pts</span>
                            <span className="ch-mc-type">{m.type}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* CENTER: CHALLENGE CONTENT */}
        <main data-g="center" ref={centerRef} className="ch-center">
          <div className="game-scroll ch-center-scroll">

          {apiResponse?.progress?.completedAll && (
            <div className="ch-complete-banner">
              <div className="ch-complete-icon">??</div>
              <div className="game-title ch-complete-title">OPERATION BLACKOUT — TERMINATED</div>
              <p className="ch-complete-body">All 9 missions complete. Saravana arrested. The malware is destroyed. 50,000 jobs saved. Coimbatore is safe.</p>
              <div className="ch-complete-score">FINAL SCORE: {teamPoints.toLocaleString()} pts</div>
            </div>
          )}

          {meta ? (
            <>
              {/* - Badges - */}
              <div className="ch-badges-row">
                <span className={`round-badge ${rc.badge}`}>{meta.roundLabel}</span>
                <span className={`diff-badge diff-${meta.difficulty}`}>{meta.difficulty}</span>
                <span className="ch-type-badge">{meta.type}</span>
                <span className="ch-pts-badge">{meta.points} pts</span>
                <span className={`ch-state-chip ch-state-${state}`}>
                  {state === 'solved' ? <CheckCircle size={12} /> : state === 'active' ? <Zap size={12} /> : <Lock size={12} />}
                  {state.toUpperCase()}
                </span>
              </div>

              {focusMode && (
                <div className="ch-focus-note">
                  Focus mode enabled — side intel panels hidden for distraction-free solving.
                </div>
              )}

              {/* - Title - */}
              <div className="ch-title-block">
                <div className="ch-act-label">{meta.storyAct}</div>
                <h1 className="ch-mission-title">{meta.level} — {meta.name}</h1>
              </div>

              {/* - Character Intel Banner - */}
              <div className="ch-intel-banner" style={{
                border: `1px solid ${rc.border}`,
                boxShadow: `0 0 24px ${rc.glow}, 0 6px 20px rgba(0,0,0,0.45)`,
              }}>
                {/* Top accent line */}
                <div className="ch-intel-accent-line" style={{ background: `linear-gradient(90deg,transparent,${rc.primary},transparent)` }} />
                {/* Scene */}
                <div className="ch-intel-scene" style={{ background: `linear-gradient(135deg,rgba(${meta.round===1?'239,68,68':meta.round===2?'245,158,11':'16,185,129'},0.06),rgba(2,1,12,0.98))` }}>
                  <div className="ch-intel-grid-bg" />
                  {/* Portrait */}
                  <div className="ch-portrait">
                    <Image src={meta.characterImage} alt={meta.character} fill style={{ objectFit: 'contain', objectPosition: 'center bottom', filter: 'drop-shadow(8px 0 16px rgba(0,0,0,0.8))' }} priority />
                  </div>
                  {/* Info overlay */}
                  <div className="ch-intel-info">
                    <div className="ch-intel-row1">
                      <div className="ch-operative-badge" style={{ background: `rgba(${meta.round===1?'239,68,68':meta.round===2?'245,158,11':'16,185,129'},0.12)`, borderColor: rc.border, color: rc.primary }}>OPERATIVE</div>
                      <span className="ch-char-name">{meta.character}</span>
                    </div>
                    <div className="ch-intel-time">
                      <Clock size={10} color="#6b7280" />
                      <span>{meta.storyTime}</span>
                    </div>
                    <div className="ch-intel-status">
                      <span className="ch-status-dot" />
                      {meta.storyStatus}
                    </div>
                  </div>
                </div>
                {/* Rescue bar */}
                <div className="ch-rescue-bar">
                  <div className="ch-rescue-label">
                    <Users size={10} color="#6b7280" />
                    <span>HOSTAGES RESCUED</span>
                  </div>
                  <span className="ch-rescue-count" style={{ color: rescuePct>=100?'#10b981':rescuePct>=60?'#f59e0b':'#ef4444' }}>{rescued.toLocaleString()} / 1,200</span>
                </div>
                <div className="ch-rescue-track">
                  <div className="ch-rescue-fill" style={{ width:`${rescuePct}%`, background: rescuePct>=100?'linear-gradient(90deg,#10b981,#34d399)':'linear-gradient(90deg,#ef4444,#f59e0b,#7c3aed)' }} />
                </div>
              </div>

              {/* - Situation - */}
              <div className="ch-sitrep">
                <div className="ch-section-label"><Shield size={11} color="#6b7280" />SITUATION REPORT</div>
                <p className="ch-sitrep-text">{meta.situation}</p>
              </div>

              {/* - Cipher payload - */}
              <div className="ch-payload-panel game-panel-bordered">
                <div className="ch-payload-header">
                  <Terminal size={12} color="#06b6d4" />
                  CIPHER PAYLOAD
                  {state === 'active' && <span className="ch-live-dot" />}
                </div>

                {state === 'active' && meta.level === '3.3' && (
                  <div className="ch-vault-link-box">
                    <div className="ch-vault-link-title">FINAL ARTIFACT ACCESS</div>
                    <p className="ch-vault-link-text">Open the interactive Master Vault interface to complete the final decode pipeline for Level 3.3.</p>
                    <a className="ch-vault-link-btn" href={masterVaultUrl} target="_blank" rel="noreferrer">
                      OPEN MASTER VAULT <ChevronRight size={14} />
                    </a>
                    <div className="ch-vault-link-path">Endpoint: {masterVaultUrl}</div>
                  </div>
                )}

                {state === 'active' && (
                  <div className="game-scroll ch-payload-code">
                    {apiResponse?.challenge?.description
                      ? formatPayloadText(apiResponse.challenge.description)
                      : 'Loading payload data...'}
                  </div>
                )}
                {state === 'solved' && (
                  <div className="ch-payload-state ch-payload-solved">
                    <CheckCircle size={16} />Payload decoded and archived. Mission complete.
                  </div>
                )}
                {state === 'locked' && (
                  <div className="ch-payload-state ch-payload-locked">
                    <Lock size={16} />Payload encrypted — complete the active mission to unlock.
                  </div>
                )}

                {/* Hint / Intel */}
                {state === 'active' && apiResponse?.challenge?.hints && (
                  <div className="ch-hint-section">
                    <button onClick={toggleHintDisplay} className={`ch-hint-btn ${currentHint ? 'ch-hint-unlocked' : ''}`}>
                      {currentHint?.shown ? <EyeOff size={13} /> : <Eye size={13} />}
                      {currentHint
                        ? (currentHint.shown
                          ? 'HIDE INTEL'
                          : (currentHint.revealed < currentHint.total ? 'REVEAL NEXT INTEL' : 'SHOW INTEL'))
                        : 'REVEAL INTEL'}
                      {(!currentHint || (currentHint.revealed < currentHint.total)) && <span className="ch-hint-cost">-{nextHintPenalty} pts</span>}
                      {currentHint && <span className="ch-hint-unlocked-tag">{currentHint.revealed}/{currentHint.total} UNLOCKED</span>}
                    </button>
                    {currentHint?.shown && currentHint.texts.length > 0 && (
                      <div className="ch-hint-box">
                        <div className="ch-hint-label">MISSION INTEL</div>
                        {currentHint.texts.map((hintText, hintIdx) => (
                          <p key={`${hintIdx}-${hintText.slice(0, 16)}`} className="ch-hint-text">
                            <strong>Hint {hintIdx + 1}:</strong> {hintText}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </>
          ) : (
            <div className="ch-empty-state">
              <RadioTower size={40} color="#374151" />
              <div>Select a mission from the timeline.</div>
            </div>
          )}
          </div>{/* end scrollable content */}

          {/* Sticky flag submit bar */}
          {meta && (
            <div className="ch-flag-bar">
              {state === 'active' && (
                <div className="ch-flag-inner">
                  <div className="ch-flag-header">
                    <div className="ch-flag-icon-wrap"><Flag size={12} color="#fff" /></div>
                    <span className="ch-flag-label">SUBMIT FLAG</span>
                    <div className="ch-awaiting-tag">
                      <span className="ch-await-dot" />
                      AWAITING FLAG
                    </div>
                  </div>
                  <form onSubmit={handleSubmit} className="ch-flag-form">
                    <input
                      className="game-input ch-flag-input"
                      type="text"
                      placeholder="CTF{your_decoded_flag}"
                      value={flag}
                      onChange={e => setFlag(e.target.value)}
                      disabled={submitting}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button
                      type="submit"
                      disabled={submitting || !flag.trim() || !challengeId}
                      className={`ch-transmit-btn${!submitting && flag.trim() ? ' ch-transmit-active' : ''}`}
                    >
                      <Flag size={14} />{submitting ? 'SENDING...' : 'TRANSMIT'}
                    </button>
                  </form>
                  {apiResponse?.progress?.maxAttempts && (
                    <div className="ch-attempts-info">ATTEMPTS: {apiResponse.progress.attemptsUsed} / {apiResponse.progress.maxAttempts}</div>
                  )}
                  {message && (
                    <div className={`ch-flag-msg ${isError ? 'ch-msg-error' : 'ch-msg-success'}`}>
                      {isError ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}{message}
                    </div>
                  )}
                </div>
              )}
              {state === 'solved' && <div className="game-alert-success ch-flag-status"><CheckCircle size={16} />Mission complete. Select the next level from the timeline.</div>}
              {state === 'locked' && <div className="game-alert-info ch-flag-status"><Lock size={16} />This mission is locked. Solve the active level first.</div>}
            </div>
          )}
        </main>

        {/* RIGHT PANEL (collapsible) */}
        <aside
          data-g="right"
          className={`ch-right-panel ${rightOpen ? 'ch-panel-open' : 'ch-panel-collapsed'}${mobilePanel === 'intel' ? ' ch-mobile-slide ch-mobile-right' : ''}`}
        >
          {/* Toggle button */}
          <button onClick={() => setRightOpen(o => !o)} className="ch-panel-toggle ch-panel-toggle-l" title={rightOpen ? 'Collapse panel' : 'Expand panel'}>
            {rightOpen ? <ChevronsRight size={10} color="#c4b5fd" /> : <ChevronsLeft size={10} color="#c4b5fd" />}
          </button>

          {/* Collapsed strip */}
          {!rightOpen && (
            <div className="ch-collapsed-strip">
              <Shield size={15} color="#a78bfa" />
              <Activity size={15} color="#a78bfa" />
              <Trophy size={15} color="#fbbf24" />
            </div>
          )}

          {/* Expanded */}
          {rightOpen && (
            <div className="game-scroll ch-right-scroll">

              {/* Team card */}
              <div className="ch-team-card">
                <div className="ch-tc-accent-bar" />
                <div className="ch-tc-label">TEAM STATUS</div>
                <div className="ch-tc-name">{teamName}</div>
                <div className="ch-tc-score-row">
                  <span className="ch-tc-big">{scored}</span>
                  <span className="ch-tc-denom"> / {totalLevels}</span>
                </div>
                <div className="ch-tc-sub">missions solved</div>
                <div className="progress-track" style={{ marginBottom: 14 }}>
                  <div className="progress-fill" style={{ width: `${Math.round((scored / totalLevels) * 100)}%` }} />
                </div>
                <div className="ch-tc-pts-row">
                  <Trophy size={14} color="#fbbf24" />
                  <span className="ch-tc-pts-label">SCORE</span>
                  <span className="ch-tc-pts-val">{teamPoints.toLocaleString()}</span>
                </div>
              </div>

              {/* Op status */}
              <div className="ch-ops-card">
                <div className="ch-section-label" style={{ marginBottom: 12 }}>OPERATION STATUS</div>
                {[
                  { label: 'CODISSIA MALL', val: currentLevel >= 9 ? 'SECURED'    : 'ACTIVE SIEGE',  ok: currentLevel >= 9 },
                  { label: 'OP BLACKOUT',  val: currentLevel >= 9 ? 'TERMINATED' : 'ARMED FEB 14',  ok: currentLevel >= 9 },
                  { label: 'UMAR SAIF',   val: currentLevel >= 8 ? 'NEUTRALIZED': 'HOSTILE',        ok: currentLevel >= 8 },
                  { label: 'FAROOQ',      val: currentLevel >= 7 ? 'RECAPTURED' : 'AT LARGE',       ok: currentLevel >= 7 },
                ].map(x => (
                  <div key={x.label} className="ch-ops-row">
                    <span className="ch-ops-key">{x.label}</span>
                    <span className={`ch-ops-val ${x.ok ? 'ok' : 'bad'}`}>{x.val}</span>
                  </div>
                ))}
              </div>

              {/* Live ops feed */}
              <div className="ch-feed-wrap">
                <button onClick={() => setFeedOpen(o => !o)} className="ch-feed-toggle">
                  <Activity size={11} color="#a78bfa" />
                  <span>LIVE OPS FEED</span>
                  {feedOpen ? <ChevronUp size={13} color="#6b7280" /> : <ChevronDown size={13} color="#6b7280" />}
                </button>
                {feedOpen && (
                  <div className="game-scroll ch-feed-scroll">
                    {activity.length === 0 ? (
                      <div className="ch-feed-empty">
                        <RadioTower size={22} color="#374151" />
                        <span>No transmissions yet.</span>
                      </div>
                    ) : activity.map((item: any, i: number) => (
                      <div key={i} className="ch-feed-item" style={{ borderLeftColor: item.actionType === 'SOLVED' ? '#10b981' : item.actionType === 'HINT_USED' ? '#f59e0b' : '#7c3aed' }}>
                        <div className="ch-feed-top">
                          <span className="ch-feed-team">{item.teamName || 'Team'}</span>
                          <span className={`ch-feed-action ${item.actionType === 'SOLVED' ? 'solved' : item.actionType === 'HINT_USED' ? 'hint' : 'other'}`}>{item.actionType}</span>
                        </div>
                        <div className="ch-feed-msg">{item.storyMessage || item.challengeTitle || 'Operation update'}</div>
                        <div className={`ch-feed-pts ${(item.points ?? 0) >= 0 ? 'pos' : 'neg'}`}>{(item.points ?? 0) >= 0 ? '+' : ''}{item.points ?? 0} pts</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile backdrop */}
      {mobilePanel && <div className="ch-mobile-backdrop" onClick={() => setMobilePanel(null)} />}

      {/* HINT CONFIRM MODAL */}
      {showHintConfirm && (
        <div className="ch-modal-overlay">
          <div className="game-panel-bordered ch-modal">
            <div className="ch-modal-header">
              <h3 className="ch-modal-title">REVEAL INTEL?</h3>
              <button onClick={() => setShowHintConfirm(false)} className="ch-modal-close"><X size={15} /></button>
            </div>
            <p className="ch-modal-body">Mission intel is classified. Accessing it deducts points from your team score. Once revealed, intel stays visible at no further cost — you can hide/show it freely.</p>
            <div className="game-alert-error ch-modal-warning">
              <AlertTriangle size={13} />Penalty for next intel tier: -{nextHintPenalty} points
            </div>
            <div className="ch-modal-actions">
              <button className="btn-game-secondary" onClick={() => setShowHintConfirm(false)}>Abort</button>
              <button className="btn-game-danger" onClick={confirmHint} disabled={revealingHint}>
                {revealingHint ? 'Applying...' : <><Eye size={12} style={{ marginRight: 4 }} />Reveal Intel</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FULL-SCREEN VISUAL NOVEL STORY --- */}
      {storyModal && (() => {
        const story = COMPLETION_STORIES[storyModal.level];
        if (!story) return null;
        const completedMission = MISSIONS[storyModal.level - 1];
        const nextMission = MISSIONS[storyModal.level];
        const isLastMission = !nextMission;
        return (
          <div
            onClick={handleStoryAdvance}
            style={{ position: 'fixed', inset: 0, zIndex: 500, cursor: 'pointer', userSelect: 'none', fontFamily: "'Inter', system-ui, sans-serif", background: '#000' }}
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
        /* --- keyframes ------------------------------------------- */
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes dopulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:0.6;transform:translateX(0)} 50%{opacity:1;transform:translateX(3px)} }
        @keyframes submitPulse { 0%,100%{box-shadow:0 0 20px rgba(109,40,217,0.35)} 50%{box-shadow:0 0 40px rgba(109,40,217,0.65),0 0 60px rgba(109,40,217,0.2)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanLine { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }

        /* --- root / bg ------------------------------------------- */
        .ch-root { height:100vh; height:100dvh; background:#070813; display:flex; flex-direction:column; font-family:'Inter', system-ui, sans-serif; position:relative; overflow:hidden; }
        .ch-bg-grid { position:fixed; inset:0; pointer-events:none; z-index:0;
          background-image:
            repeating-linear-gradient(0deg,rgba(109,40,217,0.025) 0,rgba(109,40,217,0.025) 1px,transparent 1px,transparent 52px),
            repeating-linear-gradient(90deg,rgba(109,40,217,0.025) 0,rgba(109,40,217,0.025) 1px,transparent 1px,transparent 52px),
            radial-gradient(ellipse 90% 70% at 50% 0%,rgba(109,40,217,0.07),transparent 72%); }

        /* --- topbar ----------------------------------------------- */
        .ch-topbar { position:sticky; top:0; z-index:50; display:flex; align-items:center; padding:0 20px; height:56px; border-bottom:1px solid rgba(109,40,217,0.2); background:rgba(4,2,14,0.97); backdrop-filter:blur(24px); gap:10px; flex-shrink:0; }
        .ch-brand { display:flex; align-items:center; gap:9px; text-decoration:none; }
        .ch-brand-icon { width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,#7c3aed,#06b6d4); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .ch-brand-name { color:#e2e8f0; font-size:14px; font-weight:900; letter-spacing:3px; text-transform:uppercase; white-space:nowrap; }
        .ch-topbar-nav { display:flex; align-items:center; gap:4px; margin-left:auto; }
        .ch-nav-link { display:flex; align-items:center; gap:5px; color:#6b7280; font-size:11px; font-weight:700; letter-spacing:2px; text-decoration:none; text-transform:uppercase; padding:6px 12px; border:1px solid rgba(55,65,81,0.36); border-radius:7px; transition:all 0.15s; white-space:nowrap; }
        .ch-nav-link:hover { color:#c4b5fd; border-color:rgba(167,139,250,0.4); background:rgba(109,40,217,0.08); }
        .ch-focus-btn { display:flex; align-items:center; gap:5px; color:#6b7280; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; padding:6px 12px; border:1px solid rgba(55,65,81,0.36); border-radius:7px; background:transparent; cursor:pointer; font-family:inherit; transition:all 0.15s; }
        .ch-focus-btn:hover { color:#c4b5fd; border-color:rgba(167,139,250,0.4); background:rgba(109,40,217,0.08); }
        .ch-focus-btn.active { color:#e9d5ff; border-color:rgba(167,139,250,0.55); background:rgba(109,40,217,0.2); }
        .ch-topbar-divider { width:1px; height:22px; background:rgba(109,40,217,0.3); margin:0 4px; flex-shrink:0; }
        .ch-topbar-missions { display:flex; align-items:center; gap:3px; white-space:nowrap; }
        .ch-tb-done { color:#a78bfa; font-size:13px; font-weight:900; }
        .ch-tb-sep { color:#374151; font-size:13px; }
        .ch-tb-label { color:#6b7280; font-size:10px; letter-spacing:2px; margin-left:3px; }
        .ch-score-badge { display:flex; align-items:center; gap:6px; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.35); border-radius:8px; padding:6px 14px; white-space:nowrap; }
        .ch-score-num { color:#fbbf24; font-size:17px; font-weight:900; letter-spacing:1px; }
        .ch-score-unit { color:#92400e; font-size:9px; font-weight:700; letter-spacing:2px; }
        .ch-team-tag { display:flex; align-items:center; gap:6px; }
        .ch-team-dot { width:7px; height:7px; border-radius:50%; background:#10b981; box-shadow:0 0 8px #10b981; animation:dopulse 2.2s infinite; flex-shrink:0; }
        .ch-team-name { color:#94a3b8; font-size:11px; letter-spacing:1px; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .ch-mob-btn { display:none; background:rgba(109,40,217,0.12); border:1px solid rgba(109,40,217,0.3); border-radius:7px; color:#a78bfa; cursor:pointer; padding:7px 9px; align-items:center; justify-content:center; flex-shrink:0; }

        /* --- 3-col body ------------------------------------------- */
        .ch-body { position:relative; z-index:10; flex:1; display:flex; min-height:0; height:calc(100vh - 56px); }

        /* --- side panels ------------------------------------------ */
        .ch-left-panel  { border-right:1px solid rgba(109,40,217,0.18); background:rgba(3,1,14,0.9); backdrop-filter:blur(20px); display:flex; flex-direction:column; transition:width 0.28s ease,min-width 0.28s ease; overflow:hidden; position:relative; height:100%; flex-shrink:0; }
        .ch-right-panel { border-left:1px solid rgba(109,40,217,0.18);  background:rgba(3,1,14,0.9); backdrop-filter:blur(20px); display:flex; flex-direction:column; transition:width 0.28s ease,min-width 0.28s ease; overflow:hidden; position:relative; height:100%; flex-shrink:0; }
        .ch-left-panel.ch-panel-open   { width:clamp(228px, 16.5vw, 270px); min-width:clamp(228px, 16.5vw, 270px); }
        .ch-right-panel.ch-panel-open  { width:clamp(236px, 17.5vw, 282px); min-width:clamp(236px, 17.5vw, 282px); }
        .ch-left-panel.ch-panel-collapsed,
        .ch-right-panel.ch-panel-collapsed { width:48px; min-width:48px; }
        .ch-focus-mode .ch-left-panel,
        .ch-focus-mode .ch-right-panel { width:0 !important; min-width:0 !important; opacity:0; pointer-events:none; border:none; }

        .ch-compact .ch-left-panel.ch-panel-open { width:224px; min-width:224px; }
        .ch-compact .ch-right-panel.ch-panel-open { width:232px; min-width:232px; }
        .ch-compact .ch-center-scroll { padding:20px 20px 18px; gap:16px; }
        .ch-compact .ch-payload-code { font-size:14px; line-height:1.85; }
        .ch-compact .ch-mission-title { font-size:clamp(20px,2.2vw,28px); }
        .ch-compact .ch-sitrep-text { font-size:14px; line-height:1.8; }

        @media (max-width:1200px) {
          .ch-left-panel.ch-panel-open { width:208px; min-width:208px; }
          .ch-right-panel.ch-panel-open { width:216px; min-width:216px; }
          .ch-center-scroll { padding:18px 16px 16px; gap:14px; }
          .ch-mission-title { font-size:clamp(19px,2.2vw,26px); }
          .ch-intel-scene { height:140px; }
        }
        .ch-panel-toggle { position:absolute; top:50%; transform:translateY(-50%); z-index:30; width:16px; height:56px; background:linear-gradient(180deg,rgba(109,40,217,0.65),rgba(6,182,212,0.45)); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px rgba(109,40,217,0.4); transition:opacity 0.15s; }
        .ch-panel-toggle:hover { opacity:0.8; }
        .ch-panel-toggle-r { right:-1px; border-radius:0 8px 8px 0; }
        .ch-panel-toggle-l { left:-1px; border-radius:8px 0 0 8px; }
        .ch-collapsed-strip { display:flex; flex-direction:column; align-items:center; padding-top:14px; gap:16px; }
        .ch-dot-pip { width:10px; height:10px; border-radius:50%; cursor:pointer; transition:transform 0.2s; flex-shrink:0; }
        .ch-dot-pip:hover { transform:scale(1.4); }

        /* --- left timeline ---------------------------------------- */
        .ch-tl-scroll { overflow-y:auto; flex:1; padding:16px 0 22px; }
        .ch-tl-scroll::-webkit-scrollbar { width:4px; }
        .ch-tl-scroll::-webkit-scrollbar-track { background:transparent; }
        .ch-tl-scroll::-webkit-scrollbar-thumb { background:rgba(109,40,217,0.35); border-radius:4px; }
        .ch-tl-head { padding:0 14px 6px; display:flex; align-items:center; gap:6px; }
        .ch-tl-title { color:#06b6d4; font-size:12px; font-weight:800; letter-spacing:3px; text-transform:uppercase; }
        .ch-tl-prog-wrap { padding:0 14px 10px; }
        .ch-tl-prog-info { display:flex; align-items:baseline; gap:3px; margin-bottom:6px; }
        .ch-tl-done { color:#a78bfa; font-size:15px; font-weight:900; }
        .ch-tl-total { color:#4b5563; font-size:12px; }
        .ch-round-group { margin-top:8px; }
        .ch-round-label { padding:5px 14px; display:flex; align-items:center; gap:6px; font-size:10px; font-weight:800; letter-spacing:2px; text-transform:uppercase; }
        .ch-round-line { flex:1; height:1px; }
        .ch-mc-row { padding:3px 8px; position:relative; }
        .ch-zz-dot { position:absolute; top:50%; transform:translateY(-50%); width:10px; height:10px; border-radius:50%; border:2px solid; z-index:2; left:12px; }
        .ch-mc-card { padding:11px 11px 11px 28px; border-radius:10px; border:1px solid; border-left:3px solid; transition:all 0.18s ease; cursor:pointer; }
        .ch-mc-card:not(.ch-mc-locked):hover { filter:brightness(1.1); transform:translateX(2px); }
        .ch-mc-locked { cursor:default; opacity:0.5; }
        .ch-mci-row { display:flex; align-items:center; gap:5px; margin-bottom:4px; }
        .ch-mc-icon { flex-shrink:0; }
        .ch-mc-lvl { color:#cbd5e1; font-size:12px; font-weight:800; }
        .ch-mc-name { font-size:13px; font-weight:600; color:#9ca3af; line-height:1.4; transition:color 0.15s; }
        .ch-mc-sel .ch-mc-name { color:#e2e8f0; }
        .ch-mc-pts { margin-top:5px; display:flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; }
        .ch-mc-type { color:#6b7280; font-size:10px; letter-spacing:1px; text-transform:uppercase; }

        /* --- center ----------------------------------------------- */
        .ch-center { flex:1; display:flex; flex-direction:column; min-width:0; height:100%; overflow:hidden; }
        .ch-center-scroll { flex:1; overflow-y:auto; overflow-x:hidden; padding:clamp(20px, 2vw, 28px) clamp(18px, 2.4vw, 34px) 22px; display:flex; flex-direction:column; gap:20px; }
        .ch-center-scroll::-webkit-scrollbar { width:5px; }
        .ch-center-scroll::-webkit-scrollbar-track { background:rgba(0,0,0,0.2); }
        .ch-center-scroll::-webkit-scrollbar-thumb { background:rgba(109,40,217,0.4); border-radius:4px; }

        /* complete banner */
        .ch-complete-banner { background:linear-gradient(135deg,rgba(6,78,59,0.25),rgba(16,185,129,0.1)); border:2px solid rgba(16,185,129,0.5); border-radius:14px; padding:28px; text-align:center; box-shadow:0 0 50px rgba(16,185,129,0.18); animation:fadeIn 0.5s ease; }
        .ch-complete-icon { font-size:36px; margin-bottom:8px; }
        .ch-complete-title { color:#6ee7b7; font-size:20px; font-weight:900; letter-spacing:3px; text-transform:uppercase; text-shadow:0 0 24px rgba(16,185,129,0.7); margin:0 0 12px; }
        .ch-complete-body { color:#a7f3d0; font-size:14px; line-height:1.7; margin:0 0 12px; }
        .ch-complete-score { color:#34d399; font-weight:900; font-size:16px; }

        /* badges row */
        .ch-badges-row { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .ch-type-badge { color:#94a3b8; font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; }
        .ch-pts-badge { color:#fbbf24; font-size:15px; font-weight:900; margin-left:2px; }
        .ch-state-chip { margin-left:auto; display:flex; align-items:center; gap:5px; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; }
        .ch-state-active { color:#a78bfa; }
        .ch-state-solved { color:#10b981; }
        .ch-state-locked { color:#4b5563; }

        /* title */
        .ch-title-block { display:flex; flex-direction:column; gap:6px; }
        .ch-act-label { color:#6b7280; font-size:11px; font-weight:700; letter-spacing:3px; text-transform:uppercase; }
        .ch-mission-title { margin:0; font-size:clamp(22px,2.6vw,30px); font-weight:900; color:#e9d5ff; letter-spacing:2px; text-transform:uppercase; line-height:1.25; text-shadow:0 0 20px rgba(124,58,237,0.22); }
        .ch-focus-note { color:#94a3b8; font-size:13px; background:rgba(109,40,217,0.12); border:1px solid rgba(109,40,217,0.28); border-radius:9px; padding:9px 12px; }

        /* intel banner */
        .ch-intel-banner { border:1px solid; border-radius:14px; overflow:hidden; position:relative; background:linear-gradient(135deg,rgba(2,1,12,0.98),rgba(12,7,36,0.97)); }
        .ch-intel-accent-line { position:absolute; top:0; left:0; right:0; height:2px; z-index:3; }
        .ch-intel-scene { position:relative; height:clamp(144px, 17vh, 164px); overflow:hidden; }
        .ch-intel-grid-bg { position:absolute; inset:0; background:repeating-linear-gradient(45deg,rgba(109,40,217,0.04) 0,rgba(109,40,217,0.04) 1px,transparent 1px,transparent 14px); }
        .ch-portrait { position:absolute; left:0; top:0; bottom:0; width:clamp(96px, 8vw, 116px); overflow:hidden; background:linear-gradient(90deg, rgba(0,0,0,0.26), transparent); }
        .ch-intel-info { position:absolute; bottom:0; left:clamp(102px, 8.5vw, 124px); right:0; padding:12px 16px 10px; display:flex; flex-direction:column; gap:6px; }
        .ch-intel-row1 { display:flex; align-items:center; gap:8px; }
        .ch-operative-badge { font-size:9px; font-weight:800; letter-spacing:2px; text-transform:uppercase; padding:2px 8px; border:1px solid; border-radius:5px; }
        .ch-char-name { color:#e2e8f0; font-size:15px; font-weight:800; letter-spacing:1px; }
        .ch-intel-time { display:flex; align-items:center; gap:5px; color:#94a3b8; font-size:12px; }
        .ch-intel-status { display:inline-flex; align-items:center; gap:6px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:6px; padding:4px 10px; color:#fca5a5; font-size:10px; font-weight:700; letter-spacing:1px; width:fit-content; }
        .ch-status-dot { width:5px; height:5px; border-radius:50%; background:#ef4444; animation:dopulse 1.5s infinite; flex-shrink:0; }
        .ch-rescue-bar { display:flex; justify-content:space-between; align-items:center; padding:9px 16px 5px; }
        .ch-rescue-label { display:flex; align-items:center; gap:5px; color:#6b7280; font-size:9px; letter-spacing:2px; font-weight:700; text-transform:uppercase; }
        .ch-rescue-count { font-size:12px; font-weight:900; }
        .ch-rescue-track { height:5px; margin:0 16px 12px; background:rgba(255,255,255,0.04); border-radius:3px; overflow:hidden; }
        .ch-rescue-fill { height:100%; border-radius:3px; transition:width 0.8s ease; }

        /* sitrep */
        .ch-sitrep { background:rgba(3,1,14,0.68); border:1px solid rgba(109,40,217,0.16); border-radius:12px; padding:18px 22px; }
        .ch-section-label { display:flex; align-items:center; gap:5px; color:#6b7280; font-size:11px; font-weight:700; letter-spacing:3px; text-transform:uppercase; margin-bottom:10px; }
        .ch-sitrep-text { color:#cbd5e1; font-size:15px; line-height:1.95; margin:0; }

        /* payload */
        .ch-payload-panel { padding:20px 22px; }
        .ch-payload-header { display:flex; align-items:center; gap:7px; color:#06b6d4; font-size:12px; font-weight:800; letter-spacing:3px; text-transform:uppercase; margin-bottom:14px; }
        .ch-live-dot { width:6px; height:6px; border-radius:50%; background:#10b981; box-shadow:0 0 8px #10b981; animation:dopulse 1.8s infinite; margin-left:auto; }
        .ch-vault-link-box { margin-bottom:14px; padding:12px 14px; border:1px solid rgba(6,182,212,0.35); border-radius:10px; background:rgba(6,182,212,0.06); }
        .ch-vault-link-title { color:#67e8f9; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; }
        .ch-vault-link-text { color:#cbd5e1; font-size:13px; line-height:1.65; margin:0 0 10px; }
        .ch-vault-link-btn { display:inline-flex; align-items:center; gap:6px; text-decoration:none; color:#e2e8f0; background:rgba(109,40,217,0.3); border:1px solid rgba(167,139,250,0.45); border-radius:8px; padding:8px 12px; font-size:12px; font-weight:800; letter-spacing:1px; text-transform:uppercase; transition:all 0.15s; }
        .ch-vault-link-btn:hover { background:rgba(109,40,217,0.45); box-shadow:0 0 16px rgba(109,40,217,0.4); }
        .ch-vault-link-path { margin-top:8px; color:#94a3b8; font-size:11px; word-break:break-all; }
        .ch-payload-code { background:rgba(0,0,0,0.52); border:1px solid rgba(109,40,217,0.22); border-radius:10px; padding:18px 20px; font-family:'Inter', system-ui, sans-serif; font-size:14.5px; color:#c4b5fd; line-height:2; white-space:pre-wrap; max-height:360px; overflow-y:auto; letter-spacing:0.3px; }
        .ch-payload-code::-webkit-scrollbar { width:4px; }
        .ch-payload-code::-webkit-scrollbar-thumb { background:rgba(109,40,217,0.4); border-radius:3px; }
        .ch-payload-state { display:flex; align-items:center; gap:10px; border-radius:10px; padding:14px 16px; font-size:14px; }
        .ch-payload-solved { background:rgba(16,185,129,0.07); border:1px solid rgba(16,185,129,0.28); color:#6ee7b7; }
        .ch-payload-locked { background:rgba(55,65,81,0.1); border:1px solid rgba(55,65,81,0.25); color:#6b7280; }

        /* hint */
        .ch-hint-section { margin-top:14px; }
        .ch-hint-btn { display:inline-flex; align-items:center; gap:7px; padding:10px 16px; background:rgba(109,40,217,0.08); border:1px solid rgba(109,40,217,0.27); border-radius:8px; cursor:pointer; color:#c4b5fd; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; transition:all 0.15s; font-family:inherit; }
        .ch-hint-btn:hover { background:rgba(109,40,217,0.18); border-color:rgba(167,139,250,0.6); }
        .ch-hint-btn.ch-hint-unlocked { background:rgba(245,158,11,0.1); border-color:rgba(245,158,11,0.4); color:#fbbf24; }
        .ch-hint-cost { color:#ef4444; font-size:10px; margin-left:3px; }
        .ch-hint-unlocked-tag { color:#10b981; font-size:10px; margin-left:3px; }
        .ch-hint-box { margin-top:10px; padding:14px 16px; background:rgba(15,8,40,0.7); border:1px solid rgba(109,40,217,0.38); border-radius:9px; border-left:3px solid #7c3aed; animation:fadeIn 0.3s ease; }
        .ch-hint-label { color:#a78bfa; font-size:10px; font-weight:800; letter-spacing:3px; text-transform:uppercase; margin-bottom:8px; }
        .ch-hint-text { color:#c4b5fd; font-size:15px; line-height:1.9; margin:0; }

        /* empty state */
        .ch-empty-state { display:flex; flex:1; align-items:center; justify-content:center; flex-direction:column; gap:12px; color:#374151; font-size:13px; padding:40px; }

        /* flag bar */
        .ch-flag-bar { border-top:1px solid rgba(109,40,217,0.18); background:rgba(3,1,14,0.98); padding:15px 22px; flex-shrink:0; backdrop-filter:blur(20px); }
        .ch-flag-inner { display:flex; flex-direction:column; gap:10px; }
        .ch-flag-header { display:flex; align-items:center; gap:8px; }
        .ch-flag-icon-wrap { width:26px; height:26px; border-radius:7px; background:linear-gradient(135deg,#5b21b6,#7c3aed); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .ch-flag-label { color:#c4b5fd; font-size:12px; font-weight:700; letter-spacing:3px; text-transform:uppercase; }
        .ch-awaiting-tag { margin-left:auto; display:flex; align-items:center; gap:5px; background:rgba(167,139,250,0.07); border:1px solid rgba(167,139,250,0.18); border-radius:6px; padding:3px 10px; color:#7c6fa0; font-size:9px; letter-spacing:2px; font-weight:700; text-transform:uppercase; }
        .ch-await-dot { width:5px; height:5px; border-radius:50%; background:#a78bfa; box-shadow:0 0 6px #a78bfa; animation:dopulse 1.6s infinite; flex-shrink:0; }
        .ch-flag-form { display:flex; gap:10px; }
        .ch-flag-form .ch-flag-input { flex:1 !important; }
        .ch-transmit-btn { display:flex; align-items:center; gap:7px; padding:12px 22px; background:rgba(109,40,217,0.2); border:1px solid rgba(167,139,250,0.28); border-radius:9px; cursor:not-allowed; color:#7c6fa0; font-size:13px; font-weight:800; letter-spacing:2px; white-space:nowrap; text-transform:uppercase; font-family:inherit; transition:all 0.2s; }
        .ch-transmit-btn.ch-transmit-active { background:linear-gradient(135deg,#5b21b6,#7c3aed); cursor:pointer; color:#fff; border-color:rgba(167,139,250,0.5); box-shadow:0 0 24px rgba(109,40,217,0.4); animation:submitPulse 2.2s ease-in-out infinite; }
        .ch-transmit-btn.ch-transmit-active:hover { box-shadow:0 0 40px rgba(109,40,217,0.65); transform:translateY(-1px); }
        .ch-attempts-info { color:#4b5563; font-size:10px; letter-spacing:1px; }
        .ch-flag-msg { display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:8px; font-size:13px; border:1px solid; animation:fadeIn 0.25s ease; }
        .ch-msg-error  { background:rgba(239,68,68,0.08); border-color:rgba(239,68,68,0.3); color:#fca5a5; }
        .ch-msg-success{ background:rgba(16,185,129,0.08); border-color:rgba(16,185,129,0.3); color:#6ee7b7; }
        .ch-flag-status { display:flex; align-items:center; gap:10px; font-size:14px; }

        /* --- right panel ------------------------------------------ */
        .ch-right-scroll { overflow-y:auto; flex:1; padding:18px 14px; display:flex; flex-direction:column; gap:14px; }
        .ch-right-scroll::-webkit-scrollbar { width:4px; }
        .ch-right-scroll::-webkit-scrollbar-thumb { background:rgba(109,40,217,0.35); border-radius:4px; }

        .ch-team-card { background:linear-gradient(135deg,rgba(109,40,217,0.1),rgba(109,40,217,0.03)); border:1px solid rgba(109,40,217,0.26); border-radius:12px; padding:16px 18px; position:relative; overflow:hidden; }
        .ch-tc-accent-bar { position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#7c3aed,#06b6d4); }
        .ch-tc-label { color:#6b7280; font-size:10px; font-weight:700; letter-spacing:3px; text-transform:uppercase; margin-bottom:6px; }
        .ch-tc-name { font-size:14px; font-weight:700; color:#e2e8f0; margin-bottom:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; letter-spacing:1px; }
        .ch-tc-score-row { display:flex; align-items:baseline; gap:3px; }
        .ch-tc-big { font-size:36px; font-weight:900; color:#e2e8f0; line-height:1; }
        .ch-tc-denom { color:#4b5563; font-size:20px; }
        .ch-tc-sub { color:#6b7280; font-size:12px; margin-bottom:10px; }
        .ch-tc-pts-row { display:flex; align-items:center; gap:6px; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.22); border-radius:9px; padding:10px 14px; }
        .ch-tc-pts-label { color:#6b7280; font-size:10px; font-weight:700; letter-spacing:2px; flex:1; text-transform:uppercase; }
        .ch-tc-pts-val { color:#fbbf24; font-size:20px; font-weight:900; }

        .ch-ops-card { background:rgba(5,2,18,0.8); border:1px solid rgba(55,65,81,0.25); border-radius:11px; padding:14px 16px; }
        .ch-ops-row { display:flex; justify-content:space-between; margin-bottom:9px; }
        .ch-ops-row:last-child { margin-bottom:0; }
        .ch-ops-key { color:#94a3b8; font-size:13px; letter-spacing:1px; }
        .ch-ops-val { font-size:13px; font-weight:700; }
        .ch-ops-val.ok  { color:#10b981; }
        .ch-ops-val.bad { color:#ef4444; }

        .ch-feed-wrap { display:flex; flex-direction:column; flex:1; min-height:0; }
        .ch-feed-toggle { display:flex; align-items:center; gap:6px; background:transparent; border:none; cursor:pointer; padding:4px 0 10px; width:100%; font-family:inherit; }
        .ch-feed-toggle span { color:#a78bfa; font-size:11px; font-weight:700; letter-spacing:2px; flex:1; text-align:left; text-transform:uppercase; }
        .ch-feed-scroll { overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:6px; max-height:260px; }
        .ch-feed-scroll::-webkit-scrollbar { width:3px; }
        .ch-feed-scroll::-webkit-scrollbar-thumb { background:rgba(109,40,217,0.35); border-radius:3px; }
        .ch-feed-empty { color:#374151; font-size:12px; text-align:center; padding:18px 0; border:1px dashed rgba(55,65,81,0.3); border-radius:9px; display:flex; flex-direction:column; align-items:center; gap:7px; }
        .ch-feed-item { padding:10px 12px; background:rgba(8,5,22,0.75); border:1px solid rgba(55,65,81,0.25); border-radius:8px; border-left:2px solid; flex-shrink:0; }
        .ch-feed-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
        .ch-feed-team { color:#e2e8f0; font-size:12px; font-weight:700; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:120px; }
        .ch-feed-action { font-size:9px; font-weight:800; letter-spacing:1px; text-transform:uppercase; }
        .ch-feed-action.solved { color:#10b981; }
        .ch-feed-action.hint   { color:#f59e0b; }
        .ch-feed-action.other  { color:#a78bfa; }
        .ch-feed-msg { color:#6b7280; font-size:12px; line-height:1.45; margin-bottom:4px; }
        .ch-feed-pts { font-size:12px; font-weight:700; }
        .ch-feed-pts.pos { color:#6ee7b7; }
        .ch-feed-pts.neg { color:#fca5a5; }

        /* mobile backdrop */
        .ch-mobile-backdrop { position:fixed; inset:0; z-index:199; background:rgba(0,0,0,0.6); backdrop-filter:blur(3px); }

        /* --- hint confirm modal ----------------------------------- */
        .ch-modal-overlay { position:fixed; inset:0; z-index:300; background:rgba(0,0,0,0.82); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; }
        .ch-modal { width:440px; max-width:90vw; padding:24px 24px 20px; animation:fadeIn 0.2s ease; }
        .ch-modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .ch-modal-title { margin:0; color:#e9d5ff; font-size:17px; font-weight:900; letter-spacing:2px; }
        .ch-modal-close { background:none; border:none; cursor:pointer; color:#6b7280; padding:4px; display:flex; align-items:center; justify-content:center; transition:color 0.15s; }
        .ch-modal-close:hover { color:#e2e8f0; }
        .ch-modal-body { color:#94a3b8; font-size:13px; line-height:1.7; margin-bottom:14px; }
        .ch-modal-warning { margin-bottom:16px; display:flex; align-items:center; gap:8px; font-size:13px; }
        .ch-modal-actions { display:flex; gap:8px; justify-content:flex-end; }
        .ch-modal-actions .btn-game-secondary { padding:9px 16px; font-size:12px; }
        .ch-modal-actions .btn-game-danger    { padding:9px 16px; font-size:12px; }

        /* loading screen */
        .ch-loading-screen { min-height:100vh; background:#080614; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:16px; font-family:'Inter', system-ui, sans-serif; }
        .ch-spin-ring { width:44px; height:44px; border-radius:50%; border:2px solid rgba(109,40,217,0.2); border-top-color:#7c3aed; animation:spin 0.8s linear infinite; }

        /* --- responsive ------------------------------------------- */
        @media (max-width:900px) {
          .ch-mob-btn { display:flex; }
          .ch-brand-name { display:none; }
          .ch-topbar-missions { display:none; }
          .ch-topbar-divider { display:none; }
          .ch-nav-link span { display:none; }
          .ch-nav-link { padding:6px 8px; }
          .ch-score-num { font-size:14px; }
          .ch-left-panel, .ch-right-panel {
            position:fixed; top:54px; z-index:200; height:calc(100vh - 54px);
            transform:translateX(-110%); transition:transform 0.28s ease !important;
            width:288px !important; min-width:288px !important;
          }
          .ch-right-panel { left:auto; right:0; transform:translateX(110%); }
          .ch-left-panel.ch-mobile-slide  { transform:translateX(0); }
          .ch-right-panel.ch-mobile-slide { transform:translateX(0); }
          .ch-panel-toggle { display:none; }
          .ch-collapsed-strip { display:none; }
          .ch-center-scroll { padding:18px 16px 16px; }
          .ch-focus-btn span { display:none; }
        }
        @media (max-width:600px) {
          .ch-mission-title { font-size:17px; }
          .ch-portrait { width:80px; }
          .ch-intel-info { left:90px; }
          .ch-payload-code { font-size:12.5px; }
          .ch-flag-bar { padding:12px 14px; }
          .ch-transmit-btn { padding:11px 14px; font-size:11px; letter-spacing:1px; }
          .ch-score-badge { padding:5px 10px; }
          .ch-team-name { max-width:80px; }
        }
      `}</style>
    </div>
  );
}

export default function ChallengesPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#080614', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontFamily: "'Inter', system-ui, sans-serif" }}>
        Loading mission data...
      </div>
    }>
      <ChallengesInner />
    </Suspense>
  );
}
