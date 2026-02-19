'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import GameLayout from '@/components/game/GameLayout';
import Character from '@/components/game/Character';
import Link from 'next/link';
import { ChevronRight, SkipForward, X } from 'lucide-react';

const SCENE_BACKGROUNDS: Record<string, string> = {
  night_city: "/images/background/city-night.jpg",
  ops_center: "/images/background/ops-center.jpg",
  mall_dark: "/images/background/mall-dark.jpg",
};

type CharacterType = 'veera' | 'vikram' | 'althaf' | 'none';
type CharacterExpression = 'neutral' | 'determined' | 'commanding' | 'serious';

interface Scene {
  id: number;
  bg: string;
  speaker: string;
  speakerColor: string;
  text: string;
  character?: CharacterType;
  expression?: CharacterExpression;
}

const SCENES: Scene[] = [
  {
    id: 1, bg: 'night_city',
    speaker: 'NARRATOR', speakerColor: '#c4b5fd',
    text: '11 months ago. Pakistan border. 2:34 AM. Veera Raghavan corners Umar Farooq in a crumbling safe house. Mission accomplished. But at what cost..?',
    character: 'veera',
    expression: 'determined',
  },
  {
    id: 2, bg: 'night_city',
    speaker: 'NARRATOR', speakerColor: '#c4b5fd',
    text: 'February 1, 2026. Coimbatore. Veera lives with PTSD in his dark flat, barely sleeping. Then his psychiatrist forces him to a wedding where he meets Preethi...',
    character: 'veera',
    expression: 'determined',
  },
  {
    id: 3, bg: 'mall_dark',
    speaker: 'SAIF', speakerColor: '#ef4444',
    text: '"This mall is now under MY control. 1,200 souls. One demand: Release Umar Farooq. You have 6 hours before the city burns."',
    character: 'vikram',
    expression: 'serious',
  },
  {
    id: 4, bg: 'mall_dark',
    speaker: 'VEERA', speakerColor: '#a78bfa',
    text: '"I am inside the mall. All mall security has fallen. I need cyber support immediately. Who is there? Respond on encrypted channel."',
    character: 'veera',
    expression: 'determined',
  },
  {
    id: 5, bg: 'ops_center',
    speaker: 'VIKRAM', speakerColor: '#67e8f9',
    text: '"Agent Raghavan. I am Inspector Vikram, Tamil Nadu Cyber Crime Division. We have been watching you. We have 9 cyber missions prepared. Your team handles cryptography — we handle the field."',
    character: 'vikram',
    expression: 'serious',
  },
  {
    id: 6, bg: 'ops_center',
    speaker: 'ALTHAF', speakerColor: '#fbbf24',
    text: '"All cyber units: This is Deputy NSA Althaf Hussain. Listen carefully. This is a two-phase attack. The mall siege is a distraction. Operation BLACKOUT will trigger February 14 at midnight. Stop BOTH threats."',
    character: 'althaf',
    expression: 'commanding',
  },
  {
    id: 7, bg: 'ops_center',
    speaker: 'VEERA', speakerColor: '#a78bfa',
    text: '"You are our last hope. Every cipher you crack saves a life. Every flag you capture gives me actionable intel. Are you ready, operative? The city is counting on you."',
    character: 'veera',
    expression: 'determined',
  },
  {
    id: 8, bg: 'ops_center',
    speaker: 'SYSTEM', speakerColor: '#06b6d4',
    text: '[ 3 ROUNDS. 9 MISSIONS. REAL-TIME CYBER WARFARE. ] OPERATION CIPHER STRIKE — BEGINS NOW.',
    character: 'none',
  },
];

