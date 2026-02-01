'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CyberBackground from '@/components/CyberBackground';
import StoryIntro from '@/components/StoryIntro';
import StoryEnding from '@/components/StoryEnding';
import Round1Challenge from '@/components/challenges/Round1Challenge';
import Round2Challenge from '@/components/challenges/Round2Challenge';
import Round3Challenge from '@/components/challenges/Round3Challenge';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function ChallengesPage() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [showEnding, setShowEnding] = useState(false);
  const [endingData, setEndingData] = useState<any>(null);
  const [storyProgress, setStoryProgress] = useState<any>(null);
  const [storyState, setStoryState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadProgress();
    loadStoryState();
  }, [router]);

  const loadProgress = async () => {
    try {
      const data = await api.story.getProgress();
      setStoryProgress(data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStoryState = async () => {
    try {
      const data = await api.story.getState();
      setStoryState(data);

      if (data.storyEnded) {
        setEndingData({
          outcome: data.finalOutcome || 'CITY_SAVED',
          winnerTeam: data.winnerTeamName,
        });
        setShowEnding(true);
        setShowIntro(false);
      }
    } catch (error) {
      console.error('Failed to load story state:', error);
    }
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleRound1Success = () => {
    loadProgress();
  };

  const handleRound2Success = () => {
    loadProgress();
  };

  const handleRound3Success = (isWinner: boolean, outcome: string) => {
    setEndingData({
      outcome,
      winnerTeam: isWinner ? storyProgress?.team?.name : storyState?.winnerTeamName,
    });
    setShowEnding(true);
  };

  const handleEndingClose = () => {
    router.push('/scoreboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-400 font-mono">Loading mission briefing...</div>
      </div>
    );
  }

  if (!storyProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 bg-gray-900 border-red-600">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Team Required</h2>
            <p className="text-gray-300 mb-4">
              You must be part of a team to participate in Operation DARKWEAVE.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded"
            >
              Go to Dashboard
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <CyberBackground />
      
      {showIntro && <StoryIntro onComplete={handleIntroComplete} />}
      
      {showEnding && (
        <StoryEnding
          outcome={endingData.outcome}
          winnerTeam={endingData.winnerTeam}
          onClose={handleEndingClose}
        />
      )}

      {!showIntro && !showEnding && (
        <div className="min-h-screen py-8">
          <div className="max-w-6xl mx-auto px-6 mb-8">
            <Card className="p-6 bg-gray-900 border-emerald-900">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    OPERATION DARKWEAVE
                  </h1>
                  <p className="text-gray-400 font-mono text-sm">
                    Team: {storyProgress.team?.name || 'Unknown'} | Current Round: {storyProgress.currentRound}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className={`px-4 py-2 rounded ${
                    storyProgress.round1Completed 
                      ? 'bg-emerald-900 text-emerald-300' 
                      : 'bg-gray-800 text-gray-500'
                  }`}>
                    Round 1 {storyProgress.round1Completed && '✓'}
                  </div>
                  <div className={`px-4 py-2 rounded ${
                    storyProgress.round2Completed 
                      ? 'bg-emerald-900 text-emerald-300' 
                      : 'bg-gray-800 text-gray-500'
                  }`}>
                    Round 2 {storyProgress.round2Completed && '✓'}
                  </div>
                  <div className={`px-4 py-2 rounded ${
                    storyProgress.round3Completed 
                      ? 'bg-emerald-900 text-emerald-300' 
                      : 'bg-gray-800 text-gray-500'
                  }`}>
                    Round 3 {storyProgress.round3Completed && '✓'}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {storyProgress.currentRound === 1 && (
            <Round1Challenge onSuccess={handleRound1Success} />
          )}

          {storyProgress.currentRound === 2 && (
            <Round2Challenge onSuccess={handleRound2Success} />
          )}

          {storyProgress.currentRound === 3 && (
            <Round3Challenge onSuccess={handleRound3Success} />
          )}

          {storyProgress.currentRound > 3 && (
            <div className="max-w-4xl mx-auto text-center">
              <Card className="p-8 bg-gray-900 border-emerald-900">
                <div className="text-4xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-emerald-400 mb-4">
                  All Rounds Completed
                </h2>
                <p className="text-gray-300">
                  Awaiting final mission outcome...
                </p>
              </Card>
            </div>
          )}
        </div>
      )}
    </>
  );
}
