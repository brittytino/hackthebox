'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ArrowLeft, Lock, User, Mail, Terminal, Check } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Success
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await api.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });

      localStorage.setItem('token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      setStep(2);
      
      // Redirect to story after showing success
      setTimeout(() => {
        router.push('/story');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 overflow-hidden opacity-40">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full animate-pulse"
                style={{
                  width: Math.random() * 3 + 1 + 'px',
                  height: Math.random() * 3 + 1 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  animationDelay: Math.random() * 3 + 's',
                  animationDuration: Math.random() * 2 + 2 + 's',
                }}
              />
            ))}
          </div>
        </div>

        {/* Success Message */}
        <div className="relative z-20 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/50 animate-bounce">
            <Check className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Welcome, Agent!</h1>
          <p className="text-purple-300 text-lg">Initiating story briefing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Illustrated Background - Cityscape at dusk */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900">
        {/* Animated stars */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
                animationDuration: Math.random() * 2 + 2 + 's',
              }}
            />
          ))}
        </div>
        
        {/* Cityscape silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent">
          <svg viewBox="0 0 1200 300" className="absolute bottom-0 w-full h-full opacity-70">
            <rect x="0" y="150" width="80" height="150" fill="#1a1a2e" />
            <rect x="90" y="120" width="60" height="180" fill="#16213e" />
            <rect x="160" y="100" width="100" height="200" fill="#0f3460" />
            <rect x="270" y="130" width="70" height="170" fill="#1a1a2e" />
            <rect x="350" y="80" width="90" height="220" fill="#16213e" />
            <rect x="450" y="110" width="80" height="190" fill="#0f3460" />
            <rect x="540" y="90" width="110" height="210" fill="#1a1a2e" />
            <rect x="660" y="120" width="75" height="180" fill="#16213e" />
            <rect x="745" y="100" width="95" height="200" fill="#0f3460" />
            <rect x="850" y="130" width="80" height="170" fill="#1a1a2e" />
            <rect x="940" y="110" width="90" height="190" fill="#16213e" />
            <rect x="1040" y="140" width="70" height="160" fill="#0f3460" />
            <rect x="1120" y="120" width="80" height="180" fill="#1a1a2e" />
          </svg>
          
          {/* Building windows */}
          <div className="absolute bottom-0 w-full h-full">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-yellow-300/60 animate-pulse"
                style={{
                  width: '4px',
                  height: '6px',
                  bottom: Math.random() * 200 + 50 + 'px',
                  left: Math.random() * 100 + '%',
                  animationDelay: Math.random() * 3 + 's',
                  animationDuration: Math.random() * 2 + 2 + 's',
                }}
              />
            ))}
          </div>
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Character silhouette - right side */}
      <div className="absolute right-10 bottom-0 hidden lg:block z-10 opacity-80">
        <div className="relative w-64 h-96">
          {/* Hacker silhouette */}
          <div className="absolute bottom-0 w-full h-full">
            <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-2xl">
              <defs>
                <linearGradient id="char-gradient-reg" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.3 }} />
                </linearGradient>
              </defs>
              {/* Body */}
              <ellipse cx="100" cy="340" rx="50" ry="15" fill="#0f172a" opacity="0.5" />
              <rect x="70" y="200" width="60" height="140" rx="5" fill="url(#char-gradient-reg)" />
              {/* Head */}
              <circle cx="100" cy="160" r="35" fill="url(#char-gradient-reg)" />
              {/* Hood */}
              <path d="M 65 160 Q 100 130 135 160 L 130 190 Q 100 170 70 190 Z" fill="url(#char-gradient-reg)" opacity="0.9" />
              {/* Arms */}
              <rect x="40" y="220" width="25" height="80" rx="5" fill="url(#char-gradient-reg)" />
              <rect x="135" y="220" width="25" height="80" rx="5" fill="url(#char-gradient-reg)" />
              {/* Laptop glow */}
              <ellipse cx="100" cy="280" rx="40" ry="10" fill="#a78bfa" opacity="0.6" />
              <rect x="60" y="275" width="80" height="3" fill="#a78bfa" opacity="0.8" />
            </svg>
          </div>
          {/* Glow effect */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Back button - visual novel style */}
      <Link href="/" className="absolute top-6 left-6 z-30">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/80 hover:bg-slate-800/90 backdrop-blur-md rounded-xl border-2 border-purple-500/40 hover:border-purple-400/60 transition-all group shadow-lg shadow-purple-500/20">
          <ArrowLeft className="h-5 w-5 text-purple-300 group-hover:text-purple-200 transition-colors" />
          <span className="text-purple-300 group-hover:text-purple-200 font-semibold transition-colors">Back</span>
        </button>
      </Link>

      {/* Main register container - Visual Novel style */}
      <div className="relative z-20 w-full max-w-5xl mx-4 flex items-center justify-center lg:justify-start">
        {/* Register panel - game UI style */}
        <div className="relative w-full max-w-md">
          {/* Decorative corner elements */}
          <div className="absolute -top-3 -left-3 w-12 h-12 border-t-4 border-l-4 border-cyan-400 rounded-tl-2xl" />
          <div className="absolute -top-3 -right-3 w-12 h-12 border-t-4 border-r-4 border-purple-400 rounded-tr-2xl" />
          <div className="absolute -bottom-3 -left-3 w-12 h-12 border-b-4 border-l-4 border-cyan-400 rounded-bl-2xl" />
          <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-4 border-r-4 border-purple-400 rounded-br-2xl" />
          
          {/* Main panel */}
          <div className="bg-slate-900/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl p-8 shadow-2xl shadow-purple-500/30 relative overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(90deg, rgba(168, 85, 247, 0.1) 0px, transparent 1px, transparent 40px), repeating-linear-gradient(0deg, rgba(168, 85, 247, 0.1) 0px, transparent 1px, transparent 40px)',
              }} />
            </div>

            {/* Character dialogue box style header */}
            <div className="relative mb-6">
              <div className="bg-gradient-to-r from-purple-600 to-cyan-600 p-0.5 rounded-xl mb-4">
                <div className="bg-slate-900 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Terminal className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Agent Registration</h2>
                      <p className="text-xs text-purple-300">Operation Cipher Strike</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 italic">
                    "Welcome, recruit. Complete your profile to join the team..."
                  </p>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Join The Mission
              </h1>
            </div>

            {/* Form - Game UI style */}
            <form onSubmit={handleSubmit} className="space-y-4 relative">
              {/* Email field */}
              <div className="relative">
                <label htmlFor="email" className="block text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="agent@hackthebox.local"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 pl-4 bg-slate-800/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:bg-slate-800/70 transition-all shadow-inner"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Username field */}
              <div className="relative">
                <label htmlFor="username" className="block text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Agent Codename
                </label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    placeholder="Choose your codename"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="w-full px-4 py-3 pl-4 bg-slate-800/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:bg-slate-800/70 transition-all shadow-inner"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
              
              {/* Password field */}
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Security Code
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full px-4 py-3 pl-4 bg-slate-800/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:bg-slate-800/70 transition-all shadow-inner"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                  </div>
                </div>
              </div>

              {/* Confirm Password field */}
              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirm Security Code
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your security code"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 pl-4 bg-slate-800/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:bg-slate-800/70 transition-all shadow-inner"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.9s' }} />
                  </div>
                </div>
              </div>

              {/* Error message - game style */}
              {error && (
                <div className="relative p-4 bg-red-900/30 border-2 border-red-500/50 rounded-xl backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-300 mb-1">Registration Failed</p>
                      <p className="text-xs text-red-200">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit button - game style */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-xl font-bold text-white text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-purple-500/50 hover:shadow-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Profile...
                    </span>
                  ) : (
                    'Complete Registration'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </form>

            {/* Login link - game style */}
            <div className="mt-6 text-center p-4 bg-slate-800/30 rounded-xl border border-purple-500/20">
              <p className="text-gray-300 text-sm">
                Already registered?{' '}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors underline decoration-cyan-400/30 hover:decoration-cyan-300">
                  Login Here
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom glow effect */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 blur-xl opacity-50" />
        </div>
      </div>
    </div>
  );
}
