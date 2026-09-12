'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Shield, Flag, Lock, CheckCircle, Zap, ArrowLeft, Trophy, Crosshair, Skull, Film,
} from 'lucide-react';
import { api } from '@/lib/api';
import HalfCircleMenu from '@/components/ui/HalfCircleMenu';
import FocusScreenAdvisory, { FocusScreenButton } from '@/components/ui/FocusScreenAdvisory';

gsap.registerPlugin(ScrollTrigger);

const MISSIONS = [
  { order: 1, round: 1, level: '1.1', name: 'The Intercepted Transmission', type: 'CRYPTOGRAPHY', difficulty: 'medium', points: 100, character: 'Veera Raghavan', characterImage: '/images/characters/veera_determined.png', bgImage: '/images/background/1.jpg', act: 'ROUND 1 — THE BREACH', accentColor: '#ef4444', accentRgb: '239,68,68', description: 'East Coast Mall is seized. Veera reaches basement telecom relay ER-42 and taps encrypted shortwave comms to identify patrol routes.' },
  { order: 2, round: 1, level: '1.2', name: 'The Fragmented Server Map', type: 'FORENSICS', difficulty: 'medium', points: 150, character: 'Preethi', characterImage: '/images/characters/preethi_worried.png', bgImage: '/images/background/2.jpg', act: 'ROUND 1 — THE BREACH', accentColor: '#ef4444', accentRgb: '239,68,68', description: 'Three encrypted file fragments hold the security door access codes for Server Room ER-42. Octal, Atbash, and inverted hex — assemble them before patrols return.' },
  { order: 3, round: 1, level: '1.3', name: 'The Time-Locked Vault', type: 'MATH/HASH', difficulty: 'hard', points: 200, character: 'NSA Althaf', characterImage: '/images/characters/althaf_commanding.png', bgImage: '/images/background/3.jpg', act: 'ROUND 1 — THE BREACH', accentColor: '#ef4444', accentRgb: '239,68,68', description: 'A unique biometric vault uses your team\'s registration profile. Umar Saif\'s complete mall infiltration blueprint and C4 deployment map are locked inside.' },
  { order: 4, round: 2, level: '2.1', name: 'The Corrupted Hash Trail', type: 'HASH CRACKING', difficulty: 'medium', points: 250, character: 'Veera Raghavan', characterImage: '/images/characters/veera_intense.png', bgImage: '/images/background/4.jpg', act: 'ROUND 2 — INFILTRATION', accentColor: '#dc2626', accentRgb: '220,38,38', description: 'Three password-protected databases hold evidence of the terror network. MD5, SHA-1, SHA-256 — crack all three to uncover the Home Minister\'s collusion.' },
  { order: 5, round: 2, level: '2.2', name: 'The JWT Inception', type: 'WEB/TOKEN', difficulty: 'medium', points: 300, character: 'Preethi', characterImage: '/images/characters/preethi_hopeful.png', bgImage: '/images/background/5.jpg', act: 'ROUND 2 — INFILTRATION', accentColor: '#dc2626', accentRgb: '220,38,38', description: 'A hex-encoded JWT token guards the live admin feed. Decode this token to prove Home Minister Veera Santhanam staged his family\'s kidnapping.' },
  { order: 6, round: 2, level: '2.3', name: 'The Pattern Lock', type: 'CRYPTOGRAPHY', difficulty: 'hard', points: 350, character: 'NSA Althaf', characterImage: '/images/characters/althaf_concerned.png', bgImage: '/images/background/6.jpg', act: 'ROUND 2 — INFILTRATION', accentColor: '#dc2626', accentRgb: '220,38,38', description: 'Override the communication relay so Veera can hijack the negotiation frequency and delay Farooq\'s border convoy. A SHA-256 challenge unique to your team.' },
  { order: 7, round: 3, level: '3.1', name: 'The Payload Hunt', type: 'REVERSE ENG', difficulty: 'medium', points: 400, character: 'Veera Raghavan', characterImage: '/images/characters/veera_concerned.png', bgImage: '/images/background/7.jpg', act: 'ROUND 3 — FINAL STRIKE', accentColor: '#b91c1c', accentRgb: '185,28,28', description: 'Saif\'s demolition payload is split across four encoding methods. Decode binary, hex, base64, and rot13 fragments to map the trigger mechanism.' },
  { order: 8, round: 3, level: '3.2', name: 'The Logic Bomb Defusal', type: 'NESTED DECODE', difficulty: 'hard', points: 450, character: 'Preethi', characterImage: '/images/characters/preethi_worried.png', bgImage: '/images/background/8.jpg', act: 'ROUND 3 — FINAL STRIKE', accentColor: '#b91c1c', accentRgb: '185,28,28', description: 'Saif has armed a fail-deadly explosive trigger on a 10-minute timer. Strip the nested encoding layers to defuse the logic bomb and evacuate all 1,200 hostages.' },
  { order: 9, round: 3, level: '3.3', name: 'The Master Vault', type: 'FINAL BOSS', difficulty: 'hard', points: 1000, character: 'Veera Raghavan', characterImage: '/images/characters/veera_relieved.png', bgImage: '/images/background/9.jpg', act: 'ROUND 3 — FINAL STRIKE', accentColor: '#b91c1c', accentRgb: '185,28,28', description: 'Fighter jet dogfight across hostile borders. Every technique you have learned converges here. Crack Farooq\'s Master Vault and terminate his global terror network.' },
];

