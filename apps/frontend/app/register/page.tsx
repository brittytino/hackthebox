'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  ArrowLeft, UserPlus, Users, Mail, Lock, AlertTriangle,
  RefreshCw, ShieldAlert, Calculator,
} from 'lucide-react';

interface MathProblem {
  question: string;
  answer: number;
}

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProblem(): MathProblem {
  const type = rnd(0, 4);
  switch (type) {
    case 0: {
      const a = rnd(8, 25), b = rnd(5, 20), c = rnd(2, 8);
      return { question: `(${a} + ${b})  ${c}`, answer: (a + b) * c };
    }
    case 1: {
      const a = rnd(5, 12), b = rnd(3, 9), c = rnd(5, 30);
      return { question: `${a}  ${b} + ${c}`, answer: a * b + c };
    }
    case 2: {
      const b = rnd(5, 18), a = rnd(b + 5, b + 25), c = rnd(2, 7);
      return { question: `(${a}  ${b})  ${c}`, answer: (a - b) * c };
    }
    case 3: {
      const a = rnd(6, 12), b = rnd(4, 9), c = rnd(3, 20);
      return { question: `${a}  ${b}  ${c}`, answer: a * b - c };
    }
    default: {
      const a = rnd(20, 60), b = rnd(3, 9), c = rnd(3, 9);
      return { question: `${a} + ${b}  ${c}`, answer: a + b * c };
    }
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mathProblem, setMathProblem] = useState<MathProblem | null>(null);
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathError, setMathError] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    teamName: '',
    participant1Name: '',
    participant2Name: '',
    password: '',
    confirmPassword: '',
  });

  const refreshProblem = useCallback(() => {
    setMathProblem(generateProblem());
    setMathAnswer('');
    setMathError(false);
  }, []);

  useEffect(() => { refreshProblem(); }, [refreshProblem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMathError(false);

    if (!formData.participant1Name.trim() || !formData.participant2Name.trim()) {
      setError('Both agent names are required'); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }

    // Validate math answer
    const userAnswer = parseInt(mathAnswer.trim(), 10);
    if (isNaN(userAnswer) || userAnswer !== mathProblem?.answer) {
      setMathError(true);
      setMathAnswer('');
      refreshProblem();
      setError('Incorrect answer. A new problem has been generated.');
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
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      refreshProblem();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-root">
      <div
        className="game-bg"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=2070')`,
          filter: 'brightness(0.15) saturate(0.6)',
        }}
      />
      <div className="game-bg-overlay" />
      <div className="scanlines" />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', display: 'flex', overflow: 'hidden' }}>

        {/* LEFT PANEL */}
        <div
          style={{
            width: '42%', height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '40px 44px',
            borderRight: '1px solid rgba(109,40,217,0.3)', position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #7c3aed, #06b6d4, transparent)' }} />

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #4c1d95, #7c3aed)', border: '2px solid rgba(167,139,250,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 0 40px rgba(109,40,217,0.5)' }}>
              <ShieldAlert size={36} color="#e9d5ff" />
            </div>
            <div className="game-title glow-purple" style={{ fontSize: '22px', color: '#e9d5ff', marginBottom: '4px' }}>Operation</div>
            <div className="game-title glow-cyan" style={{ fontSize: '30px', color: '#67e8f9' }}>Cipher Strike</div>
          </div>

          <div className="game-panel-bordered" style={{ padding: '26px 28px', maxWidth: '400px', width: '100%' }}>
            <div className="game-label" style={{ color: '#f59e0b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-dot warning" />MISSION BRIEFING
            </div>
            <p style={{ color: '#c4b5fd', lineHeight: 1.8, fontSize: '14px', marginBottom: '16px' }}>
              The city is under siege. A cyber-terrorist network has infiltrated critical infrastructure.
            </p>
            <p style={{ color: '#a78bfa', lineHeight: 1.8, fontSize: '14px' }}>
              <strong style={{ color: '#e9d5ff' }}>Your expertise is needed.</strong> Operation BLACKOUT activates. Enlist now.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
            <span className="round-badge round-1">Round 1</span>
            <span className="round-badge round-2">Round 2</span>
            <span className="round-badge round-3">Round 3</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <span className="diff-badge diff-easy">9 Missions</span>
            <span className="diff-badge diff-hard">Real Intel</span>
          </div>

          <Link href="/login" style={{ position: 'absolute', bottom: '28px', left: '44px', display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '13px', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
          >
            <ArrowLeft size={14} />Back to Login
          </Link>
        </div>

        {/* RIGHT PANEL */}
        <div className="game-scroll" style={{ width: '58%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 56px', overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: '520px' }}>
            <div style={{ marginBottom: '26px' }}>
              <div className="game-label" style={{ color: '#06b6d4', marginBottom: '8px' }}>OPERATIVE REGISTRATION</div>
              <h1 className="game-title glow-purple" style={{ fontSize: '26px', color: '#e9d5ff', marginBottom: '8px' }}>Enlist Your Team</h1>
              <p style={{ color: '#6b7280', fontSize: '13px' }}>Form your unit and join the counter-terrorism cyber operation.</p>
            </div>

            {error && (
              <div className="game-alert-error" style={{ marginBottom: '18px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />{error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Team name */}
              <div>
                <label className="game-label" style={{ display: 'block', marginBottom: '7px' }}>
                  <Users size={10} style={{ display: 'inline', marginRight: '5px' }} />Team Designation
                </label>
                <input className="game-input" type="text" placeholder="e.g. SHADOW_OPS" value={formData.teamName}
                  onChange={e => setFormData(p => ({ ...p, teamName: e.target.value }))} required />
              </div>

              {/* Agents */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="game-label" style={{ display: 'block', marginBottom: '7px' }}>Agent 1 Name</label>
                  <input className="game-input" type="text" placeholder="First operative" value={formData.participant1Name}
                    onChange={e => setFormData(p => ({ ...p, participant1Name: e.target.value }))} required />
                </div>
                <div>
                  <label className="game-label" style={{ display: 'block', marginBottom: '7px' }}>Agent 2 Name</label>
                  <input className="game-input" type="text" placeholder="Second operative" value={formData.participant2Name}
                    onChange={e => setFormData(p => ({ ...p, participant2Name: e.target.value }))} required />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="game-label" style={{ display: 'block', marginBottom: '7px' }}>
                  <Mail size={10} style={{ display: 'inline', marginRight: '5px' }} />Secure Contact Email
                </label>
                <input className="game-input" type="email" placeholder="team@ops.secure" value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required />
              </div>

              {/* Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="game-label" style={{ display: 'block', marginBottom: '7px' }}>
                    <Lock size={10} style={{ display: 'inline', marginRight: '5px' }} />Passphrase
                  </label>
                  <input className="game-input" type="password" placeholder="Min. 6 chars" value={formData.password}
                    onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} required />
                </div>
                <div>
                  <label className="game-label" style={{ display: 'block', marginBottom: '7px' }}>Confirm</label>
                  <input className="game-input" type="password" placeholder="Repeat passphrase" value={formData.confirmPassword}
                    onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))} required />
                </div>
              </div>

              {/* Math Captcha */}
              <div style={{ background: 'rgba(6,182,212,0.05)', border: `1px solid ${mathError ? 'rgba(239,68,68,0.5)' : 'rgba(6,182,212,0.25)'}`, borderRadius: '12px', padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div className="game-label" style={{ color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calculator size={11} />SECURITY CLEARANCE
                  </div>
                  <button type="button" onClick={refreshProblem} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 8px', borderRadius: '6px' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#06b6d4')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
                  >
                    <RefreshCw size={12} />New problem
                  </button>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '12px' }}>Solve this to verify you are human:</p>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '16px', textAlign: 'center', marginBottom: '14px', border: '1px solid rgba(109,40,217,0.3)' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: 'bold', color: '#e9d5ff', letterSpacing: '3px' }}>
                    {mathProblem?.question ?? '...'} = ?
                  </span>
                </div>
                <input
                  className="game-input"
                  type="number"
                  placeholder="Enter your answer"
                  value={mathAnswer}
                  onChange={e => { setMathAnswer(e.target.value); setMathError(false); }}
                  style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '4px', ...(mathError ? { borderColor: 'rgba(239,68,68,0.7)' } : {}) }}
                  required
                />
              </div>

              <button type="submit" className="btn-game-primary" disabled={loading} style={{ width: '100%', marginTop: '4px', opacity: loading ? 0.7 : 1 }}>
                {loading ? (
                  <>
                    <div style={{ width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Enlisting Team...
                  </>
                ) : (
                  <><UserPlus size={15} />Enlist Team</>
                )}
              </button>
            </form>

            <p style={{ marginTop: '22px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
              Already enlisted?{' '}
              <Link href="/login" style={{ color: '#a78bfa', textDecoration: 'none' }}>
                Access Command Center
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
