'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, SkipForward, X } from 'lucide-react';

const SCENE_BACKGROUNDS: Record<string, string> = {
  night_city: "url('https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2069')",
  ops_center: "url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070')",
  mall_dark: "url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070')",
};

type CharPos = 'left' | 'center' | 'right' | 'none';

interface Scene {
  id: number;
  bg: string;
  speaker: string;
  speakerColor: string;
  text: string;
  charLeft?: string;
  charRight?: string;
  charCenter?: string;
  activeChar?: CharPos;
}

const SCENES: Scene[] = [
  {
    id: 1, bg: 'night_city',
    speaker: 'NARRATOR', speakerColor: '#c4b5fd',
    text: '11 months ago. Pakistan border. 2:34 AM. Veera Raghavan corners Umar Farooq in a crumbling safe house. Mission accomplished. But at what cost..?',
    charLeft: '/images/characters/veera_determined.png',
    activeChar: 'left',
  },
  {
    id: 2, bg: 'night_city',
    speaker: 'NARRATOR', speakerColor: '#c4b5fd',
    text: 'February 1, 2026. Coimbatore. Veera lives with PTSD in his dark flat, barely sleeping. Then his psychiatrist forces him to a wedding where he meets Preethi...',
    charLeft: '/images/characters/veera_determined.png',
    activeChar: 'left',
  },
  {
    id: 3, bg: 'mall_dark',
    speaker: 'SAIF', speakerColor: '#ef4444',
    text: '"This mall is now under MY control. 1,200 souls. One demand: Release Umar Farooq. You have 6 hours before the city burns."',
    charRight: '/images/characters/vikram_neutral.png',
    activeChar: 'right',
  },
  {
    id: 4, bg: 'mall_dark',
    speaker: 'VEERA', speakerColor: '#a78bfa',
    text: '"I am inside the mall. All mall security has fallen. I need cyber support immediately. Who is there? Respond on encrypted channel."',
    charLeft: '/images/characters/veera_determined.png',
    activeChar: 'left',
  },
  {
    id: 5, bg: 'ops_center',
    speaker: 'VIKRAM', speakerColor: '#67e8f9',
    text: '"Agent Raghavan. I am Inspector Vikram, Tamil Nadu Cyber Crime Division. We have been watching you. We have 9 cyber missions prepared. Your team handles cryptography — we handle the field."',
    charRight: '/images/characters/vikram_neutral.png',
    charLeft: '/images/characters/veera_determined.png',
    activeChar: 'right',
  },
  {
    id: 6, bg: 'ops_center',
    speaker: 'ALTHAF', speakerColor: '#fbbf24',
    text: '"All cyber units: This is Deputy NSA Althaf Hussain. Listen carefully. This is a two-phase attack. The mall siege is a distraction. Operation BLACKOUT will trigger February 14 at midnight. Stop BOTH threats."',
    charCenter: '/images/characters/althaf_commanding.png',
    activeChar: 'center',
  },
  {
    id: 7, bg: 'ops_center',
    speaker: 'VEERA', speakerColor: '#a78bfa',
    text: '"You are our last hope. Every cipher you crack saves a life. Every flag you capture gives me actionable intel. Are you ready, operative? The city is counting on you."',
    charLeft: '/images/characters/veera_determined.png',
    charRight: '/images/characters/vikram_neutral.png',
    activeChar: 'left',
  },
  {
    id: 8, bg: 'ops_center',
    speaker: 'SYSTEM', speakerColor: '#06b6d4',
    text: '[ 3 ROUNDS. 9 MISSIONS. REAL-TIME CYBER WARFARE. ] OPERATION CIPHER STRIKE — BEGINS NOW.',
    activeChar: 'none',
  },
];

function CharImg({ src, pos, active }: { src?: string; pos: CharPos; active: boolean }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      className={`vn-character ${pos} ${active ? 'active' : 'inactive'}`}
      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}

