'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import GameLayout from '@/components/game/GameLayout';
import { ChevronRight, SkipForward, X, ArrowLeft } from 'lucide-react';

type Scene = {
  bg: string;
  speaker: string;
  speakerColor: string;
  text: string;
  image: string;
  imagePos?: 'left' | 'right';
};

const SCENES: Scene[] = [
  {
    bg: '/images/background/3.jpg',
    speaker: 'NARRATOR',
    speakerColor: '#6b7280',
    text: 'February 1st, 2026. 3:44 AM. Codissia Trade Fair Complex, Coimbatore. Tamil Nadu\'s largest event venue — transformed overnight into a warzone. A coordinated terror cell has seized 1,200 civilians across three buildings. This is Operation Cipher Strike.',
    image: '/images/characters/veera_intense.png',
    imagePos: 'right',
  },
  {
    bg: '/images/background/1.jpg',
    speaker: 'NARRATOR',
    speakerColor: '#6b7280',
    text: 'Umar Saif — a rogue Pakistani intelligence operative — leads the assault. His demand: the immediate release of Farooq Shah, a captured terror financier. But intelligence confirms this is a decoy. The real objective is something far more dangerous.',
    image: '/images/characters/umar_threatening.png',
    imagePos: 'right',
  },
  {
    bg: '/images/background/5.jpg',
    speaker: 'UMAR SAIF',
    speakerColor: '#ef4444',
    text: '"You have six hours. Release Farooq Shah, or I execute one hostage every ten minutes on national television. And when I am done — Operation BLACKOUT goes live. Your entire economy will collapse before morning prayer."',
    image: '/images/characters/umar_angry.png',
    imagePos: 'left',
  },
  {
    bg: '/images/background/2.jpg',
    speaker: 'PREETHI',
    speakerColor: '#f472b6',
    text: '"NSA is monitoring a dormant malware called BLACKOUT — planted inside twelve Tamil Nadu power grids. If it activates on February 14th, it will wipe financial systems, crash hospital networks, and cut power to 50,000 businesses. Saif has the trigger."',
    image: '/images/characters/preethi_worried.png',
    imagePos: 'right',
  },
  {
    bg: '/images/background/4.jpg',
    speaker: 'VEERA',
    speakerColor: '#a78bfa',
    text: '"I\'m already inside. Found a server room in the basement — B2 level. Their network is running on a backdoor relay. If I can get into ER-42, I can intercept Saif\'s command traffic. But I need you to decode what I find. Are you ready to be my cyber unit?"',
    image: '/images/characters/veera_determined.png',
    imagePos: 'left',
  },
  {
    bg: '/images/background/4.jpg',
    speaker: 'VIKRAM',
    speakerColor: '#38bdf8',
    text: '"Sir Veera, I\'m patched into the NSA relay. We have a 20-minute window before Saif rotates encryption keys. Every flag you decode is intelligence that brings us one step closer to shutting down BLACKOUT. Work fast. Work smart. Lives depend on this."',
    image: '/images/characters/vikram_urgent.png',
    imagePos: 'right',
  },
  {
    bg: '/images/background/6.jpg',
    speaker: 'ALTHAF',
    speakerColor: '#34d399',
    text: '"I\'m Deputy NSA Director Althaf. I\'m authorising your team for Level-5 cyber operations. This is not a simulation. Nine cipher challenges stand between Coimbatore and catastrophe. Solve them in sequence. No skipping — each mission builds on the last. Begin."',
    image: '/images/characters/althaf_commanding.png',
    imagePos: 'left',
  },
  {
    bg: '/images/background/7.jpg',
    speaker: 'NARRATOR',
    speakerColor: '#6b7280',
    text: 'Three rounds. Nine missions. Each challenge is a real cipher used in the field — Base64, ROT13, SHA-256, JWT tokens, logic bombs. Each solution advances the operation and reveals more of Saif\'s network. The clock is running. Farooq\'s transfer begins at dawn.',
    image: '/images/characters/vikram_serious.png',
    imagePos: 'right',
  },
  {
    bg: '/images/background/8.jpg',
    speaker: 'PREETHI',
    speakerColor: '#f472b6',
    text: '"Every team gets the same nine missions — but the Time-Locked Vault and Pattern Lock challenges are personalised to your team. Your hash. Your flag. No copying. The terrorists designed it that way, and so did we. Your unique answer is the only answer that works."',
    image: '/images/characters/preethi_hopeful.png',
    imagePos: 'left',
  },
  {
    bg: '/images/background/9.jpg',
    speaker: 'VEERA',
    speakerColor: '#a78bfa',
    text: '"I\'ll be in the field. You\'ll be my cyber support. When I send you data, decode it. When I send you a hash, crack it. When I send you a JWT, expose it. Together we find the BLACKOUT kill switch, stop Saif, and bring every hostage home. Let\'s move."',
    image: '/images/characters/veera_relieved.png',
    imagePos: 'right',
  },
];

