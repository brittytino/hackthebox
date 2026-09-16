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
  ChevronsLeft, ChevronsRight, ChevronRight, ChevronLeft,
  SkipForward, Menu, Copy, Check,
} from 'lucide-react';
import FocusScreenAdvisory, { FocusScreenButton, useFocusScreen } from '@/components/ui/FocusScreenAdvisory';

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

/* --- STORY COMPLETION SCENES (BEAST 2022 NARRATIVE) ---------------------- */
const COMPLETION_STORIES: Record<number, {
  title: string; quote: string; subtext: string;
  character: string; characterImage: string;
  bgColor: string; accentColor: string; bgImage: string;
}> = {
  1: {
    title: 'TRANSMISSION DECODED',
    quote: '"Command relay identified — basement sector ER-42. Preethi, route the team through the ventilation shafts. We move now."',
    subtext: 'Server Room ER-42 is the next target. The fragmented access codes await.',
    character: 'Veera Raghavan',
    characterImage: '/images/characters/veera_determined.webp',
    bgColor: 'rgba(239,68,68,0.12)',
    accentColor: '#ef4444',
    bgImage: '/images/background/1.webp',
  },
  2: {
    title: 'ACCESS CODES ASSEMBLED',
    quote: '"ER-42 outer bulkhead unlocked. Move fast, Veera — armed patrols are converging on the east corridor. The biometric vault is on sub-level 2."',
    subtext: 'The time-locked biometric vault holds Saif\'s complete attack blueprint.',
    character: 'Preethi',
    characterImage: '/images/characters/preethi_hopeful.webp',
    bgColor: 'rgba(234,179,8,0.12)',
    accentColor: '#f59e0b',
    bgImage: '/images/background/2.webp',
  },
  3: {
    title: 'VAULT CRACKED — ROUND 1 COMPLETE',
    quote: '"Attack schematics secured. Saif is threatening to execute hostages live on air. Three encrypted databases hold his operational network."',
    subtext: 'Round 1 complete. The Infiltration phase begins now.',
    character: 'NSA Althaf',
    characterImage: '/images/characters/althaf_commanding.webp',
    bgColor: 'rgba(16,185,129,0.12)',
    accentColor: '#10b981',
    bgImage: '/images/background/3.webp',
  },
  4: {
    title: 'HASH TRAIL BROKEN',
    quote: '"Databases cracked. Foreign transactions and communications uncovered. The trail leads directly to the Home Minister! Veera, Saif knows we are inside."',
    subtext: 'The JWT admin token holds the next layer of proof.',
    character: 'Veera Raghavan',
    characterImage: '/images/characters/veera_intense.webp',
    bgColor: 'rgba(239,68,68,0.12)',
    accentColor: '#ef4444',
    bgImage: '/images/background/4.webp',
  },
  5: {
    title: 'MINISTERIAL TREASON EXPOSED',
    quote: '"Admin logs decrypted — Home Minister Veera Santhanam staged the crisis to force Umar Farooq\'s release. His high treason is documented!"',
    subtext: 'One encrypted command database remains. The mall lockdown frequency is inside.',
    character: 'Preethi',
    characterImage: '/images/characters/preethi_hopeful.webp',
    bgColor: 'rgba(234,179,8,0.12)',
    accentColor: '#f59e0b',
    bgImage: '/images/background/5.webp',
  },
  6: {
    title: 'PATTERN LOCK BROKEN — ROUND 2 COMPLETE',
    quote: '"Mall frequency hijacked. Veera has cornered the corrupt officials and delayed Farooq\'s border handover. But Saif has armed the demolition network!"',
    subtext: 'Round 2 complete. The Final Strike begins.',
    character: 'NSA Althaf',
    characterImage: '/images/characters/althaf_concerned.webp',
    bgColor: 'rgba(16,185,129,0.12)',
    accentColor: '#10b981',
    bgImage: '/images/background/6.webp',
  },
  7: {
    title: 'PAYLOAD FRAGMENTS RECONSTRUCTED',
    quote: '"Demolition telemetry reassembled! Preethi extracted the four shards from Saif\'s rig. The main detonator code is mapped — we need the disarm sequence now!"',
    subtext: 'A fail-deadly logic bomb guards the central detonator. One misstep triggers the blast.',
    character: 'Veera Raghavan',
    characterImage: '/images/characters/veera_concerned.webp',
    bgColor: 'rgba(239,68,68,0.12)',
    accentColor: '#ef4444',
    bgImage: '/images/background/7.webp',
  },
  8: {
    title: 'LOGIC BOMB DEFUSED — MALL SECURED',
    quote: '"Bomb neutralized! The blast doors are open and all 1,200 hostages are evacuating safely. Saif is down. But Umar Farooq is crossing the border!"',
    subtext: 'Final challenge: Farooq\'s Master Vault across the border. Use every skill you have mastered.',
    character: 'Preethi',
    characterImage: '/images/characters/preethi_hopeful.webp',
    bgColor: 'rgba(16,185,129,0.12)',
    accentColor: '#10b981',
    bgImage: '/images/background/8.webp',
  },
  9: {
    title: 'TERRORIST NETWORK TERMINATED',
    quote: '"Airspace breached, fighter dogfight won, and Farooq is captured. The master vault is shattered. Chennai and the nation are safe."',
    subtext: 'Operation complete. All 9 missions cleared — true Beast status achieved.',
    character: 'Veera Raghavan',
    characterImage: '/images/characters/veera_relieved.webp',
    bgColor: 'rgba(16,185,129,0.18)',
    accentColor: '#10b981',
    bgImage: '/images/background/9.webp',
  },
};

