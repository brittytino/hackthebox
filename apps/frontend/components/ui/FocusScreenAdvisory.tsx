'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Maximize2, Minimize2, Monitor, Zap, X, CheckCircle2, ShieldCheck } from 'lucide-react';

export function useFocusScreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateFs = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    updateFs();
    document.addEventListener('fullscreenchange', updateFs);
    return () => document.removeEventListener('fullscreenchange', updateFs);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      // Ignored if user cancels or permission denied
    }
  }, []);

  return { isFullscreen, toggleFullscreen };
}

export function FocusScreenButton({
  className = '',
  isFocusMode,
  onToggleFocus,
}: {
  className?: string;
  isFocusMode?: boolean;
  onToggleFocus?: () => void;
}) {
  const { isFullscreen, toggleFullscreen } = useFocusScreen();
  const active = Boolean(isFullscreen || isFocusMode);

  const handleClick = () => {
    if (onToggleFocus) {
      onToggleFocus();
    } else {
      toggleFullscreen();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={active ? 'Exit Focus Mode (F11 / Esc)' : 'Enter Focus Screen (F11)'}
      className={`focus-screen-toggle-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '6px 14px',
        background: active
          ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.08))'
          : 'linear-gradient(135deg, rgba(220,38,38,0.16), rgba(127,29,29,0.06))',
        border: `1px solid ${active ? 'rgba(16,185,129,0.6)' : 'rgba(239,68,68,0.45)'}`,
        borderRadius: 6,
        color: active ? '#6ee7b7' : '#fee2e2',
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: '1px',
        fontFamily: 'monospace',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: active
          ? '0 0 16px rgba(16,185,129,0.35), inset 0 0 10px rgba(16,185,129,0.1)'
          : '0 0 12px rgba(220,38,38,0.25)',
      }}
    >
      {active ? (
        <>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
              animation: 'ledPulse 1.5s infinite',
            }}
          />
          <Minimize2 size={13} color="#10b981" />
          <span>FOCUS ACTIVE</span>
          <span
            style={{
              fontSize: 9,
              color: '#a7f3d0',
              background: 'rgba(16,185,129,0.2)',
              padding: '1px 5px',
              borderRadius: 3,
            }}
          >
            ESC
          </span>
        </>
      ) : (
        <>
          <Maximize2 size={13} color="#ef4444" />
          <span>FOCUS SCREEN</span>
          <span
            style={{
              fontSize: 9,
              color: '#fca5a5',
              background: 'rgba(220,38,38,0.25)',
              padding: '1px 5px',
              borderRadius: 3,
            }}
          >
            F11
          </span>
        </>
      )}
    </button>
  );
}

export default function FocusScreenAdvisory({ onEngage }: { onEngage?: () => void }) {
  const { isFullscreen, toggleFullscreen } = useFocusScreen();
  const [showModal, setShowModal] = useState(false);
  const [hudNotice, setHudNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const justLoggedIn = sessionStorage.getItem('just_logged_in');
      const dismissed = sessionStorage.getItem('focus_screen_dismissed');

      if (justLoggedIn === 'true' && !dismissed && !document.fullscreenElement) {
        setShowModal(true);
      }
    }
  }, []);

  const handleEngage = async () => {
    sessionStorage.removeItem('just_logged_in');
    sessionStorage.setItem('focus_screen_dismissed', 'true');
    setShowModal(false);
    await toggleFullscreen();
    if (onEngage) onEngage();
    setHudNotice('FOCUS MODE ENGAGED // OPTIMAL FULL-SCREEN RESOLUTION');
    setTimeout(() => setHudNotice(null), 3000);
  };

  const handleDismiss = () => {
    sessionStorage.removeItem('just_logged_in');
    sessionStorage.setItem('focus_screen_dismissed', 'true');
    setShowModal(false);
  };

  return (
    <>
      {/* Toast Notice */}
      {hudNotice && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            background: 'rgba(10,4,6,0.96)',
            border: '1px solid #10b981',
            boxShadow: '0 0 30px rgba(16,185,129,0.3)',
            borderRadius: 8,
            padding: '10px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#a7f3d0',
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1.5,
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <CheckCircle2 size={16} color="#10b981" />
          <span>{hudNotice}</span>
        </div>
      )}

      {/* Full-Screen Focus Advisory Modal */}
      {showModal && !isFullscreen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99990,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          <div
            className="tactical-box corner-brackets"
            style={{
              position: 'relative',
              maxWidth: 520,
              width: '100%',
              background: 'linear-gradient(135deg, rgba(14,4,7,0.98), rgba(28,6,10,0.97))',
              border: '1px solid rgba(220,38,38,0.6)',
              borderRadius: 12,
              padding: '32px 28px',
              boxShadow: '0 0 60px rgba(220,38,38,0.4)',
              overflow: 'hidden',
              animation: 'hudGlitchIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            {/* Top scanning line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: 'linear-gradient(90deg, transparent, #ef4444, transparent)',
                boxShadow: '0 0 15px #ef4444',
              }}
            />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg,#7f1d1d,#dc2626)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(220,38,38,0.5)',
                    border: '1px solid rgba(248,113,113,0.6)',
                    flexShrink: 0,
                  }}
                >
                  <Monitor size={22} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#ef4444', letterSpacing: 3, fontWeight: 800, fontFamily: 'monospace' }}>
                    // DISPLAY OPTIMIZATION //
                  </div>
                  <h3 style={{ margin: 0, fontSize: 20, color: '#fee2e2', fontWeight: 900, letterSpacing: 1.5, fontFamily: 'var(--font-rajdhani), sans-serif' }}>
                    FULL-SCREEN FOCUS MODE
                  </h3>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  padding: 4,
                  transition: 'color 0.2s',
                }}
                title="Dismiss"
              >
                <X size={18} />
              </button>
            </div>

            {/* Description */}
            <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.7, margin: '0 0 20px' }}>
              Welcome to the operational arena. For the optimal challenge workspace, maximized code view, and zero browser tab distractions, we recommend activating <strong style={{ color: '#fca5a5' }}>Full-Screen Focus Mode</strong>.
            </p>

            {/* Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
              <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 6, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: 11, fontWeight: 800, fontFamily: 'monospace', marginBottom: 3 }}>
                  <Maximize2 size={12} /> FULL WORKSPACE
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>Expands the challenge terminal to full monitor width.</div>
              </div>
              <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 6, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: 11, fontWeight: 800, fontFamily: 'monospace', marginBottom: 3 }}>
                  <Zap size={12} /> HOTKEY: F11 / ESC
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>Quickly enter or exit focus mode anytime.</div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleDismiss}
                style={{
                  padding: '10px 18px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 6,
                  color: '#94a3b8',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  letterSpacing: 1,
                  transition: 'all 0.15s',
                }}
              >
                PROCEED WINDOWED
              </button>
              <button
                type="button"
                onClick={handleEngage}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 22px',
                  background: 'linear-gradient(135deg, #b91c1c, #ef4444)',
                  border: '1px solid rgba(254,202,202,0.5)',
                  borderRadius: 6,
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  letterSpacing: 1.5,
                  boxShadow: '0 0 24px rgba(220,38,38,0.45)',
                  transition: 'all 0.2s',
                }}
              >
                <Maximize2 size={14} />
                <span>ENGAGE FOCUS SCREEN</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