export default function StoryPage() {
  const router = useRouter();
  const [sceneIdx, setSceneIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const bgRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const dialogueRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scene = SCENES[sceneIdx];
  const isLast = sceneIdx === SCENES.length - 1;

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
    }, 16);
  }, []);

  const animateScene = useCallback((idx: number) => {
    const s = SCENES[idx];
    // Background fade
    if (bgRef.current) {
      gsap.fromTo(bgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: 'power2.inOut' });
    }
    // Portrait slide in
    if (portraitRef.current) {
      const fromX = s.imagePos === 'left' ? -40 : 40;
      gsap.fromTo(portraitRef.current,
        { opacity: 0, x: fromX, scale: 0.96 },
        { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 }
      );
    }
    // Dialogue box rise
    if (dialogueRef.current) {
      gsap.fromTo(dialogueRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.2 });
    }
    if (nameRef.current) {
      gsap.fromTo(nameRef.current, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out', delay: 0.25 });
    }
    typeText(s.text);
  }, [typeText]);

  useEffect(() => {
    animateScene(sceneIdx);
    return () => { if (typeTimerRef.current) clearInterval(typeTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIdx]);

  const advance = () => {
    if (isTyping) {
      // Complete typing instantly
      if (typeTimerRef.current) clearInterval(typeTimerRef.current);
      setDisplayText(scene.text);
      setIsTyping(false);
      return;
    }
    if (isLast) {
      router.push('/challenges');
      return;
    }
    setSceneIdx(i => i + 1);
  };

  const handleSkip = () => {
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    router.push('/challenges');
  };

  return (
    <div
      onClick={advance}
      style={{ position: 'fixed', inset: 0, cursor: 'pointer', userSelect: 'none', fontFamily: "'Inter',sans-serif", background: '#000' }}
    >
      {/* Background */}
      <div ref={bgRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Image src={scene.bg} alt="background" fill style={{ objectFit: 'cover', filter: 'brightness(0.35) saturate(0.8)' }} priority />
        {/* Vignette */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)' }} />
        {/* Scanline overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)', zIndex: 1, pointerEvents: 'none' }} />
      </div>

      {/* HUD top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: '14px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg,rgba(0,0,0,0.7) 0%,transparent 100%)' }}>
        {/* Back button */}
        <Link 
          href="/dashboard" 
          onClick={e => e.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 13px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 7, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1, transition: 'all 0.2s', textDecoration: 'none' }}
        >
          <ArrowLeft size={12} />HQ
        </Link>

        {/* Scene dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {SCENES.map((_, i) => (
            <div key={i} style={{ width: i === sceneIdx ? 18 : 6, height: 6, borderRadius: 3, background: i < sceneIdx ? '#10b981' : i === sceneIdx ? '#a78bfa' : 'rgba(255,255,255,0.15)', transition: 'all 0.3s ease', boxShadow: i === sceneIdx ? '0 0 8px rgba(167,139,250,0.8)' : 'none' }} />
          ))}
        </div>

        {/* Operation label */}
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
          OPERATION CIPHER STRIKE
        </div>

        {/* Skip button */}
        <button
          onClick={e => { e.stopPropagation(); setShowSkipConfirm(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 13px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 7, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1, transition: 'all 0.2s' }}
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
          [scene.imagePos === 'left' ? 'left' : 'right']: '6vw',
          zIndex: 10,
          width: 'clamp(220px, 28vw, 400px)',
          height: 'clamp(340px, 68vh, 680px)',
          pointerEvents: 'none',
        }}
      >
        <Image
          src={scene.image}
          alt="character"
          fill
          style={{ objectFit: 'contain', objectPosition: 'bottom', filter: 'drop-shadow(0 0 32px rgba(109,40,217,0.45)) drop-shadow(0 0 60px rgba(0,0,0,0.8))' }}
          priority
        />
      </div>

      {/* Dialogue box */}
      <div
        ref={dialogueRef}
        style={{ position: 'absolute', bottom: '3vh', left: '5vw', right: '5vw', zIndex: 15, pointerEvents: 'none' }}
      >
        {/* Name tag */}
        <div
          ref={nameRef}
          style={{
            display: 'inline-block',
            marginBottom: 8, marginLeft: 4,
            padding: '5px 18px',
            background: 'linear-gradient(90deg, rgba(109,40,217,0.85), rgba(109,40,217,0.4))',
            border: '1px solid rgba(167,139,250,0.55)',
            borderRadius: '8px 8px 0 0',
            fontSize: 11, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase',
            color: scene.speakerColor,
            backdropFilter: 'blur(10px)',
            boxShadow: `0 0 20px ${scene.speakerColor}44`,
          }}
        >
          {scene.speaker}
        </div>

        {/* Dialogue panel */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(2,1,12,0.92), rgba(14,8,40,0.9))',
          border: '1px solid rgba(109,40,217,0.45)',
          borderRadius: '0 14px 14px 14px',
          padding: '18px 24px 20px',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 8px 60px rgba(0,0,0,0.7), 0 0 30px rgba(109,40,217,0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Top accent line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent)' }} />

          <p style={{ margin: 0, fontSize: 'clamp(13px,1.6vw,17px)', color: '#e2e8f0', lineHeight: 1.75, minHeight: '3em', fontWeight: 400 }}>
            {displayText}
            {isTyping && <span style={{ opacity: 0.7, animation: 'blink 0.7s steps(1) infinite' }}>|</span>}
          </p>

          {/* Advance hint */}
          {!isTyping && (
            <div style={{ position: 'absolute', bottom: 14, right: 20, display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(167,139,250,0.6)', fontSize: 10, fontWeight: 700, letterSpacing: 2, animation: 'pulse 1.5s ease-in-out infinite' }}>
              {isLast ? 'BEGIN MISSIONS' : 'CONTINUE'} <ChevronRight size={13} />
            </div>
          )}
        </div>
      </div>

      {/* Scene counter */}
      <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 20, color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: 2 }}>
        {sceneIdx + 1} / {SCENES.length}
      </div>

      {/* Skip confirm modal */}
      {showSkipConfirm && (
        <div
          onClick={e => e.stopPropagation()}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: 'linear-gradient(135deg,rgba(2,1,12,0.98),rgba(14,8,40,0.97))', border: '1px solid rgba(109,40,217,0.45)', borderRadius: 14, padding: '24px 28px', maxWidth: 380, width: '90vw', textAlign: 'center' }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}></div>
            <h3 style={{ color: '#e9d5ff', fontSize: 16, fontWeight: 900, letterSpacing: 2, marginBottom: 8 }}>SKIP PROLOGUE?</h3>
            <p style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.6, marginBottom: 18 }}>
              You will bypass the story introduction and proceed directly to the mission terminal.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setShowSkipConfirm(false)}
                style={{ padding: '10px 22px', background: 'rgba(109,40,217,0.12)', border: '1px solid rgba(109,40,217,0.35)', borderRadius: 8, cursor: 'pointer', color: '#c4b5fd', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}
              >
                Continue Story
              </button>
              <button
                onClick={handleSkip}
                style={{ padding: '10px 22px', background: 'rgba(109,40,217,0.7)', border: '1px solid rgba(167,139,250,0.5)', borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: 1, boxShadow: '0 0 20px rgba(109,40,217,0.35)' }}
              >
                Skip to Missions
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:0.6;transform:translateX(0)} 50%{opacity:1;transform:translateX(3px)} }
      `}</style>
    </div>
  );
}
