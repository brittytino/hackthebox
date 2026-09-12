'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  ArrowLeft, UserPlus, Users, User, Lock, AlertTriangle,
  CheckCircle, ShieldCheck
} from 'lucide-react';

interface MathProblem { q: string; a: number; }

function rnd(lo: number, hi: number) {
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function makeProblem(): MathProblem {
  const t = rnd(0, 4);
  if (t === 0) {
    const a = rnd(10, 30), b = rnd(5, 20), c = rnd(2, 9);
    return { q: '(' + a + ' + ' + b + ') x ' + c, a: (a + b) * c };
  }
  if (t === 1) {
    const a = rnd(4, 12), b = rnd(3, 9), c = rnd(5, 30);
    return { q: a + ' x ' + b + ' + ' + c, a: a * b + c };
  }
  if (t === 2) {
    const b = rnd(5, 15), a = rnd(b + 5, b + 25), c = rnd(2, 8);
    return { q: '(' + a + ' - ' + b + ') x ' + c, a: (a - b) * c };
  }
  if (t === 3) {
    const a = rnd(6, 12), b = rnd(4, 9), c = rnd(3, 20);
    return { q: a + ' x ' + b + ' - ' + c, a: a * b - c };
  }
  const a = rnd(20, 60), b = rnd(3, 9), c = rnd(3, 9);
  return { q: a + ' + ' + b + ' x ' + c, a: a + b * c };
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamSize, setTeamSize] = useState<1 | 2>(2);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [mathInput, setMathInput] = useState('');
  const [mathWrong, setMathWrong] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    teamName: '',
    participant1Name: '',
    participant2Name: '',
    password: '',
    confirmPassword: '',
  });

  const newProblem = useCallback(() => {
    setProblem(makeProblem());
    setMathInput('');
    setMathWrong(false);
  }, []);

  useEffect(() => {
    newProblem();
  }, [newProblem]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMathWrong(false);

    if (!formData.teamName.trim()) {
      setError('Team name is required');
      return;
    }
    if (!formData.participant1Name.trim()) {
      setError('Member 1 name is required');
      return;
    }
    if (teamSize === 2 && !formData.participant2Name.trim()) {
      setError('Member 2 name is required for Duo team');
      return;
    }
    if (!formData.username.trim() || formData.username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const ans = parseInt(mathInput.trim(), 10);
    if (isNaN(ans) || ans !== problem?.a) {
      setMathWrong(true);
      setMathInput('');
      newProblem();
      setError('Math verification failed. Please try the new challenge.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.register({
        username: formData.username.trim(),
        teamName: formData.teamName.trim(),
        participant1Name: formData.participant1Name.trim(),
        participant2Name: teamSize === 2 ? formData.participant2Name.trim() : undefined,
        password: formData.password,
      });
      const token = result.access_token || result.token;
      if (token) {
        localStorage.setItem('token', token);
        if (result.user) localStorage.setItem('user', JSON.stringify(result.user));
      }
      router.push('/story');
    } catch (err: unknown) {
      setMathInput('');
      newProblem();
      setError((err as Error).message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const f = (key: keyof typeof formData, val: string) =>
    setFormData(p => ({ ...p, [key]: val }));

  return (
    <div className="game-root relative flex items-center justify-center min-h-screen bg-[#050508] overflow-y-auto">
      {/* Background */}
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
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Center wrapper */}
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div
          style={{
            display: 'flex', width: '100%', maxWidth: 1080,
            maxHeight: 'calc(100vh - 48px)',
            boxShadow: '0 0 100px rgba(220,38,38,0.2)',
          }}
          className="flex-col md:flex-row rounded-xl overflow-hidden border border-red-900/60 bg-[#0a0406]/95 backdrop-blur-xl"
        >

          {/* LEFT PANEL */}
          <div
            style={{
              width: '100%', maxWidth: 340, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(14,4,7,0.98), rgba(24,6,10,0.95))',
              borderRight: '1px solid rgba(220,38,38,0.4)',
              display: 'flex', flexDirection: 'column', padding: 36,
              position: 'relative', overflow: 'hidden',
            }}
            className="hidden md:flex"
          >
            <div style={{ height: 2, position: 'absolute', top: 0, left: 0, right: 0, background: 'linear-gradient(90deg, transparent, #dc2626, transparent)' }} />

            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#9ca3af', textDecoration: 'none', marginBottom: 28, fontSize: 11, letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase', fontFamily: 'monospace' }}>
              <ArrowLeft size={13} className="text-red-500" />BACK TO LOGIN
            </Link>

            <div style={{ fontSize: 10, color: '#ef4444', letterSpacing: 4, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, fontFamily: 'monospace' }}>
              // TEAM REGISTRATION //
            </div>
            <div className="font-heading-tactical" style={{ fontSize: 26, color: '#f1f5f9', fontWeight: 900, lineHeight: 1.2, letterSpacing: 2, marginBottom: 20 }}>
              OPERATION<br /><span style={{ color: '#dc2626' }}>THE EXTRACTION</span>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px 0' }}>
              <div style={{
                width: 130, height: 130, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(220,38,38,0.25), rgba(138,3,3,0.05))',
                border: '2px solid rgba(220,38,38,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 50px rgba(220,38,38,0.2)',
                position: 'relative',
              }}>
                <div className="corner-brackets-all" style={{ position: 'absolute', inset: 6 }} />
                <div style={{ textAlign: 'center' }}>
                  <ShieldCheck className="w-10 h-10 text-red-500 mx-auto drop-shadow-[0_0_8px_#ef4444]" />
                  <div style={{ color: '#f87171', fontSize: 10, letterSpacing: 2, fontWeight: 700, marginTop: 6, fontFamily: 'monospace' }}>TEAM SIGNUP</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              <span className="round-badge round-1">ROUND 1</span>
              <span className="round-badge round-2">ROUND 2</span>
              <span className="round-badge round-3">ROUND 3</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, margin: 0 }}>
              Register your team to participate in the CTF challenges, unlock clues, and compete on the live leaderboard.
            </p>
          </div>

          {/* RIGHT PANEL */}
          <div
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, rgba(10,4,6,0.98), rgba(18,6,10,0.96))',
              padding: '36px 44px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              position: 'relative', overflowY: 'auto',
            }}
          >
            <div className="corner-brackets-all" style={{ position: 'absolute', inset: 12, pointerEvents: 'none' }} />

            <div style={{ marginBottom: 20 }}>
              <div className="game-label" style={{ color: '#ef4444', marginBottom: 6 }}>◆ TEAM REGISTRATION</div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4, fontFamily: 'var(--font-rajdhani), sans-serif' }}>
                REGISTER YOUR TEAM
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Fill in your team and member details to get started.</p>
            </div>

            {error && (
              <div className="game-alert-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {/* Team Name */}
              <div>
                <label className="game-label" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, color: '#fca5a5' }}>
                  <Users size={12} className="text-red-500" />Team Name
                </label>
                <input
                  className="game-input"
                  type="text"
                  placeholder="e.g. CyberKnights"
                  value={formData.teamName}
                  onChange={e => f('teamName', e.target.value)}
                  required
                />
              </div>

              {/* Team Size */}
              <div>
                <label className="game-label" style={{ display: 'block', marginBottom: 6, color: '#fca5a5' }}>Team Size</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setTeamSize(1)}
                    style={{
                      flex: 1, height: 38, borderRadius: 6,
                      background: teamSize === 1 ? 'rgba(220,38,38,0.25)' : 'rgba(0,0,0,0.4)',
                      border: teamSize === 1 ? '1px solid #ef4444' : '1px solid rgba(220,38,38,0.2)',
                      color: teamSize === 1 ? '#fee2e2' : '#9ca3af',
                      cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: 1,
                      fontFamily: 'monospace',
                    }}
                  >
                    Solo (1 Member)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeamSize(2)}
                    style={{
                      flex: 1, height: 38, borderRadius: 6,
                      background: teamSize === 2 ? 'rgba(220,38,38,0.25)' : 'rgba(0,0,0,0.4)',
                      border: teamSize === 2 ? '1px solid #ef4444' : '1px solid rgba(220,38,38,0.2)',
                      color: teamSize === 2 ? '#fee2e2' : '#9ca3af',
                      cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: 1,
                      fontFamily: 'monospace',
                    }}
                  >
                    Duo (2 Members)
                  </button>
                </div>
              </div>

              {/* Member Names */}
              <div style={{ display: 'grid', gridTemplateColumns: teamSize === 2 ? '1fr 1fr' : '1fr', gap: 12 }}>
                <div>
                  <label className="game-label" style={{ display: 'block', marginBottom: 6, color: '#fca5a5' }}>Member 1 Name</label>
                  <input
                    className="game-input"
                    type="text"
                    placeholder="First member's full name"
                    value={formData.participant1Name}
                    onChange={e => f('participant1Name', e.target.value)}
                    required
                  />
                </div>
                {teamSize === 2 && (
                  <div>
                    <label className="game-label" style={{ display: 'block', marginBottom: 6, color: '#fca5a5' }}>Member 2 Name</label>
                    <input
                      className="game-input"
                      type="text"
                      placeholder="Second member's full name"
                      value={formData.participant2Name}
                      onChange={e => f('participant2Name', e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Username (instead of email) */}
              <div>
                <label className="game-label" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, color: '#fca5a5' }}>
                  <User size={12} className="text-red-500" />Username (for logging in)
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={14} color="#ef4444" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.7 }} />
                  <input
                    className="game-input"
                    type="text"
                    placeholder="e.g. cyber_team"
                    value={formData.username}
                    onChange={e => f('username', e.target.value)}
                    style={{ paddingLeft: 40 }}
                    required
                    autoComplete="username"
                  />
                </div>
                <div style={{ color: '#6b7280', fontSize: 11, marginTop: 4, fontFamily: 'monospace' }}>
                  Choose a unique username that you will use to log in.
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="game-label" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, color: '#fca5a5' }}>
                    <Lock size={12} className="text-red-500" />Password
                  </label>
                  <input
                    className="game-input"
                    type="password"
                    placeholder="Min. 6 chars"
                    value={formData.password}
                    onChange={e => f('password', e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="game-label" style={{ display: 'block', marginBottom: 6, color: '#fca5a5' }}>Confirm Password</label>
                  <input
                    className="game-input"
                    type="password"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={e => f('confirmPassword', e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* INLINE MATH VERIFICATION */}
              {problem && (
                <div style={{
                  marginTop: 10, padding: '14px 18px', borderRadius: 8,
                  background: 'rgba(0,0,0,0.55)', border: mathWrong ? '1px solid rgba(239,68,68,0.8)' : '1px solid rgba(220,38,38,0.4)',
                  display: 'flex', alignItems: 'center', gap: 16
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#ef4444', fontSize: 10, letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                      Human Verification (Solve Math Problem):
                    </div>
                    <div style={{ fontFamily: "'Courier New', monospace", fontSize: 18, fontWeight: 900, color: '#fee2e2', letterSpacing: 2 }}>
                      {problem.q} = ?
                    </div>
                  </div>
                  <div style={{ width: 110 }}>
                    <input
                      className="game-input"
                      type="number"
                      placeholder="Answer"
                      value={mathInput}
                      onChange={e => { setMathInput(e.target.value); setMathWrong(false); }}
                      style={{
                        textAlign: 'center', fontSize: 16, letterSpacing: 2,
                        ...(mathWrong ? { borderColor: 'rgba(239,68,68,0.9)' } : {}),
                      }}
                      required
                    />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-game-primary" style={{ width: '100%', marginTop: 4, justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                {loading ? (
                  <>
                    <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    REGISTERING...
                  </>
                ) : (
                  <><UserPlus size={15} />REGISTER TEAM</>
                )}
              </button>
            </form>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>Already have an account? </span>
              <Link href="/login" style={{ color: '#ef4444', fontWeight: 700, fontSize: 13, textDecoration: 'none', letterSpacing: 1 }}>
                LOG IN
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
