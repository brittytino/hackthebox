'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { gsap } from 'gsap';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Volume2, VolumeX, RotateCcw, FastForward, ArrowLeft, Shield, Award } from 'lucide-react';

// ============================================================================
// CREDITS DATA CONFIGURATION
// ============================================================================
const COORDINATORS = [
  {
    name: 'TINO BRITTY',
    title: 'LEAD ARCHITECT & CHIEF COORDINATOR',
    dept: 'SYSTEM ARCHITECTURE & CTF PLATFORM DESIGN',
    image: '/images/coordinators/coordinator1.jpg',
    fallbackImage: '/images/coordinators/tino_britty.jpg',
  },
  {
    name: 'SRINITHI',
    title: 'LEAD ARCHITECT & CHIEF COORDINATOR',
    dept: 'STRATEGIC LOGISTICS & EVENT OPERATIONS',
    image: '/images/coordinators/coordinator2.jpg',
    fallbackImage: '/images/coordinators/srinithi.jpg',
  },
];

const VOLUNTEER_CATEGORIES = [
  {
    category: 'TECHNICAL OPERATIONS & SECURITY',
    members: ['Network Defense Team', 'Infrastructure Ops', 'Cryptographic QA Lead', 'Deployment Engineering'],
  },
  {
    category: 'FIELD COORDINATION & LOGISTICS',
    members: ['Tactical Floor Ops', 'Participant Support', 'Event Communications', 'Media & Stream Crew'],
  },
  {
    category: 'SPECIAL ACKNOWLEDGEMENTS',
    members: ['Faculty Advisory Board', 'Department of Information Technology', 'Cyber Security Research Cell', 'All Participating Colleges & Squads'],
  },
];

const CAST = [
  {
    name: 'VEERA RAGHAVAN',
    callsign: 'CODENAME: BEAST',
    role: 'Ex-RAW Special Operative',
    desc: 'Led the tactical breach of East Coast Mall and defused the central demolition grid.',
    img: '/images/characters/veera_relieved.webp',
    accent: '#ef4444',
  },
  {
    name: 'PREETHI',
    callsign: 'CODENAME: CIPHER',
    role: 'Signals Intelligence & Tactical Support',
    desc: 'Decoded intercept telemetry and unmasked the ministerial conspiracy behind the siege.',
    img: '/images/characters/preethi_hopeful.webp',
    accent: '#f59e0b',
  },
  {
    name: 'NSA ALTHAF',
    callsign: 'CODENAME: SENTINEL',
    role: 'Joint Counter-Terror Command',
    desc: 'Coordinated perimeter quarantine and authorized deep-space drone reconnaissance.',
    img: '/images/characters/althaf_commanding.webp',
    accent: '#10b981',
  },
  {
    name: 'UMAR SAIF',
    callsign: 'HOSTILE CELL LEADER',
    role: 'Mall Demolition Commander',
    desc: 'Armed the 10-minute fail-deadly logic bomb and commanded 1,200 hostage sectors.',
    img: '/images/characters/umar_threatening.webp',
    accent: '#dc2626',
  },
];

function CreditsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  const [gameState, setGameState] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sequenceDone, setSequenceDone] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneNodesRef = useRef<{ osc1?: OscillatorNode; osc2?: OscillatorNode; gain?: GainNode } | null>(null);

  // Load live game & team data
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [state, board] = await Promise.all([
          api.game.getState().catch(() => null),
          api.getScoreboard().catch(() => []),
        ]);
        if (active) {
          setGameState(state);
          setTeams(Array.isArray(board) ? board : []);
        }
      } catch (err) {
        console.warn('Could not load game/scoreboard data:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const winnerName = gameState?.winnerTeamName || teams[0]?.teamName || teams[0]?.name || 'THE EXTRACTION TEAM';
  const finalOutcome = gameState?.finalOutcome || 'CITY_SAVED';
  const topScore = teams.find(t => (t.teamName || t.name) === winnerName)?.totalPoints ?? teams[0]?.totalPoints ?? 450;

  // Sound Synthesizer via Web Audio API (Marvel cinematic style drone and impacts)
  const initAudio = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;

      // Master gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.35, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Low frequency sub-drone (Cinematic Marvel space rumble)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const droneGain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 note
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(55.4, ctx.currentTime); // slight detune for cinematic beating

      // Lowpass filter for deep cinematic warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(masterGain);

      droneGain.gain.setValueAtTime(0.01, ctx.currentTime);
      droneGain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 3);

      osc1.start();
      osc2.start();

      droneNodesRef.current = { osc1, osc2, gain: droneGain };
      setAudioEnabled(true);
    } catch (e) {
      console.warn('Web Audio playback error:', e);
    }
  }, []);

  const toggleAudio = () => {
    if (audioEnabled) {
      droneNodesRef.current?.gain?.gain.exponentialRampToValueAtTime(0.0001, (audioCtxRef.current?.currentTime || 0) + 0.5);
      setAudioEnabled(false);
    } else {
      initAudio();
    }
  };

  // Trigger cinematic bass impact hit
  const playImpactHit = useCallback((freq = 90) => {
    if (!audioCtxRef.current || !audioEnabled) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.7, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.3);
    } catch {}
  }, [audioEnabled]);

  // Ambient Starfield & Ember Canvas FX
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Particles: mix of floating embers & distant stars
    const particleCount = 140;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.6,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.8 - 0.2, // upward drift
      alpha: Math.random() * 0.8 + 0.2,
      color: Math.random() > 0.4 ? 'rgba(239, 68, 68, ' : 'rgba(251, 191, 36, ',
      pulseSpeed: Math.random() * 0.03 + 0.01,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Radial vignette backdrop
      const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.05, width / 2, height / 2, width * 0.7);
      grad.addColorStop(0, 'rgba(25, 4, 8, 0.45)');
      grad.addColorStop(1, 'rgba(3, 1, 2, 0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw and update embers
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.01;
        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0.1, Math.min(0.9, p.alpha))})`;
        ctx.shadowBlur = p.size * 6;
        ctx.shadowColor = '#ef4444';
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // GSAP Marvel Movie Master Timeline
  const buildTimeline = useCallback((node: HTMLDivElement) => {
    const q = gsap.utils.selector(node);
    const tl = gsap.timeline({
      paused: true,
      onComplete: () => setSequenceDone(true),
    });

    // ------------------------------------------------------------------------
    // SCENE 1: Marvel Cold Open Title Blast (0s - 8s)
    // ------------------------------------------------------------------------
    tl.set(q('.mv-scene1'), { autoAlpha: 1 })
      .fromTo(q('.mv-flash'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, onStart: () => playImpactHit(120) }, 0.2)
      .to(q('.mv-flash'), { autoAlpha: 0, duration: 0.8 }, 0.4)
      .fromTo(
        q('.mv-title-main'),
        { scale: 3.5, autoAlpha: 0, filter: 'blur(24px)' },
        { scale: 1, autoAlpha: 1, filter: 'blur(0px)', duration: 1.4, ease: 'power4.out' },
        0.35,
      )
      .fromTo(q('.mv-title-sub'), { autoAlpha: 0, y: 25, letterSpacing: '0.9em' }, { autoAlpha: 1, y: 0, letterSpacing: '0.45em', duration: 1 }, 1.3)
      .fromTo(q('.mv-shockwave'), { scale: 0.2, autoAlpha: 1 }, { scale: 8, autoAlpha: 0, duration: 2.2, ease: 'power2.out' }, 0.35)
      .to(q('.mv-scene1'), { autoAlpha: 0, filter: 'blur(10px)', duration: 1 }, 7)
      .set(q('.mv-scene1'), { autoAlpha: 0 });

    // ------------------------------------------------------------------------
    // SCENE 2: The Champions / Victory Commendation (8s - 17s)
    // ------------------------------------------------------------------------
    tl.set(q('.mv-scene2'), { autoAlpha: 1 }, 7.8)
      .fromTo(q('.mv-win-badge'), { scale: 0.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.8)' }, 8)
      .fromTo(q('.mv-win-label'), { autoAlpha: 0, y: 15 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 8.5)
      .fromTo(q('.mv-win-name'), { autoAlpha: 0, scale: 0.85, letterSpacing: '0.5em' }, { autoAlpha: 1, scale: 1, letterSpacing: '0.12em', duration: 1.1, ease: 'power3.out' }, 8.9)
      .fromTo(q('.mv-win-stats .mv-stat-box'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.2 }, 9.8)
      .to(q('.mv-scene2'), { autoAlpha: 0, duration: 1 }, 16)
      .set(q('.mv-scene2'), { autoAlpha: 0 });

    // ------------------------------------------------------------------------
    // SCENE 3: Lead Cast Operatives Showcase (17s - 27s)
    // ------------------------------------------------------------------------
    tl.set(q('.mv-scene3'), { autoAlpha: 1 }, 16.8)
      .fromTo(q('.mv-cast-header'), { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 17);

    CAST.forEach((_, i) => {
      const startTime = 17.6 + i * 2.3;
      tl.fromTo(
        q(`.mv-cast-card-${i}`),
        { autoAlpha: 0, x: i % 2 === 0 ? -90 : 90, scale: 0.95 },
        { autoAlpha: 1, x: 0, scale: 1, duration: 0.8, ease: 'power3.out' },
        startTime,
      ).to(
        q(`.mv-cast-card-${i}`),
        { autoAlpha: 0, scale: 1.05, filter: 'blur(8px)', duration: 0.6 },
        startTime + 1.8,
      );
    });

    tl.to(q('.mv-scene3'), { autoAlpha: 0, duration: 0.8 }, 26.8)
      .set(q('.mv-scene3'), { autoAlpha: 0 });

    // ------------------------------------------------------------------------
    // SCENE 4: Mission Lead Coordinators (Dedicated Hero Photo Cards) (27s - 39s)
    // ------------------------------------------------------------------------
    tl.set(q('.mv-scene4'), { autoAlpha: 1 }, 27.2)
      .fromTo(q('.mv-coord-header'), { autoAlpha: 0, y: -25 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 27.4);

    COORDINATORS.forEach((_, i) => {
      const startTime = 28.2 + i * 5.2;
      // Animate coordinator hero card
      tl.fromTo(
        q(`.mv-coord-card-${i}`),
        { autoAlpha: 0, scale: 0.8, y: 40 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 1.1, ease: 'power3.out', onStart: () => playImpactHit(100) },
        startTime,
      )
      .fromTo(
        q(`.mv-coord-card-${i} .mv-photo-ring`),
        { scale: 0.6, autoAlpha: 0 },
        { scale: 1.1, autoAlpha: 1, duration: 1.2, ease: 'back.out(1.5)' },
        startTime + 0.3,
      )
      .fromTo(
        q(`.mv-coord-card-${i} .mv-coord-name`),
        { letterSpacing: '0.4em', autoAlpha: 0 },
        { letterSpacing: '0.1em', autoAlpha: 1, duration: 0.8 },
        startTime + 0.6,
      )
      .to(
        q(`.mv-coord-card-${i}`),
        { autoAlpha: 0, scale: 1.08, filter: 'blur(10px)', duration: 0.8 },
        startTime + 4.4,
      );
    });

    tl.to(q('.mv-scene4'), { autoAlpha: 0, duration: 0.8 }, 38.6)
      .set(q('.mv-scene4'), { autoAlpha: 0 });

    // ------------------------------------------------------------------------
    // SCENE 5: Field Volunteers & Operatives Rolling Credits (39s - 54s)
    // ------------------------------------------------------------------------
    tl.set(q('.mv-scene5'), { autoAlpha: 1 }, 39)
      .fromTo(
        q('.mv-credits-scroller'),
        { y: '105%' },
        { y: '-120%', duration: 14.5, ease: 'none' },
        39.2,
      )
      .to(q('.mv-scene5'), { autoAlpha: 0, duration: 0.8 }, 53.6)
      .set(q('.mv-scene5'), { autoAlpha: 0 });

    // ------------------------------------------------------------------------
    // SCENE 6: Marvel Post-Credits Stinger / Teaser (54s - 64s)
    // ------------------------------------------------------------------------
    tl.set(q('.mv-scene6'), { autoAlpha: 1 }, 54.2)
      .fromTo(q('.mv-stinger-beacon'), { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 1 }, 54.5)
      .fromTo(q('.mv-stinger-line1'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 55.5)
      .fromTo(q('.mv-stinger-quote'), { autoAlpha: 0, y: 15 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 57)
      .fromTo(
        q('.mv-stinger-reveal'),
        { autoAlpha: 0, scale: 1.3, filter: 'blur(12px)' },
        { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 1.4, ease: 'power4.out', onStart: () => playImpactHit(70) },
        59.2,
      )
      .fromTo(q('.mv-stinger-protocol'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 61);

    return tl;
  }, [playImpactHit]);

  // Initialize Timeline on load
  useEffect(() => {
    if (loading || !rootRef.current || tlRef.current) return;
    tlRef.current = buildTimeline(rootRef.current);
    tlRef.current.timeScale(speed);
    tlRef.current.play();

    return () => {
      tlRef.current?.kill();
      tlRef.current = null;
      if (droneNodesRef.current?.osc1) {
        try {
          droneNodesRef.current.osc1.stop();
          droneNodesRef.current.osc2?.stop();
        } catch {}
      }
    };
  }, [loading, buildTimeline, speed]);

  const handleSpeedChange = (newSpeed: 1 | 2 | 4) => {
    setSpeed(newSpeed);
    tlRef.current?.timeScale(newSpeed);
  };

  const handleSkip = () => {
    tlRef.current?.progress(1);
    setSequenceDone(true);
  };

  const handleReplay = () => {
    setSequenceDone(false);
    tlRef.current?.restart();
    if (!audioEnabled) initAudio();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#030104', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(239,68,68,0.2)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: '#ef4444', fontFamily: 'monospace', letterSpacing: 4, fontSize: 13, fontWeight: 700 }}>
          SYNCHRONIZING CINEMATIC TRANSMISSION...
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const operatives = teams
    .slice()
    .sort((a, b) => (b.totalPoints ?? b.points ?? 0) - (a.totalPoints ?? a.points ?? 0))
    .map(t => ({
      name: t.teamName || t.name,
      points: t.totalPoints ?? t.points ?? 0,
      members: t.members?.map((m: any) => m.name || m.username).join(', ') || '',
    }))
    .filter(t => Boolean(t.name));

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed', inset: 0, background: '#020104', overflow: 'hidden', zIndex: 9999,
        fontFamily: "'Rajdhani', sans-serif", color: '#fff',
      }}
    >
      {/* Background Starfield & Embers Canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} />

      {/* 2.39:1 Cinematic Letterbox Bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6vh', minHeight: 36, background: '#000', zIndex: 10, borderBottom: '1px solid rgba(239,68,68,0.2)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '6vh', minHeight: 36, background: '#000', zIndex: 10, borderTop: '1px solid rgba(239,68,68,0.2)' }} />

      {/* Subtle CRT Scanlines & Anamorphic Vignette */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.85) 100%)' }} />

      {/* Top Floating Cinematic Controls Bar */}
      <div style={{ position: 'absolute', top: 12, left: 24, right: 24, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/dashboard"
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
              background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 6, color: '#fca5a5', fontSize: 11, fontWeight: 700,
              fontFamily: 'monospace', textDecoration: 'none', letterSpacing: 1,
            }}
          >
            <ArrowLeft size={13} /> DASHBOARD
          </Link>

          <div style={{ color: '#ef4444', fontSize: 10, fontFamily: 'monospace', letterSpacing: 2, padding: '4px 10px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 4 }}>
            CINEMATIC POST-CREDITS // 2.39:1
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Audio toggle */}
          <button
            onClick={toggleAudio}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
              background: audioEnabled ? 'rgba(239,68,68,0.25)' : 'rgba(0,0,0,0.6)',
              border: `1px solid ${audioEnabled ? '#ef4444' : 'rgba(255,255,255,0.2)'}`,
              borderRadius: 6, color: audioEnabled ? '#fee2e2' : '#94a3b8',
              fontSize: 11, fontWeight: 700, fontFamily: 'monospace', cursor: 'pointer',
            }}
            title="Toggle Cinematic Audio"
          >
            {audioEnabled ? <Volume2 size={13} color="#ef4444" /> : <VolumeX size={13} />}
            <span>AUDIO: {audioEnabled ? 'ON' : 'MUTED'}</span>
          </button>

          {/* Speed toggles */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, overflow: 'hidden' }}>
            {([1, 2, 4] as const).map(s => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                style={{
                  padding: '5px 10px', background: speed === s ? '#ef4444' : 'transparent',
                  color: speed === s ? '#fff' : '#94a3b8', border: 'none', fontSize: 10,
                  fontWeight: 800, fontFamily: 'monospace', cursor: 'pointer',
                }}
              >
                {s}X
              </button>
            ))}
          </div>

          {/* Skip button */}
          {!sequenceDone && (
            <button
              onClick={handleSkip}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px',
                background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(239,68,68,0.5)',
                borderRadius: 6, color: '#fca5a5', fontSize: 11, fontWeight: 800,
                fontFamily: 'monospace', cursor: 'pointer', letterSpacing: 1,
              }}
            >
              SKIP <FastForward size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SCENE 1: COLD OPEN TITLE BLAST */}
      {/* ==================================================================== */}
      <div className="mv-scene1" style={{ position: 'absolute', inset: 0, opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: 15 }}>
        <div className="mv-flash" style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0 }} />
        <div className="mv-shockwave" style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', border: '4px solid #ef4444', boxShadow: '0 0 100px 30px rgba(239,68,68,0.7)' }} />

        <div
          className="mv-title-main font-heading-tactical"
          style={{
            fontSize: 'clamp(36px, 8.5vw, 100px)', fontWeight: 900, textAlign: 'center',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            background: 'linear-gradient(180deg, #ffffff 20%, #fca5a5 60%, #ef4444 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 45px rgba(239,68,68,0.85)) drop-shadow(0 0 90px rgba(185,28,28,0.5))',
            lineHeight: 1.05,
          }}
        >
          OPERATION COMPLETE
        </div>

        <div
          className="mv-title-sub"
          style={{
            fontSize: 'clamp(14px, 2.4vw, 24px)', color: '#ef4444', letterSpacing: '0.5em',
            fontWeight: 800, marginTop: 22, fontFamily: 'monospace', textTransform: 'uppercase',
            textShadow: '0 0 20px rgba(239,68,68,0.8)',
          }}
        >
          THE EXTRACTION // CHENNAI PROTOCOL
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SCENE 2: THE CHAMPIONS / VICTORY COMMENDATION */}
      {/* ==================================================================== */}
      <div
        className="mv-scene2"
        style={{
          position: 'absolute', inset: 0, opacity: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexDirection: 'column', gap: 14, zIndex: 15,
          background: 'radial-gradient(ellipse at center, rgba(153,27,27,0.3) 0%, transparent 70%)',
        }}
      >
        <div className="mv-win-badge" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 20px', borderRadius: 999, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.5)', boxShadow: '0 0 30px rgba(239,68,68,0.3)' }}>
          <Award size={16} color="#fbbf24" />
          <span style={{ color: '#fef3c7', fontSize: 12, fontWeight: 800, letterSpacing: 3, fontFamily: 'monospace' }}>TACTICAL SUPREMACY COMMENDATION</span>
        </div>

        <div className="mv-win-label" style={{ color: '#94a3b8', fontSize: 13, letterSpacing: 5, fontFamily: 'monospace', fontWeight: 700, marginTop: 4 }}>
          {finalOutcome === 'CITY_SAVED' ? 'EAST COAST MALL & TAMIL NADU SECURED BY' : 'FINAL TARGET CONQUERED BY'}
        </div>

        <div
          className="mv-win-name"
          style={{
            fontSize: 'clamp(32px, 6.5vw, 80px)', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.12em', textAlign: 'center',
            background: 'linear-gradient(180deg, #ffffff 30%, #fef08a 70%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 35px rgba(245,158,11,0.6))',
          }}
        >
          {winnerName}
        </div>

        <div className="mv-win-stats" style={{ display: 'flex', gap: 24, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'TEAMS DEPLOYED', val: Math.max(teams.length, 1) },
            { label: 'FINAL SCORE', val: `${Number(topScore).toLocaleString()} PTS` },
            { label: 'HOSTAGES EVACUATED', val: '1,200 / 1,200' },
            { label: 'OPERATIONAL OUTCOME', val: 'TERMINATED' },
          ].map(s => (
            <div
              key={s.label}
              className="mv-stat-box"
              style={{
                textAlign: 'center', padding: '12px 24px', background: 'rgba(10,4,6,0.7)',
                border: '1px solid rgba(239,68,68,0.35)', borderRadius: 8, minWidth: 140,
                boxShadow: '0 0 20px rgba(239,68,68,0.15)',
              }}
            >
              <div style={{ color: '#ef4444', fontSize: 22, fontWeight: 900, fontFamily: 'monospace' }}>{s.val}</div>
              <div style={{ color: '#94a3b8', fontSize: 9, letterSpacing: 2, fontFamily: 'monospace', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SCENE 3: LEAD CAST OPERATIVES SHOWCASE */}
      {/* ==================================================================== */}
      <div className="mv-scene3" style={{ position: 'absolute', inset: 0, opacity: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 15 }}>
        <div className="mv-cast-header" style={{ color: '#ef4444', fontSize: 13, letterSpacing: 7, fontFamily: 'monospace', fontWeight: 900, marginBottom: 20 }}>
          // OPERATIONAL CAST //
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: 840, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {CAST.map((c, i) => (
            <div
              key={c.name}
              className={`mv-cast-card-${i}`}
              style={{
                position: 'absolute', inset: 0, opacity: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 36, padding: '0 24px',
                flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
              }}
            >
              <div style={{ position: 'relative', width: 220, height: 260, flexShrink: 0 }}>
                <img
                  src={c.img}
                  alt={c.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', filter: `drop-shadow(0 0 35px ${c.accent}88)` }}
                />
              </div>

              <div style={{ maxWidth: 420 }}>
                <div style={{ color: c.accent, fontSize: 11, fontFamily: 'monospace', letterSpacing: 3, fontWeight: 800 }}>
                  {c.callsign}
                </div>
                <div style={{ color: '#fff', fontSize: 'clamp(28px, 4.5vw, 42px)', fontWeight: 900, letterSpacing: '0.04em', lineHeight: 1.1, margin: '6px 0 8px' }}>
                  {c.name}
                </div>
                <div style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 700, fontFamily: 'monospace', marginBottom: 8 }}>
                  {c.role}
                </div>
                <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                  {c.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SCENE 4: MISSION LEAD COORDINATORS (HERO PHOTO CARDS) */}
      {/* ==================================================================== */}
      <div className="mv-scene4" style={{ position: 'absolute', inset: 0, opacity: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 15 }}>
        <div className="mv-coord-header" style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ color: '#ef4444', fontSize: 12, letterSpacing: 8, fontFamily: 'monospace', fontWeight: 900 }}>
            // MISSION COMMAND ARCHITECTS //
          </div>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 900, letterSpacing: 2, marginTop: 4 }}>
            LEAD COORDINATORS
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: 760, height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {COORDINATORS.map((coord, i) => (
            <div
              key={coord.name}
              className={`mv-coord-card-${i}`}
              style={{
                position: 'absolute', opacity: 0, display: 'flex', alignItems: 'center',
                gap: 40, padding: '28px 36px',
                background: 'linear-gradient(135deg, rgba(18, 4, 8, 0.95), rgba(30, 6, 12, 0.95))',
                border: '1.5px solid rgba(239, 68, 68, 0.6)',
                borderRadius: 16,
                boxShadow: '0 0 60px rgba(239,68,68,0.35), inset 0 0 30px rgba(239,68,68,0.15)',
                maxWidth: 680, width: '90%',
              }}
            >
              {/* Coordinator Photo Frame with Marvel/Cyber Bevel */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  className="mv-photo-ring"
                  style={{
                    position: 'absolute', inset: -8, borderRadius: '50%',
                    border: '2px solid #ef4444',
                    boxShadow: '0 0 25px #ef4444, inset 0 0 15px #ef4444',
                    animation: 'spin 12s linear infinite',
                  }}
                />
                <div
                  style={{
                    width: 170, height: 170, borderRadius: '50%', overflow: 'hidden',
                    border: '3px solid #fca5a5', position: 'relative', zIndex: 2,
                    background: '#0a0406',
                    boxShadow: '0 0 30px rgba(0,0,0,0.8)',
                  }}
                >
                  <img
                    src={coord.image}
                    alt={coord.name}
                    onError={(e) => {
                      // Fallback gracefully to backup image if primary missing
                      const target = e.currentTarget;
                      if (target.src !== coord.fallbackImage) {
                        target.src = coord.fallbackImage;
                      }
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>

              {/* Coordinator Meta & Accolades */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 4, marginBottom: 8 }}>
                  <Shield size={12} color="#ef4444" />
                  <span style={{ color: '#fca5a5', fontSize: 10, fontWeight: 800, fontFamily: 'monospace', letterSpacing: 2 }}>COMMAND CLEARANCE LEVEL 5</span>
                </div>

                <div
                  className="mv-coord-name font-heading-tactical"
                  style={{
                    fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 900, letterSpacing: '0.08em',
                    background: 'linear-gradient(180deg, #ffffff 20%, #fca5a5 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    lineHeight: 1.1,
                  }}
                >
                  {coord.name}
                </div>

                <div style={{ color: '#ef4444', fontSize: 13, fontWeight: 800, fontFamily: 'monospace', letterSpacing: 2, margin: '6px 0 4px' }}>
                  {coord.title}
                </div>

                <div style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'monospace', letterSpacing: 1 }}>
                  {coord.dept}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SCENE 5: FIELD VOLUNTEERS & TEAMS ROLLING CREDITS */}
      {/* ==================================================================== */}
      <div className="mv-scene5" style={{ position: 'absolute', inset: 0, opacity: 0, overflow: 'hidden', zIndex: 15 }}>
        <div
          className="mv-credits-scroller"
          style={{
            position: 'absolute', left: 0, right: 0, top: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 48, padding: '0 24px', textAlign: 'center',
          }}
        >
          {/* Logo Card */}
          <div>
            <div style={{ color: '#ef4444', fontSize: 14, letterSpacing: 8, fontFamily: 'monospace', fontWeight: 900 }}>
              OPERATION: THE EXTRACTION
            </div>
            <div style={{ color: '#fff', fontSize: 32, fontWeight: 900, letterSpacing: 4, marginTop: 4 }}>
              HONOR ROLL & VOLUNTEER CREW
            </div>
          </div>

          {/* Coordinators summary in scroll */}
          <div>
            <div style={{ color: '#ef4444', fontSize: 12, letterSpacing: 4, fontFamily: 'monospace', fontWeight: 800, marginBottom: 12 }}>
              CHIEF MISSION COORDINATORS
            </div>
            {COORDINATORS.map(c => (
              <div key={c.name} style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '4px 0' }}>
                {c.name}
              </div>
            ))}
          </div>

          {/* Volunteer groups */}
          {VOLUNTEER_CATEGORIES.map(cat => (
            <div key={cat.category}>
              <div style={{ color: '#ef4444', fontSize: 11, letterSpacing: 4, fontFamily: 'monospace', fontWeight: 800, marginBottom: 10 }}>
                {cat.category}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {cat.members.map(m => (
                  <div key={m} style={{ color: '#cbd5e1', fontSize: 15, fontWeight: 600 }}>
                    {m}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Live Participating Operative Teams from Database Scoreboard */}
          <div style={{ maxWidth: 640 }}>
            <div style={{ color: '#ef4444', fontSize: 11, letterSpacing: 4, fontFamily: 'monospace', fontWeight: 800, marginBottom: 12 }}>
              DEPLOYED STRIKE TEAMS ({operatives.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {operatives.map((op, idx) => (
                <div key={idx} style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6 }}>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{op.name}</div>
                  <div style={{ color: '#ef4444', fontSize: 11, fontFamily: 'monospace' }}>{op.points} PTS</div>
                </div>
              ))}
              {operatives.length === 0 && (
                <div style={{ color: '#6b7280', fontSize: 13, fontFamily: 'monospace' }}>ALL REGISTERED OPERATIVE SQUADS</div>
              )}
            </div>
          </div>

          {/* Thank You Note */}
          <div style={{ marginTop: 24, paddingBottom: 60 }}>
            <div style={{ color: '#6b7280', fontSize: 11, letterSpacing: 4, fontFamily: 'monospace' }}>
              AN ADVANCED AGENTIC CYBERSECURITY OPERATION
            </div>
            <div style={{ color: '#374151', fontSize: 12, letterSpacing: 3, fontFamily: 'monospace', marginTop: 6 }}>
              THANK YOU FOR COMPETING
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SCENE 6: MARVEL AFTER-CREDITS SCENE (STINGER) */}
      {/* ==================================================================== */}
      <div
        className="mv-scene6"
        style={{
          position: 'absolute', inset: 0, opacity: 0, background: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 20, zIndex: 20, padding: 24, textAlign: 'center',
        }}
      >
        <div className="mv-stinger-beacon" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 16px', background: 'rgba(220,38,38,0.2)', border: '1px solid #dc2626', borderRadius: 999 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444', animation: 'dpulse 1.2s infinite' }} />
          <span style={{ color: '#fca5a5', fontSize: 10, fontFamily: 'monospace', letterSpacing: 3, fontWeight: 800 }}>POST-CREDITS INTERCEPT // PRIORITY OMEGA</span>
        </div>

        <div className="mv-stinger-line1" style={{ color: '#6b7280', fontSize: 12, fontFamily: 'monospace', letterSpacing: 3 }}>
          TRANSMISSION ORIGIN: NORTHERN BORDER AIRSPACE // CLASSIFIED FREQUENCY
        </div>

        <div
          className="mv-stinger-quote"
          style={{
            maxWidth: 620, color: '#f87171', fontSize: 'clamp(18px, 3.2vw, 28px)',
            fontStyle: 'italic', fontWeight: 600, lineHeight: 1.4,
            textShadow: '0 0 20px rgba(220,38,38,0.5)',
          }}
        >
          "You neutralized one sleeper cell in Chennai. But the syndicate... is worldwide."
        </div>

        <div style={{ marginTop: 24 }}>
          <div
            className="mv-stinger-reveal font-heading-tactical"
            style={{
              fontSize: 'clamp(28px, 6vw, 64px)', fontWeight: 900, letterSpacing: '0.12em',
              background: 'linear-gradient(180deg, #ffffff 30%, #ef4444 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 40px rgba(239,68,68,0.8))',
            }}
          >
            VEERA RAGHAVAN WILL RETURN
          </div>

          <div className="mv-stinger-protocol" style={{ color: '#991b1b', fontSize: 13, letterSpacing: 6, fontFamily: 'monospace', fontWeight: 800, marginTop: 10 }}>
            IN OPERATION: RED PROTOCOL
          </div>
        </div>

        {/* Final Actions after credits */}
        <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={handleReplay}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.6)',
              borderRadius: 8, color: '#fee2e2', fontSize: 12, fontWeight: 800,
              fontFamily: 'monospace', letterSpacing: 2, cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} /> REPLAY FINALE
          </button>

          <Link
            href="/dashboard"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px',
              background: 'linear-gradient(135deg,#7f1d1d,#dc2626)',
              borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 800,
              fontFamily: 'monospace', letterSpacing: 2, textDecoration: 'none',
              boxShadow: '0 0 25px rgba(220,38,38,0.5)',
            }}
          >
            RETURN TO BASE
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CreditsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#020104', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontFamily: 'monospace' }}>
        LOADING CINEMATIC FINALE...
      </div>
    }>
      <CreditsContent />
    </Suspense>
  );
}
