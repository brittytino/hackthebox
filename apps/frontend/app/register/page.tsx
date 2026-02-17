'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ArrowLeft, UserPlus, User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Form, 2: Success

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('ENCRYPTION KEY MISMATCH (Passwords do not match)');
      return;
    }

    if (formData.password.length < 6) {
      setError('KEY STRENGTH INSUFFICIENT (Min 6 chars)');
      return;
    }

    setLoading(true);

    try {
      const result = await api.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      // Auto-login logic (save token)
      if (result.access_token) {
        localStorage.setItem('token', result.access_token);
      }
      if (result.user) {
         localStorage.setItem('user', JSON.stringify(result.user));
      }

      setStep(2);
      
      // Auto redirect after success animation
      setTimeout(() => {
        router.push('/story'); // Redirect to story start for new agents
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'REGISTRATION REJECTED: SERVER ERROR');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="vn-scene">
        <div 
          className="vn-background"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-black/60 z-[1]" />
        
        <div className="absolute inset-0 flex items-center justify-center z-[50]">
          <div className="bg-black/80 backdrop-blur-xl border-4 border-green-500 rounded-3xl p-16 text-center shadow-2xl shadow-green-500/50 animate-in zoom-in duration-700">
            <div className="w-32 h-32 mx-auto mb-8 bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.8)] animate-pulse">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
            <h2 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">Registration Successful!</h2>
            <p className="text-green-300 text-xl mb-8">Welcome to the team, Agent!</p>
            <div className="w-80 h-3 bg-slate-800 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 animate-[width_3s_ease-out_forwards] w-full origin-left" />
            </div>
            <p className="text-slate-400 text-sm mt-4">Redirecting to story intro...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vn-scene">
      {/* Background Image - Tech Office */}
      <div 
        className="vn-background"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80)',
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70 z-[1]" />

      {/* Character - Right Side */}
      <div 
        className="vn-character right"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'drop-shadow(0 0 30px rgba(234,88,12,0.4))'
        }}
      />

      {/* Back Button */}
      <Link 
        href="/"
        className="absolute top-8 left-8 z-[60] px-6 py-3 bg-black/60 hover:bg-black/80 backdrop-blur-md border-2 border-white/20 hover:border-orange-400/50 rounded-xl text-white hover:text-orange-400 transition-all flex items-center gap-2 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold">Back to Home</span>
      </Link>

      {/* Registration Form - VN Dialogue Box */}
      <div className="vn-dialogue-box">
        <div className="vn-name-tag">
          <span>🎯 NEW RECRUIT</span>
        </div>

        <div className="vn-dialogue-content max-h-[60vh] overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/50">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">Join the Agency</h2>
                <p className="text-orange-200 text-sm mt-1">Create your agent profile</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border-2 border-red-500 rounded-xl flex items-center gap-3 animate-pulse">
              <AlertCircle className="w-5 h-5 text-red-300" />
              <p className="text-red-100 text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-orange-200 ml-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-300" />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-black/40 backdrop-blur-sm border-2 border-orange-400/30 focus:border-orange-400 rounded-xl py-3 pl-12 pr-4 text-white text-base placeholder-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-orange-200 ml-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-300" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/40 backdrop-blur-sm border-2 border-orange-400/30 focus:border-orange-400 rounded-xl py-3 pl-12 pr-4 text-white text-base placeholder-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-orange-200 ml-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-300" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-black/40 backdrop-blur-sm border-2 border-orange-400/30 focus:border-orange-400 rounded-xl py-3 pl-12 pr-4 text-white text-base placeholder-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                  placeholder="Min. 6 characters"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-orange-200 ml-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-300" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-black/40 backdrop-blur-sm border-2 border-orange-400/30 focus:border-orange-400 rounded-xl py-3 pl-12 pr-4 text-white text-base placeholder-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xl font-bold py-4 rounded-xl shadow-lg shadow-orange-500/50 hover:shadow-orange-600/60 transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-orange-200 text-base">
              Already have an account?{' '}
              <Link href="/login" className="text-yellow-300 hover:text-yellow-200 font-bold underline decoration-2 hover:decoration-yellow-200 transition-all">
                Login Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
