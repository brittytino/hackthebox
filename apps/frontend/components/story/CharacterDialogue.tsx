'use client';

import React from 'react';
import Image from 'next/image';

type CharacterName = 'veera' | 'althaf' | 'preethi' | 'umar';
type VeeraExpression = 'neutral' | 'intense' | 'determined' | 'concerned' | 'relieved';
type AlthafExpression = 'neutral' | 'commanding' | 'concerned';
type PreethiExpression = 'worried' | 'hopeful';
type UmarExpression = 'threatening' | 'angry';

type CharacterExpression = 
  | VeeraExpression 
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

const characterInfo: Record<CharacterName, { name: string; title: string; color: 'red' | 'crimson' | 'darkRed' | 'blood' }> = {
  veera: {
    name: 'Veera Raghavan',
    title: 'Ex-RAW Operative',
    color: 'red',
  },
  althaf: {
    name: 'Althaf',
    title: 'NSA Tactical Commander',
    color: 'crimson',
  },
  preethi: {
    name: 'Preethi',
    title: 'Cyber Security Analyst',
    color: 'darkRed',
  },
  umar: {
    name: 'Umar Saif',
    title: 'Terrorist Commander',
    color: 'blood',
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
  
  const fixedExpression = character === 'veera' && expression === 'neutral' 
    ? 'neautral' 
    : expression;
  
  const imagePath = `/images/characters/${character}_${fixedExpression}.webp`;

  const moodStyles = {
    normal: 'border-red-950/60 bg-[rgba(10,4,6,0.95)] shadow-[0_0_25px_rgba(220,38,38,0.15)]',
    urgent: 'border-amber-600/60 bg-[rgba(20,8,6,0.95)] shadow-[0_0_25px_rgba(245,158,11,0.25)]',
    danger: 'border-red-600/80 bg-[rgba(25,5,8,0.95)] shadow-[0_0_35px_rgba(220,38,38,0.4)]',
    success: 'border-emerald-600/60 bg-[rgba(5,15,10,0.95)] shadow-[0_0_25px_rgba(16,185,129,0.25)]',
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
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border-2 border-red-600/60 shadow-[0_0_20px_rgba(220,38,38,0.3)] bg-black/60 transition-transform duration-300 hover:scale-105">
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
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded text-xs font-bold bg-[#0a0406] border border-red-600/60 whitespace-nowrap shadow-lg text-center font-mono">
            <div className="text-red-400 uppercase tracking-wider text-[11px]">
              {info.name}
            </div>
            <div className="text-gray-400 text-[9px] tracking-widest">
              {info.title}
            </div>
          </div>
        </div>
      )}

      {/* Dialogue Box */}
      <div className={`
        relative flex-1 max-w-3xl
        ${moodStyles[mood]}
        border rounded-lg p-6
        backdrop-blur-md tactical-box corner-brackets
        ${animated ? 'animate-slideIn' : ''}
      `}>
        {/* Speech Arrow */}
        {position !== 'center' && (
          <div 
            className={`
              absolute top-8 w-0 h-0
              ${position === 'left' ? '-left-3' : '-right-3'}
              border-t-[10px] border-t-transparent
              border-b-[10px] border-b-transparent
              ${position === 'left' 
                ? 'border-r-[10px] border-r-red-900/60' 
                : 'border-l-[10px] border-l-red-900/60'
              }
            `}
          />
        )}

        {/* Dialogue Text */}
        <div className="relative">
          <div className="absolute -top-4 -left-2 text-6xl text-red-600/20 font-serif">"</div>
          <p className="text-gray-100 text-lg leading-relaxed pl-6 pr-4 font-light">
            {dialogue}
          </p>
          <div className="absolute -bottom-4 -right-2 text-6xl text-red-600/20 font-serif">"</div>
        </div>

        {/* Mood Indicator */}
        {mood !== 'normal' && (
          <div className={`
            absolute top-3 right-3
            w-3 h-3 rounded-full
            ${mood === 'urgent' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse' : ''}
            ${mood === 'danger' ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse' : ''}
            ${mood === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse' : ''}
          `} />
        )}
      </div>
    </div>
  );
}
