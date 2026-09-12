'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ChevronRight, SkipForward, ArrowLeft, Skull, Trophy } from 'lucide-react';
import { api } from '@/lib/api';
import { FocusScreenButton } from '@/components/ui/FocusScreenAdvisory';

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
    speakerColor: '#94a3b8',
    text: 'Present Day. East Coast Mall, Chennai. A heavily armed terror cell commanded by Umar Saif has hijacked the complex, trapping 1,200 innocent shoppers and staff hostage. The entire city is gripped by fear.',
    image: '/images/characters/narrator.png',
    imagePos: 'right',
  },
  {
    bg: '/images/background/1.jpg',
    speaker: 'UMAR SAIF',
    speakerColor: '#dc2626',
    text: '"Listen to me carefully! I am Umar Saif. We have wired East Coast Mall with military-grade C4. Release our supreme leader, Umar Farooq, from high-security prison immediately, or we execute hostages one by one!"',
    image: '/images/characters/umar_threatening.png',
    imagePos: 'left',
  },
  {
    bg: '/images/background/2.jpg',
    speaker: 'PREETHI',
    speakerColor: '#fca5a5',
    text: '"Panic has broken out across all four floors! Saif\'s gunmen have locked the exit turnstiles and deployed automatic rifles. We are trapped in here with 1,200 innocent people!"',
    image: '/images/characters/preethi_worried.png',
    imagePos: 'left',
  },
  {
    bg: '/images/background/6.jpg',
    speaker: 'NSA ALTHAF',
    speakerColor: '#ef4444',
    text: '"The government will not surrender to terror. But a frontal assault on the glass atrium will trigger the C4 explosives. Wait... satellite thermal scan detects an operative inside: Veera Raghavan — ex-RAW black-ops specialist."',
    image: '/images/characters/althaf_concerned.png',
    imagePos: 'left',
  },
  {
    bg: '/images/background/4.jpg',
    speaker: 'VEERA',
    speakerColor: '#f87171',
    text: '"Althaf, I am in the basement maintenance sector. Civilian cellular bands are jammed, but I tapped into Server Room ER-42 backup telecom line. I need Preethi and a cyber team outside to punch through their electronic grid."',
    image: '/images/characters/veera_neautral.png',
    imagePos: 'right',
  },
  {
    bg: '/images/background/2.jpg',
    speaker: 'PREETHI',
    speakerColor: '#fca5a5',
    text: '"Veera! I have linked into Althaf\'s tactical van outside the perimeter. Our cyber unit is tied directly to your terminal. We can punch through their digital barriers layer by layer!"',
    image: '/images/characters/preethi_hopeful.png',
    imagePos: 'left',
  },
  {
    bg: '/images/background/6.jpg',
    speaker: 'NSA ALTHAF',
    speakerColor: '#ef4444',
    text: '"Veera, you have operational greenlight. Preethi\'s team will handle the cryptography remotely while you take back East Coast Mall ground by ground. Operation Beast begins now."',
    image: '/images/characters/althaf_commanding.png',
    imagePos: 'left',
  },
];

