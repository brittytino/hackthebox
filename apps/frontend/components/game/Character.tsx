'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

type CharacterName = 'veera' | 'vikram' | 'althaf' | 'preethi' | 'umar';
type CharacterExpression = 
  | 'neutral' | 'intense' | 'determined' | 'concerned' | 'relieved'  // Veera
  | 'serious' | 'urgent'                                              // Vikram
  | 'commanding'                                                      // Althaf
  | 'worried' | 'hopeful'                                            // Preethi
  | 'threatening' | 'angry';                                         // Umar

type Position = 'left' | 'center' | 'right';

interface CharacterProps {
  character: CharacterName;
  expression: CharacterExpression;
  position?: Position;
  active?: boolean;
  className?: string;
}

const CHARACTER_COLORS: Record<CharacterName, string> = {
  veera: '#a78bfa',     // Purple
  vikram: '#67e8f9',    // Cyan
  althaf: '#fbbf24',    // Gold
  preethi: '#f9a8d4',   // Pink
  umar: '#ef4444',      // Red
};

export default function Character({
  character,
  expression,
  position = 'center',
  active = true,
  className = '',
}: CharacterProps) {
  const charRef = useRef<HTMLDivElement>(null);
  const imagePath = `/images/characters/${character}_${expression}.png`;

  useEffect(() => {
    if (charRef.current) {
      // Entry animation
      gsap.fromTo(
        charRef.current,
        {
          opacity: 0,
          y: 50,
          scale: 0.95,
        },
        {
          opacity: active ? 1 : 0.4,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'power3.out',
        }
      );

      // Idle breathing animation
      if (active) {
        gsap.to(charRef.current, {
          y: -8,
          duration: 2.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      }
    }
  }, [active]);

  const positionClasses = {
    left: 'left-8 md:left-16',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-8 md:right-16',
  };

  return (
    <div
      ref={charRef}
      className={`absolute bottom-0 ${positionClasses[position]} pointer-events-none z-20 ${className}`}
      style={{
        filter: active ? 'none' : 'grayscale(50%) brightness(0.7)',
        transition: 'filter 0.3s ease',
      }}
    >
      {/* Character Shadow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full opacity-40 blur-xl"
        style={{
          background: CHARACTER_COLORS[character],
        }}
      />

      {/* Character Image */}
      <img
        src={imagePath}
        alt={`${character} - ${expression}`}
        className="relative h-[65vh] w-auto max-h-[700px] object-contain drop-shadow-2xl"
        onError={(e) => {
          // Fallback to placeholder if image not found
          e.currentTarget.src = '/images/characters/placeholder.png';
          e.currentTarget.style.opacity = '0.3';
        }}
        style={{
          filter: active 
            ? `drop-shadow(0 0 30px ${CHARACTER_COLORS[character]})` 
            : 'drop-shadow(0 0 10px rgba(0,0,0,0.5))',
        }}
      />

      {/* Character Name Tag (when active) */}
      {active && (
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full text-white font-bold text-sm uppercase tracking-wider whitespace-nowrap"
          style={{
            background: `linear-gradient(135deg, ${CHARACTER_COLORS[character]}, transparent)`,
            border: `2px solid ${CHARACTER_COLORS[character]}`,
            boxShadow: `0 0 20px ${CHARACTER_COLORS[character]}40`,
          }}
        >
          {character.toUpperCase()}
        </div>
      )}
    </div>
  );
}