const ROUND_COLORS: Record<number, { primary: string; rgb: string; label: string }> = {
  1: { primary: '#ef4444', rgb: '239,68,68', label: 'ROUND 1 — THE BREACH' },
  2: { primary: '#dc2626', rgb: '220,38,38', label: 'ROUND 2 — INFILTRATION' },
  3: { primary: '#991b1b', rgb: '153,27,27', label: 'ROUND 3 — FINAL STRIKE' },
};

const DIFF_COLORS: Record<string, string> = { easy: '#22c55e', medium: '#ef4444', hard: '#dc2626' };

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
            lineRef.current.style.filter = `drop-shadow(0 0 ${progress * 20}px rgba(220,38,38,0.7))`;
          }
        },
      });

      // Animate each mission card with advanced effects
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const isRight = i % 2 === 1;
        
        gsap.from(card, {
          x: isRight ? 160 : -160,
          y: 40,
          opacity: 0,
          scale: 0.88,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 40%',
            toggleActions: 'play none none reverse',
          },
        });
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const getState = (order: number) => {
    if (order < currentLevel) return 'solved';
    if (order === currentLevel) return 'active';
    return 'locked';
  };

  return (
    <div ref={containerRef} style={{ minHeight: '100vh', background: '#050508', overflow: 'auto', position: 'relative', color: '#f1f5f9' }}>
      <HalfCircleMenu />
      <FocusScreenAdvisory />
      {/* Blood textures */}
      <div className="blood-splatter-bg" />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.15) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(138,3,3,0.15) 0%, transparent 50%)' }} />

      {/* Top nav */}
      <div data-tl="header" style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', padding: '10px 28px', borderBottom: '1px solid rgba(220,38,38,0.3)', background: 'rgba(10,4,6,0.95)', backdropFilter: 'blur(24px)', gap: 12 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: 2, textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6, fontFamily: 'monospace' }}>
          <ArrowLeft size={12} className="text-red-500" />HQ
        </Link>
        <Link href="/challenges" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: 2, textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6, fontFamily: 'monospace' }}>
          <Crosshair size={12} className="text-red-500" />MISSIONS
        </Link>
        <Link href="/story" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: 2, textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6, fontFamily: 'monospace' }}>
          <Film size={12} className="text-red-500" />STORY
        </Link>
        <Link href="/leaderboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: 2, textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6, fontFamily: 'monospace' }}>
          <Trophy size={12} className="text-red-500" />RANKS
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,#7f1d1d,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={13} color="#fff" />
          </div>
          <span style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 900, letterSpacing: 2 }}>THE EXTRACTION</span>
          <span style={{ color: '#ef4444', fontSize: 11, letterSpacing: 2, fontFamily: 'monospace' }}>/ MISSION TIMELINE</span>
        </div>
        <FocusScreenButton />
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 6, padding: '5px 12px' }}>
          <Trophy size={13} color="#ef4444" />
          <span style={{ color: '#fee2e2', fontWeight: 900, fontSize: 16, fontFamily: 'monospace' }}>{teamPoints.toLocaleString()}</span>
          <span style={{ color: '#ef4444', fontSize: 10, fontWeight: 700, letterSpacing: 2, fontFamily: 'monospace' }}>PTS</span>
        </div>
        {teamName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="status-dot active" />
            <span style={{ color: '#fee2e2', fontSize: 11, letterSpacing: 1, fontFamily: 'monospace' }}>{teamName}</span>
          </div>
        )}
      </div>

      {/* Page header */}
      <div data-tl="header" style={{ textAlign: 'center', padding: '50px 24px 24px', position: 'relative', zIndex: 5 }}>
        <h1 className="blood-crimson-title" style={{ margin: 0, fontSize: 44, fontWeight: 900, letterSpacing: 6, textTransform: 'uppercase' }}>
          TACTICAL TIMELINE
        </h1>
        <div style={{ height: 3, width: 120, background: 'linear-gradient(90deg,transparent,#dc2626,#ef4444,transparent)', margin: '16px auto 0', borderRadius: 3, boxShadow: '0 0 20px rgba(220,38,38,0.6)' }} />
        <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 16, letterSpacing: 3, fontWeight: 600, fontFamily: 'monospace' }}>
          9 MISSIONS • 3 SECURITY SECTORS • CHENNAI RECON
        </p>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', maxWidth: 940, margin: '0 auto', padding: '20px 24px 80px', zIndex: 5 }}>
        {/* Center vertical line */}
        <div
          data-tl="line"
          ref={lineRef}
          style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            top: 0, bottom: 0, width: 2,
            background: 'linear-gradient(180deg,rgba(220,38,38,0) 0%,rgba(220,38,38,0.8) 20%,rgba(239,68,68,0.9) 60%,rgba(220,38,38,0.2) 100%)',
            zIndex: 1,
            boxShadow: '0 0 20px rgba(220,38,38,0.6)',
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
              style={{ display: 'flex', justifyContent: isRight ? 'flex-end' : 'flex-start', marginBottom: state === 'active' ? 44 : 32, position: 'relative', zIndex: state === 'active' ? 5 : 2 }}
            >
              {/* Center dot */}
              <div
                data-dot
                style={{
                  position: 'absolute', left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 20, height: 20, borderRadius: '50%',
                  background: state === 'solved'
                    ? 'radial-gradient(circle, #10b981 0%, #064e3b 100%)'
                    : state === 'active'
                    ? 'radial-gradient(circle, #ef4444 0%, #7f1d1d 100%)'
                    : 'radial-gradient(circle, #374151 0%, #111827 100%)',
                  border: `2px solid ${state === 'solved' ? '#34d399' : state === 'active' ? '#f87171' : '#1f0d12'}`,
                  boxShadow: state === 'active'
                    ? '0 0 25px rgba(239,68,68,1), 0 0 50px rgba(220,38,38,0.6)'
                    : state === 'solved'
                    ? '0 0 20px rgba(16,185,129,0.8)'
                    : 'none',
                  zIndex: 10, transition: 'all 0.3s ease',
                }}
              />

              {/* Connector line from card to center */}
              <div data-connector style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                [isRight ? 'right' : 'left']: '50%',
                width: 'calc(8% - 2px)', height: 2,
                background: `linear-gradient(${isRight ? '90deg' : '-90deg'},transparent,rgba(${rc.rgb}, 0.7))`,
                zIndex: 1,
              }} />

              {/* Card */}
              <div
                onClick={() => state !== 'locked' && router.push(`/challenges?level=${m.order}`)}
                className={`tactical-box corner-brackets ${
                  state === 'active'
                    ? 'border-red-500 shadow-[0_0_40px_rgba(220,38,38,0.35)]'
                    : state === 'solved'
                    ? 'border-emerald-700/60 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                    : 'border-red-950/40 opacity-40'
                }`}
                style={{
                  width: '42%',
                  borderRadius: 10,
                  overflow: 'hidden',
                  cursor: state !== 'locked' ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}
              >
                {/* Accent top bar */}
                <div style={{ height: 3, background: `linear-gradient(90deg,transparent,${m.accentColor},transparent)`, boxShadow: `0 0 15px ${m.accentColor}` }} />

                {/* Background image preview */}
                <div style={{ position: 'relative' }}>
                  <div style={{ height: 110, position: 'relative', overflow: 'hidden' }}>
                    <Image src={m.bgImage} alt={m.name} fill style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.22, filter: 'saturate(0.5)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(10,4,6,0.3) 0%,rgba(10,4,6,0.9) 100%)' }} />
                    {/* Character */}
                    <div style={{ position: 'absolute', bottom: 0, [isRight ? 'left' : 'right']: 12, height: 105, width: 65, overflow: 'hidden' }}>
                      <Image src={m.characterImage} alt={m.character} fill style={{ objectFit: 'cover', objectPosition: 'top center', filter: state === 'locked' ? 'grayscale(1) brightness(0.3)' : 'none' }} />
                    </div>
                    {/* Status badge */}
                    <div style={{ position: 'absolute', top: 10, [isRight ? 'right' : 'left']: 10, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(10,4,6,0.9)', border: `1px solid ${state === 'solved' ? 'rgba(16,185,129,0.5)' : state === 'active' ? 'rgba(239,68,68,0.6)' : 'rgba(220,38,38,0.2)'}`, borderRadius: 4, padding: '3px 8px' }}>
                      {state === 'solved' ? <CheckCircle size={11} color="#10b981" /> : state === 'active' ? <Zap size={11} color="#ef4444" /> : <Lock size={11} color="#6b7280" />}
                      <span style={{ fontSize: 9, fontWeight: 800, color: state === 'solved' ? '#10b981' : state === 'active' ? '#ef4444' : '#6b7280', letterSpacing: 1, fontFamily: 'monospace' }}>{state.toUpperCase()}</span>
                    </div>
                  </div>

                  <div style={{ padding: '14px 16px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, color: m.accentColor, background: `rgba(${m.accentRgb},0.15)`, border: `1px solid rgba(${m.accentRgb},0.35)`, borderRadius: 3, padding: '2px 6px', fontFamily: 'monospace' }}>{m.act}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: DIFF_COLORS[m.difficulty], letterSpacing: 1, fontFamily: 'monospace' }}>{m.difficulty.toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                      <div>
                        <div style={{ color: '#ef4444', fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 2, fontFamily: 'monospace' }}>TARGET {m.level}</div>
                        <div style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 800, lineHeight: 1.25, letterSpacing: '0.5px' }}>{m.name}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ color: '#ef4444', fontSize: 16, fontWeight: 900, fontFamily: 'monospace' }}>{m.points}</div>
                        <div style={{ color: '#991b1b', fontSize: 8, letterSpacing: 2, fontFamily: 'monospace' }}>PTS</div>
                      </div>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{m.description}</p>

                    {state !== 'locked' && (
                      <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                        <div
                          onClick={e => { e.stopPropagation(); router.push(`/challenges?level=${m.order}`); }}
                          style={{
                            flex: 1,
                            padding: state === 'active' ? '10px 16px' : '8px 12px',
                            background: state === 'active'
                              ? 'linear-gradient(135deg,#7f1d1d,#dc2626)'
                              : 'rgba(16,185,129,0.1)',
                            border: state === 'active'
                              ? '1px solid rgba(248,113,113,0.6)'
                              : '1px solid rgba(16,185,129,0.35)',
                            borderRadius: 6,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            color: '#fff',
                            fontSize: state === 'active' ? 12 : 10,
                            fontWeight: 800,
                            letterSpacing: 2,
                            cursor: 'pointer',
                            fontFamily: 'monospace',
                            textTransform: 'uppercase',
                          }}
                        >
                          {state === 'active' ? <><Zap size={13} />ENGAGE TARGET</> : <><CheckCircle size={11} color="#10b981" /><span style={{ color: '#10b981' }}>SOLVED</span></>}
                        </div>

                        {state === 'solved' && (
                          <div
                            onClick={e => { e.stopPropagation(); router.push(`/story?challenge=${m.order}`); }}
                            title="Replay mission debrief and character dialogues"
                            style={{
                              padding: '8px 12px',
                              background: 'rgba(239,68,68,0.12)',
                              border: '1px solid rgba(239,68,68,0.35)',
                              borderRadius: 6,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                              color: '#fca5a5',
                              fontSize: 10,
                              fontWeight: 800,
                              letterSpacing: 1.5,
                              cursor: 'pointer',
                              fontFamily: 'monospace',
                              textTransform: 'uppercase',
                              transition: 'all 0.2s',
                            }}
                          >
                            <Film size={11} color="#ef4444" />
                            <span>DEBRIEF</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Final complete node */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2, marginTop: 24 }}>
          <div className="tactical-box p-5 rounded-md text-center max-w-sm">
            <Skull className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div style={{ color: '#ef4444', fontSize: 13, fontWeight: 900, letterSpacing: 3, marginBottom: 2, fontFamily: 'monospace' }}>OPERATION THE EXTRACTION</div>
            <div style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}>HOSTAGE RESCUE PROTOCOL COMPLETE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
