'use client';

import React, { useState, useEffect } from 'react';
import CharacterDialogue from './CharacterDialogue';

interface DialogueLine {
  character: 'veera' | 'althaf' | 'preethi' | 'umar';
  expression: string;
  dialogue: string;
  position?: 'left' | 'right' | 'center';
  mood?: 'normal' | 'urgent' | 'danger' | 'success';
  delay?: number; // milliseconds to wait before showing
}

interface StorySceneProps {
  title: string;
  subtitle?: string;
  scene: DialogueLine[];
  backgroundImage?: string;
  backgroundColor?: string;
  autoPlay?: boolean;
  playSpeed?: number; // seconds between dialogues
  onComplete?: () => void;
  showControls?: boolean;
}

export default function StoryScene({
  title,
  subtitle,
  scene,
  backgroundImage,
  backgroundColor = 'from-[#050508] via-[#12080a] to-[#050508]',
  autoPlay = false,
  playSpeed = 3,
  onComplete,
  showControls = true,
}: StorySceneProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleDialogues, setVisibleDialogues] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!autoPlay) {
      // Show all dialogues immediately if not auto-playing
      setVisibleDialogues(scene.map((_, i) => i));
      return;
    }

    if (isPlaying && currentIndex < scene.length) {
      const timer = setTimeout(() => {
        setVisibleDialogues(prev => [...prev, currentIndex]);
        setCurrentIndex(prev => prev + 1);
        
        if (currentIndex === scene.length - 1) {
          setIsPlaying(false);
          onComplete?.();
        }
      }, scene[currentIndex]?.delay || playSpeed * 1000);

      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentIndex, scene, autoPlay, playSpeed, onComplete]);

  const handleNext = () => {
    if (currentIndex < scene.length - 1) {
      setVisibleDialogues(prev => [...prev, currentIndex]);
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setVisibleDialogues(prev => prev.slice(0, -1));
    }
  };

  const handleSkip = () => {
    setVisibleDialogues(scene.map((_, i) => i));
    setCurrentIndex(scene.length);
    setIsPlaying(false);
    onComplete?.();
  };

  return (
    <div className={`min-h-screen relative overflow-hidden bg-gradient-to-b ${backgroundColor}`}>
      <div className="blood-splatter-bg" />
      {/* Background */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Scene Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 blood-crimson-title tracking-widest uppercase">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-red-200/70 font-mono tracking-wider">
              {subtitle}
            </p>
          )}
          
          {/* Scene Progress */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex gap-1 justify-center">
              {scene.map((_, index) => (
                <div
                  key={index}
                  className={`
                    h-1 flex-1 rounded-full transition-all duration-300
                    ${visibleDialogues.includes(index) 
                      ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' 
                      : 'bg-red-950/40'
                    }
                  `}
                />
              ))}
            </div>
            <p className="text-gray-500 text-xs font-mono mt-2 tracking-widest">
              {visibleDialogues.length} / {scene.length} LOGS
            </p>
          </div>
        </div>

        {/* Dialogues */}
        <div className="max-w-5xl mx-auto space-y-8">
          {scene.map((line, index) => (
            visibleDialogues.includes(index) && (
              <CharacterDialogue
                key={index}
                character={line.character}
                expression={line.expression as any}
                dialogue={line.dialogue}
                position={line.position}
                mood={line.mood}
                animated={autoPlay}
              />
            )
          ))}
        </div>

        {/* Controls */}
        {showControls && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-[rgba(10,4,6,0.95)] backdrop-blur-md border border-red-600/40 rounded-lg px-8 py-4 shadow-[0_0_30px_rgba(220,38,38,0.3)] tactical-box">
              <div className="flex gap-4 items-center font-mono">
                {/* Previous Button */}
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 bg-red-950/30 text-gray-300 border border-red-900/40 rounded font-semibold text-xs tracking-wider
                           disabled:opacity-30 disabled:cursor-not-allowed
                           hover:bg-red-900/40 transition-all"
                >
                  ← PREV
                </button>

                {/* Play/Pause */}
                {autoPlay && (
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-6 py-2 bg-gradient-to-r from-red-700 to-red-500 text-white
                             rounded font-bold text-xs tracking-widest hover:scale-105 transition-transform"
                  >
                    {isPlaying ? '⏸ PAUSE' : '▶ AUTO'}
                  </button>
                )}

                {/* Next Button */}
                <button
                  onClick={handleNext}
                  disabled={!autoPlay && currentIndex >= scene.length - 1}
                  className="px-4 py-2 bg-red-950/30 text-gray-300 border border-red-900/40 rounded font-semibold text-xs tracking-wider
                           disabled:opacity-30 disabled:cursor-not-allowed
                           hover:bg-red-900/40 transition-all"
                >
                  NEXT →
                </button>

                {/* Skip */}
                {autoPlay && currentIndex < scene.length && (
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 text-gray-400 hover:text-red-400 
                             transition-colors font-semibold text-xs tracking-wider"
                  >
                    SKIP ALL →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
