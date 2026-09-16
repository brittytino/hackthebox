'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { gsap } from 'gsap';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Volume2, VolumeX, RotateCcw, ArrowLeft, Award, Cpu, Users } from 'lucide-react';

// ============================================================================
// CREDITS DATA CONFIGURATION (TECHNICAL & TEAM MANAGEMENT COORDINATORS)
// ============================================================================
const COORDINATORS = [
  {
    name: 'TINO BRITTY',
    roleTag: 'TECHNICAL LEAD & PLATFORM ARCHITECT',
    title: 'Lead Architect & System Coordinator',
    dept: 'System Architecture & CTF Platform Design',
    highlight: 'Platform Engineering • Realtime Flag Grid Engine',
    image: '/images/coordinators/tino_britty.png',
    fallbackImage: '/images/coordinators/tino_britty.png',
    accent: '#38bdf8',
  },
  {
    name: 'SRINITHI',
    roleTag: 'OPERATIONS LEAD & TEAM MANAGEMENT',
    title: 'Lead Event Coordinator & Operations',
    dept: 'Event Logistics & Team Management',
    highlight: 'Event Direction • Team Operations & Protocol',
    image: '/images/coordinators/srinithi.png',
    fallbackImage: '/images/coordinators/srinithi.png',
    accent: '#fb7185',
  },
];

const PATRONS_AND_LEADERSHIP = [
  {
    role: 'EVENT COORDINATOR',
    name: 'Dr. Geetha N',
    dept: 'Faculty Advisor & Strategic Event Lead For The Extraction',
    accent: '#ef4444',
  },
  {
    role: 'PROGRAMME COORDINATOR',
    name: 'Ms. Kalyani A',
    dept: 'Programme Coordinator MCA',
    accent: '#38bdf8',
  },
  {
    role: 'CAA ASSOCIATION',
    name: 'Office Bearers of 2025 & 2026',
    dept: 'CAA Association & Executive Council',
    accent: '#fb7185',
  },
];

const VOLUNTEERS = [
  { name: 'Esakki Rahul M', role: 'Operations Floor Marshall' },
  { name: 'Gaythri J', role: 'Timekeeping & Schedule Coordinator' },
  { name: 'Kavya S', role: 'Participant Experience Coordinator' },
  { name: 'Keerthana AR', role: 'Hospitality & Refreshments Lead' },
  { name: 'Mirdula S', role: 'Communications & Event Announcer' },
  { name: 'Pooja M', role: 'Hospitality & VIP Guest Relations' },
  { name: 'Rebakha Snowit N', role: 'Stage & Floor Operations Lead' },
  { name: 'Samrithi R', role: 'Score Verification & Result Audit' },
  { name: 'Sanjiv K', role: 'Crowd Safety & Security Marshall' },
  { name: 'Santhiya T', role: 'Media Documentation & Live Coverage' },
  { name: 'SivaPrasath', role: 'Venue Logistics & Equipment Setup' },
  { name: 'Sofiya A', role: 'Registration & Delegate Helpdesk' },
  { name: 'Sri Thanvarsha', role: 'Live Photography & Visual Media' },
  { name: 'Sruthi S', role: 'Delegate Kits & Participant Desk' },
  { name: 'Vive Divina J', role: 'Stage Coordination & Support Marshall' },
];

const INSTITUTIONAL_ACKNOWLEDGEMENTS = [
  'Faculty Advisory Board',
  'Department of Computer Applications',
  'All Participating Colleges & Teams',
];

