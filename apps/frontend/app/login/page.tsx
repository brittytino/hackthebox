'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ArrowLeft, Shield, User, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login({ username: formData.username, password: formData.password });
      localStorage.setItem('token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vn-scene">
      {/* Background Image - Cyberpunk Office */}
      <div 
        className="vn-background"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&q=80)',
        }}
      />
      
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 z-[1]" />

      {/* Character Illustration - Left Side */}
      <div 
        className="vn-character left"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'drop-shadow(0 0 30px rgba(59,130,246,0.4))'
        }}
      />

      {/* Back Button */}
      <Link 
        href="/"
        className="absolute top-8 left-8 z-[60] px-6 py-3 bg-black/60 hover:bg-black/80 backdrop-blur-md border-2 border-white/20 hover:border-blue-400/50 rounded-xl text-white hover:text-blue-400 transition-all flex items-center gap-2 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold">Back to Home</span>
      </Link>

      {/* Login Form - Visual Novel Dialogue Box Style */}
      <div className="vn-dialogue-box">
        {/* Name Tag */}
        <div className="vn-name-tag">
          <span>🔐 SYSTEM ACCESS</span>
        </div>

        {/* Content */}
        <div className="vn-dialogue-content">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">Welcome Back, Agent</h2>
                <p className="text-blue-200 text-sm mt-1">Please verify your identity to continue</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border-2 border-red-500 rounded-xl flex items-center gap-3 animate-pulse">
              <AlertCircle className="w-5 h-5 text-red-300" />
              <p className="text-red-100 text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-blue-200 ml-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-black/40 backdrop-blur-sm border-2 border-blue-400/30 focus:border-blue-400 rounded-xl py-4 pl-12 pr-4 text-white text-lg placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-blue-200 ml-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-black/40 backdrop-blur-sm border-2 border-blue-400/30 focus:border-blue-400 rounded-xl py-4 pl-12 pr-4 text-white text-lg placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xl font-bold py-5 rounded-xl shadow-lg shadow-blue-500/50 hover:shadow-blue-600/60 transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Login to System'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-blue-200 text-base">
              Don't have an account?{' '}
              <Link href="/register" className="text-yellow-300 hover:text-yellow-200 font-bold underline decoration-2 hover:decoration-yellow-200 transition-all">
                Register Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

