'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  ArrowLeft, UserPlus, Users, Mail, Lock, AlertTriangle,
  ShieldAlert, X, RefreshCw, CheckCircle, Skull, Crosshair
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
  const [showMath, setShowMath] = useState(false);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [mathInput, setMathInput] = useState('');
  const [mathWrong, setMathWrong] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
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

  const handleEnlist = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.teamName.trim()) { setError('Team designation is required'); return; }
    if (!formData.participant1Name.trim()) {
      setError('Operative 1 designation is required'); return;
    }
    if (teamSize === 2 && !formData.participant2Name.trim()) {
      setError('Operative 2 designation is required for Strike Team Duo'); return;
    }
    if (!formData.email.trim()) { setError('Secure email is required'); return; }
    if (formData.password.length < 6) { setError('Passphrase must be at least 6 characters'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passphrases do not match'); return; }
    newProblem();
    setShowMath(true);
  };

  const handleMathSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ans = parseInt(mathInput.trim(), 10);
    if (isNaN(ans) || ans !== problem?.a) {
      setMathWrong(true);
      setMathInput('');
      newProblem();
      return;
    }
    setLoading(true);
    try {
      const result = await api.register({
        email: formData.email,
        teamName: formData.teamName,
        participant1Name: formData.participant1Name,
        participant2Name: teamSize === 2 ? formData.participant2Name : undefined,
        password: formData.password,
      });
      const token = result.access_token || result.token;
      if (token) {
        localStorage.setItem('token', token);
        if (result.user) localStorage.setItem('user', JSON.stringify(result.user));
      }
      router.push('/story');
    } catch (err: unknown) {
      setShowMath(false);
      setError((err as Error).message || 'Enlistment failed. System rejected authorization.');
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
              <ArrowLeft size={13} className="text-red-500" />BACK TO AUTH
            </Link>

            <div style={{ fontSize: 10, color: '#ef4444', letterSpacing: 4, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, fontFamily: 'monospace' }}>
              // ENLISTMENT DIRECTIVE //
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
                  <ShieldAlert className="w-10 h-10 text-red-500 mx-auto drop-shadow-[0_0_8px_#ef4444]" />
                  <div style={{ color: '#f87171', fontSize: 9, letterSpacing: 2, fontWeight: 700, marginTop: 6, fontFamily: 'monospace' }}>NEW OPERATIVE</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              <span className="round-badge round-1">R1: BREACH</span>
              <span className="round-badge round-2">R2: INFILTRATION</span>
              <span className="round-badge round-3">R3: STRIKE</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, margin: 0 }}>
              Form your elite cyber strike team and engage in classified operations against the mall hijackers.
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
              maxHeight: '90vh',
            }}
          >
            <div className="corner-brackets-all" style={{ position: 'absolute', inset: 12, pointerEvents: 'none' }} />

            <div style={{ marginBottom: 20 }}>
              <div className="game-label" style={{ color: '#ef4444', marginBottom: 6 }}>◆ OPERATIVE REGISTRATION</div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4, fontFamily: 'var(--font-rajdhani), sans-serif' }}>
                ENLIST YOUR STRIKE TEAM
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Complete all tactical credentials to join the cyber front.</p>
            </div>

            {error && (
              <div className="game-alert-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEnlist} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div>
                <label className="game-label" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, color: '#fca5a5' }}>
                  <Users size={12} className="text-red-500" />Team Designation
                </label>
                <input
                  className="game-input"
                  type="text"
                  placeholder="e.g. SHADOW_PROTOCOL"
                  value={formData.teamName}
                  onChange={e => f('teamName', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="game-label" style={{ display: 'block', marginBottom: 6, color: '#fca5a5' }}>Tactical Team Size</label>
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
                    SOLO (1 Agent)
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
                    DUO (2 Agents)
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: teamSize === 2 ? '1fr 1fr' : '1fr', gap: 12 }}>
                <div>
                  <label className="game-label" style={{ display: 'block', marginBottom: 6, color: '#fca5a5' }}>Agent 1 Designation</label>
                  <input
                    className="game-input"
                    type="text"
                    placeholder="Primary Operative"
                    value={formData.participant1Name}
                    onChange={e => f('participant1Name', e.target.value)}
                    required
                  />
                </div>
                {teamSize === 2 && (
                  <div>
                    <label className="game-label" style={{ display: 'block', marginBottom: 6, color: '#fca5a5' }}>Agent 2 Designation</label>
                    <input
                      className="game-input"
                      type="text"
                      placeholder="Secondary Operative"
                      value={formData.participant2Name}
                      onChange={e => f('participant2Name', e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="game-label" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, color: '#fca5a5' }}>
                  <Mail size={12} className="text-red-500" />Secure Operative Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} color="#ef4444" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.7 }} />
                  <input
                    className="game-input"
                    type="email"
                    placeholder="team@theextraction.cert"
                    value={formData.email}
                    onChange={e => f('email', e.target.value)}
                    style={{ paddingLeft: 40 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="game-label" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, color: '#fca5a5' }}>
                    <Lock size={12} className="text-red-500" />Passphrase
                  </label>
                  <input
                    className="game-input"
                    type="password"
                    placeholder="Min. 6 chars"
                    value={formData.password}
                    onChange={e => f('password', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="game-label" style={{ display: 'block', marginBottom: 6, color: '#fca5a5' }}>Confirm Passphrase</label>
                  <input
                    className="game-input"
                    type="password"
                    placeholder="Repeat passphrase"
                    value={formData.confirmPassword}
                    onChange={e => f('confirmPassword', e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-game-primary" style={{ width: '100%', marginTop: 4, justifyContent: 'center' }}>
                <UserPlus size={15} />ENLIST STRIKE TEAM
              </button>
            </form>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>Already an active operative? </span>
              <Link href="/login" style={{ color: '#ef4444', fontWeight: 700, fontSize: 13, textDecoration: 'none', letterSpacing: 1 }}>
                AUTHENTICATE
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* MATH VERIFICATION MODAL */}
      {showMath && problem && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}
          onClick={e => { if (e.target === e.currentTarget) { setShowMath(false); } }}
        >
          <div style={{
            background: 'linear-gradient(135deg, rgba(12,4,7,0.99), rgba(24,6,10,0.99))',
            border: '2px solid rgba(220,38,38,0.65)',
            borderRadius: 12,
            padding: '40px 44px',
            width: '100%', maxWidth: 440,
            position: 'relative',
            boxShadow: '0 0 100px rgba(220,38,38,0.3)',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #dc2626, #ef4444, transparent)', borderRadius: '12px 12px 0 0' }} />

            <button
              onClick={() => { setShowMath(false); setMathWrong(false); }}
              style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, display: 'flex' }}
            >
              <X size={17} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div className="game-label" style={{ color: '#ef4444', marginBottom: 8 }}>// HUMAN VERIFICATION PROTOCOL //</div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, fontFamily: 'var(--font-rajdhani), sans-serif' }}>
                SECURITY CLEARANCE
              </h3>
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
                Solve the algorithmic challenge to authenticate human presence.
              </p>
            </div>

            {mathWrong && (
              <div className="game-alert-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>Invalid solution. Challenge refreshed.</span>
              </div>
            )}

            <form onSubmit={handleMathSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Problem box */}
              <div style={{
                background: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(220,38,38,0.4)',
                borderRadius: 8, padding: '18px 22px',
                textAlign: 'center',
              }}>
                <div style={{ color: '#ef4444', fontSize: 10, letterSpacing: 3, marginBottom: 8, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  Solve Equation:
                </div>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 28, fontWeight: 900, color: '#fee2e2', letterSpacing: 4 }}>
                  {problem.q} = ?
                </div>
              </div>

              <div>
                <label className="game-label" style={{ display: 'block', marginBottom: 8, color: '#fca5a5' }}>Target Solution</label>
                <input
                  className="game-input"
                  type="number"
                  placeholder="Computed Answer"
                  value={mathInput}
                  onChange={e => { setMathInput(e.target.value); setMathWrong(false); }}
                  style={{
                    textAlign: 'center', fontSize: 20, letterSpacing: 4,
                    ...(mathWrong ? { borderColor: 'rgba(239,68,68,0.9)' } : {}),
                  }}
                  autoFocus
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={newProblem}
                  style={{
                    padding: '0 16px', height: 44, flexShrink: 0,
                    background: 'rgba(220,38,38,0.1)',
                    border: '1px solid rgba(220,38,38,0.3)',
                    borderRadius: 8, cursor: 'pointer',
                    color: '#f87171', display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, letterSpacing: 1, fontWeight: 700,
                  }}
                >
                  <RefreshCw size={13} />New
                </button>
                <button
                  type="submit"
                  disabled={loading || !mathInput.trim()}
                  className="btn-game-primary"
                  style={{ flex: 1, justifyContent: 'center', opacity: loading || !mathInput.trim() ? 0.55 : 1 }}
                >
                  {loading ? (
                    <>
                      <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Enlisting Operative...
                    </>
                  ) : (
                    <><CheckCircle size={14} />Authorize &amp; Enlist</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
