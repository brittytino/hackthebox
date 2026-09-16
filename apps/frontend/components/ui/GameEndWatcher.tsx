'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { ShieldAlert, ChevronRight, Zap } from 'lucide-react';

export default function GameEndWatcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [ended, setEnded] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const redirectedRef = useRef(false);

  useEffect(() => {
    // Don't trigger modal if already on credits or admin panel
    if (pathname?.includes('/credits') || pathname?.includes('/admin')) {
      return;
    }

    let isMounted = true;
    const checkState = async () => {
      try {
        const state = await api.game.getState();
        if (!isMounted) return;
        if (state?.storyEnded && !redirectedRef.current) {
          setEnded(true);
          setWinner(state.winnerTeamName || 'THE ALLIED OPERATIVES');
        }
      } catch {}
    };

    checkState();
    const interval = setInterval(checkState, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pathname]);

  // Countdown when game end is detected
  useEffect(() => {
    if (!ended || redirectedRef.current) return;

    if (countdown <= 0) {
      redirectedRef.current = true;
      router.push('/credits');
      return;
    }

    timerRef.current = setTimeout(() => {
      setCountdown(c => c - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ended, countdown, router]);

  const handleProceedNow = () => {
    redirectedRef.current = true;
    router.push('/credits');
  };

  if (!ended || pathname?.includes('/credits') || pathname?.includes('/admin')) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(2, 1, 3, 0.94)', backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, fontFamily: "'Rajdhani', sans-serif",
      }}
    >
      <style>{`
        @keyframes alertPulse { 0%, 100% { border-color: rgba(239,68,68,0.8); box-shadow: 0 0 50px rgba(239,68,68,0.4); } 50% { border-color: rgba(239,68,68,0.3); box-shadow: 0 0 20px rgba(239,68,68,0.2); } }
      `}</style>

      <div
        style={{
          maxWidth: 580, width: '100%',
          background: 'linear-gradient(135deg, rgba(16,4,8,0.98), rgba(28,6,12,0.98))',
          border: '2px solid #ef4444', borderRadius: 16, padding: '36px 32px',
          textAlign: 'center', animation: 'alertPulse 2s infinite',
        }}
      >
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(239,68,68,0.4)' }}>
          <ShieldAlert size={32} color="#ef4444" />
        </div>

        <div style={{ color: '#ef4444', fontSize: 12, letterSpacing: 4, fontFamily: 'monospace', fontWeight: 900 }}>
          // EMERGENCY COMMAND OVERRIDE //
        </div>

        <div className="font-heading-tactical" style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '1px', margin: '8px 0 12px' }}>
          OPERATION CONCLUDED
        </div>

        <p style={{ color: '#cbd5e1', fontSize: 15, lineHeight: 1.6, margin: '0 0 20px' }}>
          Tactical Command has concluded the live CTF event. All sectors are locked and final scores have been calculated.
        </p>

        {winner && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, marginBottom: 24 }}>
            <div style={{ color: '#94a3b8', fontSize: 10, letterSpacing: 2, fontFamily: 'monospace' }}>HONORED CHAMPION SQUAD</div>
            <div style={{ color: '#fef08a', fontSize: 20, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{winner}</div>
          </div>
        )}

        <div style={{ color: '#ef4444', fontSize: 13, fontFamily: 'monospace', letterSpacing: 2, marginBottom: 20, fontWeight: 700 }}>
          TRANSITIONING TO POST-CREDITS FINALE IN {countdown}S...
        </div>

        <button
          onClick={handleProceedNow}
          style={{
            width: '100%', padding: '14px 24px', background: 'linear-gradient(135deg, #7f1d1d, #dc2626)',
            border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 900,
            fontFamily: 'monospace', letterSpacing: 2, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 0 25px rgba(220,38,38,0.5)',
          }}
        >
          <Zap size={16} /> WATCH POST-CREDITS FINALE NOW <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
