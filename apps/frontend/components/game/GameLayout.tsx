'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';

interface GameLayoutProps {
  children: ReactNode;
  backgroundImage?: string;
  showScanlines?: boolean;
  className?: string;
}

export default function GameLayout({
  children,
  backgroundImage = '/images/background/default.jpg',
  showScanlines = true,
  className = '',
}: GameLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#0a0a14] flex items-center justify-center">
      {/* Fixed Game Container - 16:9 Aspect Ratio */}
      <div
        ref={containerRef}
        className={`relative w-full h-full max-w-[1920px] max-h-[1080px] ${className}`}
        style={{
          aspectRatio: '16/9',
        }}
      >
        {/* Background Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            filter: 'brightness(0.15) saturate(0.6)',
          }}
        />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,20,0.7) 100%)',
          }}
        />

        {/* Scanlines Effect */}
        {showScanlines && (
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.3), rgba(0,0,0,0.3) 1px, transparent 1px, transparent 2px)',
            }}
          />
        )}

        {/* Main Content */}
        <div className="relative z-10 w-full h-full">
          {children}
        </div>

        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-purple-600/40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-cyan-500/40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-purple-600/40 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-cyan-500/40 pointer-events-none" />
      </div>
    </div>
  );
}
