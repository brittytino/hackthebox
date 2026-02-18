'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  ArrowLeft, UserPlus, Users, Mail, Lock, AlertTriangle,
  CheckCircle, Smartphone, ShieldAlert,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    teamName: '',
    participant1Name: '',
    participant2Name: '',
    password: '',
    confirmPassword: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.participant1Name.trim() || !formData.participant2Name.trim()) {
      setError('Both participant names are required'); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters'); return;
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
      if (result.devOtp) setDevOtp(result.devOtp);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) { setError('Please enter the OTP'); return; }
    setLoading(true);
    try {
      const result = await api.auth.verifyOTP({ email: formData.email, otp });
      if (result.token) {
        localStorage.setItem('token', result.token);
        if (result.user) localStorage.setItem('user', JSON.stringify(result.user));
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
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

      <div
        style={{
          position: 'relative', zIndex: 10, width: '100%', height: '100%',
          display: 'flex', overflow: 'hidden',
        }}
      >
        {/* LEFT PANEL */}
        <div
          style={{
            width: '42%', height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '40px 44px',
            borderRight: '1px solid rgba(109,40,217,0.3)', position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
              background: 'linear-gradient(90deg, transparent, #7c3aed, #06b6d4, transparent)',
            }}
          />

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div
              style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
                border: '2px solid rgba(167,139,250,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px', boxShadow: '0 0 40px rgba(109,40,217,0.5)',
              }}
            >
              <ShieldAlert size={36} color="#e9d5ff" />
            </div>
            <div className="game-title glow-purple" style={{ fontSize: '22px', color: '#e9d5ff', marginBottom: '4px' }}>
              Operation
            </div>
            <div className="game-title glow-cyan" style={{ fontSize: '30px', color: '#67e8f9' }}>
              Cipher Strike
            </div>
          </div>

          <div className="game-panel-bordered" style={{ padding: '26px 28px', maxWidth: '400px', width: '100%' }}>
            <div className="game-label" style={{ color: '#f59e0b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-dot warning" />
              MISSION BRIEFING
            </div>
            <p style={{ color: '#c4b5fd', lineHeight: 1.8, fontSize: '14px', marginBottom: '16px' }}>
              The city is under siege. A cyber-terrorist network has infiltrated critical infrastructure.
            </p>
            <p style={{ color: '#a78bfa', lineHeight: 1.8, fontSize: '14px', marginBottom: '16px' }}>
              <strong style={{ color: '#e9d5ff' }}>Your expertise is needed.</strong> The city needs you.
              Operation BLACKOUT activates February&nbsp;14 at midnight.
            </p>
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.3)',
                borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start',
              }}
            >
              <Smartphone size={16} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ color: '#67e8f9', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>
                Register your team to receive encrypted mission channels and begin the counter-operation.
              </p>
            </div>
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

          <Link
            href="/login"
            style={{
              position: 'absolute', bottom: '28px', left: '44px',
              display: 'flex', alignItems: 'center', gap: '8px',
              color: '#6b7280', fontSize: '13px', textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
          >
            <ArrowLeft size={14} />
            Back to Login
          </Link>
        </div>

        {/* RIGHT PANEL */}
        <div
          className="game-scroll"
          style={{
            width: '58%', height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '40px 56px', overflowY: 'auto',
          }}
        >
          {step === 1 ? (
            <div style={{ width: '100%', maxWidth: '500px', animation: 'fadeIn 0.5s ease' }}>
              <div style={{ marginBottom: '30px' }}>
                <div className="game-label" style={{ color: '#06b6d4', marginBottom: '8px' }}>
                  OPERATIVE REGISTRATION
                </div>
                <h1 className="game-title glow-purple" style={{ fontSize: '26px', color: '#e9d5ff', marginBottom: '8px' }}>
                  Enlist Your Team
                </h1>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>
                  Form your unit and join the counter-terrorism cyber operation.
                </p>
              </div>

              {error && (
                <div className="game-alert-error" style={{ marginBottom: '18px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="game-label" style={{ display: 'block', marginBottom: '7px' }}>
                    <Users size={10} style={{ display: 'inline', marginRight: '5px' }} />
                    Team Designation
                  </label>
                  <input
                    className="game-input"
                    type="text"
                    placeholder="e.g. SHADOW_OPS"
                    value={formData.teamName}
                    onChange={e => setFormData(p => ({ ...p, teamName: e.target.value }))}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="game-label" style={{ display: 'block', marginBottom: '7px' }}>Agent 1 Name</label>
                    <input
                      className="game-input"
                      type="text"
                      placeholder="First operative"
                      value={formData.participant1Name}
                      onChange={e => setFormData(p => ({ ...p, participant1Name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="game-label" style={{ display: 'block', marginBottom: '7px' }}>Agent 2 Name</label>
                    <input
                      className="game-input"
                      type="text"
                      placeholder="Second operative"
                      value={formData.participant2Name}
                      onChange={e => setFormData(p => ({ ...p, participant2Name: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="game-label" style={{ display: 'block', marginBottom: '7px' }}>
                    <Mail size={10} style={{ display: 'inline', marginRight: '5px' }} />
                    Secure Contact Email
                  </label>
                  <input
                    className="game-input"
                    type="email"
                    placeholder="team@ops.secure"
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="game-label" style={{ display: 'block', marginBottom: '7px' }}>
                      <Lock size={10} style={{ display: 'inline', marginRight: '5px' }} />
                      Passphrase
                    </label>
                    <input
                      className="game-input"
                      type="password"
                      placeholder="Min. 6 chars"
                      value={formData.password}
                      onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="game-label" style={{ display: 'block', marginBottom: '7px' }}>Confirm</label>
                    <input
                      className="game-input"
                      type="password"
                      placeholder="Repeat passphrase"
                      value={formData.confirmPassword}
                      onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-game-primary"
                  disabled={loading}
                  style={{ width: '100%', marginTop: '6px', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <>
                      <div style={{ width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Initiating Protocol...
                    </>
                  ) : (
                    <><UserPlus size={15} /> Enlist Team</>
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
          ) : (
            <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.5s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div
                  style={{
                    width: '68px', height: '68px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #064e3b, #10b981)',
                    border: '2px solid rgba(16,185,129,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 18px', boxShadow: '0 0 30px rgba(16,185,129,0.4)',
                  }}
                >
                  <CheckCircle size={30} color="#6ee7b7" />
                </div>
                <div className="game-label" style={{ color: '#10b981', marginBottom: '8px' }}>IDENTITY VERIFICATION</div>
                <h2 className="game-heading" style={{ fontSize: '20px', color: '#e9d5ff', marginBottom: '10px' }}>
                  Confirm Your Identity
                </h2>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>
                  An encrypted OTP was transmitted to{' '}
                  <span style={{ color: '#a78bfa' }}>{formData.email}</span>
                </p>
              </div>

              {devOtp && (
                <div className="game-alert-info" style={{ marginBottom: '18px', textAlign: 'center' }}>
                  <div className="game-label" style={{ color: '#f59e0b', marginBottom: '6px' }}>DEV MODE — OTP</div>
                  <div style={{ fontSize: '30px', letterSpacing: '10px', color: '#fbbf24', fontWeight: 700 }}>{devOtp}</div>
                </div>
              )}

              {error && (
                <div className="game-alert-error" style={{ marginBottom: '18px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="game-label" style={{ display: 'block', marginBottom: '9px' }}>
                    <Smartphone size={10} style={{ display: 'inline', marginRight: '5px' }} />
                    Enter 6-Digit OTP
                  </label>
                  <input
                    className="game-input"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    style={{ textAlign: 'center', fontSize: '26px', letterSpacing: '10px' }}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="btn-game-primary"
                  disabled={loading || otp.length < 6}
                  style={{ width: '100%', opacity: loading || otp.length < 6 ? 0.6 : 1 }}
                >
                  {loading ? (
                    <>
                      <div style={{ width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Verifying Code...
                    </>
                  ) : (
                    <><CheckCircle size={15} /> Verify &amp; Activate</>
                  )}
                </button>
              </form>

              <button
                onClick={() => { setStep(1); setError(''); setDevOtp(''); setOtp(''); }}
                className="btn-game-secondary"
                style={{ width: '100%', marginTop: '10px' }}
              >
                <ArrowLeft size={14} /> Back to Registration
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
