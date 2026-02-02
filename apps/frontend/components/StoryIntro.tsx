'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface StoryIntroProps {
  onComplete: () => void;
}

export default function StoryIntro({ onComplete }: StoryIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentScene, setCurrentScene] = useState(0);

  const scenes = [
    {
      title: 'COIMBATORE',
      subtitle: 'February 2026',
      text: 'A city transformed by technology...',
    },
    {
      title: 'SMART CITY CONTROL CENTER',
      subtitle: 'Municipal Corporation HQ',
      text: 'Managing power, water, and traffic for 2.5 million people.',
    },
    {
      title: 'THE BREACH',
      subtitle: '72 hours ago',
      text: 'An insider leaked credentials. Systems compromised. Quietly.',
    },
    {
      title: 'OPERATION DARKWEAVE',
      subtitle: 'CLASSIFIED',
      text: 'A ransomware attack scheduled for midnight. You are the response cell.',
    },
    {
      title: 'YOUR MISSION',
      subtitle: 'Time is running out',
      text: 'Decode. Crack. Disable. Save the city.',
    },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => {
        if (currentScene < scenes.length - 1) {
          setTimeout(() => setCurrentScene(currentScene + 1), 500);
        } else {
          setTimeout(() => onComplete(), 1000);
        }
      },
    });

    tl.fromTo(
      '.scene-title',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
      .fromTo(
        '.scene-subtitle',
        { opacity: 0, x: -30 },
        { opacity: 0.7, x: 0, duration: 0.8, ease: 'power2.out' },
        '-=0.5'
      )
      .fromTo(
        '.scene-text',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
        '-=0.3'
      )
      .to(
        {},
        { duration: 2 }
      )
      .to(
        '.scene-content',
        { opacity: 0, y: -30, duration: 0.8, ease: 'power2.in' }
      );

    return () => {
      tl.kill();
    };
  }, [currentScene]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      <div className="scene-content text-center max-w-4xl px-8">
        <div className="scene-subtitle text-emerald-400 text-sm font-mono mb-4 tracking-widest uppercase">
          {scenes[currentScene].subtitle}
        </div>
        <h1 className="scene-title text-6xl font-bold text-white mb-8 tracking-tight">
          {scenes[currentScene].title}
        </h1>
        <p className="scene-text text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          {scenes[currentScene].text}
        </p>
        
        {/* Progress indicator */}
        <div className="flex gap-2 justify-center mt-12">
          {scenes.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 w-12 rounded transition-all ${
                idx === currentScene
                  ? 'bg-emerald-400'
                  : idx < currentScene
                  ? 'bg-emerald-600'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent animate-scan" />
      </div>
    </div>
  );
}