/* --- POST-CHALLENGE SCENES (BEAST 2022 SEQUENCE) ------------------------ */
const CHALLENGE_SCENES: Record<number, Scene[]> = [
  // Dummy index 0, not used
  [],
  // 1: The Intercepted Transmission
  [
    {
      bg: '/images/background/1.jpg',
      speaker: 'VEERA',
      speakerColor: '#f87171',
      text: '"First transmission decoded! I have pinpointed the ground floor patrol routes for Saif\'s men. Neutralizing them silently right now."',
      image: '/images/characters/veera_determined.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/1.jpg',
      speaker: 'UMAR SAIF',
      speakerColor: '#dc2626',
      text: '"All squads, check in! Why is the ground floor patrol unresponsive?! Someone is killing our guards inside! Scan the security corridors!"',
      image: '/images/characters/umar_angry.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/2.jpg',
      speaker: 'PREETHI',
      speakerColor: '#fca5a5',
      text: '"Veera, Saif has placed the complex on maximum alert! The outer bulkhead door to Server Room ER-42 has been sealed with a three-fragment cipher. My team is analyzing it now."',
      image: '/images/characters/preethi_worried.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/1.jpg',
      speaker: 'NARRATOR',
      speakerColor: '#94a3b8',
      text: 'The first cipher falls. Veera clears the corridor silently. The race to reach the server vault is underway.',
      image: '/images/characters/narrator.png',
      imagePos: 'right',
    },
  ],
  // 2: The Fragmented Server Map
  [
    {
      bg: '/images/background/2.jpg',
      speaker: 'PREETHI',
      speakerColor: '#fca5a5',
      text: '"All three fragments assembled! Octal, Atbash, and inverted hex solved — the ER-42 bulkhead is unlocked! Move in, Veera!"',
      image: '/images/characters/preethi_hopeful.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/2.jpg',
      speaker: 'VEERA',
      speakerColor: '#f87171',
      text: '"Bulkhead breached. I am inside ER-42. Armed reinforcements are searching the hallway. I have eyes on the biometric vault door."',
      image: '/images/characters/veera_determined.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/2.jpg',
      speaker: 'NSA ALTHAF',
      speakerColor: '#ef4444',
      text: '"Veera, our acoustic sensors detect seismic charges wired to the floor beneath you. Saif has linked the vault alarm to the transformers. Zero room for error."',
      image: '/images/characters/althaf_concerned.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/2.jpg',
      speaker: 'PREETHI',
      speakerColor: '#fca5a5',
      text: '"The biometric vault is secured by a team-bound algorithmic lock. Our cyber team must calculate our exact registration digest to grant access before the failsafe triggers!"',
      image: '/images/characters/preethi_worried.png',
      imagePos: 'left',
    },
  ],
  // 3: The Time-Locked Vault
  [
    {
      bg: '/images/background/3.jpg',
      speaker: 'VEERA',
      speakerColor: '#f87171',
      text: '"Biometric vault cracked! I have extracted Saif\'s encrypted operational hard drive. The entire mall\'s C4 demolition grid and camera feeds are right here."',
      image: '/images/characters/veera_intense.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/3.jpg',
      speaker: 'NSA ALTHAF',
      speakerColor: '#ef4444',
      text: '"Good god... the explosives are wired to central transformers and gas lines. 1,200 hostages are trapped in the atrium. Saif is preparing his first broadcast deadline."',
      image: '/images/characters/althaf_concerned.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/3.jpg',
      speaker: 'UMAR SAIF',
      speakerColor: '#dc2626',
      text: '"Attention Indian government! Your first deadline has expired! If Umar Farooq is not escorted to the border immediately, we begin executing hostages live on camera!"',
      image: '/images/characters/umar_threatening.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/3.jpg',
      speaker: 'NSA ALTHAF',
      speakerColor: '#ef4444',
      text: '"Round 1 complete! Now entering Round 2: Infiltration. Crack the three password databases on that drive to identify who is financing and facilitating Saif from the outside."',
      image: '/images/characters/althaf_commanding.png',
      imagePos: 'left',
    },
  ],
  // 4: The Corrupted Hash Trail
  [
    {
      bg: '/images/background/4.jpg',
      speaker: 'VEERA',
      speakerColor: '#f87171',
      text: '"Three databases cracked! Sleeper cells, foreign wire transfers... and direct high-frequency phone records. The calls lead straight to Home Minister Veera Santhanam\'s office!"',
      image: '/images/characters/veera_intense.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/4.jpg',
      speaker: 'UMAR SAIF',
      speakerColor: '#dc2626',
      text: '"To the Prime Minister: the Home Minister\'s family is in our hands inside the mall. If Umar Farooq is not escorted to the border within three hours, the executions begin!"',
      image: '/images/characters/umar_threatening.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/4.jpg',
      speaker: 'PREETHI',
      speakerColor: '#fca5a5',
      text: '"Veera, the minister\'s kidnapping is a lie! He staged this crisis to emotionally blackmail the cabinet into releasing Farooq! We need unalterable admin proof from their portal."',
      image: '/images/characters/preethi_worried.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/4.jpg',
      speaker: 'VEERA',
      speakerColor: '#f87171',
      text: '"A high cabinet official betraying his own countrymen for a terrorist. Preethi, intercept their live admin session token. I\'m going to rip his mask off before the cabinet."',
      image: '/images/characters/veera_determined.png',
      imagePos: 'right',
    },
  ],
  // 5: The JWT Inception
  [
    {
      bg: '/images/background/5.jpg',
      speaker: 'PREETHI',
      speakerColor: '#fca5a5',
      text: '"Admin JWT decoded! We pulled the raw session logs from their command portal — Home Minister Veera Santhanam\'s staged crisis is fully documented! His treason is undeniable!"',
      image: '/images/characters/preethi_hopeful.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/5.jpg',
      speaker: 'NSA ALTHAF',
      speakerColor: '#ef4444',
      text: '"The Cabinet has received our decrypt. The Home Minister\'s conspiracy is shattered and his orders revoked. But Farooq\'s prison transport convoy was already dispatched toward the border."',
      image: '/images/characters/althaf_neutral.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/5.jpg',
      speaker: 'VEERA',
      speakerColor: '#f87171',
      text: '"Then I am turning the tables. I\'ve captured the minister\'s inside conspirators. I\'m hijacking Saif\'s command frequency to issue our own counter-threat!"',
      image: '/images/characters/veera_intense.png',
      imagePos: 'right',
    },
  ],
  // 6: The Pattern Lock
  [
    {
      bg: '/images/background/6.jpg',
      speaker: 'VEERA',
      speakerColor: '#f87171',
      text: '"Pattern lock breached! I am live on their secure negotiation channel. Saif, your minister is in cuffs, your funding is frozen, and Farooq\'s border convoy has been halted!"',
      image: '/images/characters/veera_determined.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/6.jpg',
      speaker: 'UMAR SAIF',
      speakerColor: '#dc2626',
      text: '"You miserable ghost! You think you\'ve won?! If Farooq does not cross that border, NO ONE leaves East Coast Mall alive! Arm the demolition grid!"',
      image: '/images/characters/umar_angry.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/6.jpg',
      speaker: 'NSA ALTHAF',
      speakerColor: '#ef4444',
      text: '"Round 2 complete. But Saif has initiated total mall demolition! We enter Round 3: The Final Strike. Veera, you must locate and disarm the central detonator!"',
      image: '/images/characters/althaf_concerned.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/6.jpg',
      speaker: 'VEERA',
      speakerColor: '#f87171',
      text: '"The entire structural framework is rigged. If that detonator fires, the atrium collapses on 1,200 people. Preethi, track down Saif\'s detonator telemetry now!"',
      image: '/images/characters/veera_concerned.png',
      imagePos: 'right',
    },
  ],
  // 7: The Payload Hunt
  [
    {
      bg: '/images/background/7.jpg',
      speaker: 'PREETHI',
      speakerColor: '#fca5a5',
      text: '"Saif armed the atrium detonator! We intercepted four fragmented telemetry shards from his detonator unit: binary, hex, base64, and rot13."',
      image: '/images/characters/preethi_worried.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/7.jpg',
      speaker: 'VEERA',
      speakerColor: '#f87171',
      text: '"I am in the central atrium pinned under heavy machine gun fire. Preethi, reassemble those payload shards so we can locate the disarm routine!"',
      image: '/images/characters/veera_concerned.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/7.jpg',
      speaker: 'PREETHI',
      speakerColor: '#fca5a5',
      text: '"All four fragments reconstructed! Killswitch override packet mapped! But Saif has activated a fail-deadly logic bomb inside the power grid!"',
      image: '/images/characters/preethi_hopeful.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/7.jpg',
      speaker: 'UMAR SAIF',
      speakerColor: '#dc2626',
      text: '"Concentrate fire on the atrium escalator! Do not let him reach the terminal! The countdown is running!"',
      image: '/images/characters/umar_angry.png',
      imagePos: 'left',
    },
  ],
  // 8: The Logic Bomb Defusal
  [
    {
      bg: '/images/background/8.jpg',
      speaker: 'PREETHI',
      speakerColor: '#fca5a5',
      text: '"Logic bomb countdown: ten minutes! Nested encoding layers are guarding the defusal key. One error detonates the entire mall!"',
      image: '/images/characters/preethi_worried.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/8.jpg',
      speaker: 'PREETHI',
      speakerColor: '#fca5a5',
      text: '"DEFUSED! The logic bomb is dead! Blast doors are disengaging — all 1,200 hostages are evacuating through the east exits!"',
      image: '/images/characters/preethi_hopeful.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/8.jpg',
      speaker: 'UMAR SAIF',
      speakerColor: '#dc2626',
      text: '"It doesn\'t matter that you stopped the bomb... Farooq was already flown across the border into Pakistan! You can never touch him now!"',
      image: '/images/characters/umar_angry.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/8.jpg',
      speaker: 'VEERA',
      speakerColor: '#f87171',
      text: '"Watch me. Umar Saif is down in the atrium, and East Coast Mall is safe. Althaf, clear runway three. I am taking an Indian Air Force fighter jet across the border."',
      image: '/images/characters/veera_determined.png',
      imagePos: 'right',
    },
  ],
  // 9: The Master Vault (Dogfight Climax)
  [
    {
      bg: '/images/background/9.jpg',
      speaker: 'NARRATOR',
      speakerColor: '#94a3b8',
      text: 'Hostile Border Airspace. Veera pushes the fighter jet into supersonic velocity, dodging surface-to-air missiles and dogfighting hostile interceptors over the mountains.',
      image: '/images/characters/narrator.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/9.jpg',
      speaker: 'UMAR FAROOQ',
      speakerColor: '#dc2626',
      text: '"How did an Indian jet penetrate this deep into our airspace?! Scramble all defenses! Protect the master vault server!"',
      image: '/images/characters/umar_threatening.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/9.jpg',
      speaker: 'VEERA',
      speakerColor: '#f87171',
      text: '"Airspace cleared. Compound neutralized. Umar Farooq is tied up in my custody, and his Master Vault is completely shattered. The global terror network is finished. Chennai is safe."',
      image: '/images/characters/veera_relieved.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/9.jpg',
      speaker: 'PREETHI',
      speakerColor: '#fca5a5',
      text: '"Veera... you did it! All 1,200 hostages are home safe, and Farooq is in chains! The nightmare is finally over!"',
      image: '/images/characters/preethi_hopeful.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/6.jpg',
      speaker: 'NSA ALTHAF',
      speakerColor: '#ef4444',
      text: '"Sensational work, Veera. You brought back Farooq, exposed high-level treason, and saved 1,200 innocent citizens. A true Beast in action. Chennai and the nation salute you."',
      image: '/images/characters/althaf_commanding.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/9.jpg',
      speaker: 'NARRATOR',
      speakerColor: '#94a3b8',
      text: 'The East Coast Mall siege and the border dogfight are over. 1,200 innocent lives saved. The mastermind is captured. Operation Beast is accomplished.',
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
    <div style={{ position: 'fixed', inset: 0, background: '#020203', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: 'monospace' }}>
      {/* Glow bg */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(220,38,38,0.15) 0%, rgba(2,2,3,1) 70%)' }} />
      
      <div ref={cardRef} style={{ textAlign: 'center', padding: '40px 32px', maxWidth: 640, zIndex: 10 }} className="tactical-box corner-brackets p-8 rounded-lg">
        {/* Emblem */}
        <div style={{ marginBottom: 16 }}>
          <Skull className="w-16 h-16 text-red-500 mx-auto drop-shadow-[0_0_20px_#ef4444]" />
        </div>

        {/* Title */}
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 5, color: '#ef4444', marginBottom: 8, textTransform: 'uppercase', fontFamily: 'monospace' }}>
          // OPERATION THE EXTRACTION COMPLETE //
        </div>
        <h1 className="blood-crimson-title" style={{ fontSize: 'clamp(24px,5vw,42px)', fontWeight: 900, letterSpacing: 3, margin: '0 0 8px' }}>
          MISSION ACCOMPLISHED
        </h1>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5', letterSpacing: 3, marginBottom: 28, fontFamily: 'monospace' }}>
          ALL 9 ENCRYPTED TARGETS DESTROYED
        </div>

        {/* Divider */}
        <div style={{ width: 120, height: 2, background: 'linear-gradient(90deg,transparent,#dc2626,#ef4444,transparent)', margin: '0 auto 28px', boxShadow: '0 0 10px #ef4444' }} />

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'TARGETS CRACKED', value: '9 / 9' },
            { label: 'HOSTAGES FREED', value: '1,200' },
            { label: 'THREAT STATUS', value: 'TERMINATED' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 6, padding: '14px 8px' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fee2e2', marginBottom: 4, fontFamily: 'var(--font-rajdhani), sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: 9, color: '#ef4444', letterSpacing: 1, fontFamily: 'monospace' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Credits quote */}
        <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.8, fontStyle: 'italic', marginBottom: 24, fontFamily: 'sans-serif' }}>
          "The names of those who stood in the dark to protect the light will never appear in a public report. But Chennai remembers."
        </p>
        <p style={{ color: '#64748b', fontSize: 11, letterSpacing: 2, marginBottom: 28, fontFamily: 'monospace' }}>— THE EXTRACTION DIRECTIVE, PRESENT DAY</p>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/leaderboard')}
            className="btn-game-primary"
            style={{ padding: '12px 24px', fontSize: 12 }}
          >
            <Trophy size={14} /> VIEW FINAL RANKINGS
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-game-secondary"
            style={{ padding: '12px 24px', fontSize: 12 }}
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
      const target = Math.min(Math.max(challengeNum, 1), currentLevel);
      setResolvedChallengeNum(target);
      setAccessReady(true);
    }).catch(() => {
      if (cancelled) return;
      setResolvedChallengeNum(challengeNum);
      setAccessReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [challengeNum]);

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

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FocusScreenButton />
          {/* Skip */}
          <button
            onClick={e => { e.stopPropagation(); setShowSkipConfirm(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 15px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}
          >
            <SkipForward size={12} />SKIP
          </button>
        </div>
      </div>

      {/* Character portrait */}
      <div
        ref={portraitRef}
        className="story-portrait"
        style={{
          position: 'absolute',
          bottom: 0,
          [scene.imagePos === 'left' ? 'left' : 'right']: 0,
          zIndex: 10,
          width: 'clamp(240px, 28vw, 440px)',
          height: 'clamp(340px, 72vh, 740px)',
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
              ? 'drop-shadow(0 0 36px rgba(239,68,68,0.7)) drop-shadow(0 0 60px rgba(0,0,0,0.95))'
              : 'drop-shadow(0 0 32px rgba(220,38,38,0.5)) drop-shadow(0 0 60px rgba(0,0,0,0.9))',
          }}
          priority
          onError={() => {}}
        />
      </div>

      {/* Dialogue box */}
      <div
        ref={dialogueRef}
        className="story-dialogue-container"
        style={{
          position: 'absolute',
          bottom: '2.5vh',
          ...(scene.imagePos === 'left'
            ? { left: 'clamp(250px, 29vw, 460px)', right: '3vw' }
            : { left: '3vw', right: 'clamp(250px, 29vw, 460px)' }
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
              ? 'linear-gradient(90deg,rgba(220,38,38,0.95),rgba(153,27,27,0.6))'
              : isNarrator
              ? 'linear-gradient(90deg,rgba(75,85,99,0.9),rgba(55,65,81,0.5))'
              : 'linear-gradient(90deg,rgba(185,28,28,0.9),rgba(127,29,29,0.5))',
            border: `1px solid ${speakerColor}88`,
            borderRadius: '6px 6px 0 0',
            fontSize: 15, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase',
            color: speakerColor,
            backdropFilter: 'blur(10px)',
            boxShadow: `0 0 24px ${speakerColor}44`,
            fontFamily: 'monospace',
          }}
        >
          {scene.speaker}
        </div>

        {/* Dialogue panel */}
        <div style={{
          background: isUmar
            ? 'linear-gradient(135deg,rgba(20,4,6,0.97),rgba(32,6,10,0.95))'
            : 'linear-gradient(135deg,rgba(10,4,6,0.96),rgba(20,5,8,0.94))',
          border: `1px solid ${speakerColor}66`,
          borderRadius: '0 12px 12px 12px',
          padding: '26px 36px 50px',
          backdropFilter: 'blur(28px)',
          boxShadow: `0 10px 70px rgba(0,0,0,0.9), 0 0 40px ${speakerColor}22`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${speakerColor}66,transparent)` }} />
          <p style={{ margin: 0, fontSize: 21, color: '#f8fafc', lineHeight: 1.85, fontWeight: 400, letterSpacing: '0.01em', minHeight: '4em' }}>
            {displayText}
            {isTyping && <span style={{ color: '#ef4444', opacity: 0.9, animation: 'blink 0.7s steps(1) infinite' }}>|</span>}
          </p>
          {!isTyping && (
            <div style={{ position: 'absolute', bottom: 18, right: 26, display: 'flex', alignItems: 'center', gap: 7, color: `${speakerColor}ee`, fontSize: 13, fontWeight: 700, letterSpacing: 2, animation: 'nudge 1.5s ease-in-out infinite', fontFamily: 'monospace' }}>
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
          <div key={i} style={{ width: i === sceneIdx ? 18 : 6, height: 6, borderRadius: 3, background: i < sceneIdx ? '#ef4444' : i === sceneIdx ? speakerColor : 'rgba(255,255,255,0.18)', transition: 'all 0.3s ease', boxShadow: i === sceneIdx ? `0 0 8px ${speakerColor}` : 'none' }} />
        ))}
      </div>

      {/* Skip confirm */}
      {showSkipConfirm && (
        <div
          onClick={e => e.stopPropagation()}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: 'linear-gradient(135deg,rgba(12,4,7,0.99),rgba(24,6,10,0.98))', border: '1px solid rgba(220,38,38,0.5)', borderRadius: 12, padding: '28px 32px', maxWidth: 380, width: '90vw', textAlign: 'center', boxShadow: '0 0 60px rgba(220,38,38,0.25)' }}>
            <div style={{ fontSize: 28, marginBottom: 10, color: '#ef4444' }}>⚠️</div>
            <h3 style={{ color: '#fee2e2', fontSize: 18, fontWeight: 900, letterSpacing: 2, marginBottom: 10, fontFamily: 'monospace' }}>SKIP CUTSCENE?</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, marginBottom: 22 }}>
              {challengeNum
                ? 'Skip the mission debrief and return to the timeline.'
                : 'Skip the story introduction and proceed to the mission HQ.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setShowSkipConfirm(false)}
                style={{ padding: '11px 22px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 6, cursor: 'pointer', color: '#f87171', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}
              >
                Keep Watching
              </button>
              <button
                onClick={handleSkip}
                style={{ padding: '11px 22px', background: 'linear-gradient(135deg,#991b1b,#dc2626)', border: '1px solid rgba(248,113,113,0.5)', borderRadius: 6, cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 1, boxShadow: '0 0 20px rgba(220,38,38,0.4)' }}
              >
                Skip Intel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes nudge { 0%,100%{opacity:0.6;transform:translateX(0)} 50%{opacity:1;transform:translateX(4px)} }
        @media (max-width: 860px) {
          .story-portrait {
            opacity: 0.35 !important;
            height: clamp(260px, 50vh, 460px) !important;
            width: clamp(180px, 45vw, 300px) !important;
          }
          .story-dialogue-container {
            left: 16px !important;
            right: 16px !important;
            bottom: 16px !important;
          }
        }
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
