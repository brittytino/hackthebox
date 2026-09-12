'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { User, Lock, AlertTriangle, LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api.login({ username: formData.username, password: formData.password });
      localStorage.setItem('token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
      sessionStorage.setItem('just_logged_in', 'true');
      sessionStorage.removeItem('focus_screen_dismissed');
      // Redirect admin to admin panel, regular users to dashboard
      if (result.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Login failed. Please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-root relative flex items-center justify-center min-h-screen bg-[#050508]">
      {/* Background with Blood Vignette */}
      <div
        className="game-bg"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop')`,
          filter: 'brightness(0.08) contrast(1.4) saturate(1.2)',
        }}
      />
      <div className="game-bg-overlay" />
      <div className="blood-splatter-bg" />

      {/* Cyber grid */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08, zIndex: 2, pointerEvents: 'none' }}>
        <defs>
          <pattern id="lgrid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lgrid)" />
      </svg>

      {/* Main layout */}
      <div
        style={{
          position: 'relative', zIndex: 10,
          minHeight: '100vh', width: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex', width: '100%', maxWidth: 1020,
            minHeight: 580, maxHeight: 'calc(100vh - 48px)',
            boxShadow: '0 0 100px rgba(220,38,38,0.2)',
          }}
          className="flex-col md:flex-row rounded-xl overflow-hidden border border-red-900/60 bg-[#0a0406]/95 backdrop-blur-xl"
        >
          {/* Left: Info panel */}
          <div
            style={{
              width: '100%', maxWidth: 380, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(14,4,7,0.98), rgba(24,6,10,0.95))',
              borderRight: '1px solid rgba(220,38,38,0.4)',
              display: 'flex', flexDirection: 'column',
              padding: 36, position: 'relative', overflow: 'hidden',
            }}
            className="hidden md:flex"
          >
            {/* Top accent */}
            <div style={{ height: 2, position: 'absolute', top: 0, left: 0, right: 0, background: 'linear-gradient(90deg, transparent, #dc2626, transparent)' }} />

            <div style={{ marginBottom: 'auto' }}>
              <div style={{ fontSize: 10, color: '#ef4444', letterSpacing: 4, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, fontFamily: 'monospace' }}>
                // CTF CHALLENGE PORTAL //
              </div>
              <div className="font-heading-tactical" style={{ fontSize: 30, color: '#f1f5f9', fontWeight: 900, lineHeight: 1.1, letterSpacing: 2 }}>
                OPERATION<br /><span style={{ color: '#dc2626' }}>THE EXTRACTION</span>
              </div>
            </div>

            {/* Tactical icon center badge */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '20px 0',
              }}
            >
              <div
                style={{
                  width: 150, height: 150, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(220,38,38,0.25), rgba(138,3,3,0.05))',
                  border: '2px solid rgba(220,38,38,0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 50px rgba(220,38,38,0.2)',
                  position: 'relative',
                }}
              >
                <div className="corner-brackets-all" style={{ position: 'absolute', inset: 8 }} />
                <div style={{ textAlign: 'center' }}>
                  <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-2 drop-shadow-[0_0_10px_#ef4444]" />
                  <div style={{ color: '#f87171', fontSize: 10, letterSpacing: 2, fontWeight: 700, fontFamily: 'monospace' }}>WELCOME</div>
                </div>
              </div>
            </div>

            {/* Bottom description */}
            <div>
              <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6 }}>
                Sign in with your username and password to access the challenges and live scoreboard.
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                {['CHALLENGES', 'LEADERBOARD', 'SECURE'].map(tag => (
                  <div
                    key={tag}
                    style={{
                      padding: '3px 8px',
                      background: 'rgba(220,38,38,0.1)',
                      border: '1px solid rgba(220,38,38,0.3)',
                      borderRadius: 4,
                      fontSize: 9,
                      color: '#f87171',
                      letterSpacing: 1,
                      fontWeight: 700,
                      fontFamily: 'monospace',
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Form panel */}
          <div
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, rgba(10,4,6,0.98), rgba(18,6,10,0.96))',
              padding: '40px 44px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              overflowY: 'auto',
            }}
          >
            <div className="corner-brackets-all" style={{ position: 'absolute', inset: 12, pointerEvents: 'none' }} />

            {/* Corner decoration */}
            <div style={{ position: 'absolute', top: 20, right: 24, color: '#ef4444', fontSize: 10, letterSpacing: 2, fontFamily: 'monospace' }}>
              // SIGN IN //
            </div>

            <div style={{ marginBottom: 28 }}>
              <div className="game-label" style={{ color: '#ef4444', marginBottom: 6 }}>◆ ACCOUNT ACCESS</div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, fontFamily: 'var(--font-rajdhani), sans-serif' }}>
                LOG IN
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5 }}>
                Enter your username and password to access your dashboard.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="game-alert-error" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Username */}
              <div>
                <label className="game-label" style={{ display: 'block', marginBottom: 8, color: '#fca5a5' }}>
                  ◆ USERNAME
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#ef4444" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.7 }} />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="game-input"
                    style={{ paddingLeft: 42 }}
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="game-label" style={{ display: 'block', marginBottom: 8, color: '#fca5a5' }}>
                  ◆ PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#ef4444" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.7 }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="game-input"
                    style={{ paddingLeft: 42, paddingRight: 42 }}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2 }}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-game-primary"
                style={{ width: '100%', marginTop: 8, justifyContent: 'center', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    LOGGING IN...
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    LOG IN
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>Don&apos;t have an account? </span>
              <Link href="/register" style={{ color: '#ef4444', fontWeight: 700, fontSize: 13, textDecoration: 'none', letterSpacing: 1 }}>
                REGISTER YOUR TEAM
              </Link>
            </div>

            {/* Bottom status */}
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <span className="status-dot active" />
              <span style={{ color: '#6b7280', fontSize: 10, letterSpacing: 2, fontFamily: 'monospace' }}>SECURE CONNECTION</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}
