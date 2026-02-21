'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Shield, Flag, Lock, CheckCircle, Zap, ArrowLeft, Trophy,
} from 'lucide-react';
import { api } from '@/lib/api';

gsap.registerPlugin(ScrollTrigger);

const MISSIONS = [
  { order: 1, round: 1, level: '1.1', name: 'The Intercepted Transmission', type: 'CRYPTOGRAPHY', difficulty: 'easy', points: 100, character: 'Veera Raghavan', characterImage: '/images/characters/veera_determined.png', bgImage: '/images/background/1.jpg', act: 'ROUND 1 — THE BREACH', accentColor: '#ef4444', accentRgb: '239,68,68', description: 'A dark, encrypted message intercepts the terror cell\'s communication channel. Triple-layer encoding stands between you and the command center location.' },
  { order: 2, round: 1, level: '1.2', name: 'The Fragmented Server Map', type: 'FORENSICS', difficulty: 'medium', points: 150, character: 'Vikram Singaravelan', characterImage: '/images/characters/vikram_serious.png', bgImage: '/images/background/2.jpg', act: 'ROUND 1 — THE BREACH', accentColor: '#ef4444', accentRgb: '239,68,68', description: 'Three encrypted file fragments hold the access codes to Server Room ER-42. Hex, Binary, Caesar — assemble them in order before the patrol returns.' },
  { order: 3, round: 1, level: '1.3', name: 'The Time-Locked Vault', type: 'MATH/HASH', difficulty: 'hard', points: 200, character: 'Deputy NSA Althaf', characterImage: '/images/characters/althaf_commanding.png', bgImage: '/images/background/3.jpg', act: 'ROUND 1 — THE BREACH', accentColor: '#ef4444', accentRgb: '239,68,68', description: 'A unique biometric vault uses your team\'s identity as part of the combination. The city\'s attack blueprint is locked inside.' },
  { order: 4, round: 2, level: '2.1', name: 'The Corrupted Hash Trail', type: 'HASH CRACKING', difficulty: 'medium', points: 250, character: 'Veera Raghavan', characterImage: '/images/characters/veera_intense.png', bgImage: '/images/background/4.jpg', act: 'ROUND 2 — INFILTRATION', accentColor: '#f59e0b', accentRgb: '245,158,11', description: 'Three password-protected databases hold evidence against the terror cell. MD5, SHA-1, SHA-256 — crack all three to stop Farooq\'s release.' },
  { order: 5, round: 2, level: '2.2', name: 'The JWT Inception', type: 'WEB/TOKEN', difficulty: 'hard', points: 300, character: 'Vikram Singaravelan', characterImage: '/images/characters/vikram_urgent.png', bgImage: '/images/background/5.jpg', act: 'ROUND 2 — INFILTRATION', accentColor: '#f59e0b', accentRgb: '245,158,11', description: 'A hex-encoded JWT token guards the terrorist admin panel. Decode this multi-layered token to extract proof of government blackmail.' },
  { order: 6, round: 2, level: '2.3', name: 'The Pattern Lock', type: 'CRYPTOGRAPHY', difficulty: 'hard', points: 350, character: 'Deputy NSA Althaf', characterImage: '/images/characters/althaf_concerned.png', bgImage: '/images/background/6.jpg', act: 'ROUND 2 — INFILTRATION', accentColor: '#f59e0b', accentRgb: '245,158,11', description: 'The final database protecting the BLACKOUT worm blueprint uses a team-specific pattern. A SHA-256 challenge unique to every team.' },
  { order: 7, round: 3, level: '3.1', name: 'The Payload Hunt', type: 'REVERSE ENG', difficulty: 'hard', points: 400, character: 'Veera Raghavan', characterImage: '/images/characters/veera_concerned.png', bgImage: '/images/background/7.jpg', act: 'ROUND 3 — FINAL STRIKE', accentColor: '#10b981', accentRgb: '16,185,129', description: 'The BLACKOUT payload is split across four encoding methods. Decode each fragment to reveal the activation mechanism and build the kill switch.' },
  { order: 8, round: 3, level: '3.2', name: 'The Logic Bomb Defusal', type: 'NESTED DECODE', difficulty: 'hard', points: 450, character: 'Vikram Singaravelan', characterImage: '/images/characters/vikram_serious.png', bgImage: '/images/background/8.jpg', act: 'ROUND 3 — FINAL STRIKE', accentColor: '#10b981', accentRgb: '16,185,129', description: 'A logic bomb will trigger Operation BLACKOUT 13 days early. Five encoding layers deep — one wrong step and the city loses everything tonight.' },
  { order: 9, round: 3, level: '3.3', name: 'The Master Vault', type: 'FINAL BOSS', difficulty: 'hard', points: 1000, character: 'Veera Raghavan', characterImage: '/images/characters/veera_relieved.png', bgImage: '/images/background/9.jpg', act: 'ROUND 3 — FINAL STRIKE', accentColor: '#10b981', accentRgb: '16,185,129', description: 'The last stronghold. Every technique you have learned converges here. Crack the master vault and destroy Operation BLACKOUT forever.' },
];

