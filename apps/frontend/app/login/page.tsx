'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ArrowLeft, Mail, Lock, AlertTriangle, LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api.login({ email: formData.email, password: formData.password });
      localStorage.setItem('token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'ACCESS DENIED: Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-root">
      {/* Background */}
      <div
        className="game-bg"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop')`,
          filter: 'brightness(0.15) saturate(0.6)',
        }}
      />
      <div
        className="game-bg-overlay"
        style={{
          background: 'linear-gradient(135deg, rgba(5,2,18,0.97) 0%, rgba(15,5,40,0.92) 100%)',
        }}
      />

      {/* Cyber grid */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, zIndex: 2, pointerEvents: 'none' }}>
        <defs>
          <pattern id="lgrid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#7c3aed" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lgrid)" />
      </svg>

      {/* Main layout */}
      <div
        style={{
          position: 'relative', zIndex: 10,
          height: '100vh', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex', width: '100%', maxWidth: 1000,
            height: 580, margin: '0 32px',
          }}
        >
          {/* Left: Art panel */}
          <div
            style={{
              width: 380, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(5,2,20,0.97), rgba(20,8,50,0.95))',
              border: '2px solid rgba(109,40,217,0.45)',
              borderRight: 'none',
              borderRadius: '16px 0 0 16px',
              display: 'flex', flexDirection: 'column',
              padding: 36, position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Top accent */}
            <div style={{ height: 2, position: 'absolute', top: 0, left: 0, right: 0, background: 'linear-gradient(90deg, transparent, #7c3aed, transparent)' }} />

            {/* Logo */}
            <div style={{ marginBottom: 'auto' }}>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#6b7280', textDecoration: 'none', marginBottom: 32, fontSize: 12, letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase' }}>
                <ArrowLeft size={14} />
                MAIN MENU
              </Link>

              <div>
                <div style={{ fontSize: 10, color: '#4c1d95', letterSpacing: 4, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                  ◆ CLASSIFIED ◆
                </div>
                <div className="game-title" style={{ fontSize: 32, background: 'linear-gradient(135deg, #c4b5fd, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.1 }}>
                  OPERATION<br />CIPHER<br />STRIKE
                </div>
              </div>
            </div>

            {/* Character placeholder (where character image would show) */}
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
                  width: 160, height: 160, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(124,58,237,0.2), rgba(109,40,217,0.05))',
                  border: '2px solid rgba(109,40,217,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 60px rgba(109,40,217,0.15)',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>🛡️</div>
                  <div style={{ color: '#4c1d95', fontSize: 10, letterSpacing: 2, fontWeight: 700 }}>AUTHENTICATE</div>
                </div>
              </div>
            </div>

            {/* Bottom description */}
            <div>
              <div style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6 }}>
                Secure access portal for authorized operatives only. Your credentials are encrypted end-to-end.
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
                {['ENCRYPTED', 'SECURE', 'LIVE'].map(tag => (
                  <div
                    key={tag}
                    style={{
                      padding: '3px 10px',
                      background: 'rgba(109,40,217,0.1)',
                      border: '1px solid rgba(109,40,217,0.25)',
                      borderRadius: 4,
                      fontSize: 10,
                      color: '#6b7280',
                      letterSpacing: 1,
                      fontWeight: 700,
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
              background: 'linear-gradient(135deg, rgba(8,4,25,0.98), rgba(15,8,40,0.97))',
              border: '2px solid rgba(109,40,217,0.45)',
              borderLeft: '1px solid rgba(109,40,217,0.2)',
              borderRadius: '0 16px 16px 0',
              padding: '44px 48px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Corner decoration */}
            <div style={{ position: 'absolute', top: 16, right: 16, color: '#1a0f40', fontSize: 11, letterSpacing: 1 }}>
              TERMINAL v3.0
            </div>

            <div style={{ marginBottom: 32 }}>
              <div className="game-label" style={{ color: '#7c3aed', marginBottom: 8 }}>◆ AUTHENTICATION REQUIRED</div>
              <h2 style={{ fontSize: 30, fontWeight: 900, color: '#e2e8f0', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                SYSTEM ACCESS
              </h2>
              <p style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.5 }}>
                Enter your credentials to access the mission portal.
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
              {/* Email */}
              <div>
                <label className="game-label" style={{ display: 'block', marginBottom: 8 }}>
                  ◆ EMAIL ADDRESS
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#4b5563" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="game-input"
                    style={{ paddingLeft: 42 }}
                    placeholder="agent@codissia.in"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="game-label" style={{ display: 'block', marginBottom: 8 }}>
                  ◆ PASSPHRASE
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#4b5563" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="game-input"
                    style={{ paddingLeft: 42, paddingRight: 42 }}
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', padding: 2 }}
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
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    AUTHENTICATE
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <span style={{ color: '#4b5563', fontSize: 13 }}>New operative? </span>
              <Link href="/register" style={{ color: '#a78bfa', fontWeight: 700, fontSize: 13, textDecoration: 'none', letterSpacing: 1 }}>
                ENLIST NOW
              </Link>
            </div>

            {/* Bottom status */}
            <div style={{ position: 'absolute', bottom: 20, left: 48, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="status-dot active" />
              <span style={{ color: '#374151', fontSize: 11, letterSpacing: 2 }}>SECURE CONNECTION</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

