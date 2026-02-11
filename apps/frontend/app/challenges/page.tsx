'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CharacterDialogue from '@/components/story/CharacterDialogue';
import { api } from '@/lib/api';

interface Challenge {
  id: number;
  name: string;
  description: string;
  storyContext?: string;
  characterMessage?: string;
  points: number;
  difficulty: string;
  category: string;
  hint?: string;
  hintPenalty?: number;
}

export default function ChallengesPage() {
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [flag, setFlag] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadCurrentChallenge();
    loadActivity();
    
    // Refresh activity every 10 seconds
    const interval = setInterval(loadActivity, 10000);
    return () => clearInterval(interval);
  }, [router]);

  const loadCurrentChallenge = async () => {
    try {
      const data = await api.challenges.getCurrent();
      setChallenge(data);
      setLoading(false);
    } catch (error: any) {
      setMessage(error.message || 'Failed to load challenge');
      setIsError(true);
      setLoading(false);
    }
  };

  const loadActivity = async () => {
    try {
      const data = await api.challenges.getActivity();
      setActivity(data);
    } catch (error) {
      console.error('Failed to load activity:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag.trim()) return;

    setSubmitting(true);
    setMessage('');

    try {
      const response = await api.challenges.submitFlag({ flag: flag.trim() });
      setMessage(response.message || 'Correct! Moving to next challenge...');
      setIsError(false);
      setFlag('');
      
      // Reload challenge after 2 seconds
      setTimeout(() => {
        loadCurrentChallenge();
        loadActivity();
      }, 2000);
    } catch (error: any) {
      setMessage(error.message || 'Incorrect flag. Try again.');
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400 border-green-500';
      case 'medium': return 'text-yellow-400 border-yellow-500';
      case 'hard': return 'text-red-400 border-red-500';
      default: return 'text-cyan-400 border-cyan-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'cryptography': return '🔐';
      case 'forensics': return '🔍';
      case 'web': return '🌐';
      case 'reverse engineering': return '🔧';
      case 'pwn': return '💥';
      default: return '🎯';
    }
  };

  // Determine which character and expression to use based on challenge level
  const getCharacterForChallenge = (challengeName: string) => {
    if (challengeName?.includes('1.1') || challengeName?.includes('Intercepted')) {
      return { character: 'veera' as const, expression: 'determined', position: 'left' as const };
    } else if (challengeName?.includes('1.2') || challengeName?.includes('Server')) {
      return { character: 'vikram' as const, expression: 'urgent', position: 'right' as const };
    } else if (challengeName?.includes('1.3') || challengeName?.includes('Vault')) {
      return { character: 'althaf' as const, expression: 'commanding', position: 'left' as const };
    } else if (challengeName?.includes('2.1') || challengeName?.includes('Hash')) {
      return { character: 'veera' as const, expression: 'intense', position: 'left' as const };
    } else if (challengeName?.includes('2.2') || challengeName?.includes('JWT')) {
      return { character: 'vikram' as const, expression: 'serious', position: 'right' as const };
    } else if (challengeName?.includes('2.3') || challengeName?.includes('Pattern')) {
      return { character: 'althaf' as const, expression: 'concerned', position: 'left' as const };
    } else if (challengeName?.includes('3.1') || challengeName?.includes('Payload')) {
      return { character: 'veera' as const, expression: 'intense', position: 'left' as const };
    } else if (challengeName?.includes('3.2') || challengeName?.includes('Logic')) {
      return { character: 'vikram' as const, expression: 'urgent', position: 'right' as const };
    } else if (challengeName?.includes('3.3') || challengeName?.includes('MASTER')) {
      return { character: 'veera' as const, expression: 'determined', position: 'center' as const };
    }
    return { character: 'veera' as const, expression: 'neutral', position: 'left' as const };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-cyan-400 text-6xl mb-4 animate-pulse">🔄</div>
          <div className="text-2xl text-cyan-400 font-bold">Loading Mission Data...</div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black">
        <div className="container mx-auto px-6 py-20 text-center">
          <CharacterDialogue
            character="veera"
            expression="relieved"
            dialogue="Mission complete! You've solved all challenges and saved the city. Check the scoreboard to see your final ranking."
            position="center"
            mood="success"
          />
          <div className="mt-12">
            <a href="/scoreboard" className="px-12 py-4 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl font-bold text-xl hover:scale-105 transition-all shadow-2xl inline-block">
              🏆 VIEW SCOREBOARD
            </a>
          </div>
        </div>
      </div>
    );
  }

  const characterData = getCharacterForChallenge(challenge.name);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-cyan-500/30">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-cyan-400">
            OPERATION CIPHER STRIKE
          </div>
          <div className="flex gap-4">
            <a href="/dashboard" className="px-4 py-2 text-cyan-400 hover:text-cyan-300 transition-colors">
              Dashboard
            </a>
            <a href="/scoreboard" className="px-4 py-2 text-cyan-400 hover:text-cyan-300 transition-colors">
              Scoreboard
            </a>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/');
              }}
              className="px-4 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900/70 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Challenge Area */}
          <div className="lg:col-span-2">
            {/* Story Context */}
            {challenge.storyContext && (
              <div className="mb-8">
                <CharacterDialogue
                  character={characterData.character}
                  expression={characterData.expression as any}
                  dialogue={challenge.storyContext}
                  position={characterData.position}
                  mood="normal"
                />
              </div>
            )}

            {/* Character Message (Mission Briefing) */}
            {challenge.characterMessage && (
              <div className="mb-8">
                <CharacterDialogue
                  character={characterData.character}
                  expression={characterData.expression as any}
                  dialogue={challenge.characterMessage}
                  position={characterData.position}
                  mood="urgent"
                />
              </div>
            )}

            {/* Challenge Card */}
            <div className="bg-gray-900/90 backdrop-blur-xl border-2 border-cyan-500/50 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20">
              {/* Challenge Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{getCategoryIcon(challenge.category)}</span>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                      {challenge.name}
                    </h1>
                  </div>
                  <div className="flex gap-3 mt-3 flex-wrap">
                    <span className={`px-4 py-1 border-2 rounded-full text-sm font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty?.toUpperCase()}
                    </span>
                    <span className="px-4 py-1 border-2 border-purple-500 rounded-full text-sm font-semibold text-purple-400">
                      {challenge.category}
                    </span>
                    <span className="px-4 py-1 border-2 border-yellow-500 rounded-full text-sm font-semibold text-yellow-400">
                      {challenge.points} PTS
                    </span>
                  </div>
                </div>
              </div>

              {/* Challenge Description */}
              <div className="mb-8 p-6 bg-black/40 rounded-xl border border-cyan-500/20">
                <h3 className="text-xl font-bold text-cyan-400 mb-3">📋 Mission Objective</h3>
                <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                  {challenge.description}
                </p>
              </div>

              {/* Hint Section */}
              {challenge.hint && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="px-6 py-3 bg-yellow-900/30 border-2 border-yellow-500/50 rounded-xl text-yellow-400 font-semibold hover:bg-yellow-900/50 transition-all"
                  >
                    {showHint ? '🔼 Hide Hint' : '💡 Show Hint'} 
                    {challenge.hintPenalty && ` (-${challenge.hintPenalty} pts)`}
                  </button>
                  {showHint && (
                    <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl text-yellow-300 animate-fadeIn">
                      {challenge.hint}
                    </div>
                  )}
                </div>
              )}

              {/* Flag Submission */}
              <form onSubmit={handleSubmit} className="mb-6">
                <label className="block text-cyan-400 font-bold mb-3 text-lg">
                  🚩 Submit Flag
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    placeholder="CTF{...}"
                    className="flex-1 px-6 py-4 bg-black/60 border-2 border-cyan-500/50 rounded-xl text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono text-lg"
                    disabled={submitting}
                  />
                  <button
                    type="submit"
                    disabled={submitting || !flag.trim()}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/50"
                  >
                    {submitting ? '⏳' : '🚀'} SUBMIT
                  </button>
                </div>
              </form>

              {/* Message Display */}
              {message && (
                <div className={`p-4 rounded-xl border-2 font-semibold animate-fadeIn ${
                  isError 
                    ? 'bg-red-900/30 border-red-500 text-red-400' 
                    : 'bg-green-900/30 border-green-500 text-green-400'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity Feed */}
            <div className="bg-gray-900/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                📡 LIVE ACTIVITY
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activity.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                ) : (
                  activity.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-black/40 rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-all animate-fadeIn"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-2xl">
                          {item.type === 'SOLVE' ? '✅' : '🎯'}
                        </span>
                        <div className="flex-1">
                          <div className="text-purple-400 font-semibold">
                            {item.teamName}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {item.message}
                          </div>
                          <div className="text-gray-600 text-xs mt-1">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tips Box */}
            <div className="bg-gray-900/90 backdrop-blur-xl border-2 border-cyan-500/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
                💡 TIPS
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">▸</span>
                  <span>Flags follow format: CTF{`{...}`}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">▸</span>
                  <span>Use hints wisely - they cost points</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">▸</span>
                  <span>All challenges must be solved in order</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">▸</span>
                  <span>Time matters for tiebreakers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
