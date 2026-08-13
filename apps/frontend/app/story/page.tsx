'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ChevronRight, SkipForward, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

/* --- Types --------------------------------------------------------------- */
type Scene = {
  bg: string;
  speaker: string;
  speakerColor: string;
  text: string;
  image: string;
  imagePos?: 'left' | 'right' | 'center';
};

/* --- INTRO SCENES (no param) ? /dashboard -------------------------------- */
const INTRO_SCENES: Scene[] = [
  {
    bg: '/images/background/1.jpg',
    speaker: 'NARRATOR',
    speakerColor: '#9ca3af',
    text: 'Present Day. East Coast Mall, Chennai. It was supposed to be a normal day. But a heavily armed terror cell has hijacked the entire building, taking hundreds of innocent civilians hostage. The city is in a state of panic.',
    image: '/images/characters/narrator.png',
    imagePos: 'right',
  },
  {
    bg: '/images/background/1.jpg',
    speaker: 'UMAR SAIF',
    speakerColor: '#ef4444',
    text: '"Listen to me carefully. I am Umar Saif. We have wired the mall with C4. You will release our leader, Umar Farooq, from prison immediately, or I will execute hostages one by one. Do not test our patience."',
    image: '/images/characters/umar_threatening.png',
    imagePos: 'left',
  },
  {
    bg: '/images/background/6.jpg',
    speaker: 'ALTHAF',
    speakerColor: '#34d399',
    text: '"The government will not negotiate with terrorists. But a frontal assault will result in mass casualties. We need a miracle inside that mall. Wait... intelligence says Veera Raghavan is inside. A former RAW agent. He is our only hope."',
    image: '/images/characters/althaf_commanding.png',
    imagePos: 'left',
  },
  {
    bg: '/images/background/4.jpg',
    speaker: 'VEERA',
    speakerColor: '#a78bfa',
    text: '"Althaf, I am inside. The terrorists have jammed all signals, but I managed to access a maintenance terminal in the basement. I need remote cyber support to crack their encrypted comms. Who do we have?"',
    image: '/images/characters/veera_determined.png',
    imagePos: 'right',
  },
  {
    bg: '/images/background/2.jpg',
    speaker: 'PREETHI',
    speakerColor: '#f472b6',
    text: '"Veera! It\'s Preethi. I am coordinating with Althaf\'s team from the outside. We have patched into your terminal. We need to decode Saif\'s network to track his men and disarm their explosives. My team of cyber specialists is ready."',
    image: '/images/characters/preethi_hopeful.png',
    imagePos: 'left',
  },
  {
    bg: '/images/background/6.jpg',
    speaker: 'ALTHAF',
    speakerColor: '#34d399',
    text: '"Veera, Preethi\'s team will handle the cryptography. There are nine security layers protecting Saif\'s master command server. Solve them one by one. For every cipher they crack, you move forward. Let\'s get to work."',
    image: '/images/characters/althaf_commanding.png',
    imagePos: 'left',
  },
];