export default function StoryPage() {
  const router = useRouter();
  const [sceneIdx, setSceneIdx] = useState(0);
  const [textDisplayed, setTextDisplayed] = useState('');
  const [typing, setTyping] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const scene = SCENES[sceneIdx];

  const typeText = useCallback((text: string) => {
    setTextDisplayed('');
    setTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setTextDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTyping(false);
      }
    }, 22);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cleanup = typeText(scene.text);
    return cleanup;
  }, [sceneIdx, scene.text, typeText]);

  const advance = () => {
    if (typing) {
      setTextDisplayed(scene.text);
      setTyping(false);
      return;
    }
    if (sceneIdx < SCENES.length - 1) {
      setSceneIdx(s => s + 1);
    } else {
      router.push('/challenges');
    }
  };

  const bgImg = SCENE_BACKGROUNDS[scene.bg] || SCENE_BACKGROUNDS.ops_center;
  const isLast = sceneIdx === SCENES.length - 1;

  return (
    <div className="vn-root" style={{ cursor: 'pointer' }} onClick={advance}>
      {/* Background */}
      <div
        className="vn-background"
        style={{
          backgroundImage: bgImg,
          filter: 'brightness(0.15) saturate(0.6)',
          transition: 'background-image 0.8s ease',
        }}
      />
      <div className="game-bg-overlay" />
      <div className="scanlines" />

      {/* HUD top bar */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'linear-gradient(180deg, rgba(5,2,20,0.9), transparent)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="game-title glow-purple" style={{ fontSize: '16px', color: '#a78bfa' }}>
            OPERATION CIPHER STRIKE
          </div>
          <span className="game-label" style={{ color: '#4b5563' }}>— ORIGIN STORY</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Scene dots */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {SCENES.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === sceneIdx ? '20px' : '8px', height: '8px', borderRadius: '4px',
                  background: i === sceneIdx ? '#7c3aed' : i < sceneIdx ? '#10b981' : 'rgba(109,40,217,0.3)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
          <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '8px' }}>
            {sceneIdx + 1} / {SCENES.length}
          </span>
          <button
            className="btn-game-secondary"
            style={{ fontSize: '12px', padding: '7px 14px' }}
            onClick={() => setShowSkipConfirm(true)}
          >
            <SkipForward size={13} /> Skip Story
          </button>
        </div>
      </div>

      {/* Characters */}
      <CharImg src={scene.charLeft} pos="left" active={scene.activeChar === 'left'} />
      <CharImg src={scene.charRight} pos="right" active={scene.activeChar === 'right'} />
      <CharImg src={scene.charCenter} pos="center" active={scene.activeChar === 'center'} />

      {/* Dialogue box */}
      <div className="vn-dialogue-box">
        <div className="vn-name-tag" style={{ color: scene.speakerColor }}>
          {scene.speaker}
        </div>
        <div className="vn-text">
          {textDisplayed}
          {typing && <span style={{ animation: 'pulse 1s ease-in-out infinite', color: '#a78bfa' }}></span>}
        </div>
        {!typing && (
          <div
            style={{
              position: 'absolute', bottom: '16px', right: '22px',
              display: 'flex', alignItems: 'center', gap: '6px',
              color: '#a78bfa', fontSize: '13px', fontWeight: 600,
            }}
          >
            {isLast ? 'BEGIN OPERATION' : 'CONTINUE'}
            <ChevronRight size={16} />
          </div>
        )}
      </div>

      {/* Skip confirmation modal */}
      {showSkipConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="game-panel-bordered" style={{ padding: '36px 40px', maxWidth: '400px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
            <X size={28} color="#ef4444" style={{ margin: '0 auto 14px' }} />
            <h3 className="game-heading" style={{ fontSize: '18px', color: '#e9d5ff', marginBottom: '10px' }}>
              Skip Story?
            </h3>
            <p style={{ color: '#a78bfa', fontSize: '14px', lineHeight: 1.7, marginBottom: '24px' }}>
              Jump straight to the missions. You can always return to the story briefing from the menu.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn-game-danger"
                style={{ flex: 1 }}
                onClick={() => router.push('/challenges')}
              >
                Skip to Missions
              </button>
              <button
                className="btn-game-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowSkipConfirm(false)}
              >
                Continue Story
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