const CAST = [
  {
    name: 'Veera Raghavan',
    callsign: 'CODENAME: BEAST',
    role: 'Ex-RAW Special Operative',
    desc: 'Led the rescue operation inside East Coast Mall and defused the central bomb grid.',
    img: '/images/characters/veera_relieved.webp',
    accent: '#ef4444',
  },
  {
    name: 'Preethi',
    callsign: 'CODENAME: CIPHER',
    role: 'Signals Intelligence & Support',
    desc: 'Decoded secret communications and exposed the corruption behind the siege.',
    img: '/images/characters/preethi_hopeful.webp',
    accent: '#f59e0b',
  },
  {
    name: 'Althaf Hussain',
    callsign: 'CODENAME: SENTINEL',
    role: 'National Security Negotiator',
    desc: 'Coordinated perimeter security and guided tactical rescue operations.',
    img: '/images/characters/althaf_commanding.webp',
    accent: '#10b981',
  },
  {
    name: 'Umar Saif',
    callsign: 'HOSTILE CELL LEADER',
    role: 'Siege Commander',
    desc: 'Armed the 10-minute fail-deadly logic bomb across the hostage sectors.',
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
  const topScore = teams.find(t => (t.teamName || t.name) === winnerName)?.totalPoints ?? teams[0]?.totalPoints ?? 450;

  // Sound Synthesizer via Web Audio API (Hans Zimmer BRAAAM, ambient drone, seismic impacts)
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

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.35, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const droneGain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, ctx.currentTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(55.4, ctx.currentTime);

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

  // Auto-unlock audio on first user gesture anywhere
  useEffect(() => {
    const handleGesture = () => {
      if (!audioEnabled) {
        initAudio();
      }
    };
    window.addEventListener('click', handleGesture, { once: true });
    return () => window.removeEventListener('click', handleGesture);
  }, [audioEnabled, initAudio]);

  // Hollywood trailer BRAAAM blast
  const playBraaam = useCallback(() => {
    if (!audioCtxRef.current || !audioEnabled) return;
    try {
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const saw1 = ctx.createOscillator();
      const saw2 = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      saw1.type = 'sawtooth';
      saw1.frequency.setValueAtTime(46, now);
      saw2.type = 'sawtooth';
      saw2.frequency.setValueAtTime(46.6, now);

      sub.type = 'sine';
      sub.frequency.setValueAtTime(35, now);
      sub.frequency.exponentialRampToValueAtTime(16, now + 2.4);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(550, now);
      filter.frequency.exponentialRampToValueAtTime(65, now + 2.2);
      filter.Q.setValueAtTime(5, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.9, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

      saw1.connect(filter);
      saw2.connect(filter);
      filter.connect(gain);
      sub.connect(gain);
      gain.connect(ctx.destination);

      saw1.start(now);
      saw2.start(now);
      sub.start(now);
      saw1.stop(now + 2.5);
      saw2.stop(now + 2.5);
      sub.stop(now + 2.5);
    } catch {}
  }, [audioEnabled]);

  // Trigger cinematic bass impact hit with optional sub-boom acoustic shockwave
  const playImpactHit = useCallback((freq = 90, subBoom = false) => {
    if (!audioCtxRef.current || !audioEnabled) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.85, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.3);

      if (subBoom) {
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        subOsc.type = 'sawtooth';
        subOsc.frequency.setValueAtTime(50, ctx.currentTime);
        subOsc.frequency.exponentialRampToValueAtTime(15, ctx.currentTime + 1.8);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(80, ctx.currentTime);

        subGain.gain.setValueAtTime(0.9, ctx.currentTime);
        subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

        subOsc.connect(filter);
        filter.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start();
        subOsc.stop(ctx.currentTime + 1.9);
      }
    } catch {}
  }, [audioEnabled]);

  // Ambient Starfield & Fiery Ember Canvas FX
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

    const particleCount = 140;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.5,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -Math.random() * 0.9 - 0.2,
      alpha: Math.random() * 0.8 + 0.2,
      color: Math.random() > 0.5 ? 'rgba(239, 68, 68, ' : Math.random() > 0.25 ? 'rgba(251, 191, 36, ' : 'rgba(56, 189, 248, ',
      pulseSpeed: Math.random() * 0.03 + 0.01,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.05, width / 2, height / 2, width * 0.75);
      grad.addColorStop(0, 'rgba(28, 4, 10, 0.45)');
      grad.addColorStop(1, 'rgba(1, 0, 2, 0.98)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

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

  // 3D Parallax Mouse Tracking on Screen
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const xPercent = (clientX - left) / width - 0.5;
    const yPercent = (clientY - top) / height - 0.5;

    gsap.to('.mv-tilt-world', {
      rotationY: xPercent * 5,
      rotationX: -yPercent * 5,
      transformPerspective: 1200,
      ease: 'power1.out',
      duration: 0.5,
    });
  };

  // GSAP Master Timeline (~45 seconds total)
  const buildTimeline = useCallback((node: HTMLDivElement) => {
    const q = gsap.utils.selector(node);
    const tl = gsap.timeline({
      paused: true,
      onComplete: () => setSequenceDone(true),
    });

    // ========================================================================
    // ACT 0A: EVENT COMPLETED SLAM (0.0s - 3.0s) - FULL CENTER
    // ========================================================================
    tl.set(q('.mv-act0-completion'), { autoAlpha: 1 })
      .fromTo(q('.mv-letterbox-top'), { yPercent: -100 }, { yPercent: 0, duration: 0.7, ease: 'power3.out' }, 0)
      .fromTo(q('.mv-letterbox-bottom'), { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: 'power3.out' }, 0)
      
      // Massive cinematic BRAAAM impact
      .add(() => playBraaam(), 0.15)
      
      // Camera shake on screen container
      .to(q('.mv-screen-container'), {
        keyframes: [
          { x: -16, y: 12, duration: 0.04 },
          { x: 14, y: -14, duration: 0.04 },
          { x: -10, y: 8, duration: 0.05 },
          { x: 6, y: -5, duration: 0.05 },
          { x: 0, y: 0, duration: 0.06 },
        ],
        ease: 'power2.out',
      }, 0.15)

      // Anamorphic laser streak
      .fromTo(
        q('.mv-fullscreen-beam'),
        { scaleX: 0, autoAlpha: 0 },
        { scaleX: 2.6, autoAlpha: 1, duration: 0.15, ease: 'power3.out' },
        0.15,
      )
      .to(q('.mv-fullscreen-beam'), { autoAlpha: 0, duration: 0.65 }, 0.3)

      // Badge, Title, Subtitle, Callout reveals
      .fromTo(
        q('.mv-act0-badge'),
        { autoAlpha: 0, y: -16, scale: 0.85 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.7)' },
        0.2,
      )
      .fromTo(
        q('.mv-act0-title'),
        { autoAlpha: 0, scale: 2.0, filter: 'blur(16px)' },
        { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.65, ease: 'power4.out' },
        0.3,
      )
      .fromTo(
        q('.mv-act0-subtitle'),
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        0.6,
      )
      .fromTo(
        q('.mv-act0-callout'),
        { autoAlpha: 0, scale: 0.9 },
        { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
        0.9,
      )
      
      // Act 0A holds until 2.5s, then dissolves out
      .to(q('.mv-act0-completion'), {
        autoAlpha: 0, scale: 1.06, filter: 'blur(10px)', duration: 0.5, ease: 'power3.in',
      }, 2.5)
      .set(q('.mv-act0-completion'), { autoAlpha: 0 }, 3.0);

    // ========================================================================
    // ACT 0B: FULL CENTER COLD OPEN TITLE & WINNER (3.0s - 7.6s)
    // ========================================================================
    tl.set(q('.mv-full-center-title'), { autoAlpha: 1 }, 3.0)
      .fromTo(
        q('.mv-center-title-block'),
        { autoAlpha: 0, scale: 2.0, filter: 'blur(16px)' },
        { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.75, ease: 'power4.out', onStart: () => playImpactHit(130, true) },
        3.0,
      )
      .fromTo(q('.mv-shockwave-ring'), { scale: 0.2, autoAlpha: 1 }, { scale: 5, autoAlpha: 0, duration: 1.5, ease: 'power2.out' }, 3.05)
      .to(q('.mv-center-title-block'), { autoAlpha: 0, duration: 0.45 }, 5.1)

      // Winner Commendation in Full Center
      .fromTo(
        q('.mv-center-winner-block'),
        { autoAlpha: 0, scale: 0.9 },
        { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.out', onStart: () => playImpactHit(85) },
        5.3,
      )
      .to(q('.mv-center-winner-block'), { autoAlpha: 0, duration: 0.45 }, 7.2)
      .set(q('.mv-full-center-title'), { autoAlpha: 0 }, 7.6);

    // ========================================================================
    // ACT 1A: SPLIT-SCREEN CREDITS & CAST (7.6s - 26.0s)
    // Left: Smooth slow-scrolling credit roll (18.4s duration, ~25px/s)
    // Right: 4 Lead Cast Operatives (~4.6s per character)
    // ========================================================================
    tl.set(q('.mv-split-credits'), { autoAlpha: 1 }, 7.6);

    // 1. LEFT-SIDE CREDITS SCROLL TRACK (Glides slowly and gracefully over 18.4 seconds!)
    tl.fromTo(
      q('.mv-scroll-track'),
      { y: '0%' },
      { y: '-58%', duration: 18.4, ease: 'none' },
      7.6,
    );

    // 2. RIGHT-SIDE: 4 CAST OPERATIVES (7.6s - 26.0s, ~4.5s each)
    CAST.forEach((_, i) => {
      const startTime = 7.6 + i * 4.5;
      tl.fromTo(
        q(`.mv-reel-cast-${i}`),
        { autoAlpha: 0, x: 45, filter: 'blur(8px)' },
        { autoAlpha: 1, x: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out', onStart: () => playImpactHit(75) },
        startTime,
      ).to(
        q(`.mv-reel-cast-${i}`),
        { autoAlpha: 0, x: -25, filter: 'blur(6px)', duration: 0.5, ease: 'power2.in' },
        startTime + 3.9,
      );
    });

    // Split credits cast dissolves out smoothly
    tl.to(
      q('.mv-split-credits'),
      { autoAlpha: 0, scale: 0.97, filter: 'blur(8px)', duration: 0.65, ease: 'power2.inOut' },
      25.6,
    ).set(q('.mv-split-credits'), { autoAlpha: 0 }, 26.3);

    // ========================================================================
    // ACT 1B: DUAL CHIEF COORDINATORS GRAND CENTER SHOWCASE (26.3s - 34.5s)
    // Left: Technical Lead (Tino Britty) | Right: Team Management (Srinithi)
    // Generous 8.2s duration with over 6 seconds of steady hold!
    // ========================================================================
    tl.set(q('.mv-dual-coordinators'), { autoAlpha: 1 }, 26.3)

      // 1. Center Anamorphic Horizon Flare Sweep
      .fromTo(
        q('.mv-coord-horizon-flare'),
        { scaleX: 0, autoAlpha: 0 },
        { scaleX: 1.4, autoAlpha: 0.9, duration: 0.4, ease: 'power3.out' },
        26.3,
      )
      .to(
        q('.mv-coord-horizon-flare'),
        { autoAlpha: 0, duration: 0.7, ease: 'power2.out' },
        26.7,
      )

      // 2. Header reveals with tactical drop
      .fromTo(
        q('.mv-dual-coord-header'),
        { autoAlpha: 0, y: -20, filter: 'blur(10px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' },
        26.5,
      )

      // 3. Center Energy Divider scales in from core
      .fromTo(
        q('.mv-coord-divider'),
        { scaleY: 0, autoAlpha: 0 },
        { scaleY: 1, autoAlpha: 1, duration: 0.75, ease: 'power3.out' },
        26.6,
      )

      // 4. Coordinator 1 (Technical - Left: Tino Britty) glides in from left
      .fromTo(
        q('.mv-coord-card-left'),
        { autoAlpha: 0, x: -70, scale: 0.95, filter: 'blur(12px)' },
        { autoAlpha: 1, x: 0, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out', onStart: () => playImpactHit(95) },
        26.7,
      )

      // 5. Coordinator 2 (Team Management - Right: Srinithi) glides in from right
      .fromTo(
        q('.mv-coord-card-right'),
        { autoAlpha: 0, x: 70, scale: 0.95, filter: 'blur(12px)' },
        { autoAlpha: 1, x: 0, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out', onStart: () => playImpactHit(90) },
        26.9,
      )

      // 6. Dynamic continuous cinematic camera push (living motion on screen!)
      .to(
        q('.mv-dual-inner'),
        { scale: 1.035, duration: 6.6, ease: 'none' },
        26.9,
      )

      // 7. Smooth cinematic dissolve & exit
      .to(
        q('.mv-coord-card-left'),
        { autoAlpha: 0, x: -35, filter: 'blur(10px)', duration: 0.75, ease: 'power2.inOut' },
        33.6,
      )
      .to(
        q('.mv-coord-card-right'),
        { autoAlpha: 0, x: 35, filter: 'blur(10px)', duration: 0.75, ease: 'power2.inOut' },
        33.6,
      )
      .to(
        q('.mv-dual-coord-header, .mv-coord-divider'),
        { autoAlpha: 0, filter: 'blur(8px)', duration: 0.65, ease: 'power2.inOut' },
        33.7,
      )
      .to(
        q('.mv-dual-coordinators'),
        { autoAlpha: 0, duration: 0.6 },
        33.9,
      )
      .set(q('.mv-dual-coordinators'), { autoAlpha: 0 }, 34.5);

    // ========================================================================
    // ACT 2: POST-CREDITS STINGER / TEASER (34.8s - 45.0s)
    // Generous 10.2s duration — dramatic, unhurried, breathtaking finale
    // ========================================================================
    tl.set(q('.mv-post-credits'), { autoAlpha: 1 }, 34.8)
      .fromTo(
        q('.mv-stinger-quote'),
        { autoAlpha: 0, y: 16, filter: 'blur(6px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power2.out' },
        35.1,
      )
      
      // Reveal Image 1 (Veera Raghavan) cleanly - NO ZOOM IN OR ZOOM OUT!
      .fromTo(
        q('.mv-char-portal'),
        { autoAlpha: 0, filter: 'blur(10px)' },
        { autoAlpha: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power2.out', onStart: () => playImpactHit(65) },
        36.8,
      )

      // ======================================================================
      // THE AGGRESSIVE FULL-SCREEN SCREEN EFFECT (TRANSITION HAPPENS ONLY ONCE!)
      // ======================================================================
      // 1. Dual-oscillator seismic sonic boom
      .add(() => playImpactHit(160, true), 39.5)

      // 2. Violent camera tremor on entire screen container
      .to(q('.mv-screen-container'), {
        keyframes: [
          { x: -22, y: 15, duration: 0.035 },
          { x: 20, y: -16, duration: 0.035 },
          { x: -16, y: 11, duration: 0.04 },
          { x: 12, y: -9, duration: 0.04 },
          { x: -7, y: 5, duration: 0.045 },
          { x: 0, y: 0, duration: 0.06 },
        ],
        ease: 'power2.out',
      }, 39.5)

      // 3. Fullscreen Blinding EMP Shockwave
      .fromTo(
        q('.mv-fullscreen-shockwave'),
        { autoAlpha: 0, scale: 0.7 },
        { autoAlpha: 1, scale: 1.4, duration: 0.08, ease: 'power4.in' },
        39.5,
      )
      .to(
        q('.mv-fullscreen-shockwave'),
        { autoAlpha: 0, duration: 0.7, ease: 'power2.out' },
        39.58,
      )

      // 4. Fullscreen Anamorphic Flare Beam
      .fromTo(
        q('.mv-fullscreen-beam'),
        { scaleX: 0, autoAlpha: 0 },
        { scaleX: 2.8, autoAlpha: 1, duration: 0.1, ease: 'power3.out' },
        39.5,
      )
      .to(
        q('.mv-fullscreen-beam'),
        { autoAlpha: 0, duration: 0.55, ease: 'power2.out' },
        39.6,
      )

      // 5. Fullscreen Chromatic Glitch Wave
      .fromTo(
        q('.mv-fullscreen-glitch'),
        { autoAlpha: 0 },
        { autoAlpha: 0.95, duration: 0.05 },
        39.5,
      )
      .to(
        q('.mv-fullscreen-glitch'),
        { autoAlpha: 0, duration: 0.3 },
        39.55,
      )

      // 6. IMAGE 1 BLENDS INTO IMAGE 2 (ONLY ONCE! NO ZOOM! NO LOOP!)
      .to(q('.mv-char-img1'), { autoAlpha: 0, duration: 0.35, ease: 'power2.inOut' }, 39.52)
      .to(q('.mv-char-img2'), { autoAlpha: 1, duration: 0.35, ease: 'power2.inOut' }, 39.52)

      // 7. Title Slam & Specular Sheen (Screen stabilizes firmly on Image 2)
      .fromTo(
        q('.mv-stinger-reveal'),
        { autoAlpha: 0, scale: 1.35, filter: 'blur(14px)' },
        { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power4.out', onStart: () => playImpactHit(105) },
        40.6,
      )
      .to(q('.mv-screen-container'), {
        keyframes: [
          { x: -10, y: 7, duration: 0.04 },
          { x: 9, y: -8, duration: 0.04 },
          { x: -5, y: 4, duration: 0.05 },
          { x: 0, y: 0, duration: 0.06 },
        ],
      }, 40.6)
      .fromTo(q('.mv-stinger-protocol'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 41.5)
      .fromTo(q('.mv-stinger-actions'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 42.3);

    return tl;
  }, [playBraaam, playImpactHit]);

  // Initialize Timeline on load
  useEffect(() => {
    if (loading || !rootRef.current || tlRef.current) return;
    const node = rootRef.current;
    const q = gsap.utils.selector(node);

    tlRef.current = buildTimeline(node);
    tlRef.current.play();

    // Initial state for character frames (clean, fixed scale: 1, NO zoom, NO loop)
    gsap.set(q('.mv-char-img1'), { autoAlpha: 1 });
    gsap.set(q('.mv-char-img2'), { autoAlpha: 0 });

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
  }, [loading, buildTimeline]);

  const handleReplay = () => {
    setSequenceDone(false);
    tlRef.current?.restart();
    if (!audioEnabled) initAudio();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#010002', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 44, height: 44, border: '3px solid rgba(239,68,68,0.2)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: '#ef4444', fontFamily: 'monospace', letterSpacing: 4, fontSize: 13, fontWeight: 700 }}>
          INITIALIZING CINEMA TRANSMISSION...
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
      onMouseMove={handleMouseMove}
      style={{
        position: 'fixed', inset: 0, background: '#010002', overflow: 'hidden', zIndex: 9999,
        fontFamily: "'Rajdhani', sans-serif", color: '#fff',
      }}
    >
      {/* Background Starfield & Embers Canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} />

      {/* 35mm Subtle Cinema Film Grain Texture */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3, opacity: 0.22,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 0)',
          backgroundSize: '3px 3px',
        }}
      />

      {/* Cinema Screen Top Projector Light Cone Bloom */}
      <div
        style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '75%', height: '35%', pointerEvents: 'none', zIndex: 4,
          background: 'radial-gradient(ellipse at top, rgba(239,68,68,0.08) 0%, rgba(220,38,38,0.02) 45%, transparent 70%)',
        }}
      />

      {/* Hollywood 2.39:1 Cinema Scope Letterbox Bars */}
      <div
        className="mv-letterbox-top"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '6.5vh',
          background: '#000', zIndex: 45, pointerEvents: 'none',
          boxShadow: '0 4px 25px rgba(0,0,0,0.95)',
        }}
      />
      <div
        className="mv-letterbox-bottom"
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '6.5vh',
          background: '#000', zIndex: 45, pointerEvents: 'none',
          boxShadow: '0 -4px 25px rgba(0,0,0,0.95)',
        }}
      />

      {/* Discreet Minimal Floating Cinema Controls (Top Right) */}
      <div
        style={{
          position: 'absolute', top: '7.5vh', right: 24, zIndex: 60,
          display: 'flex', alignItems: 'center', gap: 10,
          opacity: 0.35, transition: 'opacity 0.25s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.35')}
      >
        <button
          onClick={toggleAudio}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px',
            background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 20,
            color: audioEnabled ? '#f87171' : '#94a3b8', fontSize: 11, fontWeight: 800,
            fontFamily: 'monospace', cursor: 'pointer',
          }}
          title="Toggle Cinematic Audio"
        >
          {audioEnabled ? <Volume2 size={13} color="#ef4444" /> : <VolumeX size={13} />}
          <span>{audioEnabled ? 'SOUND ON' : 'MUTED'}</span>
        </button>

        <Link
          href="/dashboard"
          style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px',
            background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 20,
            color: '#cbd5e1', fontSize: 11, fontWeight: 800,
            fontFamily: 'monospace', textDecoration: 'none', letterSpacing: 1,
          }}
        >
          <ArrowLeft size={12} /> EXIT
        </Link>
      </div>

      {/* MASTER SCREEN CONTAINER (Tremors & Shakes on Impacts) */}
      <div className="mv-screen-container" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        
        {/* 3D Parallax Tilt World */}
        <div className="mv-tilt-world" style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>

          {/* Fullscreen EMP Shockwave Flash for Character Transition */}
          <div
            className="mv-fullscreen-shockwave"
            style={{
              position: 'absolute', inset: 0, zIndex: 35, pointerEvents: 'none', opacity: 0,
              background: 'radial-gradient(circle at center, #ffffff 0%, rgba(254,202,202,0.95) 20%, rgba(239,68,68,0.85) 50%, rgba(153,27,27,0.5) 75%, transparent 100%)',
              mixBlendMode: 'screen',
            }}
          />

          {/* Fullscreen Anamorphic Lens Flare Beam */}
          <div
            className="mv-fullscreen-beam"
            style={{
              position: 'absolute', top: '50%', left: '-50%', width: '200%', height: 18,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 30%, #ef4444 50%, rgba(255,255,255,0.95) 70%, transparent 100%)',
              boxShadow: '0 0 65px 30px rgba(239,68,68,0.95), 0 0 130px 60px rgba(255,100,100,0.7)',
              transform: 'translateY(-50%)', zIndex: 36, pointerEvents: 'none', opacity: 0,
            }}
          />

          {/* Fullscreen Chromatic Glitch Wave */}
          <div
            className="mv-fullscreen-glitch"
            style={{
              position: 'absolute', inset: 0, zIndex: 34, pointerEvents: 'none', opacity: 0,
              background: 'repeating-linear-gradient(0deg, rgba(255,0,0,0.25) 0px, rgba(0,255,255,0.25) 2px, transparent 3px, transparent 6px)',
              mixBlendMode: 'color-dodge',
            }}
          />

          {/* ================================================================== */}
          {/* ACT 0A: CINEMATIC EVENT COMPLETION OVERLAY (0.0s - 2.0s) */}
          {/* ================================================================== */}
          <div
            className="mv-act0-completion"
            style={{
              position: 'absolute', inset: 0, zIndex: 30,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', padding: '0 24px', pointerEvents: 'none', opacity: 0,
            }}
          >
            {/* Defusal Status Indicator */}
            <div
              className="mv-act0-badge"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 22px',
                background: 'rgba(239,68,68,0.22)',
                borderRadius: 999, marginBottom: 16, boxShadow: '0 0 25px rgba(239,68,68,0.4)',
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 12px #10b981', animation: 'dpulse 1s infinite' }} />
            </div>

            {/* Blockbuster Title Slam */}
            <div
              className="mv-act0-title font-heading-tactical"
              style={{
                fontSize: 'clamp(38px, 7vw, 86px)', fontWeight: 900, letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'linear-gradient(180deg, #ffffff 25%, #fca5a5 60%, #ef4444 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 55px rgba(239,68,68,0.85))',
              }}
            >
              EVENT COMPLETED
            </div>

            <div
              className="mv-act0-subtitle"
              style={{
                color: '#e2e8f0', fontSize: 'clamp(15px, 2.4vw, 24px)', fontWeight: 700,
                letterSpacing: 4, marginTop: 12, textTransform: 'uppercase',
              }}
            >
              EAST COAST MALL SECURED
            </div>

            <div
              className="mv-act0-callout"
              style={{
                color: '#ef4444', fontSize: 'clamp(12px, 1.8vw, 15px)', fontFamily: 'monospace', fontWeight: 800,
                letterSpacing: 6, marginTop: 14,
              }}
            >
              1,200 HOSTAGES EVACUATED
            </div>
          </div>

          {/* ================================================================== */}
          {/* ACT 0B: FULL CENTER COLD OPEN TITLE & WINNER COMMENDATION (2.0s - 5.5s) */}
          {/* ================================================================== */}
          <div
            className="mv-full-center-title"
            style={{
              position: 'absolute', inset: 0, zIndex: 28, pointerEvents: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', textAlign: 'center', padding: '0 24px', opacity: 0,
            }}
          >
            {/* The Extraction Title & Shockwave Ring (Full Center) */}
            <div
              className="mv-center-title-block"
              style={{
                position: 'absolute', display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center', opacity: 0, width: '100%',
              }}
            >
              <div
                className="mv-shockwave-ring"
                style={{
                  position: 'absolute', width: 120, height: 120, borderRadius: '50%',
                  border: '3px solid #ef4444', boxShadow: '0 0 80px 25px rgba(239,68,68,0.7)',
                }}
              />
              <div
                className="font-heading-tactical"
                style={{
                  fontSize: 'clamp(42px, 7.5vw, 92px)', fontWeight: 900,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: 'linear-gradient(180deg, #ffffff 20%, #fca5a5 60%, #ef4444 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 45px rgba(239,68,68,0.75))',
                }}
              >
                THE EXTRACTION
              </div>
              <div style={{ color: '#fca5a5', fontSize: 12, letterSpacing: 6, fontWeight: 800, fontFamily: 'monospace', marginTop: 12 }}>
                CTF CYBER DEFENSE INITIATIVE
              </div>
            </div>

            {/* Winner Commendation (Full Center) */}
            <div
              className="mv-center-winner-block"
              style={{
                position: 'absolute', display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center', opacity: 0, width: '100%',
              }}
            >
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(239,68,68,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, boxShadow: '0 0 40px rgba(239,68,68,0.6)' }}>
                <Award size={36} color="#fbbf24" />
              </div>
              <div style={{ color: '#ef4444', fontSize: 11, letterSpacing: 5, fontWeight: 800, fontFamily: 'monospace' }}>
                MISSION CITATION // 1ST PLACE
              </div>
              <div className="font-heading-tactical" style={{ fontSize: 'clamp(32px, 5.5vw, 56px)', fontWeight: 900, color: '#fff', letterSpacing: '0.06em', margin: '8px 0' }}>
                {winnerName}
              </div>
              <div style={{ color: '#fbbf24', fontSize: 14, fontWeight: 800, fontFamily: 'monospace', letterSpacing: 2 }}>
                VICTORY PROTOCOL SECURED // {topScore} PTS
              </div>
            </div>
          </div>

          {/* ================================================================== */}
          {/* ACT 1A: SPLIT-SCREEN CREDITS & CAST (5.5s - 17.5s) */}
          {/* Text starts scrolling IMMEDIATELY with characters (NO empty gap!) */}
          {/* ================================================================== */}
          <div
            className="mv-split-credits"
            style={{
              position: 'absolute', inset: 0, display: 'flex', zIndex: 10, opacity: 0,
            }}
          >
            {/* LEFT COLUMN: Inset from screen edge, zero dead space (~46% width) */}
            <div
              style={{
                width: '46%', height: '100%', position: 'relative', overflow: 'hidden',
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
              }}
            >
              <div
                className="mv-scroll-track"
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  paddingLeft: 'clamp(44px, 7vw, 96px)',
                  paddingRight: 'clamp(20px, 3vw, 40px)',
                  maxWidth: 520,
                  textAlign: 'left',
                  display: 'flex', flexDirection: 'column', gap: 34,
                }}
              >
                {/* Title Header */}
                <div>
                  <div style={{ color: '#ef4444', fontSize: 11, letterSpacing: 4, fontWeight: 800, fontFamily: 'monospace' }}>
                    PRESENTED BY
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 13, letterSpacing: 2, fontWeight: 700, marginTop: 2 }}>
                    DEPARTMENT OF COMPUTER APPLICATIONS
                  </div>
                  <div className="font-heading-tactical" style={{ color: '#fff', fontSize: 'clamp(28px, 3.4vw, 38px)', fontWeight: 900, letterSpacing: 2, marginTop: 8 }}>
                    THE EXTRACTION
                  </div>
                </div>

                {/* Honorary Leadership & Patrons */}
                <div>
                  <div style={{ color: '#ef4444', fontSize: 11, letterSpacing: 3, fontWeight: 800, fontFamily: 'monospace', marginBottom: 10 }}>
                    HONORARY PATRONS & LEADERSHIP
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {PATRONS_AND_LEADERSHIP.map(p => (
                      <div
                        key={p.name}
                        style={{
                          padding: '8px 12px',
                          background: 'rgba(255,255,255,0.03)',
                          borderLeft: `3px solid ${p.accent}`,
                          borderRadius: 4,
                        }}
                      >
                        <div style={{ color: p.accent, fontSize: 10, fontFamily: 'monospace', letterSpacing: 2, fontWeight: 800 }}>
                          {p.role}
                        </div>
                        <div style={{ color: '#fff', fontSize: 16, fontWeight: 900, letterSpacing: '0.04em', marginTop: 2 }}>
                          {p.name}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>
                          {p.dept}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Student Volunteer Corps with Non-Technical Roles */}
                <div>
                  <div style={{ color: '#ef4444', fontSize: 11, letterSpacing: 3, fontWeight: 800, fontFamily: 'monospace', marginBottom: 10 }}>
                    STUDENT VOLUNTEER CORPS ({VOLUNTEERS.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 12px', maxWidth: 480 }}>
                    {VOLUNTEERS.map(v => (
                      <div
                        key={v.name}
                        style={{
                          padding: '7px 10px',
                          background: 'rgba(255,255,255,0.03)',
                          borderLeft: '2px solid rgba(239,68,68,0.5)',
                          borderRadius: 4,
                        }}
                      >
                        <div style={{ color: '#ffffff', fontSize: 13, fontWeight: 700, letterSpacing: '0.02em' }}>
                          {v.name}
                        </div>
                        <div style={{ color: '#fca5a5', fontSize: 10, fontFamily: 'monospace', letterSpacing: 0.5, marginTop: 2, lineHeight: 1.3 }}>
                          {v.role}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Champions Citation */}
                <div>
                  <div style={{ color: '#ef4444', fontSize: 11, letterSpacing: 3, fontWeight: 800, fontFamily: 'monospace', marginBottom: 6 }}>
                    CHAMPIONS // 1ST PLACE
                  </div>
                  <div style={{ color: '#fbbf24', fontSize: 22, fontWeight: 900, letterSpacing: 1.5 }}>
                    {winnerName}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'monospace', marginTop: 3 }}>
                    FINAL SCORE: {topScore} PTS
                  </div>
                </div>

                {/* Participating Teams (Compact Summary) */}
                {operatives.length > 0 && (
                  <div>
                    <div style={{ color: '#ef4444', fontSize: 11, letterSpacing: 3, fontWeight: 800, fontFamily: 'monospace', marginBottom: 8 }}>
                      PARTICIPATING TEAMS ({operatives.length})
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', maxWidth: 440 }}>
                      {operatives.map((op, idx) => (
                        <div key={idx} style={{ color: '#cbd5e1', fontSize: 12, fontFamily: 'monospace' }}>
                          {op.name} <span style={{ color: '#ef4444', fontWeight: 700 }}>({op.points} pts)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Thanks & Dramatic Adjusted Statement */}
                <div style={{ maxWidth: 480 }}>
                  <div
                    style={{
                      padding: '14px 18px',
                      background: 'linear-gradient(135deg, rgba(239,68,68,0.14) 0%, rgba(15,23,42,0.65) 100%)',
                      borderRadius: 10,
                      border: '1px solid rgba(239,68,68,0.3)',
                      boxShadow: '0 0 25px rgba(239,68,68,0.12)',
                    }}
                  >
                    <div style={{ color: '#fca5a5', fontSize: 10, letterSpacing: 3, fontWeight: 800, fontFamily: 'monospace', marginBottom: 6 }}>
                      // SPECIAL MESSAGE FROM CENTRAL COMMAND //
                    </div>
                    <div
                      style={{
                        color: '#f8fafc',
                        fontSize: 'clamp(12px, 1.3vw, 13.5px)',
                        lineHeight: 1.6,
                        fontStyle: 'italic',
                        fontWeight: 600,
                        letterSpacing: '0.01em',
                      }}
                    >
                      &ldquo;If we started giving thanks to every single person who made this possible, this credit reel would literally never end. So please adjust — and consider this an eternal salute and heartfelt thank you to each and every one of you!&rdquo;
                    </div>
                    <div style={{ color: '#ef4444', fontSize: 11, fontFamily: 'monospace', fontWeight: 800, letterSpacing: 2, marginTop: 8, textAlign: 'right' }}>
                      — ORGANIZING COMMITTEE &hearts;
                    </div>
                  </div>
                </div>

                {/* Closing Note */}
                <div style={{ paddingBottom: 100 }}>
                  <div style={{ color: '#64748b', fontSize: 11, letterSpacing: 3, fontFamily: 'monospace' }}>
                    DEPARTMENT OF COMPUTER APPLICATIONS
                  </div>
                  <div style={{ color: '#ef4444', fontSize: 15, letterSpacing: 2, fontWeight: 900, fontFamily: 'monospace', marginTop: 4 }}>
                    THANK YOU FOR PARTICIPATING!
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: 4 Cast Operatives (~54% width) */}
            <div
              style={{
                width: '54%', height: '100%', position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {/* Cast Operatives (Borderless Portraits with Dark Feathering) */}
              {CAST.map((c, i) => (
                <div
                  key={c.name}
                  className={`mv-reel-cast-${i}`}
                  style={{
                    position: 'absolute', opacity: 0, display: 'flex', alignItems: 'center',
                    gap: 32, maxWidth: 540, width: '90%', zIndex: 10,
                  }}
                >
                  <div style={{ position: 'relative', width: 220, height: 290, flexShrink: 0, overflow: 'hidden' }}>
                    <img
                      src={c.img}
                      alt={c.name}
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        maskImage: 'radial-gradient(circle at center, black 50%, transparent 92%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, black 50%, transparent 92%)',
                      }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle, ${c.accent}26 0%, transparent 70%)`, pointerEvents: 'none' }} />
                  </div>
                  <div>
                    <div style={{ color: c.accent, fontSize: 11, fontFamily: 'monospace', letterSpacing: 3, fontWeight: 800 }}>
                      {c.callsign}
                    </div>
                    <div className="font-heading-tactical" style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: '#fff', letterSpacing: '0.06em', margin: '4px 0' }}>
                      {c.name}
                    </div>
                    <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 800, fontFamily: 'monospace', letterSpacing: 1 }}>
                      {c.role}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5, marginTop: 8 }}>
                      {c.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================================================================== */}
          {/* ACT 1B: DUAL CHIEF COORDINATORS GRAND CENTER SHOWCASE (18.0s - 24.5s) */}
          {/* "make this again in center one coordinator in left and other one in right side, */}
          {/* make it like one technical another team management" */}
          {/* ================================================================== */}
          <div
            className="mv-dual-coordinators"
            style={{
              position: 'absolute', inset: 0, zIndex: 26, pointerEvents: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '0 clamp(16px, 4vw, 48px)', opacity: 0,
            }}
          >
            {/* Anamorphic Horizon Flare Sweep across Center for Scene Entrance */}
            <div
              className="mv-coord-horizon-flare"
              style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '180vw', height: 2, pointerEvents: 'none', zIndex: 1, opacity: 0,
                background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.8) 30%, #ffffff 50%, rgba(251,113,133,0.8) 70%, transparent)',
                boxShadow: '0 0 35px 8px rgba(255,255,255,0.7)',
              }}
            />

            {/* Inner dynamic motion container (continuous cinematic slow push) */}
            <div
              className="mv-dual-inner"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                width: '100%', maxWidth: 1180, position: 'relative', zIndex: 2,
              }}
            >
              {/* Top Header Badge */}
              <div
                className="mv-dual-coord-header"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'clamp(20px, 3vh, 32px)', opacity: 0, textAlign: 'center',
                }}
              >
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  color: '#ef4444', fontSize: 11, letterSpacing: 4, fontWeight: 800, fontFamily: 'monospace',
                  padding: '4px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: 20, border: '1px solid rgba(239,68,68,0.25)',
                }}>
                  <Award size={13} style={{ color: '#ef4444' }} /> CENTRAL COMMAND & EVENT DIRECTION
                </div>
                <div className="font-heading-tactical" style={{
                  color: '#fff', fontSize: 'clamp(26px, 4.2vw, 44px)', fontWeight: 900, letterSpacing: '0.08em', marginTop: 8,
                  textShadow: '0 0 30px rgba(239,68,68,0.35)',
                }}>
                  CHIEF EVENT COORDINATORS
                </div>
                <div style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'monospace', letterSpacing: 2, marginTop: 4 }}>
                  TECHNICAL ARCHITECTURE &bull; EVENT OPERATIONS
                </div>
              </div>

              {/* Dual Hero Cards (Side-by-Side in Screen Center) */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 'clamp(28px, 5vw, 68px)', width: '100%',
                }}
              >
                {/* ------------------------------------------------------------- */}
                {/* COORDINATOR 1: TECHNICAL LEAD (LEFT) - TINO BRITTY */}
                {/* ------------------------------------------------------------- */}
                <div
                  className="mv-coord-card-left"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'clamp(18px, 2.5vw, 28px)',
                    flex: 1, maxWidth: 520, opacity: 0, position: 'relative',
                  }}
                >
                  {/* Ambient Cybernetic Blue Glow Backdrop */}
                  <div
                    style={{
                      position: 'absolute', top: '50%', left: '30%', transform: 'translate(-50%, -50%)',
                      width: 280, height: 280, borderRadius: '50%', pointerEvents: 'none',
                      background: 'radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)',
                      filter: 'blur(20px)', zIndex: 0,
                    }}
                  />

                  {/* Borderless Portrait with Soft Edge Radial Feathering */}
                  <div style={{
                    position: 'relative',
                    width: 'clamp(160px, 17vw, 215px)',
                    height: 'clamp(230px, 24vw, 305px)',
                    flexShrink: 0, overflow: 'hidden', zIndex: 1,
                  }}>
                    <img
                      src={COORDINATORS[0].image}
                      alt={COORDINATORS[0].name}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== COORDINATORS[0].fallbackImage) target.src = COORDINATORS[0].fallbackImage;
                      }}
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%',
                        maskImage: 'radial-gradient(circle at center, black 55%, transparent 92%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, black 55%, transparent 92%)',
                      }}
                    />
                    {/* Glowing Cyan Floor Reflection Beam */}
                    <div style={{
                      position: 'absolute', bottom: 12, left: '-25%', right: '-25%', height: 2,
                      background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                      boxShadow: '0 0 16px 2px #38bdf8', filter: 'blur(1px)',
                    }} />
                  </div>

                  {/* Technical Coordinator Details */}
                  <div style={{ zIndex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      color: '#38bdf8', fontSize: 10, fontFamily: 'monospace', letterSpacing: 2, fontWeight: 800,
                      padding: '3px 10px', background: 'rgba(56,189,248,0.12)', borderRadius: 20,
                      border: '1px solid rgba(56,189,248,0.3)', marginBottom: 8,
                    }}>
                      <Cpu size={12} /> {COORDINATORS[0].roleTag}
                    </div>
                    <div className="font-heading-tactical" style={{
                      fontSize: 'clamp(24px, 3.2vw, 38px)', fontWeight: 900, color: '#fff',
                      letterSpacing: '0.06em', lineHeight: 1.1, margin: '2px 0 6px',
                      textShadow: '0 0 25px rgba(56,189,248,0.35)',
                    }}>
                      {COORDINATORS[0].name}
                    </div>
                    <div style={{ color: '#38bdf8', fontSize: 13, fontWeight: 800, fontFamily: 'monospace', letterSpacing: 1.5 }}>
                      {COORDINATORS[0].title}
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: 12, fontFamily: 'monospace', marginTop: 6, lineHeight: 1.4 }}>
                      {COORDINATORS[0].dept}
                    </div>
                    <div style={{ color: '#64748b', fontSize: 11, fontFamily: 'monospace', marginTop: 4, letterSpacing: 1 }}>
                      {COORDINATORS[0].highlight}
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* CENTER GLOWING VERTICAL DIVIDER WITH ENERGY CORE */}
                {/* ------------------------------------------------------------- */}
                <div
                  className="mv-coord-divider"
                  style={{
                    position: 'relative', width: 2, height: 'clamp(180px, 22vw, 260px)',
                    background: 'linear-gradient(180deg, transparent, #38bdf8 25%, #ffffff 50%, #fb7185 75%, transparent)',
                    boxShadow: '0 0 14px rgba(255,255,255,0.5)', opacity: 0, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <div style={{
                    position: 'absolute', width: 8, height: 8, borderRadius: '50%',
                    background: '#fff', boxShadow: '0 0 16px 4px rgba(255,255,255,0.9)',
                  }} />
                </div>

                {/* ------------------------------------------------------------- */}
                {/* COORDINATOR 2: TEAM MANAGEMENT / OPERATIONS (RIGHT) - SRINITHI */}
                {/* ------------------------------------------------------------- */}
                <div
                  className="mv-coord-card-right"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'clamp(18px, 2.5vw, 28px)',
                    flex: 1, maxWidth: 520, opacity: 0, position: 'relative',
                  }}
                >
                  {/* Ambient Rose / Crimson Glow Backdrop */}
                  <div
                    style={{
                      position: 'absolute', top: '50%', left: '30%', transform: 'translate(-50%, -50%)',
                      width: 280, height: 280, borderRadius: '50%', pointerEvents: 'none',
                      background: 'radial-gradient(circle, rgba(251,113,133,0.18) 0%, transparent 70%)',
                      filter: 'blur(20px)', zIndex: 0,
                    }}
                  />

                  {/* Borderless Portrait with Soft Edge Radial Feathering */}
                  <div style={{
                    position: 'relative',
                    width: 'clamp(160px, 17vw, 215px)',
                    height: 'clamp(230px, 24vw, 305px)',
                    flexShrink: 0, overflow: 'hidden', zIndex: 1,
                  }}>
                    <img
                      src={COORDINATORS[1].image}
                      alt={COORDINATORS[1].name}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== COORDINATORS[1].fallbackImage) target.src = COORDINATORS[1].fallbackImage;
                      }}
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%',
                        maskImage: 'radial-gradient(circle at center, black 55%, transparent 92%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, black 55%, transparent 92%)',
                      }}
                    />
                    {/* Glowing Rose Floor Reflection Beam */}
                    <div style={{
                      position: 'absolute', bottom: 12, left: '-25%', right: '-25%', height: 2,
                      background: 'linear-gradient(90deg, transparent, #fb7185, transparent)',
                      boxShadow: '0 0 16px 2px #fb7185', filter: 'blur(1px)',
                    }} />
                  </div>

                  {/* Operations Coordinator Details */}
                  <div style={{ zIndex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      color: '#fb7185', fontSize: 10, fontFamily: 'monospace', letterSpacing: 2, fontWeight: 800,
                      padding: '3px 10px', background: 'rgba(251,113,133,0.12)', borderRadius: 20,
                      border: '1px solid rgba(251,113,133,0.3)', marginBottom: 8,
                    }}>
                      <Users size={12} /> {COORDINATORS[1].roleTag}
                    </div>
                    <div className="font-heading-tactical" style={{
                      fontSize: 'clamp(24px, 3.2vw, 38px)', fontWeight: 900, color: '#fff',
                      letterSpacing: '0.06em', lineHeight: 1.1, margin: '2px 0 6px',
                      textShadow: '0 0 25px rgba(251,113,133,0.35)',
                    }}>
                      {COORDINATORS[1].name}
                    </div>
                    <div style={{ color: '#fb7185', fontSize: 13, fontWeight: 800, fontFamily: 'monospace', letterSpacing: 1.5 }}>
                      {COORDINATORS[1].title}
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: 12, fontFamily: 'monospace', marginTop: 6, lineHeight: 1.4 }}>
                      {COORDINATORS[1].dept}
                    </div>
                    <div style={{ color: '#64748b', fontSize: 11, fontFamily: 'monospace', marginTop: 4, letterSpacing: 1 }}>
                      {COORDINATORS[1].highlight}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================== */}
          {/* ACT 2: MARVEL CINEMATIC POST-CREDITS FINALE (VEERA RAGHAVAN) */}
          {/* ================================================================== */}
          <div
            className="mv-post-credits"
            style={{
              position: 'absolute', inset: 0, opacity: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 14, zIndex: 20, padding: '24px 16px', textAlign: 'center',
            }}
          >
            {/* Ambient red halo aura */}
            <div
              style={{
                position: 'absolute', width: 550, height: 550, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(153,27,27,0.06) 45%, transparent 70%)',
                filter: 'blur(50px)', pointerEvents: 'none', animation: 'auraPulse 4s ease-in-out infinite alternate',
              }}
            />

            {/* Cinema Dialogue / Quote */}
            <div
              className="mv-stinger-quote"
              style={{
                maxWidth: 640, color: '#fca5a5', fontSize: 'clamp(16px, 2.4vw, 22px)',
                fontStyle: 'italic', fontWeight: 600, lineHeight: 1.45,
                textShadow: '0 0 25px rgba(239,68,68,0.6)', zIndex: 2,
                letterSpacing: '0.04em',
              }}
            >
              "You neutralized one sleeper cell in Chennai. But the syndicate... is worldwide."
            </div>

            {/* Borderless Character Portal (NO zoom in or zoom out!) */}
            <div
              className="mv-char-portal"
              style={{
                position: 'relative',
                width: 'clamp(240px, 30vw, 330px)',
                height: 'clamp(240px, 30vw, 330px)',
                overflow: 'hidden',
                zIndex: 2,
                margin: '6px 0',
                maskImage: 'radial-gradient(circle at center, black 58%, transparent 95%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 58%, transparent 95%)',
              }}
            >
              {/* Blending Character Frames (Single transition on shockwave beat, NO zoom in/out, NO loop) */}
              <img
                src="/images/credits/end1.png"
                alt="Veera Raghavan Frame 1"
                className="mv-char-img1"
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center 20%', zIndex: 1,
                }}
              />
              <img
                src="/images/credits/end2.png"
                alt="Veera Raghavan Frame 2"
                className="mv-char-img2"
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center 20%', zIndex: 2,
                  opacity: 0,
                }}
              />
            </div>

            {/* Blockbuster Reveal Title & Protocol */}
            <div style={{ marginTop: 2, zIndex: 2 }}>
              <div
                className="mv-stinger-reveal mv-title-specular font-heading-tactical"
                style={{
                  fontSize: 'clamp(24px, 5.2vw, 54px)', fontWeight: 900, letterSpacing: '0.14em',
                  background: 'linear-gradient(180deg, #ffffff 25%, #fca5a5 65%, #ef4444 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 35px rgba(239,68,68,0.85))',
                }}
              >
                VEERA RAGHAVAN WILL RETURN
              </div>

              <div className="mv-stinger-protocol" style={{ color: '#ef4444', fontSize: 'clamp(11px, 2vw, 13px)', letterSpacing: 6, fontFamily: 'monospace', fontWeight: 800, marginTop: 6 }}>
                IN OPERATION: RED PROTOCOL
              </div>
            </div>

            {/* Final Action Buttons */}
            <div className="mv-stinger-actions" style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center', zIndex: 2 }}>
              <button
                onClick={handleReplay}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px',
                  background: 'rgba(239,68,68,0.18)', border: 'none',
                  borderRadius: 24, color: '#fee2e2', fontSize: 12, fontWeight: 800,
                  fontFamily: 'monospace', letterSpacing: 2, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <RotateCcw size={14} /> REPLAY FINALE
              </button>

              <Link
                href="/dashboard"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 26px',
                  background: 'linear-gradient(135deg, #991b1b, #ef4444)',
                  borderRadius: 24, color: '#fff', fontSize: 12, fontWeight: 800,
                  fontFamily: 'monospace', letterSpacing: 2, textDecoration: 'none',
                  boxShadow: '0 0 25px rgba(220,38,38,0.5)',
                  transition: 'all 0.2s ease',
                }}
              >
                RETURN TO BASE
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dpulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.35; transform: scale(0.9); } }
        @keyframes auraPulse { 0% { opacity: 0.25; transform: scale(0.95); } 100% { opacity: 0.65; transform: scale(1.06); } }
        @keyframes shineSheen {
          0% { transform: translateX(-150%) skewX(-25deg); }
          35%, 100% { transform: translateX(250%) skewX(-25deg); }
        }
        .mv-title-specular {
          position: relative;
          overflow: hidden;
        }
        .mv-title-specular::after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 40%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent);
          animation: shineSheen 4s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

export default function CreditsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#010002', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontFamily: 'monospace' }}>
        LOADING CINEMATIC FINALE...
      </div>
    }>
      <CreditsContent />
    </Suspense>
  );
}