/* --- POST-CHALLENGE SCENES ? /timeline ----------------------------------- */
const CHALLENGE_SCENES: Record<number, Scene[]> = [
  // Dummy index 0, not used
  [],
  // 1
  [
    {
      bg: '/images/background/1.jpg',
      speaker: 'VEERA',
      speakerColor: '#a78bfa',
      text: '"First transmission decoded! I have the patrol routes for Saif\'s men on the ground floor. I\'m taking them out now. Preethi, the next door is locked with a fragment code. Get your team on it."',
      image: '/images/characters/veera_determined.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/1.jpg',
      speaker: 'NARRATOR',
      speakerColor: '#9ca3af',
      text: 'The first cipher falls. Veera neutralizes the ground floor guards silently. But the security doors remain a barrier. Two more challenges stand before they can reach the security control room.',
      image: '/images/characters/narrator.png',
      imagePos: 'right',
    },
  ],
  // 2
  [
    {
      bg: '/images/background/2.jpg',
      speaker: 'PREETHI',
      speakerColor: '#f472b6',
      text: '"Veera, we\'ve cracked the fragment code. The door is open! But wait, they have a biometric time-lock on the security room. The lock uses a team-specific hash. My team needs to compute the unique code to bypass it."',
      image: '/images/characters/preethi_worried.png',
      imagePos: 'left',
    },
  ],
  // 3
  [
    {
      bg: '/images/background/3.jpg',
      speaker: 'VEERA',
      speakerColor: '#a78bfa',
      text: '"I am inside the security room. I have camera access. I can see all the hostages... they are terrified. I also see Umar Saif. He is heavily guarded. I need access to their explosive deployment plans to ensure they can\'t blow the mall."',
      image: '/images/characters/veera_intense.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/3.jpg',
      speaker: 'ALTHAF',
      speakerColor: '#34d399',
      text: '"Excellent. You have eyes on the hostages. Now we move to Round 2: Infiltration. Crack the databases containing the C4 schematics and their backup triggers. We must disarm those explosives."',
      image: '/images/characters/althaf_concerned.png',
      imagePos: 'left',
    },
  ],
  // 4
  [
    {
      bg: '/images/background/4.jpg',
      speaker: 'PREETHI',
      speakerColor: '#f472b6',
      text: '"The database has three hashed passwords. We need to crack all three to access the C4 schematics. My team is analyzing the hashes now. Veera, stay out of sight until we get this!"',
      image: '/images/characters/preethi_hopeful.png',
      imagePos: 'right',
    },
  ],
  // 5
  [
    {
      bg: '/images/background/5.jpg',
      speaker: 'VEERA',
      speakerColor: '#a78bfa',
      text: '"Good work. I have the schematics. But there\'s a problem... they have a dead-man\'s switch linked to a government broadcast system. If Saif triggers it, the bombs detonate. We need to invalidate that admin token."',
      image: '/images/characters/veera_intense.png',
      imagePos: 'right',
    },
  ],
  // 6
  [
    {
      bg: '/images/background/6.jpg',
      speaker: 'VEERA',
      speakerColor: '#a78bfa',
      text: '"Token invalidated. Saif\'s dead-man switch is useless now. I am moving towards the hostages. But they have initiated a mall lockdown to prevent any escape. We need to decode the lockdown override payload to open the fire exits!"',
      image: '/images/characters/veera_intense.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/6.jpg',
      speaker: 'NARRATOR',
      speakerColor: '#9ca3af',
      text: 'Round 2 complete. The explosives are disabled, but the hostages are still trapped. Round 3 begins: The Final Strike. Veera and the Cyber Unit race against time to lift the lockdown and confront Saif.',
      image: '/images/characters/narrator.png',
      imagePos: 'right',
    },
  ],
  // 7
  [
    {
      bg: '/images/background/7.jpg',
      speaker: 'PREETHI',
      speakerColor: '#f472b6',
      text: '"The lockdown override is protected by a logic bomb. It has five nested encoding layers. If we make a mistake, the blast doors permanently seal. We have to be extremely careful."',
      image: '/images/characters/preethi_worried.png',
      imagePos: 'left',
    },
  ],
  // 8
  [
    {
      bg: '/images/background/8.jpg',
      speaker: 'VEERA',
      speakerColor: '#a78bfa',
      text: '"Fire exits are open! The hostages are escaping. I am going after Umar Saif. His command network is collapsing, but he has retreated to a reinforced master vault. That\'s where he controls the remaining defense systems."',
      image: '/images/characters/veera_determined.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/8.jpg',
      speaker: 'ALTHAF',
      speakerColor: '#34d399',
      text: '"This is the final hurdle. Saif\'s Master Vault is protected by a complex cryptographic sequence. Your team needs to crack it. Give Veera the access code so he can finish this."',
      image: '/images/characters/althaf_commanding.png',
      imagePos: 'left',
    },
  ],
  // 9
  [
    {
      bg: '/images/background/9.jpg',
      speaker: 'VEERA',
      speakerColor: '#a78bfa',
      text: '"The vault is open. Umar Saif is subdued. The mall is secure. It\'s over."',
      image: '/images/characters/veera_relieved.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/9.jpg',
      speaker: 'ALTHAF',
      speakerColor: '#34d399',
      text: '"Outstanding work, Veera. The hostages are safe, and the terror cell is dismantled. The Extraction is complete. I owe this team a great debt."',
      image: '/images/characters/althaf_commanding.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/9.jpg',
      speaker: 'NARRATOR',
      speakerColor: '#9ca3af',
      text: 'The East Coast Mall siege is over. Hundreds of lives saved. The city sleeps peacefully, unaware of the heroes in the shadows who fought a silent war. The mission is accomplished.',
      image: '/images/characters/narrator.png',
      imagePos: 'right',
    },
  ],
] as unknown as Record<number, Scene[]>;

