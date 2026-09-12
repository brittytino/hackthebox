'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { gsap } from 'gsap';
import {
  Volume2, VolumeX, Radio, Activity, Shield, Terminal
} from 'lucide-react';

interface CharacterScene {
  act: string;
  badge: string;
  charName: string;
  charTitle: string;
  image: string;
  quote: string;
  accent: string;
  status: string;
  telemetry: string;
  sfx: 'umar' | 'althaf' | 'preethi' | 'veera';
}

const SCENES: CharacterScene[] = [
  {
    act: 'ACT I // THE SIEGE',
    badge: 'AL-ZULFIQAR COMMANDER',
    charName: 'UMAR SAIF',
    charTitle: 'TERRORIST COMMANDER // EAST COAST MALL SECTOR',
    image: '/images/characters/umar_threatening.png',
    quote: '"East Coast Mall is under my control. 1,200 hostages will die unless Umar Farooq is released!"',
    accent: '#dc2626',
    status: 'HOSTILE SIEGE // DETONATOR ARMED',
    telemetry: 'HOSTAGES: 1,200 // THREAT LEVEL: MAXIMUM // FREQ: 433.92 MHz',
    sfx: 'umar',
  },
  {
    act: 'ACT II // THE CRISIS DISPATCH',
    badge: 'RAW CHIEF NEGOTIATOR',
    charName: 'NSA ALTHAF',
    charTitle: 'RAW HIGH COMMAND // CHENNAI SATELLITE OPERATIONS',
    image: '/images/characters/althaf_commanding.png',
    quote: '"The government is paralyzed. Veera, you are our sole operative inside. Break through node ER-42."',
    accent: '#f59e0b',
    status: 'ORBITAL SATELLITE LOCK // DEFCON-1',
    telemetry: 'TARGET: 12.9827° N, 80.2584° E // SERVER RELAY ER-42',
    sfx: 'althaf',
  },
  {
    act: 'ACT III // THE CIPHER BREACH',
    badge: 'CYBER LIAISON SPECIALIST',
    charName: 'PREETHI',
    charTitle: 'RAW CYBER INTELLIGENCE // FIREWALL INFILTRATION',
    image: '/images/characters/preethi_hopeful.png',
    quote: '"Bypassing Saif\'s AES-256 firewall! Infiltration frequency open... Veera, your route is mapped!"',
    accent: '#10b981',
    status: 'FREQUENCY UPLINK ESTABLISHED',
    telemetry: 'RELAY ER-42 TELEMETRY: AIR-GAP SHATTERED // 100% STREAM',
    sfx: 'preethi',
  },
  {
    act: 'ACT IV // THE MASS HERO ARRIVAL',
    badge: 'EX-RAW AGENT // CODENAME: BEAST',
    charName: 'VEERA RAGHAVAN',
    charTitle: 'CHIEF FIELD OPERATIVE // THE UNSANCTIONED ASSET',
    image: '/images/characters/veera_determined.png',
    quote: '"Infiltration confirmed. Nobody touches the hostages. Umar Saif, your time is up."',
    accent: '#ef4444',
    status: 'LETHAL AUTHORIZATION GRANTED',
    telemetry: 'HEART RATE: 140 BPM // WEAPON: READY // CLEARANCE: ALPHA',
    sfx: 'veera',
  },
];

