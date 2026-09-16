'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import Link from 'next/link';
import { api } from '@/lib/api';

// ============================================================================
// CREDITS — fully data-driven, edit here (no code changes needed elsewhere).
// The "OPERATIVES" roll below is generated live from the real scoreboard —
// nothing about who competed is hardcoded.
// ============================================================================
const COORDINATORS = ['Tino Britty', 'Srinithi'];
// Add volunteer names here as plain strings, e.g. ['Name One', 'Name Two']
const VOLUNTEERS: string[] = [];

const CHAR = (name: string) => `/images/characters/${name}.webp`;

const CAST = [
  { name: 'VEERA RAGHAVAN', role: 'Special Operative', img: CHAR('veera_relieved') },
  { name: 'PREETHI', role: 'Signals Intelligence', img: CHAR('preethi_hopeful') },
  { name: 'NSA ALTHAF', role: 'Field Commander', img: CHAR('althaf_commanding') },
  { name: 'UMAR SAIF', role: 'Hostile Operative', img: CHAR('umar_threatening') },
];

const TOTAL_DURATION = 45; // seconds, matches the requested runtime

export default function VictoryPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [skipped, setSkipped] = useState(false);
  const [sequenceDone, setSequenceDone] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    (async () => {
      try {
        const [state, board] = await Promise.all([
          api.game.getState().catch(() => null),
          api.getScoreboard().catch(() => []),
        ]);
        setGameState(state);
        setTeams(Array.isArray(board) ? board : []);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const winnerName = gameState?.winnerTeamName || 'THE EXTRACTION TEAM';
  const finalOutcome = gameState?.finalOutcome || 'CITY_SAVED';
  const storyEnded = Boolean(gameState?.storyEnded);

  const operatives = teams
    .slice()
    .sort((a, b) => (b.totalPoints ?? b.points ?? 0) - (a.totalPoints ?? a.points ?? 0))
    .map(t => t.teamName)
    .filter(Boolean);

  const buildTimeline = useCallback((node: HTMLDivElement) => {
    const q = gsap.utils.selector(node);
    const tl = gsap.timeline({ paused: true, onComplete: () => setSequenceDone(true) });

    // ---- SCENE 1: Marvel-style title flash (0s - 8s) ----
    tl.set(q('.vx-scene1'), { autoAlpha: 1 })
      .fromTo(q('.vx-flash'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, 0.3)
      .to(q('.vx-flash'), { autoAlpha: 0, duration: 0.6 }, 0.45)
      .fromTo(
        q('.vx-title-main'),
        { scale: 3.2, autoAlpha: 0, filter: 'blur(20px)' },
        { scale: 1, autoAlpha: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power4.out' },
        0.35,
      )
      .fromTo(q('.vx-title-sub'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 1.4)
      .fromTo(q('.vx-ring'), { scale: 0, autoAlpha: 0.9 }, { scale: 8, autoAlpha: 0, duration: 2.2, ease: 'power2.out' }, 0.35)
      .to(q('.vx-title-main, .vx-title-sub'), { autoAlpha: 1 }, 3)
      .to(q('.vx-scene1'), { autoAlpha: 0, duration: 0.8 }, 6.6)
      .set(q('.vx-scene1'), { autoAlpha: 0 }, 7.4);

    // ---- SCENE 2: Winner announcement (8s - 16s) ----
    tl.set(q('.vx-scene2'), { autoAlpha: 1 }, 7.5)
      .fromTo(q('.vx-winner-portrait'), { autoAlpha: 0, scale: 1.15 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, 7.6)
      .fromTo(q('.vx-winner-label'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 8.4)
      .fromTo(q('.vx-winner-name'), { autoAlpha: 0, letterSpacing: '0.6em' }, { autoAlpha: 1, letterSpacing: '0.08em', duration: 1, ease: 'power3.out' }, 8.8)
      .fromTo(q('.vx-stat'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.15 }, 10)
      .to(q('.vx-scene2'), { autoAlpha: 0, duration: 0.8 }, 14.8)
      .set(q('.vx-scene2'), { autoAlpha: 0 }, 15.6);

    // ---- SCENE 3: Character montage (16s - 26s) ----
    tl.set(q('.vx-scene3'), { autoAlpha: 1 }, 15.7)
      .fromTo(q('.vx-cast-title'), { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 15.9);

    const castCards = q('.vx-cast-card');
    castCards.forEach((_, i) => {
      const t = 16.7 + i * 2.1;
      tl.fromTo(
        q('.vx-cast-card')[i],
        { autoAlpha: 0, x: i % 2 === 0 ? -60 : 60 },
        { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power3.out' },
        t,
      ).to(q('.vx-cast-card')[i], { autoAlpha: 0, duration: 0.5 }, t + 1.7);
    });

    tl.to(q('.vx-scene3'), { autoAlpha: 0, duration: 0.8 }, 25.2)
      .set(q('.vx-scene3'), { autoAlpha: 0 }, 26);

    // ---- SCENE 4: Rolling credits (26s - 40s) ----
    tl.set(q('.vx-scene4'), { autoAlpha: 1 }, 26.1)
      .fromTo(q('.vx-credits-track'), { y: '100%' }, { y: '-115%', duration: 13.5, ease: 'none' }, 26.2)
      .to(q('.vx-scene4'), { autoAlpha: 0, duration: 0.8 }, 39.4)
      .set(q('.vx-scene4'), { autoAlpha: 0 }, 40.2);

    // ---- SCENE 5: Post-credits stinger (40s - 45s) ----
    tl.set(q('.vx-scene5'), { autoAlpha: 1 }, 40.3)
      .fromTo(q('.vx-stinger-img'), { autoAlpha: 0, scale: 1.1, filter: 'brightness(0)' }, { autoAlpha: 1, scale: 1, filter: 'brightness(1)', duration: 1.4 }, 40.4)
      .fromTo(q('.vx-stinger-text'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 42)
      .to(q('.vx-scene5'), { autoAlpha: 1 }, 44.5);

    return tl;
  }, []);

  useEffect(() => {
    if (loading || !rootRef.current || tlRef.current) return;
    tlRef.current = buildTimeline(rootRef.current);
    tlRef.current.play();
    return () => { tlRef.current?.kill(); tlRef.current = null; };
  }, [loading, buildTimeline]);

  const handleSkip = () => {
    tlRef.current?.progress(1);
    setSkipped(true);
    setSequenceDone(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#ef4444', fontFamily: 'monospace', letterSpacing: 3, fontSize: 13 }}>LOADING FINALE SEQUENCE...</div>
      </div>
    );
  }

  if (!storyEnded) {
    return (
      <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: '#f1f5f9', textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2 }}>OPERATION STILL IN PROGRESS</div>
        <p style={{ color: '#94a3b8', maxWidth: 420, fontSize: 14 }}>The finale unlocks once a team cracks the Master Vault. Get back to the mission.</p>
        <Link href="/dashboard" className="btn-game-primary" style={{ marginTop: 8 }}>RETURN TO DASHBOARD</Link>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed', inset: 0, background: '#000', overflow: 'hidden', zIndex: 1000,
        fontFamily: "'Rajdhani', sans-serif",
      }}
    >
      <style>{`
        @keyframes vxPulse { 0%,100% { opacity: 0.5 } 50% { opacity: 1 } }
        @keyframes vxScan { 0% { transform: translateY(-100%) } 100% { transform: translateY(100%) } }
        .vx-scanline { position:absolute; inset:0; pointer-events:none; background: repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px); }
        .vx-vignette { position:absolute; inset:0; pointer-events:none; background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%); }
      `}</style>
      <div className="vx-scanline" />
      <div className="vx-vignette" />

      {!sequenceDone && (
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute', top: 20, right: 20, zIndex: 50,
            padding: '8px 16px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(220,38,38,0.5)',
            borderRadius: 6, color: '#fca5a5', fontSize: 12, fontWeight: 700, letterSpacing: 1,
            cursor: 'pointer', fontFamily: 'monospace',
          }}
        >
          SKIP ▸▸
        </button>
      )}

      {/* SCENE 1 — TITLE FLASH */}
      <div className="vx-scene1" style={{ position: 'absolute', inset: 0, opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div className="vx-flash" style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0 }} />
        <div className="vx-ring" style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', border: '3px solid #ef4444', boxShadow: '0 0 60px 10px rgba(239,68,68,0.6)' }} />
        <div className="vx-title-main" style={{ fontSize: 'clamp(36px, 7vw, 84px)', fontWeight: 900, color: '#fff', letterSpacing: '0.05em', textShadow: '0 0 40px rgba(239,68,68,0.9), 0 0 90px rgba(220,38,38,0.6)', textAlign: 'center', zIndex: 2 }}>
          OPERATION COMPLETE
        </div>
        <div className="vx-title-sub" style={{ fontSize: 'clamp(14px, 2.2vw, 22px)', color: '#ef4444', letterSpacing: '0.6em', fontWeight: 700, marginTop: 18, fontFamily: 'monospace', zIndex: 2 }}>
          THE EXTRACTION
        </div>
      </div>

      {/* SCENE 2 — WINNER ANNOUNCEMENT */}
      <div className="vx-scene2" style={{ position: 'absolute', inset: 0, opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, background: 'radial-gradient(ellipse at center, rgba(127,29,29,0.25), #000 75%)' }}>
        <img src={CHAR('veera_relieved')} alt="" className="vx-winner-portrait" style={{ height: '46vh', maxHeight: 420, objectFit: 'contain', filter: 'drop-shadow(0 0 40px rgba(220,38,38,0.5))', marginBottom: 8 }} />
        <div className="vx-winner-label" style={{ color: '#94a3b8', fontSize: 13, letterSpacing: 4, fontFamily: 'monospace', fontWeight: 700 }}>
          {finalOutcome === 'CITY_SAVED' ? 'THE CITY HAS BEEN SAVED' : 'MISSION OUTCOME LOGGED'}
        </div>
        <div className="vx-winner-name" style={{ color: '#fff', fontSize: 'clamp(26px, 5vw, 56px)', fontWeight: 900, textTransform: 'uppercase', textShadow: '0 0 30px rgba(239,68,68,0.7)' }}>
          {winnerName}
        </div>
        <div style={{ display: 'flex', gap: 32, marginTop: 22 }}>
          {[
            { label: 'TEAMS DEPLOYED', value: teams.length },
            { label: 'FINAL SCORE', value: (teams.find(t => t.teamName === winnerName)?.totalPoints ?? teams[0]?.totalPoints ?? 0).toLocaleString() },
            { label: 'STATUS', value: 'EXTRACTED' },
          ].map(s => (
            <div key={s.label} className="vx-stat" style={{ textAlign: 'center' }}>
              <div style={{ color: '#ef4444', fontSize: 22, fontWeight: 900, fontFamily: 'monospace' }}>{s.value}</div>
              <div style={{ color: '#6b7280', fontSize: 10, letterSpacing: 2, fontFamily: 'monospace', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SCENE 3 — CHARACTER MONTAGE */}
      <div className="vx-scene3" style={{ position: 'absolute', inset: 0, opacity: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="vx-cast-title" style={{ color: '#ef4444', fontSize: 13, letterSpacing: 6, fontFamily: 'monospace', fontWeight: 800, marginBottom: 30 }}>
          — THE OPERATIVES —
        </div>
        <div style={{ position: 'relative', width: '100%', height: 260 }}>
          {CAST.map((c, i) => (
            <div
              key={c.name}
              className="vx-cast-card"
              style={{
                position: 'absolute', inset: 0, opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24,
                flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
              }}
            >
              <img src={c.img} alt="" style={{ height: 220, objectFit: 'contain', filter: 'drop-shadow(0 0 24px rgba(220,38,38,0.4))' }} />
              <div>
                <div style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: '0.03em' }}>{c.name}</div>
                <div style={{ color: '#ef4444', fontSize: 13, fontFamily: 'monospace', letterSpacing: 2, marginTop: 6 }}>{c.role.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SCENE 4 — ROLLING CREDITS */}
      <div className="vx-scene4" style={{ position: 'absolute', inset: 0, opacity: 0, overflow: 'hidden', background: '#000' }}>
        <div className="vx-credits-track" style={{ position: 'absolute', left: 0, right: 0, top: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 46, padding: '0 24px', textAlign: 'center' }}>
          <div style={{ color: '#ef4444', fontSize: 20, fontWeight: 900, letterSpacing: 6, fontFamily: 'monospace' }}>THE EXTRACTION</div>

          <CreditBlock title="MISSION COORDINATORS" names={COORDINATORS} big />
          {VOLUNTEERS.length > 0 && <CreditBlock title="FIELD VOLUNTEERS" names={VOLUNTEERS} />}
          <CreditBlock title="OPERATIVES DEPLOYED" names={operatives.length > 0 ? operatives : ['— no teams recorded —']} />

          <div style={{ marginTop: 20 }}>
            <div style={{ color: '#6b7280', fontSize: 11, letterSpacing: 3, fontFamily: 'monospace' }}>A LOCAL NETWORK OPERATION</div>
            <div style={{ color: '#374151', fontSize: 11, letterSpacing: 2, fontFamily: 'monospace', marginTop: 6 }}>THANK YOU FOR PLAYING</div>
          </div>
        </div>
      </div>

      {/* SCENE 5 — POST-CREDITS STINGER */}
      <div className="vx-scene5" style={{ position: 'absolute', inset: 0, opacity: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 18 }}>
        <img src={CHAR('umar_threatening')} alt="" className="vx-stinger-img" style={{ height: '42vh', maxHeight: 360, objectFit: 'contain', filter: 'grayscale(0.3) contrast(1.2)' }} />
        <div className="vx-stinger-text" style={{ textAlign: 'center', opacity: 0 }}>
          <div style={{ color: '#dc2626', fontSize: 15, fontFamily: 'monospace', letterSpacing: 3, fontWeight: 800 }}>
            "You stopped one network. There are others."
          </div>
          <div style={{ color: '#6b7280', fontSize: 12, fontFamily: 'monospace', letterSpacing: 4, marginTop: 14 }}>
            THE EXTRACTION WILL RETURN
          </div>
        </div>

        {sequenceDone && (
          <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
            <button onClick={() => { tlRef.current?.restart(); setSequenceDone(false); setSkipped(false); }} className="btn-game-secondary" style={{ padding: '10px 20px' }}>
              REPLAY
            </button>
            <Link href="/dashboard" className="btn-game-primary" style={{ padding: '10px 20px' }}>
              RETURN TO BASE
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function CreditBlock({ title, names, big }: { title: string; names: string[]; big?: boolean }) {
  return (
    <div>
      <div style={{ color: '#ef4444', fontSize: 12, letterSpacing: 4, fontFamily: 'monospace', fontWeight: 800, marginBottom: 14 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {names.map(n => (
          <div key={n} style={{ color: '#fff', fontSize: big ? 22 : 16, fontWeight: big ? 800 : 600 }}>{n}</div>
        ))}
      </div>
    </div>
  );
}
