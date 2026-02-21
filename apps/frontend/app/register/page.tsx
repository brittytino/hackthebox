'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  ArrowLeft, UserPlus, Users, Mail, Lock, AlertTriangle,
  ShieldAlert, X, RefreshCw, CheckCircle,
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
    if (!formData.participant1Name.trim() || !formData.participant2Name.trim()) {
      setError('Both agent names are required'); return;
    }
    if (!formData.email.trim()) { setError('Email is required'); return; }
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
        participant2Name: formData.participant2Name,
        password: formData.password,
      });
      const token = result.access_token || result.token;
      if (token) {
        localStorage.setItem('token', token);
        if (result.user) localStorage.setItem('user', JSON.stringify(result.user));
      }
      router.push('/story');
    } catch (err: any) {
      setShowMath(false);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const f = (key: keyof typeof formData, val: string) =>
    setFormData(p => ({ ...p, [key]: val }));

  const panelStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(8,4,25,0.98), rgba(15,8,40,0.97))',
    border: '2px solid rgba(109,40,217,0.45)',
  };

  return (
    <div className="game-root">
      {/* Background */}
      <div
        className="game-bg"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop')`,
          filter: 'brightness(0.12) saturate(0.5)',
        }}
      />
      <div
        className="game-bg-overlay"
        style={{ background: 'linear-gradient(135deg, rgba(5,2,18,0.97) 0%, rgba(15,5,40,0.92) 100%)' }}
      />

      {/* Cyber grid */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, zIndex: 2, pointerEvents: 'none' }}>
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#7c3aed" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Center wrapper */}
      <div style={{ position: 'relative', zIndex: 10, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', width: '100%', maxWidth: 1080, margin: '0 32px', boxShadow: '0 0 120px rgba(109,40,217,0.18)' }}>

          {/* LEFT PANEL */}
          <div style={{
            ...panelStyle,
            width: 340, flexShrink: 0,
            borderRight: 'none',
            borderRadius: '16px 0 0 16px',
            display: 'flex', flexDirection: 'column', padding: 36,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ height: 2, position: 'absolute', top: 0, left: 0, right: 0, background: 'linear-gradient(90deg, transparent, #7c3aed, transparent)' }} />

            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#6b7280', textDecoration: 'none', marginBottom: 32, fontSize: 11, letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase' as React.CSSProperties['textTransform'] }}>
              <ArrowLeft size={13} />BACK TO LOGIN
            </Link>

            <div style={{ fontSize: 10, color: '#4c1d95', letterSpacing: 4, fontWeight: 700, textTransform: 'uppercase' as React.CSSProperties['textTransform'], marginBottom: 4 }}>
              ◆ ENLISTMENT ◆
            </div>
            <div className="game-title" style={{ fontSize: 26, background: 'linear-gradient(135deg, #c4b5fd, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.2, marginBottom: 28 }}>
              OPERATION<br />CIPHER<br />STRIKE
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: 130, height: 130, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(124,58,237,0.18), rgba(109,40,217,0.04))',
                border: '2px solid rgba(109,40,217,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 60px rgba(109,40,217,0.12)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <ShieldAlert size={48} color="rgba(124,58,237,0.55)" />
                  <div style={{ color: '#4c1d95', fontSize: 9, letterSpacing: 2, fontWeight: 700, marginTop: 8 }}>ENLIST</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' as React.CSSProperties['flexWrap'] }}>
              <span className="round-badge round-1">Round 1</span>
              <span className="round-badge round-2">Round 2</span>
              <span className="round-badge round-3">Round 3</span>
            </div>
            <p style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.65, margin: 0 }}>
              Form your elite cyber unit and join the counter-operation against Operation BLACKOUT.
            </p>
          </div>

          {/* RIGHT PANEL */}
          <div style={{
            ...panelStyle,
            flex: 1,
            borderLeft: '1px solid rgba(109,40,217,0.2)',
            borderRadius: '0 16px 16px 0',
            padding: '36px 44px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            position: 'relative', overflowY: 'auto',
            maxHeight: '90vh',
          }}>
            <div style={{ marginBottom: 22 }}>
              <div className="game-label" style={{ color: '#7c3aed', marginBottom: 8 }}>◆ OPERATIVE REGISTRATION</div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#e2e8f0', letterSpacing: 2, textTransform: 'uppercase' as React.CSSProperties['textTransform'], marginBottom: 6 }}>Enlist Your Team</h2>
              <p style={{ color: '#4b5563', fontSize: 13, margin: 0 }}>Complete all fields to create your operative unit.</p>
            </div>

            {error && (
              <div className="game-alert-error" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEnlist} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="game-label" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                  <Users size={10} />Team Designation
                </label>
                <input
                  className="game-input"
                  type="text"
                  placeholder="e.g. SHADOW_OPS"
                  value={formData.teamName}
                  onChange={e => f('teamName', e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="game-label" style={{ display: 'block', marginBottom: 7 }}>Agent 1 Name</label>
                  <input
                    className="game-input"
                    type="text"
                    placeholder="First operative"
                    value={formData.participant1Name}
                    onChange={e => f('participant1Name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="game-label" style={{ display: 'block', marginBottom: 7 }}>Agent 2 Name</label>
                  <input
                    className="game-input"
                    type="text"
                    placeholder="Second operative"
                    value={formData.participant2Name}
                    onChange={e => f('participant2Name', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="game-label" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                  <Mail size={10} />Secure Contact Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} color="#4b5563" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    className="game-input"
                    type="email"
                    placeholder="team@ops.secure"
                    value={formData.email}
                    onChange={e => f('email', e.target.value)}
                    style={{ paddingLeft: 40 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="game-label" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                    <Lock size={10} />Passphrase
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
                  <label className="game-label" style={{ display: 'block', marginBottom: 7 }}>Confirm Passphrase</label>
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
                <UserPlus size={15} />ENLIST TEAM
              </button>
            </form>

            <div style={{ marginTop: 18, textAlign: 'center' }}>
              <span style={{ color: '#4b5563', fontSize: 13 }}>Already enlisted? </span>
              <Link href="/login" style={{ color: '#a78bfa', fontWeight: 700, fontSize: 13, textDecoration: 'none', letterSpacing: 1 }}>
                AUTHENTICATE
              </Link>
            </div>

            <div style={{ position: 'absolute', bottom: 16, right: 44, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="status-dot active" />
              <span style={{ color: '#374151', fontSize: 10, letterSpacing: 2 }}>SECURE CHANNEL</span>
            </div>
          </div>
        </div>
      </div>

      {/* MATH VERIFICATION MODAL */}
      {showMath && problem && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)',
          }}
          onClick={e => { if (e.target === e.currentTarget) { setShowMath(false); } }}
        >
          <div style={{
            background: 'linear-gradient(135deg, rgba(8,4,25,0.99), rgba(20,8,60,0.99))',
            border: '2px solid rgba(109,40,217,0.65)',
            borderRadius: 16,
            padding: '44px 48px',
            width: '100%', maxWidth: 440,
            position: 'relative',
            boxShadow: '0 0 100px rgba(109,40,217,0.28)',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #7c3aed, #06b6d4, transparent)', borderRadius: '16px 16px 0 0' }} />

            <button
              onClick={() => { setShowMath(false); setMathWrong(false); }}
              style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', padding: 4, display: 'flex' }}
            >
              <X size={17} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 26 }}>
              <div className="game-label" style={{ color: '#06b6d4', marginBottom: 10 }}>◆ SECURITY CLEARANCE ◆</div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#e2e8f0', letterSpacing: 2, textTransform: 'uppercase' as React.CSSProperties['textTransform'], marginBottom: 8 }}>
                Human Verification
              </h3>
              <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>
                Solve the equation to confirm you are not an AI.
              </p>
            </div>

            {mathWrong && (
              <div className="game-alert-error" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>Wrong answer. New problem generated.</span>
              </div>
            )}

            <form onSubmit={handleMathSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Problem box */}
              <div style={{
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(109,40,217,0.4)',
                borderRadius: 12, padding: '20px 24px',
                textAlign: 'center',
              }}>
                <div style={{ color: '#9ca3af', fontSize: 10, letterSpacing: 3, marginBottom: 12, textTransform: 'uppercase' as React.CSSProperties['textTransform'] }}>
                  Solve this equation (x = multiply)
                </div>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 30, fontWeight: 900, color: '#e9d5ff', letterSpacing: 4 }}>
                  {problem.q} = ?
                </div>
              </div>

              <div>
                <label className="game-label" style={{ display: 'block', marginBottom: 8 }}>Your Answer</label>
                <input
                  className="game-input"
                  type="number"
                  placeholder="Enter the result"
                  value={mathInput}
                  onChange={e => { setMathInput(e.target.value); setMathWrong(false); }}
                  style={{
                    textAlign: 'center', fontSize: 22, letterSpacing: 6,
                    ...(mathWrong ? { borderColor: 'rgba(239,68,68,0.7)' } : {}),
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
                    padding: '0 16px', height: 46, flexShrink: 0,
                    background: 'rgba(109,40,217,0.1)',
                    border: '1px solid rgba(109,40,217,0.3)',
                    borderRadius: 9, cursor: 'pointer',
                    color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, letterSpacing: 1, fontWeight: 600,
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
                      Registering...
                    </>
                  ) : (
                    <><CheckCircle size={14} />Confirm &amp; Enlist</>
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