export default function RootPage() {
  const router = useRouter();

  // State
  const [hasStarted, setHasStarted] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [phaseLog, setPhaseLog] = useState('STANDBY // SECURE LINK ACTIVE');
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Procedural Web Audio Synthesizer
  const playSfx = useCallback((type: 'umar' | 'althaf' | 'preethi' | 'veera' | 'impact' | 'boom' | 'click' | 'welcome' | 'laser') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(820, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'impact') {
        // Short, heavy cinematic impact (only when needed)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.7);
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
      } else if (type === 'boom') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(24, now + 1.6);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.6);
      } else if (type === 'umar') {
        // Menacing low alarm klaxon
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.linearRampToValueAtTime(360, now + 0.5);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
      } else if (type === 'althaf') {
        // High-tech satellite chirp sequence
        [1200, 1500, 1850].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + i * 0.12;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.1);
        });
      } else if (type === 'preethi') {
        // Electronic cyber arpeggio
        [1000, 1400, 1900, 2400].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + i * 0.07;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.06);
        });
      } else if (type === 'veera') {
        // Mass Hero Beast Entry chord
        [55, 110, 165, 220].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 1.8);
          gain.gain.setValueAtTime(0.24, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 1.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.8);
        });
      } else if (type === 'laser') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2200, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'welcome') {
        // Grand orchestral chord for the welcome reveal
        [130.81, 164.81, 196.00, 261.63, 329.63].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.22, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 2.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 2.8);
        });
      }
    } catch {
      // Audio safety
    }
  }, [soundEnabled]);

  // Navigate to login
  const navigateToLogin = useCallback(() => {
    if (masterTimelineRef.current) masterTimelineRef.current.kill();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    router.push('/login');
  }, [router]);

  // Mouse Parallax for Resting Title
  useEffect(() => {
    if (hasStarted) return;
    const onMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      setMouseTilt({ x: dx, y: dy });

      if (heroRef.current) {
        gsap.to(heroRef.current, {
          rotationY: dx * 10,
          rotationX: -dy * 10,
          transformPerspective: 1000,
          duration: 0.5,
          ease: 'power2.out',
        });
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [hasStarted]);

  // Canvas particle starfield & speed lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const numStars = 140;
    interface Star {
      x: number;
      y: number;
      z: number;
      pz: number;
      color: string;
    }
    const stars: Star[] = Array.from({ length: numStars }, () => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * width,
      pz: width,
      color: Math.random() > 0.4 ? '#ef4444' : '#ffffff',
    }));

    let warpSpeed = 1.0;

    const render = () => {
      ctx.fillStyle = 'rgba(3, 1, 4, 0.4)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.z -= warpSpeed;

        if (s.z <= 0) {
          s.z = width;
          s.x = (Math.random() - 0.5) * width * 2;
          s.y = (Math.random() - 0.5) * height * 2;
          s.pz = s.z;
        }

        const k = 260 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;

        const pk = 260 / s.pz;
        const prevPx = s.x * pk + cx;
        const prevPy = s.y * pk + cy;
        s.pz = s.z;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = Math.min(1, Math.max(0.15, (1 - s.z / width) * 1.5));
          ctx.strokeStyle = s.color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = warpSpeed > 10 ? 2 : 1;

          ctx.beginPath();
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1.0;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    (canvas as unknown as { setWarpSpeed: (s: number) => void }).setWarpSpeed = (s: number) => {
      warpSpeed = s;
    };

    return () => {
      window.removeEventListener('resize', onResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // START 30-SECOND ULTIMATE CINEMATIC INTRO
  const startCinematicSequence = () => {
    if (hasStarted) return;
    setHasStarted(true);
    playSfx('click');
    playSfx('impact');

    const canvas = canvasRef.current as unknown as { setWarpSpeed?: (s: number) => void };

    // GSAP 30-Second Master Timeline
    const tl = gsap.timeline({
      onComplete: () => {
        navigateToLogin();
      },
    });
    masterTimelineRef.current = tl;

    // Fade out resting title
    tl.to('.clean-hero-block', {
      opacity: 0,
      scale: 0.94,
      duration: 0.6,
      ease: 'power3.in',
    }, 0);

    // Fade in cinema stage
    tl.to('.cinematic-theatre', {
      opacity: 1,
      pointerEvents: 'auto',
      duration: 0.5,
    }, 0.3);

    // ==============================================================
    // ACT 1 (0.0s – 6.0s): UMAR SAIF — THE HOSTILE SIEGE
    // ==============================================================
    tl.call(() => {
      setCurrentSceneIndex(0);
      setPhaseLog('ACT 1 // HOSTILE SIEGE — UMAR SAIF CONTROLS EAST COAST MALL');
      playSfx('umar');
      if (canvas?.setWarpSpeed) canvas.setWarpSpeed(2);
    }, undefined, 0.4);

    // Controlled single impact shake (only once when bomb armed)
    tl.to(containerRef.current, {
      x: 'random(-8, 8)',
      y: 'random(-6, 6)',
      repeat: 4,
      duration: 0.06,
      ease: 'none',
      yoyo: true,
    }, 0.5);

    tl.fromTo('.theatre-single-view',
      { opacity: 0, scale: 0.95, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      0.5
    );

    // ==============================================================
    // ACT 2 (6.0s – 12.0s): NSA ALTHAF — THE CRISIS DISPATCH
    // ==============================================================
    tl.to('.theatre-single-view', { opacity: 0, x: -25, duration: 0.45 }, 5.6);

    tl.call(() => {
      setCurrentSceneIndex(1);
      setPhaseLog('ACT 2 // RAW COMMAND — CHENNAI SATELLITE DISPATCH');
      playSfx('althaf');
      if (canvas?.setWarpSpeed) canvas.setWarpSpeed(6);
    }, undefined, 6.1);

    tl.fromTo('.theatre-single-view',
      { opacity: 0, scale: 0.96, x: 25 },
      { opacity: 1, scale: 1, x: 0, duration: 0.8, ease: 'power3.out' },
      6.2
    );

    // ==============================================================
    // ACT 3 (12.0s – 18.0s): PREETHI — THE CIPHER BREACH
    // ==============================================================
    tl.to('.theatre-single-view', { opacity: 0, scale: 1.04, duration: 0.45 }, 11.6);

    tl.call(() => {
      setCurrentSceneIndex(2);
      setPhaseLog('ACT 3 // CYBER LIAISON PREETHI — INFILTRATING NODE ER-42');
      playSfx('preethi');
      if (canvas?.setWarpSpeed) canvas.setWarpSpeed(12);
    }, undefined, 12.1);

    tl.fromTo('.theatre-single-view',
      { opacity: 0, scale: 0.96, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      12.2
    );

    // ==============================================================
    // ACT 4 (18.0s – 24.0s): VEERA RAGHAVAN // MASS HERO ARRIVAL
    // ==============================================================
    tl.to('.theatre-single-view', { opacity: 0, scale: 1.08, duration: 0.45 }, 17.6);

    tl.call(() => {
      setCurrentSceneIndex(3);
      setPhaseLog('ACT 4 // MASS HERO ENTRY — VEERA RAGHAVAN // CODENAME: BEAST');
      playSfx('impact');
      playSfx('veera');
      if (canvas?.setWarpSpeed) canvas.setWarpSpeed(18);
    }, undefined, 18.1);

    // Single punchy impact shake for Beast entry
    tl.to(containerRef.current, {
      x: 'random(-10, 10)',
      y: 'random(-8, 8)',
      repeat: 5,
      duration: 0.06,
      ease: 'none',
      yoyo: true,
    }, 18.2);

    tl.fromTo('.theatre-single-view',
      { opacity: 0, scale: 1.08 },
      { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' },
      18.2
    );

    // Laser eye scan effect
    tl.call(() => {
      playSfx('laser');
    }, undefined, 19.8);

    // ==============================================================
    // ACT 5 (24.0s – 28.5s): GRAND MASS OPENING & WELCOME BANNER
    // ==============================================================
    tl.to('.theatre-single-view', { opacity: 0, scale: 0.9, duration: 0.45 }, 23.6);

    tl.call(() => {
      setPhaseLog('GRAND OPENING // WELCOME TO OPERATION: THE EXTRACTION');
      playSfx('welcome');
      playSfx('boom');
      if (canvas?.setWarpSpeed) canvas.setWarpSpeed(28);
    }, undefined, 24.1);

    tl.to('.theatre-welcome-montage', { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }, 24.1);

    tl.fromTo('.welcome-big-title',
      { opacity: 0, scale: 0.88, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power3.out' },
      24.3
    );

    tl.fromTo('.welcome-message-banner',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 1.0, ease: 'back.out(1.2)' },
      25.0
    );

    // ==============================================================
    // ACT 6 (28.5s – 30.0s): WHITE-HOT FLASH & PORTAL DROP
    // ==============================================================
    tl.call(() => {
      setPhaseLog('ACCESS GRANTED // DROPPING INTO MISSION CONSOLE');
      playSfx('boom');
    }, undefined, 28.6);

    tl.to('.white-hot-flash', {
      opacity: 1,
      duration: 0.85,
      ease: 'power4.in',
    }, 28.8);

    tl.to(containerRef.current, {
      opacity: 0,
      duration: 0.35,
      delay: 0.7,
    }, 29.4);
  };

  const currentScene = SCENES[currentSceneIndex];

  return (
    <div ref={containerRef} className="mass-root">
      {/* Background Particle Canvas */}
      <canvas ref={canvasRef} className="mass-canvas" />

      {/* Atmospheric Vignette & CRT Scanlines */}
      <div className="mass-vignette" />
      <div className="mass-scanlines" />

      {/* MINIMAL TOPBAR (NO INTRO SECONDS MENTIONED, NO SKIP BUTTON) */}
      <header className="mass-topbar">
        <div className="mass-brand">
          <span className="beacon-dot" />
          <span className="brand-logo-text">OPERATION // THE EXTRACTION</span>
        </div>

        <div className="mass-topbar-controls">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSoundEnabled(!soundEnabled);
            }}
            className="mass-audio-btn"
            title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
          >
            {soundEnabled ? <Volume2 size={15} color="#ef4444" /> : <VolumeX size={15} color="#94a3b8" />}
            <span className="hide-mob">{soundEnabled ? 'AUDIO ON' : 'MUTED'}</span>
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT - CLICK ANYWHERE TO START 30-SEC CINEMATIC INTRO */}
      <main
        className={`mass-main ${!hasStarted ? 'cursor-pointer' : ''}`}
        onClick={!hasStarted ? startCinematicSequence : undefined}
      >

        {/* 1. ULTRA-MINIMAL RESTING HERO (TEXT ALONE IN A SINGLE LINE + CLICK PROMPT) */}
        {!hasStarted && (
          <div ref={heroRef} className="clean-hero-block">
            {/* Single Line Pure Grand Title */}
            <div className="clean-title-wrap">
              <h1 className="clean-title-main">THE EXTRACTION</h1>
              <h1 className="clean-title-aura" aria-hidden="true">THE EXTRACTION</h1>
            </div>

            {/* Click Anywhere Prompt */}
            <div className="click-screen-cue">
              <span className="cue-bracket">[</span>
              <span>CLICK ANYWHERE TO COMMENCE</span>
              <span className="cue-bracket">]</span>
            </div>
          </div>
        )}

        {/* 2. THE 30-SECOND CINEMATIC THEATRE */}
        <div className={`cinematic-theatre ${hasStarted ? 'active' : ''}`}>

          {/* SINGLE CHARACTER FOCUSED VIEW (Acts 1 to 4) */}
          <div className="theatre-single-view">
            
            {/* Crisp Character Frame with Corner Accents (No contrast distortion, natural crisp rendering) */}
            <div
              className="char-hero-frame"
              style={{
                borderColor: currentScene.accent,
                boxShadow: `0 0 45px ${currentScene.accent}55`,
              }}
            >
              <div className="corner-bracket c-tl" style={{ borderColor: currentScene.accent }} />
              <div className="corner-bracket c-tr" style={{ borderColor: currentScene.accent }} />
              <div className="corner-bracket c-bl" style={{ borderColor: currentScene.accent }} />
              <div className="corner-bracket c-br" style={{ borderColor: currentScene.accent }} />

              {/* Laser Scanning Line */}
              <div
                className="laser-scanner"
                style={{ background: `linear-gradient(180deg, transparent, ${currentScene.accent}, transparent)` }}
              />

              {/* Character Portrait Image (Single clean image, crisp natural resolution) */}
              <div className="char-portrait-wrap">
                <Image
                  src={currentScene.image}
                  alt={currentScene.charName}
                  fill
                  priority
                  sizes="(max-width: 768px) 240px, 340px"
                  style={{ objectFit: 'cover', objectPosition: 'center 15%' }}
                />
              </div>

              {/* Live Tactical Codename Badge */}
              <div className="hero-mass-stamp" style={{ background: currentScene.accent }}>
                <span className="stamp-dot" />
                <span>{currentScene.badge}</span>
              </div>
            </div>

            {/* Tactical Dialogue Card */}
            <div className="char-dossier-card" style={{ borderLeftColor: currentScene.accent }}>
              
              <div className="dossier-header-row">
                <div className="act-badge-pill" style={{ borderColor: currentScene.accent, color: currentScene.accent }}>
                  <Activity size={12} />
                  <span>{currentScene.act}</span>
                </div>
                <div className="status-badge-pill" style={{ background: `${currentScene.accent}20`, color: currentScene.accent }}>
                  {currentScene.status}
                </div>
              </div>

              <h2 className="char-main-name">{currentScene.charName}</h2>
              <div className="char-subtitle">{currentScene.charTitle}</div>

              {/* Waveform Bar Graphic */}
              <div className="waveform-display">
                {Array.from({ length: 32 }).map((_, i) => (
                  <span
                    key={i}
                    className="wave-bar"
                    style={{
                      background: currentScene.accent,
                      animationDelay: `${(i % 8) * 0.08}s`,
                    }}
                  />
                ))}
              </div>

              {/* Character Dialogue */}
              <p className="char-quote-text">{currentScene.quote}</p>

              {/* Telemetry info line */}
              <div className="telemetry-bar">
                <Radio size={12} color={currentScene.accent} />
                <span>{currentScene.telemetry}</span>
              </div>
            </div>

          </div>

          {/* ACT 5: GRAND MASS OPENING & WELCOME BANNER (24s – 28.5s) */}
          <div className="theatre-welcome-montage">
            
            {/* 4-Character Tribute Row */}
            <div className="tribute-row">
              {SCENES.map((scene) => (
                <div key={scene.charName} className="tribute-card" style={{ borderColor: scene.accent }}>
                  <div className="tribute-img-box">
                    <Image
                      src={scene.image}
                      alt={scene.charName}
                      fill
                      sizes="180px"
                      style={{ objectFit: 'cover', objectPosition: 'center 15%' }}
                    />
                  </div>
                  <div className="tribute-overlay">
                    <span className="tribute-codename" style={{ color: scene.accent }}>{scene.charName}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Grand Mass Welcome Card */}
            <div className="welcome-banner-center">
              <div className="welcome-tagline">
                <span className="w-line" />
                <span>OFFICIAL CTF CYBER WARFARE OPERATIONS</span>
                <span className="w-line" />
              </div>

              <h1 className="welcome-big-title">THE EXTRACTION</h1>

              <div className="welcome-message-banner">
                <div className="w-icon-wrap">
                  <Shield size={22} color="#fbbf24" />
                </div>
                <div className="w-text-block">
                  <h3 className="w-head">WELCOMES YOU ALL TO THIS STORY</h3>
                  <p className="w-sub">1,200 HOSTAGES • 9 CLASSIFIED MISSIONS • ONE MASS EXTRACTION</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* BOTTOM STATUS LOG (NO SECONDS, NO TIMELINE NUMBERS) */}
      <footer className="mass-footer">
        <div className="footer-status-box">
          <span className="pulsing-led" />
          <span className="footer-log">{phaseLog}</span>
        </div>

        <div className="footer-location hide-mob">
          <span>CHENNAI // EAST COAST MALL // BASEMENT RELAY ER-42</span>
        </div>
      </footer>

      {/* WHITE-HOT BLINDING FLASH COLLAPSE */}
      <div className="white-hot-flash" aria-hidden="true" />

      {/* STYLES */}
      <style jsx>{`
        .mass-root {
          position: fixed;
          inset: 0;
          height: 100vh;
          height: 100dvh;
          width: 100vw;
          background: #030104;
          overflow: hidden;
          font-family: var(--font-inter), system-ui, sans-serif;
          color: #f1f5f9;
          display: flex;
          flex-direction: column;
          user-select: none;
          z-index: 100;
        }

        .mass-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .mass-vignette {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background: radial-gradient(circle at center, transparent 38%, rgba(0,0,0,0.85) 90%),
                      radial-gradient(circle at center, rgba(220,38,38,0.06) 0%, transparent 60%);
        }

        .mass-scanlines {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background: repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 3px);
          opacity: 0.65;
        }

        /* Topbar (Clean, no seconds mention, no skip button) */
        .mass-topbar {
          position: relative;
          z-index: 20;
          height: 52px;
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(16px, 3vw, 32px);
          border-bottom: 1px solid rgba(220,38,38,0.2);
          background: rgba(5, 2, 4, 0.92);
          backdrop-filter: blur(16px);
        }

        .mass-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          font-family: var(--font-share-tech-mono), monospace;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #f87171;
        }

        .beacon-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 10px #ef4444;
          animation: beacon 1.4s infinite;
        }

        @keyframes beacon {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.4; }
        }

        .mass-topbar-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mass-audio-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(220,38,38,0.1);
          border: 1px solid rgba(220,38,38,0.3);
          border-radius: 6px;
          color: #cbd5e1;
          font-family: monospace;
          font-size: 11px;
          font-weight: 700;
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mass-audio-btn:hover {
          background: rgba(220,38,38,0.25);
          border-color: #ef4444;
          color: #fff;
        }

        /* Main Stage */
        .mass-main {
          position: relative;
          z-index: 10;
          flex: 1;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(14px, 3vw, 32px);
          overflow-y: auto;
          overflow-x: hidden;
        }

        /* 1. Clean Resting Hero (Single line title + click prompt alone) */
        .clean-hero-block {
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin: auto;
          transform-style: preserve-3d;
          transition: transform 0.2s ease-out;
        }

        .clean-title-wrap {
          position: relative;
          display: inline-block;
          white-space: nowrap;
          cursor: pointer;
        }

        .clean-title-main {
          margin: 0;
          font-family: var(--font-rajdhani), sans-serif;
          font-size: clamp(34px, 8.5vw, 115px);
          font-weight: 900;
          letter-spacing: clamp(5px, 1.4vw, 18px);
          text-transform: uppercase;
          line-height: 1;
          white-space: nowrap;
          color: #ffffff;
          text-shadow: 0 0 35px rgba(239,68,68,0.85),
                       0 0 80px rgba(220,38,38,0.5),
                       0 4px 20px rgba(0,0,0,0.9);
        }

        .clean-title-aura {
          position: absolute;
          inset: 0;
          margin: 0;
          font-family: var(--font-rajdhani), sans-serif;
          font-size: clamp(34px, 8.5vw, 115px);
          font-weight: 900;
          letter-spacing: clamp(5px, 1.4vw, 18px);
          text-transform: uppercase;
          line-height: 1;
          white-space: nowrap;
          color: #ef4444;
          mix-blend-mode: screen;
          opacity: 0.35;
          pointer-events: none;
          transform: translate(-3px, -2px);
        }

        .click-screen-cue {
          margin-top: clamp(16px, 3.5vh, 32px);
          font-family: var(--font-share-tech-mono), monospace;
          font-size: clamp(11.5px, 1.5vw, 14px);
          font-weight: 700;
          color: #fca5a5;
          letter-spacing: clamp(2.5px, 0.5vw, 5px);
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          animation: cuePulse 2s ease-in-out infinite;
        }

        .cue-bracket {
          color: #ef4444;
          font-weight: 900;
        }

        @keyframes cuePulse {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.98); }
        }

        /* 2. Cinematic Theatre Stage */
        .cinematic-theatre {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(14px, 3vw, 32px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }

        .cinematic-theatre.active {
          opacity: 1;
        }

        /* Single Character Focused View (Acts 1 to 4) */
        .theatre-single-view {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(20px, 4vw, 48px);
          width: 100%;
          max-width: 900px;
        }

        .char-hero-frame {
          position: relative;
          width: clamp(200px, 28vw, 300px);
          height: clamp(240px, 35vw, 380px);
          min-width: clamp(200px, 28vw, 300px);
          border: 2px solid;
          border-radius: 14px;
          overflow: hidden;
          background: #080306;
          box-shadow: 0 0 45px rgba(0,0,0,0.85);
          flex-shrink: 0;
        }

        .corner-bracket {
          position: absolute;
          width: 14px;
          height: 14px;
          border-style: solid;
          z-index: 5;
          pointer-events: none;
        }

        .c-tl { top: 4px; left: 4px; border-width: 2.5px 0 0 2.5px; }
        .c-tr { top: 4px; right: 4px; border-width: 2.5px 2.5px 0 0; }
        .c-bl { bottom: 4px; left: 4px; border-width: 0 0 2.5px 2.5px; }
        .c-br { bottom: 4px; right: 4px; border-width: 0 2.5px 2.5px 0; }

        .laser-scanner {
          position: absolute;
          left: 0;
          right: 0;
          height: 8px;
          z-index: 4;
          pointer-events: none;
          animation: laserTravel 2.4s ease-in-out infinite;
        }

        @keyframes laserTravel {
          0% { top: 0; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        /* Natural, crisp rendering of the single character image (NO contrast distortion) */
        .char-portrait-wrap {
          position: relative;
          width: 100%;
          height: 100%;
          filter: none;
        }

        .hero-mass-stamp {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
          border-radius: 4px;
          color: #ffffff;
          font-family: monospace;
          font-size: 10.5px;
          font-weight: 900;
          letter-spacing: 1.5px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.8);
          z-index: 6;
          white-space: nowrap;
        }

        .stamp-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #ffffff;
          animation: beacon 1s infinite;
        }

        /* Dialogue Dossier Card */
        .char-dossier-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(12, 4, 8, 0.94);
          border: 1.5px solid rgba(220,38,38,0.35);
          border-left: 4px solid;
          border-radius: 14px;
          padding: clamp(16px, 3vw, 28px);
          backdrop-filter: blur(20px);
          box-shadow: 0 0 45px rgba(0,0,0,0.75);
          flex: 1;
          min-width: 0;
        }

        .dossier-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }

        .act-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: monospace;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 1.5px;
          border: 1px solid;
          border-radius: 4px;
          padding: 2px 8px;
        }

        .status-badge-pill {
          font-family: monospace;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          padding: 3px 8px;
          border-radius: 4px;
        }

        .char-main-name {
          margin: 0;
          font-family: var(--font-rajdhani), sans-serif;
          font-size: clamp(26px, 4vw, 42px);
          font-weight: 900;
          letter-spacing: 2px;
          color: #ffffff;
          line-height: 1;
        }

        .char-subtitle {
          font-family: monospace;
          font-size: clamp(10px, 1.3vw, 12px);
          color: #94a3b8;
          letter-spacing: 1.5px;
        }

        .waveform-display {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 20px;
        }

        .wave-bar {
          flex: 1;
          height: 12px;
          border-radius: 1px;
          animation: waveJump 0.8s ease-in-out infinite alternate;
        }

        @keyframes waveJump {
          0% { height: 4px; opacity: 0.35; }
          100% { height: 18px; opacity: 1; }
        }

        .char-quote-text {
          margin: 0;
          font-size: clamp(14px, 1.8vw, 17px);
          line-height: 1.6;
          color: #f1f5f9;
          font-style: italic;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 10px;
        }

        .telemetry-bar {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: monospace;
          font-size: 10px;
          color: #64748b;
          letter-spacing: 1px;
          background: rgba(0,0,0,0.5);
          padding: 6px 10px;
          border-radius: 6px;
        }

        /* Act 5: Grand Mass Welcome Showcase */
        .theatre-welcome-montage {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(16px, 3vh, 32px);
          padding: clamp(14px, 3vw, 32px);
          opacity: 0;
          pointer-events: none;
        }

        .tribute-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(8px, 1.8vw, 16px);
          width: 100%;
          max-width: 820px;
        }

        .tribute-card {
          position: relative;
          height: clamp(110px, 18vw, 190px);
          border: 1.5px solid;
          border-radius: 10px;
          overflow: hidden;
          background: #050204;
          box-shadow: 0 0 25px rgba(0,0,0,0.85);
        }

        .tribute-img-box {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .tribute-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 8px;
          background: linear-gradient(0deg, #000 0%, transparent 60%);
          z-index: 2;
        }

        .tribute-codename {
          font-family: monospace;
          font-size: 10.5px;
          font-weight: 900;
          letter-spacing: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .welcome-banner-center {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .welcome-tagline {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: monospace;
          font-size: clamp(10px, 1.3vw, 12px);
          font-weight: 800;
          letter-spacing: 3px;
          color: #f87171;
        }

        .w-line {
          width: clamp(20px, 4vw, 50px);
          height: 1.5px;
          background: linear-gradient(90deg, transparent, #ef4444, transparent);
        }

        .welcome-big-title {
          margin: 0;
          font-family: var(--font-rajdhani), sans-serif;
          font-size: clamp(38px, 7.5vw, 86px);
          font-weight: 900;
          letter-spacing: clamp(5px, 1.2vw, 14px);
          color: #ffffff;
          text-shadow: 0 0 35px rgba(239,68,68,0.8),
                       0 0 75px rgba(220,38,38,0.45);
          line-height: 1;
        }

        .welcome-message-banner {
          display: flex;
          align-items: center;
          gap: 14px;
          background: linear-gradient(135deg, rgba(220,38,38,0.22), rgba(245,158,11,0.15));
          border: 1.5px solid rgba(251,191,36,0.6);
          border-radius: 12px;
          padding: 12px 24px;
          box-shadow: 0 0 35px rgba(245,158,11,0.35);
        }

        .w-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: rgba(245,158,11,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(251,191,36,0.5);
          flex-shrink: 0;
        }

        .w-text-block {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .w-head {
          margin: 0;
          font-family: var(--font-rajdhani), sans-serif;
          font-size: clamp(16px, 2.4vw, 22px);
          font-weight: 900;
          letter-spacing: 2px;
          color: #fef3c7;
        }

        .w-sub {
          margin: 3px 0 0;
          font-family: monospace;
          font-size: clamp(9.5px, 1.2vw, 11px);
          color: #fde68a;
          letter-spacing: 1.5px;
        }

        /* Footer */
        .mass-footer {
          position: relative;
          z-index: 20;
          height: 48px;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(16px, 3vw, 32px);
          border-top: 1px solid rgba(220,38,38,0.2);
          background: rgba(5, 2, 4, 0.92);
          backdrop-filter: blur(16px);
        }

        .footer-status-box {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: monospace;
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 1px;
        }

        .pulsing-led {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          flex-shrink: 0;
        }

        .footer-location {
          font-family: monospace;
          font-size: 10px;
          color: #64748b;
          letter-spacing: 1.5px;
        }

        /* White-hot Flashbang Collapse */
        .white-hot-flash {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: radial-gradient(circle at center, #ffffff 0%, #fee2e2 35%, #ef4444 75%, #000000 100%);
          pointer-events: none;
          opacity: 0;
        }

        /* Responsive Breakpoints */
        @media (max-width: 820px) {
          .theatre-single-view {
            flex-direction: column;
            gap: 14px;
            max-height: calc(100vh - 120px);
          }
          .char-hero-frame {
            width: 170px;
            height: 190px;
            min-width: 170px;
          }
          .char-dossier-card {
            padding: 14px;
            gap: 8px;
            width: 100%;
          }
          .char-main-name { font-size: 22px; }
          .char-quote-text { font-size: 13.5px; line-height: 1.45; }
          .tribute-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .tribute-card { height: 100px; }
          .welcome-message-banner { flex-direction: column; text-align: center; padding: 12px; }
          .w-text-block { align-items: center; text-align: center; }
        }

        @media (max-width: 600px) {
          .hide-mob { display: none !important; }
          .mass-topbar { padding: 0 12px; height: 46px; min-height: 46px; }
          .mass-footer { padding: 0 12px; height: 46px; min-height: 46px; }
          .footer-status-box { font-size: 9.5px; }
        }
      `}</style>
    </div>
  );
}