const MISSIONS: MissionMeta[] = [
  {
    order: 1, round: 1, level: '1.1',
    name: 'The Intercepted Transmission',
    type: 'CRYPTOGRAPHY', difficulty: 'medium', points: 100,
    storyAct: 'ACT I — THE SIEGE BEGINS',
    storyTime: '03:47 AM  Basement Telecom Relay ER-42',
    storyStatus: '1,200 HOSTAGES  EXECUTION THREAT IN 28 MIN',
    situation: 'East Coast Mall in Chennai has been seized by terrorists commanded by Umar Saif, holding 1,200 hostages to demand the release of Umar Farooq. Veera has gone dark inside the building and reached the basement telecom relay ER-42. He taps into the encrypted shortwave line to intercept Saif\'s command transmission.',
    intel: '"Intercepted their shortwave command packet. It was armored in multiple encoding passes to conceal their ground floor deployment. Reverse it before they shift frequencies."',
    character: 'Veera Raghavan',
    characterImage: '/images/characters/veera_determined.webp',
    roundLabel: 'ROUND 1  BREACH',
  },
  {
    order: 2, round: 1, level: '1.2',
    name: 'The Fragmented Server Map',
    type: 'FORENSICS', difficulty: 'medium', points: 150,
    storyAct: 'ACT I — THE SIEGE BEGINS',
    storyTime: '04:15 AM  Approaching Server Room ER-42',
    storyStatus: 'PATROLS ACTIVE  EXECUTION THREAT IN 15 MIN',
    situation: 'Preethi\'s cyber unit intercepts three fragmented relay files — the security door access code for Server Room ER-42. With hostile patrols sweeping the corridors, Veera is 50 meters away and needs the complete authorization phrase immediately.',
    intel: '"Three fragments, three independent encoding schemes. Decode each piece and assemble in exact order — A then B then C. Veera is holding off the patrol."',
    character: 'Preethi',
    characterImage: '/images/characters/preethi_worried.webp',
    roundLabel: 'ROUND 1  BREACH',
  },
  {
    order: 3, round: 1, level: '1.3',
    name: 'The Time-Locked Vault',
    type: 'MATH/HASH', difficulty: 'hard', points: 200,
    storyAct: 'ROUND 1 FINALE',
    storyTime: '04:45 AM  Server Room ER-42 Biometric Vault',
    storyStatus: 'FIRST HOSTAGE DEADLINE EXPIRING',
    situation: 'Veera reaches the biometric vault in ER-42. The system uses a team-bound algorithmic lock to prevent shared answers. Inside is Saif\'s complete mall infiltration blueprint and C4 detonation grid.',
    intel: '"Personalised algorithmic vault lock — your authorization code depends strictly on your team registration data. Compute it with zero error or the vault seals permanently."',
    character: 'NSA Althaf',
    characterImage: '/images/characters/althaf_commanding.webp',
    roundLabel: 'ROUND 1  BREACH',
  },
  {
    order: 4, round: 2, level: '2.1',
    name: 'The Corrupted Hash Trail',
    type: 'HASH CRACKING', difficulty: 'medium', points: 250,
    storyAct: 'ACT II — THE CONSPIRACY',
    storyTime: '05:12 AM  Security Ops Terminal',
    storyStatus: 'CABINET UNDER PRESSURE  FAROOQ CONVOY PREPARING',
    situation: 'The hard drive recovered from the vault contains three password-protected databases: sleeper cell identities, foreign funding channels, and high-level government communication records. Cracking them will stop Farooq\'s release.',
    intel: '"Three locked databases, three password hashes. Crack all three to assemble the master credential. This evidence exposes who on the outside is helping Saif."',
    character: 'Veera Raghavan',
    characterImage: '/images/characters/veera_intense.webp',
    roundLabel: 'ROUND 2  INFILTRATION',
  },
  {
    order: 5, round: 2, level: '2.2',
    name: 'The JWT Inception',
    type: 'WEB/TOKEN', difficulty: 'medium', points: 300,
    storyAct: 'ACT II — THE MINISTERIAL BETRAYAL',
    storyTime: '05:50 AM  Terrorist Admin Panel',
    storyStatus: 'HOME MINISTER SANTHANAM\'S CRISIS STAGED',
    situation: 'Veera accesses the terrorist admin portal. Preethi uncovers proof that Home Minister Veera Santhanam staged his family\'s hostage situation inside East Coast Mall to force the Prime Minister into releasing Umar Farooq. Decode the obfuscated JWT token to expose his treason.',
    intel: '"The token is wrapped and obfuscated in hex. Strip the wrapper, extract the operational claims, and decode the embedded evidence. That is our proof the Home Minister colluded with Saif."',
    character: 'Preethi',
    characterImage: '/images/characters/preethi_hopeful.webp',
    roundLabel: 'ROUND 2  INFILTRATION',
  },
  {
    order: 6, round: 2, level: '2.3',
    name: 'The Pattern Lock',
    type: 'CRYPTOGRAPHY', difficulty: 'hard', points: 350,
    storyAct: 'ROUND 2 FINALE — HOSTAGE COUNTERSTRIKE',
    storyTime: '06:15 AM  Central Command Node',
    storyStatus: 'FAROOQ BORDER HANDOVER IN 3 HOURS',
    situation: 'Veera turns the tables by capturing the Home Minister\'s accomplices inside the mall as leverage. NSA Althaf alerts Veera that Farooq\'s transport convoy is approaching the border. Veera must breach the dynamic pattern lock to hijack the negotiation frequency and freeze the handover.',
    intel: '"Dynamic pattern lock unique to your team. Compute your hash digest to hijack the command frequency and broadcast our counter-ultimatum before Farooq crosses the border."',
    character: 'NSA Althaf',
    characterImage: '/images/characters/althaf_concerned.webp',
    roundLabel: 'ROUND 2  INFILTRATION',
  },
  {
    order: 7, round: 3, level: '3.1',
    name: 'The Payload Hunt',
    type: 'REVERSE ENG', difficulty: 'medium', points: 400,
    storyAct: 'ACT III — THE FINAL STRIKE',
    storyTime: '07:10 AM  Central Atrium Demolition Grid',
    storyStatus: 'VEERA COMPROMISED  DEMOLITION SEQUENCE ARMED',
    situation: 'Saif discovers Veera\'s identity and activates the mall\'s master demolition protocol. Preethi extracts four fragmented telemetry packets from Saif\'s detonator unit. Decode all four fragments to analyze the trigger sequence and build the disarm command.',
    intel: '"Four payload fragments, four distinct conversion protocols. Identify each, decode them, and concatenate in order 1 through 4. We need the full payload string to disarm the detonator."',
    character: 'Veera Raghavan',
    characterImage: '/images/characters/veera_concerned.webp',
    roundLabel: 'ROUND 3  FINAL STRIKE',
  },
  {
    order: 8, round: 3, level: '3.2',
    name: 'The Logic Bomb Defusal',
    type: 'NESTED DECODE', difficulty: 'hard', points: 450,
    storyAct: 'ROUND 3 CRITICAL — THE MALL DEMOLITION',
    storyTime: '07:35 AM  Power Substation Detonation Unit',
    storyStatus: 'FAIL-DEADLY LOGIC BOMB: 10 MIN REMAINING',
    situation: 'Umar Saif arms a fail-deadly logic bomb wired to the mall\'s gas line and primary transformers. If the countdown reaches zero, all 1,200 hostages will perish. The defusal payload is concealed beneath nested encoding layers. Strip every layer to stop the blast.',
    intel: '"Multiple nested conversion layers protect the defusal code. Carefully peel each layer back until you recover the raw flag. One miscalculation detonates the mall."',
    character: 'Preethi',
    characterImage: '/images/characters/preethi_worried.webp',
    roundLabel: 'ROUND 3  FINAL STRIKE',
  },
  {
    order: 9, round: 3, level: '3.3',
    name: 'The Master Vault',
    type: 'FINAL BOSS', difficulty: 'hard', points: 1000,
    storyAct: 'EPILOGUE — BORDER CLIMAX & DOGFIGHT',
    storyTime: '08:00 AM  Hostile Airspace // Farooq\'s Mountain Fortress',
    storyStatus: '1,200 HOSTAGES SAVED  FINAL TARGET: FAROOQ',
    situation: 'East Coast Mall is saved and Saif is defeated, but Umar Farooq crossed the Pakistan border. Veera commandeers an IAF fighter jet, flies deep into hostile airspace in a high-speed dogfight, and breaches Farooq\'s master command server. Decrypt the Master Vault to permanently terminate the global terrorist syndicate.',
    intel: '"This is the finale. Every cryptographic concept you have conquered culminates here. Break through the multi-layer security grid, crack the Master Vault, and bring Farooq to justice."',
    character: 'Veera Raghavan',
    characterImage: '/images/characters/veera_relieved.webp',
    roundLabel: 'ROUND 3  FINAL STRIKE',
  },
];

