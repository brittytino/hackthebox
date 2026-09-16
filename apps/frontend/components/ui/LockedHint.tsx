'use client';

import { Lock } from 'lucide-react';

interface LockedHintProps {
  text: string;
  position?: 'top' | 'bottom';
}

/**
 * Hover tooltip explaining why a mission is locked. The parent element must
 * carry `group relative` (and must NOT clip overflow) for this to show.
 */
export default function LockedHint({ text, position = 'top' }: LockedHintProps) {
  const sideClass = position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
  return (
    <div
      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 ${sideClass} z-30 w-max max-w-[220px] opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0`}
    >
      <div className="flex items-center gap-1.5 rounded-md border border-red-900/60 bg-[#0a0407] px-2.5 py-1.5 text-[10px] font-mono font-semibold leading-snug tracking-wide text-red-200 shadow-lg shadow-black/70">
        <Lock size={11} className="shrink-0 text-red-400" />
        <span>{text}</span>
      </div>
    </div>
  );
}