const ROUND_COLORS: Record<number, { primary: string; rgb: string; label: string }> = {
  1: { primary: '#ef4444', rgb: '239,68,68', label: 'ROUND 1 — THE BREACH' },
  2: { primary: '#f59e0b', rgb: '245,158,11', label: 'ROUND 2 — INFILTRATION' },
  3: { primary: '#10b981', rgb: '16,185,129', label: 'ROUND 3 — FINAL STRIKE' },
};

const DIFF_COLORS: Record<string, string> = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };

export default function TimelinePage() {
  const router = useRouter();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [teamPoints, setTeamPoints] = useState(0);
  const [teamName, setTeamName] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    api.challenges.getCurrent().then(data => {
      setCurrentLevel(data?.progress?.currentLevel ?? 1);
      setTeamPoints(data?.team?.currentPoints ?? 0);
      setTeamName(data?.team?.name ?? '');
      // Auto-scroll to active card after brief delay
      setTimeout(() => {
        if (activeCardRef.current) {
          activeCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 800);
    }).catch(() => {});
  }, [router]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      // Create floating particles
      const particleCount = 20;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
          position: fixed;
          width: ${Math.random() * 60 + 20}px;
          height: ${Math.random() * 60 + 20}px;
          border: 1.5px solid rgba(124,58,237,${Math.random() * 0.15 + 0.05});
          border-radius: ${Math.random() > 0.3 ? '50%' : '8px'};
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          pointer-events: none;
          z-index: 1;
          transform: rotate(${Math.random() * 360}deg);
        `;
        containerRef.current?.appendChild(particle);

        // Animate particle floating
        gsap.to(particle, {
          x: (Math.random() - 0.5) * 300,
          y: (Math.random() - 0.5) * 300,
          rotation: Math.random() * 360,
          opacity: Math.random() * 0.4,
          duration: Math.random() * 10 + 10,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      // Title entrance with bounce
      gsap.from('[data-tl="header"]', {
        y: -80,
        opacity: 0,
        scale: 0.9,
        duration: 1,
        ease: 'back.out(1.5)',
      });

      // Animate center line drawing with glow
      gsap.from('[data-tl="line"]', {
        scaleY: 0,
        transformOrigin: 'top center',
        duration: 2.2,
        ease: 'power2.inOut',
        delay: 0.5,
        onUpdate: function() {
          if (lineRef.current) {
            const progress = this.progress();
            lineRef.current.style.filter = `drop-shadow(0 0 ${progress * 20}px rgba(124,58,237,0.6))`;
          }
        },
      });

      // Animate each mission card with advanced effects
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const isRight = i % 2 === 1;
        
        // Card entrance
        gsap.from(card, {
          x: isRight ? 180 : -180,
          y: 50,
          opacity: 0,
          scale: 0.85,
          rotation: isRight ? 8 : -8,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 40%',
            toggleActions: 'play none none reverse',
          },
        });

        // Card subtle floating animation when in view
        gsap.to(card, {
          y: '+=10',
          duration: 2.5 + i * 0.3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            end: 'bottom 10%',
            toggleActions: 'play pause play pause',
          },
        });

        // Dot entrance with spring
        const dot = card.querySelector('[data-dot]');
        if (dot) {
          gsap.from(dot, {
            scale: 0,
            rotation: 360,
            duration: 0.8,
            ease: 'elastic.out(1, 0.5)',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          });

          // Continuous pulse
          gsap.to(dot, {
            scale: 1.15,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }

        // Connector line draw-in
        const connector = card.parentElement?.querySelector('[data-connector]');
        if (connector) {
          gsap.from(connector, {
            scaleX: 0,
            transformOrigin: isRight ? 'right center' : 'left center',
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          });
        }
      });
    }, containerRef);

    return () => {
      ctx.revert();
      // Clean up particles
      const particles = containerRef.current?.querySelectorAll('.floating-particle');
      particles?.forEach(p => p.remove());
    };
  }, []);

  const getState = (order: number) => {
    if (order < currentLevel) return 'solved';
    if (order === currentLevel) return 'active';
    return 'locked';
  };

  return (
    <div ref={containerRef} style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #080614 0%, #0a0818 40%, #080614 100%)', fontFamily: "'Share Tech Mono', 'Courier New', monospace", overflow: 'auto', position: 'relative' }}>
      {/* Animated radial gradient overlay */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(6,182,212,0.1) 0%, transparent 50%)', opacity: 0.6 }} />
      {/* Scanlines */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.22),rgba(0,0,0,0.22) 1px,transparent 1px,transparent 3px)', opacity: 0.28 }} />
      {/* Grid bg */}
      <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', opacity: 0.02, zIndex: 0, pointerEvents: 'none' }}>
        <defs><pattern id="tg" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0 L0 0 0 60" fill="none" stroke="#7c3aed" strokeWidth="0.5" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#tg)" />
      </svg>

      {/* Top nav */}
      <div data-tl="header" style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', padding: '10px 28px', borderBottom: '1px solid rgba(109,40,217,0.25)', background: 'rgba(5,2,18,0.97)', backdropFilter: 'blur(24px)', gap: 14 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 12, fontWeight: 700, letterSpacing: 2, textDecoration: 'none', padding: '7px 14px', border: '1px solid rgba(55,65,81,0.4)', borderRadius: 7 }}>
          <ArrowLeft size={13} />HQ
        </Link>
        <Link href="/leaderboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 12, fontWeight: 700, letterSpacing: 2, textDecoration: 'none', padding: '7px 14px', border: '1px solid rgba(55,65,81,0.4)', borderRadius: 7 }}>
          <Trophy size={13} />RANKS
        </Link>
        <Link href="/story" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 12, fontWeight: 700, letterSpacing: 2, textDecoration: 'none', padding: '7px 14px', border: '1px solid rgba(55,65,81,0.4)', borderRadius: 7 }}>
          <Flag size={13} />STORY
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={13} color="#fff" />
          </div>
          <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 800, letterSpacing: 3 }}>CIPHER OPS</span>
          <span style={{ color: '#4b5563', fontSize: 12, letterSpacing: 2 }}>/ MISSION TIMELINE</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.32)', borderRadius: 8, padding: '5px 14px' }}>
          <Trophy size={13} color="#fbbf24" />
          <span style={{ color: '#fbbf24', fontWeight: 900, fontSize: 18 }}>{teamPoints.toLocaleString()}</span>
          <span style={{ color: '#92400e', fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>PTS</span>
        </div>
        {teamName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'dopulse 2s infinite' }} />
            <span style={{ color: '#94a3b8', fontSize: 11, letterSpacing: 1, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teamName}</span>
          </div>
        )}
      </div>

      {/* Page header */}
      <div data-tl="header" style={{ textAlign: 'center', padding: '60px 24px 30px', position: 'relative', zIndex: 5 }}>
        <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 700, letterSpacing: 6, marginBottom: 14, textTransform: 'uppercase' }}>Operation Blackout</div>
        <h1 style={{ margin: 0, fontSize: 48, fontWeight: 900, color: 'transparent', backgroundImage: 'linear-gradient(135deg, #a78bfa 0%, #06b6d4 50%, #10b981 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', letterSpacing: 8, textTransform: 'uppercase', textShadow: 'none', filter: 'drop-shadow(0 0 60px rgba(124,58,237,0.6))' }}>
          Mission Timeline
        </h1>
        <div style={{ height: 3, width: 120, background: 'linear-gradient(90deg,transparent,#7c3aed 20%,#06b6d4 50%,#10b981 80%,transparent)', margin: '20px auto 0', borderRadius: 3, boxShadow: '0 0 30px rgba(124,58,237,0.5)' }} />
        <p style={{ color: '#94a3b8', fontSize: 15, marginTop: 20, letterSpacing: 3, fontWeight: 600 }}>9 MISSIONS · 3 ACTS · COIMBATORE 2026</p>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', padding: '20px 24px 80px', zIndex: 5 }}>
        {/* Center vertical line */}
        <div
          data-tl="line"
          ref={lineRef}
          style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            top: 0, bottom: 0, width: 3,
            background: 'linear-gradient(180deg,rgba(124,58,237,0) 0%,rgba(124,58,237,0.8) 10%,rgba(124,58,237,0.9) 30%,rgba(6,182,212,0.7) 50%,rgba(16,185,129,0.8) 70%,rgba(16,185,129,0.9) 90%,rgba(16,185,129,0) 100%)',
            zIndex: 1,
            boxShadow: '0 0 20px rgba(124,58,237,0.6), 0 0 40px rgba(6,182,212,0.3)',
          }}
        />

        {MISSIONS.map((m, i) => {
          const state = getState(m.order);
          const isRight = i % 2 === 1;
          const rc = ROUND_COLORS[m.round];
          return (
            <div
              key={m.level}
              ref={el => {
                cardRefs.current[i] = el;
                if (state === 'active') activeCardRef.current = el;
              }}
              style={{ display: 'flex', justifyContent: isRight ? 'flex-end' : 'flex-start', marginBottom: state === 'active' ? 50 : 36, position: 'relative', zIndex: state === 'active' ? 5 : 2 }}
            >
              {/* Center dot */}
              <div
                data-dot
                style={{
                  position: 'absolute', left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 22, height: 22, borderRadius: '50%',
                  background: state === 'solved'
                    ? 'radial-gradient(circle, #34d399 0%, #10b981 100%)'
                    : state === 'active'
                    ? 'radial-gradient(circle, #a78bfa 0%, #7c3aed 100%)'
                    : 'radial-gradient(circle, #4b5563 0%, #1f2937 100%)',
                  border: `3px solid ${state === 'solved' ? '#6ee7b7' : state === 'active' ? '#c4b5fd' : '#374151'}`,
                  boxShadow: state === 'active'
                    ? '0 0 30px rgba(124,58,237,1), 0 0 60px rgba(124,58,237,0.6), inset 0 0 15px rgba(255,255,255,0.3)'
                    : state === 'solved'
                    ? '0 0 20px rgba(16,185,129,0.9), 0 0 40px rgba(16,185,129,0.5), inset 0 0 10px rgba(255,255,255,0.2)'
                    : 'none',
                  zIndex: 10, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />

              {/* Connector line from card to center */}
              <div data-connector style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                [isRight ? 'right' : 'left']: '50%',
                width: 'calc(8% - 2px)', height: 2,
                background: `linear-gradient(${isRight ? '90deg' : '-90deg'},transparent,rgba(${rc.rgb}, 0.7))`,
                zIndex: 1,
                boxShadow: `0 0 12px rgba(${rc.rgb}, 0.4)`,
              }} />

              {/* Card */}
              <div
                onClick={() => state !== 'locked' && router.push(`/challenges?level=${m.order}`)}
                style={{
                  width: '42%',
                  background: state === 'active'
                    ? 'linear-gradient(135deg,rgba(109,40,217,0.22),rgba(5,2,18,0.97))'
                    : state === 'solved'
                    ? 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(5,2,18,0.97))'
                    : 'rgba(5,2,18,0.92)',
                  border: `2px solid ${state === 'active' ? 'rgba(124,58,237,0.65)' : state === 'solved' ? 'rgba(16,185,129,0.45)' : 'rgba(55,65,81,0.3)'}`,
                  borderRadius: 20,
                  overflow: 'hidden',
                  cursor: state !== 'locked' ? 'pointer' : 'default',
                  opacity: state === 'locked' ? 0.5 : 1,
                  boxShadow: state === 'active'
                    ? '0 0 50px rgba(109,40,217,0.35), 0 12px 50px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : state === 'solved'
                    ? '0 0 30px rgba(16,185,129,0.2), 0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 4px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={e => {
                  if (state === 'locked') return;
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-8px) scale(1.02)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 70px rgba(${rc.rgb},0.45), 0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.15)`;
                  (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${rc.rgb}, 0.9)`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0) scale(1)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = state === 'active'
                    ? '0 0 50px rgba(109,40,217,0.35), 0 12px 50px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : state === 'solved'
                    ? '0 0 30px rgba(16,185,129,0.2), 0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 4px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = state === 'active' ? 'rgba(124,58,237,0.65)' : state === 'solved' ? 'rgba(16,185,129,0.45)' : 'rgba(55,65,81,0.3)';
                }}
              >
                {/* Accent top bar with glow */}
                <div style={{ height: 4, background: `linear-gradient(90deg,transparent,${m.accentColor},${m.accentColor},transparent)`, boxShadow: `0 0 20px ${m.accentColor}, 0 0 40px ${m.accentColor}50` }} />

                {/* Background image subtle overlay */}
                <div style={{ position: 'relative' }}>
                  <div style={{ height: 120, position: 'relative', overflow: 'hidden' }}>
                    <Image src={m.bgImage} alt={m.name} fill style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.28, filter: 'saturate(0.6)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(5,2,18,0.4) 0%,rgba(5,2,18,0.85) 100%)' }} />
                    {/* Character */}
                    <div style={{ position: 'absolute', bottom: 0, [isRight ? 'left' : 'right']: 12, height: 115, width: 70, overflow: 'hidden' }}>
                      <Image src={m.characterImage} alt={m.character} fill style={{ objectFit: 'cover', objectPosition: 'top center', filter: state === 'locked' ? 'grayscale(1) brightness(0.4)' : 'none' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(5,2,18,0.3),transparent,rgba(5,2,18,0.3))' }} />
                    </div>
                    {/* Status badge */}
                    <div style={{ position: 'absolute', top: 12, [isRight ? 'right' : 'left']: 12, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(5,2,18,0.85)', border: `1px solid ${state === 'solved' ? 'rgba(16,185,129,0.5)' : state === 'active' ? 'rgba(124,58,237,0.5)' : 'rgba(55,65,81,0.4)'}`, borderRadius: 7, padding: '4px 10px' }}>
                      {state === 'solved' ? <CheckCircle size={11} color="#10b981" /> : state === 'active' ? <Zap size={11} color="#a78bfa" /> : <Lock size={11} color="#4b5563" />}
                      <span style={{ fontSize: 10, fontWeight: 700, color: state === 'solved' ? '#10b981' : state === 'active' ? '#a78bfa' : '#4b5563', letterSpacing: 1 }}>{state.toUpperCase()}</span>
                    </div>
                  </div>

                  <div style={{ padding: '14px 16px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: m.accentColor, background: `rgba(${m.accentRgb},0.12)`, border: `1px solid rgba(${m.accentRgb},0.3)`, borderRadius: 5, padding: '2px 8px' }}>{m.act}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: DIFF_COLORS[m.difficulty], letterSpacing: 1 }}>{m.difficulty.toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                      <div>
                        <div style={{ color: '#6b7280', fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>{m.level}</div>
                        <div style={{ color: '#e9d5ff', fontSize: 16, fontWeight: 900, lineHeight: 1.25, letterSpacing: 1 }}>{m.name}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ color: '#fbbf24', fontSize: 18, fontWeight: 900 }}>{m.points}</div>
                        <div style={{ color: '#92400e', fontSize: 9, letterSpacing: 2 }}>PTS</div>
                      </div>
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>{m.type}</div>
                    <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.75, margin: 0 }}>{m.description}</p>

                    {state !== 'locked' && (
                      <div
                        onClick={e => { e.stopPropagation(); router.push(`/challenges?level=${m.order}`); }}
                        style={{
                          marginTop: 16,
                          padding: state === 'active' ? '14px 20px' : '10px 14px',
                          background: state === 'active'
                            ? `linear-gradient(135deg,${m.accentColor},${m.accentColor}cc)`
                            : 'rgba(16,185,129,0.1)',
                          border: state === 'active'
                            ? 'none'
                            : '1px solid rgba(16,185,129,0.3)',
                          borderRadius: 10,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          color: state === 'active' ? '#fff' : '#10b981',
                          fontSize: state === 'active' ? 14 : 11,
                          fontWeight: 900,
                          letterSpacing: state === 'active' ? 3 : 1,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: state === 'active' ? `0 0 30px ${m.accentColor}50, 0 4px 20px rgba(0,0,0,0.5)` : 'none',
                          fontFamily: 'inherit',
                          textTransform: 'uppercase',
                          animation: state === 'active' ? 'activePulse 2s ease-in-out infinite' : 'none',
                        }}
                      >
                        {state === 'active' ? <><Zap size={16} />START MISSION</> : <><CheckCircle size={12} />COMPLETED</>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Round separator (between rounds) */}
              {[3, 6].includes(m.order) && i < MISSIONS.length - 1 && (
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '100%', marginTop: 10, zIndex: 20 }}>
                  <div style={{ background: 'rgba(5,2,18,0.95)', border: `1px solid rgba(${ROUND_COLORS[m.round + 1]?.rgb ?? '109,40,217'},0.45)`, borderRadius: 8, padding: '4px 14px', color: ROUND_COLORS[m.round + 1]?.primary ?? '#a78bfa', fontSize: 9, fontWeight: 700, letterSpacing: 3, whiteSpace: 'nowrap' }}>
                    ↓ {ROUND_COLORS[m.round + 1]?.label}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Final complete node */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2, marginTop: 20 }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,2,18,0.97))', border: '2px solid rgba(16,185,129,0.45)', borderRadius: 16, padding: '20px 40px', textAlign: 'center', boxShadow: '0 0 40px rgba(16,185,129,0.15)' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
            <div style={{ color: '#6ee7b7', fontSize: 14, fontWeight: 900, letterSpacing: 4, marginBottom: 4 }}>OPERATION TERMINATED</div>
            <div style={{ color: '#4b5563', fontSize: 11, letterSpacing: 2 }}>Coimbatore is safe. Good luck.</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dopulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes activePulse { 0%,100%{box-shadow: 0 0 30px currentColor; transform: scale(1)} 50%{box-shadow: 0 0 50px currentColor; transform: scale(1.02)} }
      `}</style>
    </div>
  );
}