const ROUND_CONFIG: Record<number, { badge: string; primary: string; glow: string; border: string }> = {
  1: { badge: 'round-1', primary: '#ef4444', glow: 'rgba(239,68,68,0.4)', border: 'rgba(239,68,68,0.5)' },
  2: { badge: 'round-2', primary: '#dc2626', glow: 'rgba(220,38,38,0.4)', border: 'rgba(220,38,38,0.5)' },
  3: { badge: 'round-3', primary: '#991b1b', glow: 'rgba(153,27,27,0.4)', border: 'rgba(153,27,27,0.5)' },
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
  const [activity, setActivity] = useState<Record<string, any>[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [feedOpen, setFeedOpen] = useState(true);
  const [storyModal, setStoryModal] = useState<{ level: number } | null>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [cinematicTransition, setCinematicTransition] = useState(false);

  const { toggleFullscreen } = useFocusScreen();

  // Hint cache: maps challengeId ? { texts, shown, revealed, total }
  const [hintCache, setHintCache] = useState<Record<string, { texts: string[]; shown: boolean; revealed: number; total: number }>>({})
  // Mobile panel overlay: 'missions' | 'intel' | null
  const [mobilePanel, setMobilePanel] = useState<'missions' | 'intel' | null>(null);

  const searchParams = useSearchParams();
  const levelParam = searchParams.get('level');

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
    if (order === currentLevel && currentLevel <= totalLevels) return 'active';
    return currentLevel > totalLevels ? 'solved' : 'locked';
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

  // GSAP entrance animations with smooth gentle glide
  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-g="topbar"]', { y: -30, opacity: 0, duration: 0.45, ease: 'power3.out' });
      gsap.from('[data-g="left"]', { x: -35, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.06 });
      gsap.from('[data-g="center"]', { y: 18, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.1 });
      gsap.from('[data-g="right"]', { x: 35, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.06 });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  // Sync fullscreen change with focusMode
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = Boolean(document.fullscreenElement);
      if (!isFs && focusMode) {
        setFocusMode(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [focusMode]);

  const toggleFocusScreen = useCallback(async () => {
    setCinematicTransition(true);
    const nextMode = !focusMode;
    setFocusMode(nextMode);

    if (nextMode) {
      if (!document.fullscreenElement) {
        try {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          }
        } catch {}
      }
    } else {
      if (document.fullscreenElement) {
        try {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          }
        } catch {}
      }
    }

    setTimeout(() => {
      setCinematicTransition(false);
    }, 850);
  }, [focusMode]);

  const exitFocusMode = useCallback(async () => {
    setFocusMode(false);
    if (document.fullscreenElement) {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch {}
    }
  }, []);

  // Keyboard shortcut listener: F = Focus, T = Timeline, I = Intel, Esc = Exit Focus
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFocusScreen();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setLeftOpen(prev => !prev);
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setRightOpen(prev => !prev);
      } else if (e.key === 'Escape' && focusMode) {
        exitFocusMode();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [focusMode, toggleFocusScreen, exitFocusMode]);

  const handleCopyPayload = async () => {
    const text = apiResponse?.challenge?.description
      ? formatPayloadText(apiResponse.challenge.description)
      : '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2200);
    } catch {
      // Fallback
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2200);
    }
  };

  // Reset message/flag on level switch; preserve hints
  useEffect(() => {
    if (prevLevelRef.current === selectedLevel) return;
    prevLevelRef.current = selectedLevel;
    setMessage('');
    setFlag('');
  }, [selectedLevel]);

  const activeIndex = MISSIONS.findIndex(m => m.level === selectedLevel);
  const prevMission = activeIndex > 0 ? MISSIONS[activeIndex - 1] : null;
  const nextMission = activeIndex >= 0 && activeIndex < MISSIONS.length - 1 ? MISSIONS[activeIndex + 1] : null;
  const canGoPrev = Boolean(prevMission);
  const canGoNext = Boolean(nextMission && getState(nextMission.order) !== 'locked');

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
        if (res.gameCompleted) {
          router.push('/victory');
          return;
        }
        // Redirect to story page with challenge context
        router.push(`/story?challenge=${solvedOrder}`);
      } else {
        setMessage(res.message || 'Incorrect flag. Analyse and retry.');
        setIsError(true);
      }
    } catch (err: unknown) {
      setMessage((err as Error).message || 'Submission failed.');
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
    } catch (err: unknown) {
      setMessage((err as Error).message || 'Failed to reveal intel.');
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
      <div className="ch-loading-sub">TACTICAL HANDSHAKE IN PROGRESS...</div>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .ch-loading-screen{min-height:100vh;background:#050508;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;font-family:monospace;}
        .ch-spin-ring{width:52px;height:52px;border:3px solid rgba(220,38,38,0.22);border-top-color:#ef4444;border-radius:50%;animation:spin 0.85s linear infinite;}
        .ch-loading-title{color:#ef4444;letter-spacing:4px;font-size:12px;font-weight:700;text-transform:uppercase;}
        .ch-loading-sub{color:#6b7280;font-size:11px;letter-spacing:2px;}
      `}</style>
    </div>
  );

  const isCompletedAll = Boolean(apiResponse?.progress?.completedAll || currentLevel > totalLevels);
  const scored = isCompletedAll ? 9 : Math.max(currentLevel - 1, 0);
  const rescued = isCompletedAll ? 1200 : (HOSTAGE[scored] ?? 0);
  const rescuePct = Math.round((rescued / 1200) * 100);
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

      {/* Focus Screen Advisory on First Landing */}
      <FocusScreenAdvisory onEngage={toggleFocusScreen} />

      {/* Cinematic Full Screen Scanline Effect */}
      {cinematicTransition && (
        <div className="focus-scan-overlay" aria-hidden="true">
          <div className="focus-scan-beam" />
        </div>
      )}

      {/* Floating HUD Chip when in Focus Mode */}
      {focusMode && (
        <button
          type="button"
          onClick={exitFocusMode}
          className="focus-hud-badge"
          title="Exit Focus Mode (Esc or F11)"
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
              animation: 'ledPulse 1.5s infinite',
            }}
          />
          <span>FOCUS MODE ACTIVE</span>
          <span
            style={{
              fontSize: 9,
              color: '#a7f3d0',
              background: 'rgba(16,185,129,0.2)',
              padding: '2px 6px',
              borderRadius: 3,
            }}
          >
            CLICK OR ESC TO EXIT
          </span>
        </button>
      )}

      {/* -- TOP BAR -- */}
      <header data-g="topbar" className="ch-topbar">
        {/* Brand */}
        <Link href="/dashboard" className="ch-brand">
          <span className="ch-brand-name">The Extraction</span>
        </Link>

        {/* Nav */}
        <nav className="ch-topbar-nav">
          <Link href="/dashboard" className="ch-nav-link"><Activity size={13} /><span>HQ</span></Link>
          <Link href="/leaderboard" className="ch-nav-link"><Trophy size={13} /><span>LEADERBOARD</span></Link>
          <Link href={storyHref} className="ch-nav-link"><Map size={13} /><span>STORY</span></Link>

          {/* Quick Sidebar Toggles in Topbar */}
          <button
            type="button"
            onClick={() => setLeftOpen(v => !v)}
            className={`ch-nav-link ${leftOpen ? 'ch-nav-active' : ''}`}
            title={`Toggle Timeline (${leftOpen ? 'Open' : 'Collapsed'}) - Hotkey: T`}
          >
            <RadioTower size={13} />
            <span className="ch-nav-hide-mob">TIMELINE</span>
          </button>

          <button
            type="button"
            onClick={() => setRightOpen(v => !v)}
            className={`ch-nav-link ${rightOpen ? 'ch-nav-active' : ''}`}
            title={`Toggle Intel Panel (${rightOpen ? 'Open' : 'Collapsed'}) - Hotkey: I`}
          >
            <Shield size={13} />
            <span className="ch-nav-hide-mob">INTEL</span>
          </button>

          {/* Unified Animated Focus Screen Button */}
          <FocusScreenButton
            isFocusMode={focusMode}
            onToggleFocus={toggleFocusScreen}
          />
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
            {leftOpen ? <ChevronsLeft size={10} color="#fca5a5" /> : <ChevronsRight size={10} color="#fca5a5" />}
          </button>

          {/* Collapsed icon strip */}
          {!leftOpen && (
            <div className="ch-collapsed-strip">
              <RadioTower size={15} color="#ef4444" />
              {MISSIONS.map(m => {
                const s = getState(m.order);
                return (
                  <div key={m.level}
                    className="ch-dot-pip"
                    onClick={() => { setSelectedLevel(m.level); setLeftOpen(true); }}
                    title={m.name}
                    style={{
                      background: s === 'solved' ? '#10b981' : s === 'active' ? '#ef4444' : '#374151',
                      boxShadow: s === 'active' ? '0 0 8px #ef4444' : 'none',
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
                <RadioTower size={12} color="#ef4444" />
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
                { act: 'ROUND 2 — INFILTRATION', color: '#f87171', rgb: '220,38,38', orders: [4,5,6] },
                { act: 'ROUND 3 — FINAL STRIKE', color: '#ef4444', rgb: '185,28,28', orders: [7,8,9] },
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
                          background: s === 'solved' ? '#10b981' : s === 'active' ? '#ef4444' : '#1f0d12',
                          borderColor: s === 'solved' ? '#6ee7b7' : s === 'active' ? '#f87171' : '#4b5563',
                          boxShadow: s === 'active' ? '0 0 12px rgba(239,68,68,0.9)' : s === 'solved' ? '0 0 6px rgba(16,185,129,0.5)' : 'none',
                        }} />
                        <div
                          onClick={() => can && setSelectedLevel(m.level)}
                          className={`ch-mc-card ${sel ? 'ch-mc-sel' : ''} ${s === 'locked' ? 'ch-mc-locked' : ''}`}
                          style={{
                            marginLeft: isAlt ? 22 : 26, marginRight: isAlt ? 26 : 22,
                            borderColor: sel ? 'rgba(239,68,68,0.8)' : s === 'solved' ? 'rgba(16,185,129,0.35)' : s === 'active' ? 'rgba(220,38,38,0.6)' : 'rgba(220,38,38,0.18)',
                            background: sel ? 'rgba(220,38,38,0.18)' : s === 'solved' ? 'rgba(16,185,129,0.06)' : s === 'active' ? 'rgba(127,10,10,0.22)' : 'rgba(8,3,5,0.75)',
                            opacity: s === 'locked' ? 0.35 : 1,
                            boxShadow: sel ? `0 0 18px ${rc2.glow}` : s === 'active' ? `0 2px 14px ${rc2.glow}` : 'none',
                            borderLeft: `3px solid ${sel ? '#ef4444' : s === 'solved' ? '#10b981' : s === 'active' ? '#dc2626' : '#2d0f14'}`,
                            cursor: can ? 'pointer' : 'default',
                          }}
                        >
                          <div className="ch-mci-row">
                            <span className="ch-mc-icon">
                              {s === 'solved' ? <CheckCircle size={12} color="#10b981" /> : s === 'active' ? <Zap size={12} color="#ef4444" /> : <Lock size={12} color="#4b5563" />}
                            </span>
                            <span className="ch-mc-lvl">{m.level}</span>
                            <span className={`diff-badge diff-${m.difficulty}`} style={{ fontSize: 9, padding: '1px 5px' }}>{m.difficulty[0].toUpperCase()}</span>
                          </div>
                          <div className={`ch-mc-name ${sel ? 'ch-mc-name-sel' : ''}`}>{m.name}</div>
                          <div className="ch-mc-pts">
                            <span style={{ color: '#ef4444' }}>{m.points} pts</span>
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
              <div className="ch-complete-icon">🏆</div>
              <div className="game-title ch-complete-title">OPERATION BEAST — SIEGE TERMINATED</div>
              <p className="ch-complete-body">All 9 missions cleared! 1,200 hostages rescued, Umar Saif neutralized, and Umar Farooq recaptured across the border. East Coast Mall and Chennai are secure.</p>
              <div className="ch-complete-score">FINAL SCORE: {teamPoints.toLocaleString()} PTS</div>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div className="ch-act-label">{meta.storyAct}</div>
                  
                  {/* Quick Mission Switcher */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      disabled={!canGoPrev}
                      onClick={() => prevMission && setSelectedLevel(prevMission.level)}
                      className="ch-step-btn"
                      title={prevMission ? `Previous: ${prevMission.name}` : 'First mission'}
                    >
                      <ChevronLeft size={12} />
                      <span>PREV</span>
                    </button>
                    <button
                      type="button"
                      disabled={!canGoNext}
                      onClick={() => nextMission && canGoNext && setSelectedLevel(nextMission.level)}
                      className="ch-step-btn"
                      title={nextMission ? (canGoNext ? `Next: ${nextMission.name}` : 'Next mission locked') : 'Last mission'}
                    >
                      <span>NEXT</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
                <h1 className="ch-mission-title">{meta.level} — {meta.name}</h1>
              </div>

              {/* - Character Intel Banner (Responsive Flexbox, No Vertical Misalignment) - */}
              <div className="ch-intel-banner" style={{
                borderColor: rc.border,
                boxShadow: `0 0 24px ${rc.glow}, 0 6px 20px rgba(0,0,0,0.45)`,
              }}>
                {/* Top accent line */}
                <div className="ch-intel-accent-line" style={{ background: `linear-gradient(90deg,transparent,${rc.primary},transparent)` }} />
                
                {/* Scene Content */}
                <div className="ch-intel-scene" style={{ background: `linear-gradient(135deg,rgba(${meta.round===1?'239,68,68':meta.round===2?'245,158,11':'16,185,129'},0.06),rgba(2,1,12,0.98))` }}>
                  <div className="ch-intel-grid-bg" />
                  
                  {/* Tactical Portrait Frame */}
                  <div className="ch-portrait-box" style={{ borderColor: rc.border }}>
                    <div className="ch-portrait-img-wrap">
                      <Image
                        src={meta.characterImage}
                        alt={meta.character}
                        fill
                        sizes="92px"
                        style={{ objectFit: 'cover', objectPosition: 'center 12%' }}
                        priority
                      />
                    </div>
                    <span className="ch-portrait-corner ch-p-tl" style={{ borderColor: rc.primary }} />
                    <span className="ch-portrait-corner ch-p-br" style={{ borderColor: rc.primary }} />
                    <div className="ch-portrait-tag" style={{ background: `rgba(${meta.round===1?'239,68,68':meta.round===2?'245,158,11':'16,185,129'},0.88)` }}>
                      <span className="ch-tag-dot" /> LIVE
                    </div>
                  </div>

                  {/* Intel details */}
                  <div className="ch-intel-info">
                    <div className="ch-intel-row1">
                      <div className="ch-operative-badge" style={{ background: `rgba(${meta.round===1?'239,68,68':meta.round===2?'245,158,11':'16,185,129'},0.12)`, borderColor: rc.border, color: rc.primary }}>
                        OPERATIVE
                      </div>
                      <span className="ch-char-name">{meta.character}</span>
                      <span className="ch-char-callsign">
                        {meta.character === 'Veera Raghavan' ? 'EX-RAW AGENT // CODENAME: BEAST' :
                         meta.character === 'Preethi' ? 'CYBER SECURITY LIAISON' :
                         meta.character === 'NSA Althaf' ? 'CHIEF NEGOTIATOR // RAW COMMAND' : 'TACTICAL ADVISOR'}
                      </span>
                    </div>

                    <div className="ch-intel-meta-row">
                      <div className="ch-intel-time">
                        <Clock size={11} color="#94a3b8" />
                        <span>{meta.storyTime}</span>
                      </div>
                      <div className="ch-intel-status">
                        <span className="ch-status-dot" />
                        <span>{meta.storyStatus}</span>
                      </div>
                    </div>

                    <div className="ch-intel-transmission">
                      <RadioTower size={11} color={rc.primary} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span className="ch-intel-comm-text">{meta.intel}</span>
                    </div>
                  </div>
                </div>

                {/* Hostage Rescue Section */}
                <div className="ch-rescue-section">
                  <div className="ch-rescue-bar">
                    <div className="ch-rescue-label">
                      <Users size={11} color="#94a3b8" />
                      <span>HOSTAGE EVACUATION STATUS</span>
                    </div>
                    <div className="ch-rescue-meta">
                      <span className="ch-rescue-count" style={{ color: rescuePct>=100?'#10b981':rescuePct>=60?'#f59e0b':'#ef4444' }}>
                        {rescued.toLocaleString()} / 1,200 RESCUED
                      </span>
                      <span className="ch-rescue-pct" style={{ color: rescuePct>=100?'#10b981':'#f59e0b' }}>
                        ({rescuePct}%)
                      </span>
                    </div>
                  </div>
                  <div className="ch-rescue-track">
                    <div
                      className="ch-rescue-fill"
                      style={{
                        width:`${rescuePct}%`,
                        background: rescuePct>=100?'linear-gradient(90deg,#10b981,#34d399)':'linear-gradient(90deg,#ef4444,#f59e0b,#7c3aed)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* - Situation - */}
              <div className="ch-sitrep">
                <div className="ch-section-label"><Shield size={11} color="#6b7280" />SITUATION REPORT</div>
                <p className="ch-sitrep-text">{meta.situation}</p>
              </div>

              {/* - Cipher payload - */}
              <div className="ch-payload-panel game-panel-bordered">
                <div className="ch-payload-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Terminal size={13} color="#06b6d4" />
                    <span>CIPHER PAYLOAD</span>
                    {state === 'active' && <span className="ch-live-dot" />}
                  </div>

                  {state === 'active' && apiResponse?.challenge?.description && (
                    <button
                      type="button"
                      onClick={handleCopyPayload}
                      className="ch-copy-btn"
                      title="Copy payload to clipboard"
                    >
                      {copiedPayload ? (
                        <>
                          <Check size={12} color="#10b981" />
                          <span style={{ color: '#6ee7b7' }}>COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} color="#fca5a5" />
                          <span>COPY PAYLOAD</span>
                        </>
                      )}
                    </button>
                  )}
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
              {state === 'solved' && (
                <div className="game-alert-success ch-flag-status">
                  <CheckCircle size={16} />
                  {isCompletedAll
                    ? '🎉 Operation Beast Complete! All 9 missions cleared.'
                    : 'Mission complete. Select the next level from the timeline.'}
                </div>
              )}
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
            {rightOpen ? <ChevronsRight size={10} color="#fca5a5" /> : <ChevronsLeft size={10} color="#fca5a5" />}
          </button>

          {/* Collapsed strip */}
          {!rightOpen && (
            <div className="ch-collapsed-strip">
              <Shield size={15} color="#ef4444" />
              <Activity size={15} color="#ef4444" />
              <Trophy size={15} color="#ef4444" />
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
                  { label: 'EAST COAST MALL', val: currentLevel >= 9 ? 'SECURED'    : 'ACTIVE SIEGE',  ok: currentLevel >= 9 },
                  { label: 'OP The Extraction',  val: currentLevel >= 9 ? 'TERMINATED' : 'ARMED FEB 14',  ok: currentLevel >= 9 },
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
                      ) : activity.map((item: Record<string, any>, i: number) => (
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
              <AlertTriangle size={13} />Penalty for next intel tier: -{nextHintPenalty} points (Will result in negative score if points are low or zero)
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
            repeating-linear-gradient(0deg,rgba(220,38,38,0.03) 0,rgba(220,38,38,0.03) 1px,transparent 1px,transparent 52px),
            repeating-linear-gradient(90deg,rgba(220,38,38,0.03) 0,rgba(220,38,38,0.03) 1px,transparent 1px,transparent 52px),
            radial-gradient(ellipse 90% 70% at 50% 0%,rgba(220,38,38,0.1),transparent 72%); }

        /* --- topbar ----------------------------------------------- */
        .ch-topbar { position:sticky; top:0; z-index:50; display:flex; align-items:center; padding:0 20px; height:56px; border-bottom:1px solid rgba(220,38,38,0.3); background:rgba(8,3,5,0.97); backdrop-filter:blur(24px); gap:10px; flex-shrink:0; }
        .ch-brand { display:flex; align-items:center; gap:9px; text-decoration:none; }
        .ch-brand-icon { width:30px; height:30px; border-radius:6px; background:linear-gradient(135deg,#7f1d1d,#dc2626); display:flex; align-items:center; justify-content:center; flex-shrink:0; border:1px solid rgba(248,113,113,0.4); }
        .ch-brand-name { color:#f1f5f9; font-size:14px; font-weight:900; letter-spacing:3px; text-transform:uppercase; white-space:nowrap; }
        .ch-topbar-nav { display:flex; align-items:center; gap:4px; margin-left:auto; }
        .ch-nav-link { display:flex; align-items:center; gap:5px; color:#94a3b8; font-size:11px; font-weight:700; letter-spacing:2px; text-decoration:none; text-transform:uppercase; padding:6px 12px; border:1px solid rgba(220,38,38,0.3); border-radius:6px; transition:all 0.15s; white-space:nowrap; font-family:monospace; }
        .ch-nav-link:hover { color:#fee2e2; border-color:rgba(239,68,68,0.6); background:rgba(220,38,38,0.12); }
        .ch-focus-btn { display:flex; align-items:center; gap:5px; color:#94a3b8; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; padding:6px 12px; border:1px solid rgba(220,38,38,0.3); border-radius:6px; background:transparent; cursor:pointer; font-family:monospace; transition:all 0.15s; }
        .ch-focus-btn:hover { color:#fee2e2; border-color:rgba(239,68,68,0.6); background:rgba(220,38,38,0.12); }
        .ch-focus-btn.active { color:#fee2e2; border-color:rgba(239,68,68,0.7); background:rgba(220,38,38,0.25); }
        .ch-topbar-divider { width:1px; height:22px; background:rgba(220,38,38,0.3); margin:0 4px; flex-shrink:0; }
        .ch-topbar-missions { display:flex; align-items:center; gap:3px; white-space:nowrap; }
        .ch-tb-done { color:#ef4444; font-size:13px; font-weight:900; font-family:monospace; }
        .ch-tb-sep { color:#6b7280; font-size:13px; }
        .ch-tb-label { color:#94a3b8; font-size:10px; letter-spacing:2px; margin-left:3px; font-family:monospace; }
        .ch-score-badge { display:flex; align-items:center; gap:6px; background:rgba(220,38,38,0.12); border:1px solid rgba(220,38,38,0.4); border-radius:6px; padding:5px 12px; white-space:nowrap; }
        .ch-score-num { color:#fee2e2; font-size:16px; font-weight:900; letter-spacing:1px; font-family:monospace; }
        .ch-score-unit { color:#ef4444; font-size:9px; font-weight:700; letter-spacing:2px; font-family:monospace; }
        .ch-team-tag { display:flex; align-items:center; gap:6px; }
        .ch-team-dot { width:7px; height:7px; border-radius:50%; background:#ef4444; box-shadow:0 0 8px #ef4444; animation:dopulse 2.2s infinite; flex-shrink:0; }
        .ch-team-name { color:#94a3b8; font-size:11px; letter-spacing:1px; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-family:monospace; }
        .ch-mob-btn { display:none; background:rgba(220,38,38,0.12); border:1px solid rgba(220,38,38,0.3); border-radius:6px; color:#f87171; cursor:pointer; padding:7px 9px; align-items:center; justify-content:center; flex-shrink:0; }

        /* --- 3-col body ------------------------------------------- */
        .ch-body { position:relative; z-index:10; flex:1; display:flex; min-height:0; height:calc(100vh - 56px); }

        /* --- side panels ------------------------------------------ */
        .ch-left-panel  { border-right:1px solid rgba(220,38,38,0.22); background:rgba(8,3,5,0.95); backdrop-filter:blur(20px); display:flex; flex-direction:column; transition:width 0.32s cubic-bezier(0.16,1,0.3,1),min-width 0.32s cubic-bezier(0.16,1,0.3,1),transform 0.32s cubic-bezier(0.16,1,0.3,1),opacity 0.25s ease; overflow:hidden; position:relative; height:100%; flex-shrink:0; }
        .ch-right-panel { border-left:1px solid rgba(220,38,38,0.22);  background:rgba(8,3,5,0.95); backdrop-filter:blur(20px); display:flex; flex-direction:column; transition:width 0.32s cubic-bezier(0.16,1,0.3,1),min-width 0.32s cubic-bezier(0.16,1,0.3,1),transform 0.32s cubic-bezier(0.16,1,0.3,1),opacity 0.25s ease; overflow:hidden; position:relative; height:100%; flex-shrink:0; }
        .ch-left-panel.ch-panel-open   { width:clamp(228px, 16.5vw, 270px); min-width:clamp(228px, 16.5vw, 270px); }
        .ch-right-panel.ch-panel-open  { width:clamp(236px, 17.5vw, 282px); min-width:clamp(236px, 17.5vw, 282px); }
        .ch-left-panel.ch-panel-collapsed,
        .ch-right-panel.ch-panel-collapsed { width:48px; min-width:48px; }

        /* --- focus mode layout overrides --- */
        .ch-focus-mode .ch-left-panel { width:0 !important; min-width:0 !important; opacity:0 !important; pointer-events:none !important; border:none !important; transform:translateX(-100%) !important; }
        .ch-focus-mode .ch-right-panel { width:0 !important; min-width:0 !important; opacity:0 !important; pointer-events:none !important; border:none !important; transform:translateX(100%) !important; }
        .ch-focus-mode .ch-center-scroll { padding-top:28px; padding-bottom:20px; }
        .ch-focus-mode .ch-center-scroll > * { max-width:1060px; margin-left:auto; margin-right:auto; width:100%; }
        .ch-focus-mode .ch-flag-inner { max-width:1060px; margin:0 auto; width:100%; }

        /* --- interactive control styles --- */
        .ch-copy-btn { display:inline-flex; align-items:center; gap:6px; background:rgba(220,38,38,0.12); border:1px solid rgba(220,38,38,0.35); border-radius:6px; color:#fca5a5; font-size:11px; font-weight:700; letter-spacing:1px; padding:5px 11px; cursor:pointer; font-family:monospace; transition:all 0.2s cubic-bezier(0.16,1,0.3,1); }
        .ch-copy-btn:hover { background:rgba(220,38,38,0.25); border-color:rgba(239,68,68,0.6); color:#ffffff; box-shadow:0 0 14px rgba(220,38,38,0.4); transform:translateY(-1px); }
        .ch-copy-btn:active { transform:translateY(0); }
        .ch-step-btn { display:inline-flex; align-items:center; gap:5px; background:rgba(18,6,10,0.85); border:1px solid rgba(220,38,38,0.3); border-radius:6px; color:#cbd5e1; font-size:11px; font-weight:700; font-family:monospace; letter-spacing:1px; padding:5px 12px; cursor:pointer; transition:all 0.2s cubic-bezier(0.16,1,0.3,1); }
        .ch-step-btn:hover:not(:disabled) { background:rgba(220,38,38,0.22); border-color:rgba(239,68,68,0.6); color:#ffffff; box-shadow:0 0 12px rgba(220,38,38,0.35); transform:translateY(-1px); }
        .ch-step-btn:disabled { opacity:0.3; cursor:not-allowed; border-color:rgba(255,255,255,0.08); color:#64748b; }
        .ch-nav-active { background:rgba(220,38,38,0.24) !important; border-color:rgba(239,68,68,0.7) !important; color:#fee2e2 !important; box-shadow:0 0 14px rgba(220,38,38,0.35); }
        @media (max-width:1080px) { .ch-nav-hide-mob { display:none !important; } }

        .ch-compact .ch-left-panel.ch-panel-open { width:224px; min-width:224px; }
        .ch-compact .ch-right-panel.ch-panel-open { width:232px; min-width:232px; }
        .ch-compact .ch-center-scroll { padding:20px 20px 18px; gap:16px; }
        .ch-compact .ch-payload-code { font-size:14px; line-height:1.7; }
        .ch-compact .ch-mission-title { font-size:clamp(20px,2.2vw,28px); }
        .ch-compact .ch-sitrep-text { font-size:14px; line-height:1.8; }

        @media (max-width:1200px) {
          .ch-left-panel.ch-panel-open { width:208px; min-width:208px; }
          .ch-right-panel.ch-panel-open { width:216px; min-width:216px; }
          .ch-center-scroll { padding:18px 16px 16px; gap:14px; }
          .ch-mission-title { font-size:clamp(19px,2.2vw,26px); }
        }
        .ch-panel-toggle { position:absolute; top:50%; transform:translateY(-50%); z-index:30; width:16px; height:56px; background:linear-gradient(180deg,#7f1d1d,#dc2626); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px rgba(220,38,38,0.4); transition:opacity 0.15s; }
        .ch-panel-toggle:hover { opacity:0.8; }
        .ch-panel-toggle-r { right:-1px; border-radius:0 6px 6px 0; }
        .ch-panel-toggle-l { left:-1px; border-radius:6px 0 0 6px; }
        .ch-collapsed-strip { display:flex; flex-direction:column; align-items:center; padding-top:14px; gap:16px; }
        .ch-dot-pip { width:10px; height:10px; border-radius:50%; cursor:pointer; transition:transform 0.2s; flex-shrink:0; }
        .ch-dot-pip:hover { transform:scale(1.4); }

        /* --- left timeline ---------------------------------------- */
        .ch-tl-scroll { overflow-y:auto; flex:1; padding:16px 0 22px; }
        .ch-tl-scroll::-webkit-scrollbar { width:4px; }
        .ch-tl-scroll::-webkit-scrollbar-track { background:transparent; }
        .ch-tl-scroll::-webkit-scrollbar-thumb { background:rgba(220,38,38,0.35); border-radius:4px; }
        .ch-tl-head { padding:0 14px 6px; display:flex; align-items:center; gap:6px; }
        .ch-tl-title { color:#ef4444; font-size:11px; font-weight:800; letter-spacing:3px; text-transform:uppercase; font-family:monospace; }
        .ch-tl-prog-wrap { padding:0 14px 10px; }
        .ch-tl-prog-info { display:flex; align-items:baseline; gap:3px; margin-bottom:6px; }
        .ch-tl-done { color:#ef4444; font-size:15px; font-weight:900; font-family:monospace; }
        .ch-tl-total { color:#6b7280; font-size:12px; }
        .ch-round-group { margin-top:8px; }
        .ch-round-label { padding:5px 14px; display:flex; align-items:center; gap:6px; font-size:10px; font-weight:800; letter-spacing:2px; text-transform:uppercase; font-family:monospace; }
        .ch-round-line { flex:1; height:1px; }
        .ch-mc-row { padding:3px 8px; position:relative; }
        .ch-zz-dot { position:absolute; top:50%; transform:translateY(-50%); width:10px; height:10px; border-radius:50%; border:2px solid; z-index:2; left:12px; }
        .ch-mc-card { padding:11px 11px 11px 28px; border-radius:8px; border:1px solid; border-left:3px solid; transition:all 0.18s ease; cursor:pointer; background:rgba(12,4,6,0.9); }
        .ch-mc-card:not(.ch-mc-locked):hover { filter:brightness(1.15); transform:translateX(2px); }
        .ch-mc-locked { cursor:default; opacity:0.4; }
        .ch-mci-row { display:flex; align-items:center; gap:5px; margin-bottom:4px; }
        .ch-mc-icon { flex-shrink:0; }
        .ch-mc-lvl { color:#f1f5f9; font-size:11px; font-weight:800; font-family:monospace; }
        .ch-mc-name { font-size:13px; font-weight:600; color:#9ca3af; line-height:1.4; transition:color 0.15s; }
        .ch-mc-sel .ch-mc-name { color:#ffffff; font-weight:800; }
        .ch-mc-pts { margin-top:5px; display:flex; align-items:center; gap:6px; font-size:11px; font-weight:700; font-family:monospace; }
        .ch-mc-type { color:#6b7280; font-size:9px; letter-spacing:1px; text-transform:uppercase; }

        /* --- center ----------------------------------------------- */
        .ch-center { flex:1; display:flex; flex-direction:column; min-width:0; height:100%; overflow:hidden; }
        .ch-center-scroll { flex:1; overflow-y:auto; overflow-x:hidden; padding:clamp(20px, 2vw, 28px) clamp(18px, 2.4vw, 34px) 22px; display:flex; flex-direction:column; gap:20px; }
        .ch-center-scroll::-webkit-scrollbar { width:5px; }
        .ch-center-scroll::-webkit-scrollbar-track { background:rgba(0,0,0,0.2); }
        .ch-center-scroll::-webkit-scrollbar-thumb { background:rgba(220,38,38,0.4); border-radius:4px; }

        /* complete banner */
        .ch-complete-banner { background:linear-gradient(135deg,rgba(127,29,29,0.3),rgba(220,38,38,0.15)); border:2px solid rgba(239,68,68,0.6); border-radius:12px; padding:28px; text-align:center; box-shadow:0 0 50px rgba(220,38,38,0.3); animation:fadeIn 0.5s ease; }
        .ch-complete-icon { font-size:36px; margin-bottom:8px; }
        .ch-complete-title { color:#fee2e2; font-size:20px; font-weight:900; letter-spacing:3px; text-transform:uppercase; text-shadow:0 0 24px rgba(220,38,38,0.7); margin:0 0 12px; font-family:monospace; }
        .ch-complete-body { color:#fca5a5; font-size:14px; line-height:1.7; margin:0 0 12px; }
        .ch-complete-score { color:#ef4444; font-weight:900; font-size:16px; font-family:monospace; }

        /* badges row */
        .ch-badges-row { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .ch-type-badge { color:#94a3b8; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; font-family:monospace; }
        .ch-pts-badge { color:#ef4444; font-size:14px; font-weight:900; margin-left:2px; font-family:monospace; }
        .ch-state-chip { margin-left:auto; display:flex; align-items:center; gap:5px; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; font-family:monospace; }
        .ch-state-active { color:#ef4444; }
        .ch-state-solved { color:#10b981; }
        .ch-state-locked { color:#6b7280; }

        /* title */
        .ch-title-block { display:flex; flex-direction:column; gap:6px; }
        .ch-act-label { color:#ef4444; font-size:11px; font-weight:700; letter-spacing:3px; text-transform:uppercase; font-family:monospace; }
        .ch-mission-title { margin:0; font-size:clamp(22px,2.6vw,30px); font-weight:900; color:#f1f5f9; letter-spacing:2px; text-transform:uppercase; line-height:1.25; font-family:var(--font-rajdhani), sans-serif; }
        .ch-focus-note { color:#94a3b8; font-size:13px; background:rgba(220,38,38,0.12); border:1px solid rgba(220,38,38,0.3); border-radius:8px; padding:9px 12px; font-family:monospace; }

        /* intel banner */
        .ch-intel-banner {
          border: 1px solid;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, rgba(10,4,6,0.98), rgba(18,6,9,0.97));
          display: flex;
          flex-direction: column;
        }
        .ch-intel-accent-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          z-index: 3;
        }
        .ch-intel-scene {
          position: relative;
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 16px 20px;
          min-height: 110px;
          overflow: hidden;
        }
        .ch-intel-grid-bg {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(45deg, rgba(220,38,38,0.035) 0, rgba(220,38,38,0.035) 1px, transparent 1px, transparent 14px);
          pointer-events: none;
        }
        .ch-portrait-box {
          position: relative;
          width: 92px;
          height: 92px;
          min-width: 92px;
          border-radius: 10px;
          border: 1.5px solid;
          background: radial-gradient(circle at 50% 30%, rgba(220,38,38,0.22), rgba(6,2,4,0.95));
          box-shadow: 0 4px 18px rgba(0,0,0,0.6);
          flex-shrink: 0;
          overflow: hidden;
          z-index: 2;
        }
        .ch-portrait-img-wrap {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .ch-portrait-corner {
          position: absolute;
          width: 8px;
          height: 8px;
          border-style: solid;
          z-index: 4;
          pointer-events: none;
        }
        .ch-p-tl { top: 3px; left: 3px; border-width: 2px 0 0 2px; border-color: inherit; }
        .ch-p-br { bottom: 3px; right: 3px; border-width: 0 2px 2px 0; border-color: inherit; }
        .ch-portrait-tag {
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 1px 6px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
          color: #fff;
          z-index: 5;
          box-shadow: 0 2px 6px rgba(0,0,0,0.7);
        }
        .ch-tag-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #fff;
          animation: dopulse 1.2s infinite;
        }
        .ch-intel-info {
          position: relative;
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 2;
        }
        .ch-intel-row1 {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .ch-operative-badge {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 2px 8px;
          border: 1px solid;
          border-radius: 4px;
          font-family: monospace;
          flex-shrink: 0;
        }
        .ch-char-name {
          color: #f1f5f9;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 1px;
          font-family: var(--font-rajdhani), sans-serif;
          white-space: nowrap;
        }
        .ch-char-callsign {
          color: #64748b;
          font-size: 10px;
          font-family: monospace;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .ch-intel-meta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .ch-intel-time {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #94a3b8;
          font-size: 11px;
          font-family: monospace;
        }
        .ch-intel-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(220,38,38,0.12);
          border: 1px solid rgba(220,38,38,0.35);
          border-radius: 6px;
          padding: 3px 8px;
          color: #fca5a5;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          font-family: monospace;
        }
        .ch-intel-transmission {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          margin-top: 2px;
        }
        .ch-intel-comm-text {
          color: #cbd5e1;
          font-size: 12.5px;
          font-style: italic;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .ch-rescue-section {
          border-top: 1px solid rgba(220,38,38,0.15);
          background: rgba(4,2,3,0.4);
          padding: 8px 16px 10px;
        }
        .ch-rescue-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }
        .ch-rescue-label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          font-size: 10px;
          letter-spacing: 1.5px;
          font-weight: 700;
          text-transform: uppercase;
          font-family: monospace;
        }
        .ch-rescue-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: monospace;
        }
        .ch-rescue-count {
          font-size: 12px;
          font-weight: 900;
        }
        .ch-rescue-pct {
          font-size: 11px;
          font-weight: 800;
        }
        .ch-rescue-track {
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 3px;
          overflow: hidden;
        }
        .ch-rescue-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.8s ease;
        }

        /* sitrep */
        .ch-sitrep { background:rgba(10,4,6,0.85); border:1px solid rgba(220,38,38,0.25); border-radius:10px; padding:18px 22px; }
        .ch-section-label { display:flex; align-items:center; gap:5px; color:#ef4444; font-size:11px; font-weight:700; letter-spacing:3px; text-transform:uppercase; margin-bottom:10px; font-family:monospace; }
        .ch-sitrep-text { color:#f1f5f9; font-size:15px; line-height:1.85; margin:0; }

        /* payload */
        .ch-payload-panel { padding:20px 22px; background:rgba(10,4,6,0.92); border:1px solid rgba(220,38,38,0.35); border-radius:10px; }
        .ch-payload-header { display:flex; align-items:center; gap:7px; color:#ef4444; font-size:12px; font-weight:800; letter-spacing:3px; text-transform:uppercase; margin-bottom:14px; font-family:monospace; }
        .ch-live-dot { width:6px; height:6px; border-radius:50%; background:#ef4444; box-shadow:0 0 8px #ef4444; animation:dopulse 1.8s infinite; margin-left:auto; }
        .ch-vault-link-box { margin-bottom:14px; padding:12px 14px; border:1px solid rgba(220,38,38,0.4); border-radius:8px; background:rgba(220,38,38,0.08); }
        .ch-vault-link-title { color:#f87171; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; font-family:monospace; }
        .ch-vault-link-text { color:#cbd5e1; font-size:13px; line-height:1.65; margin:0 0 10px; }
        .ch-vault-link-btn { display:inline-flex; align-items:center; gap:6px; text-decoration:none; color:#ffffff; background:linear-gradient(135deg,#7f1d1d,#dc2626); border:1px solid rgba(248,113,113,0.5); border-radius:6px; padding:8px 14px; font-size:12px; font-weight:800; letter-spacing:1px; text-transform:uppercase; transition:all 0.15s; font-family:monospace; }
        .ch-vault-link-btn:hover { box-shadow:0 0 20px rgba(220,38,38,0.5); }
        .ch-vault-link-path { margin-top:8px; color:#94a3b8; font-size:11px; word-break:break-all; font-family:monospace; }
        .ch-payload-code { background:rgba(0,0,0,0.65); border:1px solid rgba(220,38,38,0.3); border-radius:8px; padding:16px 18px; font-family:'Fira Code','JetBrains Mono',monospace; font-size:13.5px; color:#fee2e2; line-height:1.65; white-space:pre-wrap; max-height:340px; overflow-y:auto; letter-spacing:0.4px; }
        .ch-payload-code::-webkit-scrollbar { width:4px; }
        .ch-payload-code::-webkit-scrollbar-thumb { background:rgba(220,38,38,0.4); border-radius:3px; }
        .ch-payload-state { display:flex; align-items:center; gap:10px; border-radius:8px; padding:14px 16px; font-size:13px; font-family:monospace; }
        .ch-payload-solved { background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.35); color:#6ee7b7; }
        .ch-payload-locked { background:rgba(30,10,14,0.3); border:1px solid rgba(220,38,38,0.2); color:#6b7280; }

        /* hint */
        .ch-hint-section { margin-top:14px; }
        .ch-hint-btn { display:inline-flex; align-items:center; gap:7px; padding:10px 16px; background:rgba(220,38,38,0.1); border:1px solid rgba(220,38,38,0.35); border-radius:6px; cursor:pointer; color:#f87171; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; transition:all 0.15s; font-family:monospace; }
        .ch-hint-btn:hover { background:rgba(220,38,38,0.22); border-color:rgba(239,68,68,0.65); color:#fff; }
        .ch-hint-btn.ch-hint-unlocked { background:rgba(220,38,38,0.2); border-color:rgba(239,68,68,0.5); color:#fee2e2; }
        .ch-hint-cost { color:#ef4444; font-size:10px; margin-left:3px; }
        .ch-hint-unlocked-tag { color:#10b981; font-size:10px; margin-left:3px; }
        .ch-hint-box { margin-top:10px; padding:14px 16px; background:rgba(18,6,9,0.85); border:1px solid rgba(220,38,38,0.4); border-radius:8px; border-left:3px solid #dc2626; animation:fadeIn 0.3s ease; }
        .ch-hint-label { color:#ef4444; font-size:10px; font-weight:800; letter-spacing:3px; text-transform:uppercase; margin-bottom:8px; font-family:monospace; }
        .ch-hint-text { color:#fee2e2; font-size:14px; line-height:1.8; margin:0; }

        /* empty state */
        .ch-empty-state { display:flex; flex:1; align-items:center; justify-content:center; flex-direction:column; gap:12px; color:#6b7280; font-size:13px; padding:40px; font-family:monospace; }

        /* flag bar */
        .ch-flag-bar { border-top:1px solid rgba(220,38,38,0.25); background:rgba(8,3,5,0.98); padding:12px 20px; flex-shrink:0; backdrop-filter:blur(20px); position:relative; z-index:35; }
        .ch-flag-inner { display:flex; flex-direction:column; gap:10px; }
        .ch-flag-header { display:flex; align-items:center; gap:8px; }
        .ch-flag-icon-wrap { width:26px; height:26px; border-radius:6px; background:linear-gradient(135deg,#7f1d1d,#dc2626); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .ch-flag-label { color:#f1f5f9; font-size:12px; font-weight:800; letter-spacing:3px; text-transform:uppercase; font-family:monospace; }
        .ch-awaiting-tag { margin-left:auto; display:flex; align-items:center; gap:5px; background:rgba(220,38,38,0.1); border:1px solid rgba(220,38,38,0.3); border-radius:4px; padding:3px 10px; color:#f87171; font-size:9px; letter-spacing:2px; font-weight:700; text-transform:uppercase; font-family:monospace; }
        .ch-await-dot { width:5px; height:5px; border-radius:50%; background:#ef4444; box-shadow:0 0 6px #ef4444; animation:dopulse 1.6s infinite; flex-shrink:0; }
        .ch-flag-form { display:flex; gap:10px; }
        .ch-flag-form .ch-flag-input { flex:1 !important; }
        .ch-transmit-btn { display:flex; align-items:center; gap:7px; padding:12px 22px; background:rgba(220,38,38,0.15); border:1px solid rgba(220,38,38,0.3); border-radius:8px; cursor:not-allowed; color:#9ca3af; font-size:13px; font-weight:800; letter-spacing:2px; white-space:nowrap; text-transform:uppercase; font-family:monospace; transition:all 0.2s; }
        .ch-transmit-btn.ch-transmit-active { background:linear-gradient(135deg,#7f1d1d,#dc2626); cursor:pointer; color:#fff; border-color:rgba(248,113,113,0.6); box-shadow:0 0 24px rgba(220,38,38,0.5); animation:submitPulse 2.2s ease-in-out infinite; }
        .ch-transmit-btn.ch-transmit-active:hover { box-shadow:0 0 40px rgba(239,68,68,0.7); transform:translateY(-1px); }
        .ch-attempts-info { color:#6b7280; font-size:10px; letter-spacing:1px; font-family:monospace; }
        .ch-flag-msg { display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:6px; font-size:13px; border:1px solid; animation:fadeIn 0.25s ease; font-family:monospace; }
        .ch-msg-error  { background:rgba(220,38,38,0.15); border-color:rgba(239,68,68,0.4); color:#fca5a5; }
        .ch-msg-success{ background:rgba(16,185,129,0.15); border-color:rgba(16,185,129,0.4); color:#6ee7b7; }
        .ch-flag-status { display:flex; align-items:center; gap:10px; font-size:13px; font-family:monospace; }

        /* --- right panel ------------------------------------------ */
        .ch-right-scroll { overflow-y:auto; flex:1; padding:18px 14px; display:flex; flex-direction:column; gap:14px; }
        .ch-right-scroll::-webkit-scrollbar { width:4px; }
        .ch-right-scroll::-webkit-scrollbar-thumb { background:rgba(220,38,38,0.35); border-radius:4px; }

        .ch-team-card { background:linear-gradient(135deg,rgba(220,38,38,0.12),rgba(138,3,3,0.04)); border:1px solid rgba(220,38,38,0.35); border-radius:10px; padding:16px 18px; position:relative; overflow:hidden; }
        .ch-tc-accent-bar { position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#7f1d1d,#dc2626,#ef4444); }
        .ch-tc-label { color:#ef4444; font-size:10px; font-weight:700; letter-spacing:3px; text-transform:uppercase; margin-bottom:6px; font-family:monospace; }
        .ch-tc-name { font-size:14px; font-weight:800; color:#f1f5f9; margin-bottom:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; letter-spacing:1px; text-transform:uppercase; }
        .ch-tc-score-row { display:flex; align-items:baseline; gap:3px; }
        .ch-tc-big { font-size:36px; font-weight:900; color:#f1f5f9; line-height:1; font-family:var(--font-rajdhani), sans-serif; }
        .ch-tc-denom { color:#6b7280; font-size:20px; }
        .ch-tc-sub { color:#94a3b8; font-size:11px; margin-bottom:10px; font-family:monospace; }
        .ch-tc-pts-row { display:flex; align-items:center; gap:6px; background:rgba(220,38,38,0.1); border:1px solid rgba(220,38,38,0.3); border-radius:8px; padding:10px 14px; }
        .ch-tc-pts-label { color:#94a3b8; font-size:10px; font-weight:700; letter-spacing:2px; flex:1; text-transform:uppercase; font-family:monospace; }
        .ch-tc-pts-val { color:#ef4444; font-size:20px; font-weight:900; font-family:monospace; }

        .ch-ops-card { background:rgba(10,4,6,0.85); border:1px solid rgba(220,38,38,0.25); border-radius:8px; padding:14px 16px; }
        .ch-ops-row { display:flex; justify-content:space-between; margin-bottom:9px; font-family:monospace; }
        .ch-ops-row:last-child { margin-bottom:0; }
        .ch-ops-key { color:#94a3b8; font-size:12px; letter-spacing:1px; }
        .ch-ops-val { font-size:12px; font-weight:700; }
        .ch-ops-val.ok  { color:#10b981; }
        .ch-ops-val.bad { color:#ef4444; }

        .ch-feed-wrap { display:flex; flex-direction:column; flex:1; min-height:0; }
        .ch-feed-toggle { display:flex; align-items:center; gap:6px; background:transparent; border:none; cursor:pointer; padding:4px 0 10px; width:100%; font-family:monospace; }
        .ch-feed-toggle span { color:#ef4444; font-size:11px; font-weight:700; letter-spacing:2px; flex:1; text-align:left; text-transform:uppercase; }
        .ch-feed-scroll { overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:6px; max-height:260px; }
        .ch-feed-scroll::-webkit-scrollbar { width:3px; }
        .ch-feed-scroll::-webkit-scrollbar-thumb { background:rgba(220,38,38,0.35); border-radius:3px; }
        .ch-feed-empty { color:#6b7280; font-size:12px; text-align:center; padding:18px 0; border:1px dashed rgba(220,38,38,0.25); border-radius:8px; display:flex; flex-direction:column; align-items:center; gap:7px; font-family:monospace; }
        .ch-feed-item { padding:10px 12px; background:rgba(12,4,7,0.85); border:1px solid rgba(220,38,38,0.25); border-radius:6px; border-left:2px solid #ef4444; flex-shrink:0; }
        .ch-feed-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
        .ch-feed-team { color:#f1f5f9; font-size:12px; font-weight:700; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:120px; }
        .ch-feed-action { font-size:9px; font-weight:800; letter-spacing:1px; text-transform:uppercase; font-family:monospace; }
        .ch-feed-action.solved { color:#10b981; }
        .ch-feed-action.hint   { color:#f59e0b; }
        .ch-feed-action.other  { color:#ef4444; }
        .ch-feed-msg { color:#94a3b8; font-size:11px; line-height:1.45; margin-bottom:4px; }
        .ch-feed-pts { font-size:12px; font-weight:700; font-family:monospace; }
        .ch-feed-pts.pos { color:#6ee7b7; }
        .ch-feed-pts.neg { color:#fca5a5; }

        /* mobile backdrop */
        .ch-mobile-backdrop { position:fixed; inset:0; z-index:199; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); }

        /* --- hint confirm modal ----------------------------------- */
        .ch-modal-overlay { position:fixed; inset:0; z-index:300; background:rgba(0,0,0,0.88); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; }
        .ch-modal { width:440px; max-width:90vw; padding:24px 24px 20px; animation:fadeIn 0.2s ease; background:linear-gradient(135deg,rgba(12,4,7,0.99),rgba(24,6,10,0.98)); border:1.5px solid rgba(220,38,38,0.5); border-radius:10px; }
        .ch-modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .ch-modal-title { margin:0; color:#fee2e2; font-size:16px; font-weight:900; letter-spacing:2px; font-family:monospace; }
        .ch-modal-close { background:none; border:none; cursor:pointer; color:#9ca3af; padding:4px; display:flex; align-items:center; justify-content:center; transition:color 0.15s; }
        .ch-modal-close:hover { color:#fff; }
        .ch-modal-body { color:#94a3b8; font-size:13px; line-height:1.6; margin-bottom:14px; }
        .ch-modal-warning { margin-bottom:16px; display:flex; align-items:center; gap:8px; font-size:13px; }
        .ch-modal-actions { display:flex; gap:8px; justify-content:flex-end; }
        .ch-modal-actions .btn-game-secondary { padding:9px 16px; font-size:12px; }
        .ch-modal-actions .btn-game-danger    { padding:9px 16px; font-size:12px; }

        /* loading screen */
        .ch-loading-screen { min-height:100vh; background:#050508; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:16px; font-family:monospace; }
        .ch-spin-ring { width:44px; height:44px; border-radius:50%; border:2px solid rgba(220,38,38,0.2); border-top-color:#ef4444; animation:spin 0.8s linear infinite; }

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
          .ch-intel-scene { gap:12px; padding:12px 14px; }
          .ch-portrait-box { width:74px; height:74px; min-width:74px; }
          .ch-char-name { font-size:14px; }
          .ch-char-callsign { display:none; }
          .ch-intel-comm-text { font-size:11px; -webkit-line-clamp:1; }
          .ch-rescue-section { padding:6px 12px 8px; }
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