/* --- End destinations ----------------------------------------------------- */
function getDestination(challengeNum: number | null): string {
  if (challengeNum === null) return '/dashboard';
  if (challengeNum >= 9) return '__END__';
  return '/timeline';
}

/* --- End Title Card ------------------------------------------------------- */
function EndTitleCard({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' });
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Stars bg */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, rgba(0,0,0,1) 70%)' }} />
      
      <div ref={cardRef} style={{ textAlign: 'center', padding: '40px 32px', maxWidth: 640, zIndex: 10 }}>
        {/* Emblem */}
        <div style={{ fontSize: 64, marginBottom: 20 }}>???</div>

        {/* Title */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 5, color: '#10b981', marginBottom: 12, textTransform: 'uppercase' }}>
          OPERATION COMPLETE
        </div>
        <h1 style={{ fontSize: 'clamp(24px,5vw,42px)', fontWeight: 900, color: '#e2e8f0', letterSpacing: 2, margin: '0 0 8px', textShadow: '0 0 40px rgba(16,185,129,0.6)' }}>
          THE EXTRACTION
        </h1>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981', letterSpacing: 3, marginBottom: 32 }}>
          MISSION ACCOMPLISHED
        </div>

        {/* Divider */}
        <div style={{ width: 80, height: 1, background: 'linear-gradient(90deg,transparent,#10b981,transparent)', margin: '0 auto 32px' }} />

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 36 }}>
          {[
            { label: 'MISSIONS CRACKED', value: '9 / 9' },
            { label: 'HOSTAGES FREED', value: '1,200' },
            { label: 'The Hostage Crisis STATUS', value: 'TERMINATED' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '16px 10px' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#6ee7b7', marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', letterSpacing: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Credits quote */}
        <p style={{ color: '#9ca3af', fontSize: 15, lineHeight: 1.85, fontStyle: 'italic', marginBottom: 32 }}>
          "The names of those who stood in the dark to protect the light will never appear in a public report. But Chennai remembers."
        </p>
        <p style={{ color: '#6b7280', fontSize: 12, letterSpacing: 2, marginBottom: 36 }}>— THE EXTRACTION, PRESENT DAY</p>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/leaderboard')}
            style={{ padding: '14px 28px', background: 'linear-gradient(135deg,rgba(16,185,129,0.8),rgba(5,150,105,0.8))', border: '1px solid rgba(16,185,129,0.5)', borderRadius: 10, cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 2, boxShadow: '0 0 30px rgba(16,185,129,0.3)' }}
          >
            ?? VIEW FINAL RANKINGS
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, cursor: 'pointer', color: '#9ca3af', fontSize: 13, fontWeight: 700, letterSpacing: 2 }}
          >
            RETURN TO HQ
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Story Inner Component ------------------------------------------------ */
function StoryInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeParam = searchParams.get('challenge');
  const parsedChallenge = challengeParam ? parseInt(challengeParam, 10) : NaN;
  const challengeNum = Number.isInteger(parsedChallenge) && parsedChallenge >= 1 && parsedChallenge <= 9
    ? parsedChallenge
    : null;

  const [resolvedChallengeNum, setResolvedChallengeNum] = useState<number | null>(challengeNum);
  const [accessReady, setAccessReady] = useState(challengeNum === null);

  useEffect(() => {
    setResolvedChallengeNum(challengeNum);
    setAccessReady(challengeNum === null);
  }, [challengeNum]);

  useEffect(() => {
    if (challengeNum === null) {
      setAccessReady(true);
      return;
    }

    let cancelled = false;

    api.challenges.getCurrent().then((data) => {
      if (cancelled) return;
      const currentLevel = Math.min(Math.max(data?.progress?.currentLevel ?? 1, 1), 9);
      const maxDebrief = Math.max(0, currentLevel - 1);

      if (maxDebrief <= 0) {
        setResolvedChallengeNum(null);
        setAccessReady(true);
        router.replace('/timeline');
        return;
      }

      setResolvedChallengeNum(Math.min(challengeNum, maxDebrief));
      setAccessReady(true);
    }).catch(() => {
      if (cancelled) return;
      setResolvedChallengeNum(null);
      setAccessReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [challengeNum, router]);

  const scenes: Scene[] = resolvedChallengeNum !== null
    ? (CHALLENGE_SCENES[resolvedChallengeNum] ?? INTRO_SCENES)
    : INTRO_SCENES;

  const destination = getDestination(resolvedChallengeNum);
  const isIntro = resolvedChallengeNum === null;

  const [sceneIdx, setSceneIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [showEndCard, setShowEndCard] = useState(false);

  const bgRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const dialogueRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scene = scenes[sceneIdx];
  const isLast = sceneIdx === scenes.length - 1;

  const typeText = useCallback((text: string) => {
    setDisplayText('');
    setIsTyping(true);
    let i = 0;
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    typeTimerRef.current = setInterval(() => {
      i++;
      setDisplayText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(typeTimerRef.current!);
        setIsTyping(false);
      }
    }, 18);
  }, []);

  const animateScene = useCallback((idx: number) => {
    const s = scenes[idx];
    if (bgRef.current) gsap.fromTo(bgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.inOut' });
    if (portraitRef.current) {
      const fromX = s.imagePos === 'left' ? -50 : 50;
      gsap.fromTo(portraitRef.current, { opacity: 0, x: fromX, scale: 0.95 }, { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 });
    }
    if (dialogueRef.current) gsap.fromTo(dialogueRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', delay: 0.2 });
    if (nameRef.current) gsap.fromTo(nameRef.current, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out', delay: 0.25 });
    typeText(s.text);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes, typeText]);

  useEffect(() => {
    animateScene(sceneIdx);
    return () => { if (typeTimerRef.current) clearInterval(typeTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIdx]);

  const advance = () => {
    if (isTyping) {
      if (typeTimerRef.current) clearInterval(typeTimerRef.current);
      setDisplayText(scene.text);
      setIsTyping(false);
      return;
    }
    if (isLast) {
      if (destination === '__END__') {
        setShowEndCard(true);
      } else {
        router.push(destination);
      }
      return;
    }
    setSceneIdx(i => i + 1);
  };

  const handleSkip = () => {
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    if (destination === '__END__') {
      setShowEndCard(true);
    } else {
      router.push(destination);
    }
  };

  const speakerColor = scene.speakerColor || '#a78bfa';
  const isNarrator = scene.speaker === 'NARRATOR';
  const isUmar = scene.speaker.includes('UMAR');

  if (!accessReady) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontFamily: "'Inter',sans-serif", letterSpacing: 2, fontSize: 12 }}>
        VALIDATING STORY ACCESS...
      </div>
    );
  }

  if (showEndCard) return <EndTitleCard onClose={() => router.push('/dashboard')} />;

  return (
    <div
      onClick={advance}
      style={{ position: 'fixed', inset: 0, cursor: 'pointer', userSelect: 'none', fontFamily: "'Inter',sans-serif", background: '#000' }}
    >
      {/* Background */}
      <div ref={bgRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Image
          src={scene.bg}
          alt="background"
          fill
          style={{ objectFit: 'cover', filter: `brightness(0.32) saturate(0.75) ${isUmar ? 'hue-rotate(-10deg)' : ''}` }}
          priority
        />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.72) 100%)' }} />
        {/* Red tint for Umar scenes */}
        {isUmar && <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.07)' }} />}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.05) 3px,rgba(0,0,0,0.05) 4px)', zIndex: 1, pointerEvents: 'none' }} />
      </div>

      {/* HUD top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: '14px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg,rgba(0,0,0,0.65) 0%,transparent 100%)' }}>
        {/* Back / context label */}
        <Link
          href={isIntro ? '/login' : '/timeline'}
          onClick={e => e.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 15px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, letterSpacing: 1, textDecoration: 'none' }}
        >
          <ArrowLeft size={12} />{isIntro ? 'BACK' : 'TIMELINE'}
        </Link>

        {/* Operation label — centered absolutely so it doesn't affect flex spacing */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
          {challengeNum ? `LEVEL ${challengeNum} — DEBRIEF` : 'THE EXTRACTION'}
        </div>

        {/* Skip */}
        <button
          onClick={e => { e.stopPropagation(); setShowSkipConfirm(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 15px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}
        >
          <SkipForward size={12} />SKIP
        </button>
      </div>

      {/* Character portrait */}
      <div
        ref={portraitRef}
        style={{
          position: 'absolute',
          bottom: 0,
          [scene.imagePos === 'left' ? 'left' : 'right']: 0,
          zIndex: 10,
          width: '28vw',
          minWidth: 200,
          maxWidth: 420,
          height: '72vh',
          minHeight: 320,
          pointerEvents: 'none',
        }}
      >
        <Image
          src={scene.image}
          alt={scene.speaker}
          fill
          style={{
            objectFit: 'contain',
            objectPosition: 'bottom',
            filter: isNarrator
              ? 'drop-shadow(0 0 24px rgba(156,163,175,0.4)) drop-shadow(0 0 50px rgba(0,0,0,0.9))'
              : isUmar
              ? 'drop-shadow(0 0 32px rgba(239,68,68,0.5)) drop-shadow(0 0 60px rgba(0,0,0,0.85))'
              : 'drop-shadow(0 0 32px rgba(109,40,217,0.45)) drop-shadow(0 0 60px rgba(0,0,0,0.85))',
          }}
          priority
          onError={() => {}}
        />
      </div>

      {/* Dialogue box */}
      <div
        ref={dialogueRef}
        style={{
          position: 'absolute',
          bottom: '2vh',
          ...(scene.imagePos === 'left'
            ? { left: 'calc(28vw + 16px)', right: '2vw' }
            : { left: '2vw', right: 'calc(28vw + 16px)' }
          ),
          zIndex: 15,
          pointerEvents: 'none',
        }}
      >
        {/* Name tag */}
        <div
          ref={nameRef}
          style={{
            display: 'inline-block',
            marginBottom: 10, marginLeft: 4,
            padding: '10px 28px',
            background: isUmar
              ? 'linear-gradient(90deg,rgba(239,68,68,0.85),rgba(239,68,68,0.3))'
              : isNarrator
              ? 'linear-gradient(90deg,rgba(75,85,99,0.85),rgba(75,85,99,0.3))'
              : 'linear-gradient(90deg,rgba(109,40,217,0.85),rgba(109,40,217,0.3))',
            border: `1px solid ${speakerColor}88`,
            borderRadius: '8px 8px 0 0',
            fontSize: 16, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase',
            color: speakerColor,
            backdropFilter: 'blur(10px)',
            boxShadow: `0 0 24px ${speakerColor}44`,
          }}
        >
          {scene.speaker}
        </div>

        {/* Dialogue panel */}
        <div style={{
          background: isUmar
            ? 'linear-gradient(135deg,rgba(20,3,3,0.94),rgba(40,8,8,0.92))'
            : 'linear-gradient(135deg,rgba(2,1,12,0.93),rgba(14,8,40,0.91))',
          border: `1px solid ${speakerColor}55`,
          borderRadius: '0 18px 18px 18px',
          padding: '26px 36px 50px',
          backdropFilter: 'blur(28px)',
          boxShadow: `0 10px 70px rgba(0,0,0,0.85), 0 0 40px ${speakerColor}18`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${speakerColor}55,transparent)` }} />
          <p style={{ margin: 0, fontSize: 22, color: '#f8fafc', lineHeight: 1.85, fontWeight: 400, letterSpacing: '0.01em', minHeight: '4em' }}>
            {displayText}
            {isTyping && <span style={{ opacity: 0.7, animation: 'blink 0.7s steps(1) infinite' }}>|</span>}
          </p>
          {!isTyping && (
            <div style={{ position: 'absolute', bottom: 18, right: 26, display: 'flex', alignItems: 'center', gap: 7, color: `${speakerColor}cc`, fontSize: 14, fontWeight: 700, letterSpacing: 2, animation: 'nudge 1.5s ease-in-out infinite' }}>
              {isLast
                ? (destination === '__END__' ? 'FINISH' : challengeNum ? 'RETURN TO TIMELINE' : 'BEGIN MISSIONS')
                : 'CONTINUE'
              }
              <ChevronRight size={16} />
            </div>
          )}
        </div>
      </div>

      {/* Scene dots — bottom center */}
      <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 25, display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'none' }}>
        {scenes.map((_, i) => (
          <div key={i} style={{ width: i === sceneIdx ? 18 : 6, height: 6, borderRadius: 3, background: i < sceneIdx ? '#10b981' : i === sceneIdx ? speakerColor : 'rgba(255,255,255,0.18)', transition: 'all 0.3s ease', boxShadow: i === sceneIdx ? `0 0 8px ${speakerColor}` : 'none' }} />
        ))}
      </div>

      {/* Skip confirm */}
      {showSkipConfirm && (
        <div
          onClick={e => e.stopPropagation()}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: 'linear-gradient(135deg,rgba(2,1,12,0.98),rgba(14,8,40,0.97))', border: '1px solid rgba(109,40,217,0.45)', borderRadius: 14, padding: '26px 30px', maxWidth: 380, width: '90vw', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>?</div>
            <h3 style={{ color: '#e9d5ff', fontSize: 18, fontWeight: 900, letterSpacing: 2, marginBottom: 10 }}>SKIP CUTSCENE?</h3>
            <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.7, marginBottom: 22 }}>
              {challengeNum
                ? 'Skip the mission debrief and return to the timeline.'
                : 'Skip the story introduction and proceed to the mission HQ.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setShowSkipConfirm(false)}
                style={{ padding: '11px 24px', background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(109,40,217,0.35)', borderRadius: 8, cursor: 'pointer', color: '#c4b5fd', fontSize: 14, fontWeight: 700, letterSpacing: 1 }}
              >
                Keep Watching
              </button>
              <button
                onClick={handleSkip}
                style={{ padding: '11px 24px', background: 'rgba(109,40,217,0.7)', border: '1px solid rgba(167,139,250,0.5)', borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: 1, boxShadow: '0 0 20px rgba(109,40,217,0.35)' }}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes nudge { 0%,100%{opacity:0.6;transform:translateX(0)} 50%{opacity:1;transform:translateX(4px)} }
      `}</style>
    </div>
  );
}

/* --- Page export (Suspense wrapper for useSearchParams) ------------------- */
export default function StoryPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontFamily: "'Inter', system-ui, sans-serif" }}>
        Loading...
      </div>
    }>
      <StoryInner />
    </Suspense>
  );
}
