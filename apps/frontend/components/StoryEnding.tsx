'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface StoryEndingProps {
  outcome: 'CITY_SAVED' | 'BREACH_EXECUTED';
  winnerTeam?: string;
  onClose?: () => void;
}

export default function StoryEnding({ outcome, winnerTeam, onClose }: StoryEndingProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline();

    tl.fromTo(
      '.ending-overlay',
      { opacity: 0 },
      { opacity: 1, duration: 1 }
    )
      .fromTo(
        '.ending-title',
        { opacity: 0, scale: 0.8, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power3.out' }
      )
      .fromTo(
        '.ending-message',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        '-=0.5'
      )
      .fromTo(
        '.ending-details',
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: 'power2.out' },
        '-=0.3'
      );

    return () => {
      tl.kill();
    };
  }, []);

  const isSaved = outcome === 'CITY_SAVED';

  return (
    <div 
      ref={containerRef}
      className="ending-overlay fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm"
    >
      <div className="text-center max-w-4xl px-8">
        <div className={`ending-title text-7xl font-bold mb-8 ${
          isSaved ? 'text-emerald-400' : 'text-red-500'
        }`}>
          {isSaved ? 'MISSION COMPLETE' : 'BREACH EXECUTED'}
        </div>

        <div className="ending-message text-2xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
          {isSaved ? (
            <>
              The kill switch has been disabled. Coimbatore's infrastructure is secure.
              <br />
              <span className="text-emerald-400 font-semibold">
                Operation DARKWEAVE: NEUTRALIZED
              </span>
            </>
          ) : (
            <>
              Time ran out. Ransomware triggered across the city.
              <br />
              <span className="text-red-500 font-semibold">
                Coimbatore is in chaos.
              </span>
            </>
          )}
        </div>

        {winnerTeam && isSaved && (
          <div className="ending-details mb-12">
            <div className="inline-block bg-emerald-950/50 border border-emerald-500 rounded-lg px-8 py-6">
              <div className="text-emerald-400 text-sm font-mono mb-2 uppercase tracking-widest">
                First to Respond
              </div>
              <div className="text-4xl font-bold text-white">
                {winnerTeam}
              </div>
            </div>
          </div>
        )}

        <div className="ending-details text-gray-500 text-sm font-mono space-y-2">
          <div>SCCC SECURITY LOG - INCIDENT #{Math.floor(Math.random() * 9999).toString().padStart(4, '0')}</div>
          <div>TIMESTAMP: {new Date().toISOString()}</div>
          <div>STATUS: {isSaved ? 'RESOLVED' : 'CRITICAL'}</div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="mt-12 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold transition-colors"
          >
            View Scoreboard
          </button>
        )}
      </div>

      {/* Pulse effect */}
      <div className={`absolute inset-0 pointer-events-none ${
        isSaved ? 'animate-pulse-success' : 'animate-pulse-danger'
      }`}>
        <div className={`absolute inset-0 ${
          isSaved ? 'bg-emerald-500/5' : 'bg-red-500/5'
        }`} />
      </div>
    </div>
  );
}