export default function StoryPage() {
  const router = useRouter();
  const [sceneIdx, setSceneIdx] = useState(0);
  const [textDisplayed, setTextDisplayed] = useState('');
  const [typing, setTyping] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const dialogueRef = useRef<HTMLDivElement>(null);

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
    
    // GSAP: Fade in dialogue box
    if (dialogueRef.current) {
      gsap.fromTo(
        dialogueRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
    
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
    <GameLayout backgroundImage={bgImg} showScanlines>
      <div className="cursor-pointer h-full flex flex-col" onClick={advance}>
        {/* HUD Top Bar */}
        <div
          className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
          style={{
            background: 'linear-gradient(180deg, rgba(5,2,20,0.9), transparent)',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            <div className="text-base font-bold text-purple-400 glow-purple">
              OPERATION CIPHER STRIKE
            </div>
            <span className="text-xs font-bold tracking-widest text-gray-600 uppercase">
              — Origin Story
            </span>
          </div>
          
          <div className="flex gap-2.5 items-center">
            {/* Scene Progress Dots */}
            <div className="flex gap-1.5 items-center">
              {SCENES.map((_, i) => (
                <div
                  key={i}
                  className="h-2 rounded transition-all duration-300 ease-in-out"
                  style={{
                    width: i === sceneIdx ? '20px' : '8px',
                    background: i === sceneIdx ? '#7c3aed' : i < sceneIdx ? '#10b981' : 'rgba(109,40,217,0.3)',
                  }}
                />
              ))}
            </div>
            
            <span className="text-gray-500 text-xs ml-2">
              {sceneIdx + 1} / {SCENES.length}
            </span>
            
            <button
              className="btn-game-secondary text-xs px-3.5 py-1.5"
              onClick={() => setShowSkipConfirm(true)}
            >
              <SkipForward size={13} /> Skip Story
            </button>
          </div>
        </div>

        {/* Character Display */}
        {scene.character && scene.character !== 'none' && (
          <Character
            character={scene.character}
            expression={scene.expression || 'neutral'}
            position="left"
            active={true}
          />
        )}

        {/* Dialogue Box */}
        <div
          ref={dialogueRef}
          className="absolute bottom-0 left-0 right-0 z-30 mx-auto mb-8 px-8"
          style={{ maxWidth: '1100px' }}
        >
          <div className="bg-gradient-to-br from-slate-950/95 to-purple-950/90 border-2 border-purple-600/50 rounded-xl p-6 shadow-2xl">
            {/* Speaker Name */}
            <div
              className="text-sm font-bold tracking-widest uppercase mb-3 pb-2 border-b border-purple-600/30"
              style={{ color: scene.speakerColor }}
            >
              {scene.speaker}
            </div>
            
            {/* Dialogue Text */}
            <div className="text-slate-100 text-lg leading-relaxed min-h-[80px]">
              {textDisplayed}
              {typing && (
                <span className="inline-block w-2 h-5 ml-1 bg-purple-400 animate-pulse" />
              )}
            </div>
            
            {/* Continue Prompt */}
            {!typing && (
              <div className="absolute bottom-4 right-5.5 flex items-center gap-1.5 text-purple-400 text-[13px] font-semibold">
                {isLast ? 'BEGIN OPERATION' : 'CONTINUE'}
                <ChevronRight size={16} />
              </div>
            )}
          </div>
        </div>

        {/* Skip Confirmation Modal */}
        {showSkipConfirm && (
          <div
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="game-panel-bordered p-9 px-10 max-w-md text-center animate-fadeIn">
              <X size={28} className="text-red-500 mx-auto mb-3.5" />
              
              <h3 className="text-lg font-bold text-purple-200 mb-2.5">
                Skip Story?
              </h3>
              
              <p className="text-purple-400 text-sm leading-relaxed mb-6">
                Jump straight to the missions. You can always return to the story briefing from the menu.
              </p>
              
              <div className="flex gap-3">
                <button
                  className="btn-game-danger flex-1"
                  onClick={() => router.push('/challenges')}
                >
                  Skip to Missions
                </button>
                <button
                  className="btn-game-secondary flex-1"
                  onClick={() => setShowSkipConfirm(false)}
                >
                  Continue Story
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
