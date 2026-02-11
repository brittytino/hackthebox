'use client';

import React from 'react';
import Image from 'next/image';

type CharacterName = 'veera' | 'vikram' | 'althaf' | 'preethi' | 'umar';
type VeeraExpression = 'neutral' | 'intense' | 'determined' | 'concerned' | 'relieved';
type VikramExpression = 'neutral' | 'serious' | 'urgent';
type AlthafExpression = 'neutral' | 'commanding' | 'concerned';
type PreethiExpression = 'worried' | 'hopeful';
type UmarExpression = 'threatening' | 'angry';

type CharacterExpression = 
  | VeeraExpression 
  | VikramExpression 
  | AlthafExpression 
  | PreethiExpression 
  | UmarExpression;

interface CharacterDialogueProps {
  character: CharacterName;
  expression: CharacterExpression;
  dialogue: string;
  position?: 'left' | 'right' | 'center';
  showProfile?: boolean;
  animated?: boolean;
  mood?: 'normal' | 'urgent' | 'danger' | 'success';
}

const characterInfo: Record<CharacterName, { name: string; title: string; color: 'cyan' | 'blue' | 'purple' | 'pink' | 'red' }> = {
  veera: {
    name: 'Veera Raghavan',
    title: 'Ex-RAW Agent',
    color: 'cyan',
  },
  vikram: {
    name: 'Vikram',
    title: 'RAW Director',
    color: 'blue',
  },
  althaf: {
    name: 'Althaf',
    title: 'NSA Commander',
    color: 'purple',
  },
  preethi: {
    name: 'Preethi',
    title: 'Security Specialist',
    color: 'pink',
  },
  umar: {
    name: 'Umar Saif',
    title: 'Terrorist Leader',
    color: 'red',
  },
};

export default function CharacterDialogue({
  character,
  expression,
  dialogue,
  position = 'left',
  showProfile = true,
  animated = true,
  mood = 'normal',
}: CharacterDialogueProps) {
  const info = characterInfo[character];
  
  // Fix the typo in filename (veera_neautral -> veera_neutral)
  const fixedExpression = character === 'veera' && expression === 'neutral' 
    ? 'neautral' // Keep the typo for now since that's the actual filename
    : expression;
  
  const imagePath = `/images/characters/${character}_${fixedExpression}.png`;

  const moodStyles = {
    normal: 'border-cyan-500/40 bg-gray-900/95',
    urgent: 'border-yellow-500/60 bg-yellow-900/20 shadow-yellow-500/30',
    danger: 'border-red-500/60 bg-red-900/20 shadow-red-500/30',
    success: 'border-green-500/60 bg-green-900/20 shadow-green-500/30',
  };

  const colorClasses = {
    cyan: 'text-cyan-400 border-cyan-500',
    blue: 'text-blue-400 border-blue-500',
    purple: 'text-purple-400 border-purple-500',
    pink: 'text-pink-400 border-pink-500',
    red: 'text-red-400 border-red-500',
  };

  const positionClasses = {
    left: 'flex-row',
    right: 'flex-row-reverse',
    center: 'flex-col items-center',
  };

  return (
    <div
      className={`
        flex gap-6 items-start mb-8
        ${positionClasses[position]}
        ${animated ? 'animate-fadeIn' : ''}
      `}
    >
      {/* Character Image */}
      {showProfile && (
        <div className="relative flex-shrink-0">
          <div className={`
            w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden 
            border-4 ${colorClasses[info.color]}
            shadow-lg shadow-${info.color}-500/50
            transition-transform duration-300 hover:scale-105
          `}>
            <Image
              src={imagePath}
              alt={`${info.name} - ${expression}`}
              width={160}
              height={160}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          
          {/* Character Name Badge */}
          <div className={`
            absolute -bottom-3 left-1/2 transform -translate-x-1/2
            px-4 py-1 rounded-full text-xs font-bold
            bg-gray-950 border-2 ${colorClasses[info.color]}
            whitespace-nowrap shadow-lg
          `}>
            <div className={colorClasses[info.color]}>
              {info.name}
            </div>
            <div className="text-gray-400 text-[10px]">
              {info.title}
            </div>
          </div>
        </div>
      )}

      {/* Dialogue Box */}
      <div className={`
        relative flex-1 max-w-3xl
        ${moodStyles[mood]}
        border-2 rounded-2xl p-6
        shadow-2xl backdrop-blur-md
        ${animated ? 'animate-slideIn' : ''}
      `}>
        {/* Speech Arrow */}
        {position !== 'center' && (
          <div 
            className={`
              absolute top-8 w-0 h-0
              ${position === 'left' ? '-left-3' : '-right-3'}
              border-t-[12px] border-t-transparent
              border-b-[12px] border-b-transparent
              ${position === 'left' 
                ? 'border-r-[12px] border-r-cyan-500/40' 
                : 'border-l-[12px] border-l-cyan-500/40'
              }
            `}
          />
        )}

        {/* Dialogue Text */}
        <div className="relative">
          <div className="absolute -top-4 -left-2 text-6xl text-cyan-500/20 font-serif">"</div>
          <p className="text-gray-100 text-lg leading-relaxed pl-6 pr-4 font-light">
            {dialogue}
          </p>
          <div className="absolute -bottom-4 -right-2 text-6xl text-cyan-500/20 font-serif">"</div>
        </div>

        {/* Mood Indicator */}
        {mood !== 'normal' && (
          <div className={`
            absolute top-2 right-2
            w-3 h-3 rounded-full
            ${mood === 'urgent' ? 'bg-yellow-400 animate-pulse' : ''}
            ${mood === 'danger' ? 'bg-red-400 animate-pulse' : ''}
            ${mood === 'success' ? 'bg-green-400 animate-pulse' : ''}
          `} />
        )}
      </div>
    </div>
  );
}
