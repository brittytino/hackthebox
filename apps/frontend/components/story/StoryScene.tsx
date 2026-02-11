'use client';

import React, { useState, useEffect } from 'react';
import CharacterDialogue from './CharacterDialogue';

interface DialogueLine {
  character: 'veera' | 'vikram' | 'althaf' | 'preethi' | 'umar';
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
  backgroundColor = 'from-gray-900 via-purple-900 to-black',
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
      {/* Background */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 opacity-20"
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-gray-400 font-light">
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
                      ? 'bg-cyan-500' 
                      : 'bg-gray-700'
                    }
                  `}
                />
              ))}
            </div>
            <p className="text-gray-500 text-sm mt-2">
              {visibleDialogues.length} / {scene.length}
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
            <div className="bg-gray-900/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl px-8 py-4 shadow-2xl">
              <div className="flex gap-4 items-center">
                {/* Previous Button */}
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 bg-gray-800 text-cyan-400 rounded-lg font-semibold 
                           disabled:opacity-30 disabled:cursor-not-allowed
                           hover:bg-gray-700 transition-all"
                >
                  ← Previous
                </button>

                {/* Play/Pause */}
                {autoPlay && (
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 
                             rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                  </button>
                )}

                {/* Next Button */}
                <button
                  onClick={handleNext}
                  disabled={!autoPlay && currentIndex >= scene.length - 1}
                  className="px-4 py-2 bg-gray-800 text-cyan-400 rounded-lg font-semibold 
                           disabled:opacity-30 disabled:cursor-not-allowed
                           hover:bg-gray-700 transition-all"
                >
                  Next →
                </button>

                {/* Skip */}
                {autoPlay && currentIndex < scene.length && (
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 text-gray-400 hover:text-cyan-400 
                             transition-colors font-semibold"
                  >
                    Skip All →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
}
