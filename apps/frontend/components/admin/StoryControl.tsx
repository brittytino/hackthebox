'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from '@/components/ui/table';

export default function StoryControl() {
  const [storyState, setStoryState] = useState<any>(null);
  const [teamsProgress, setTeamsProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [stateRes, progressRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/story/state`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/story/admin/all-progress`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (stateRes.ok) {
        setStoryState(await stateRes.json());
      }

      if (progressRes.ok) {
        setTeamsProgress(await progressRes.json());
      }
    } catch (error) {
      console.error('Failed to load story data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartStory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/story/admin/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Story started!');
        loadData();
      }
    } catch (error) {
      alert('Failed to start story');
    }
  };

  const handleEndStory = async (outcome: 'CITY_SAVED' | 'BREACH_EXECUTED') => {
    if (!confirm(`End story with outcome: ${outcome}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/story/admin/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outcome }),
      });

      if (response.ok) {
        alert('Story ended!');
        loadData();
      }
    } catch (error) {
      alert('Failed to end story');
    }
  };

  const handleResetStory = async () => {
    if (!confirm('Reset all story progress? This cannot be undone!')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/story/admin/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Story reset!');
        loadData();
      }
    } catch (error) {
      alert('Failed to reset story');
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading story control...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Story State */}
      <Card className="p-6 bg-gray-900 border-emerald-900">
        <h3 className="text-2xl font-bold text-white mb-4">📖 Story State</h3>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded">
            <div className="text-gray-400 text-sm mb-1">Status</div>
            <div className={`text-xl font-bold ${
              storyState?.storyEnded 
                ? 'text-red-400' 
                : storyState?.storyStarted 
                ? 'text-emerald-400' 
                : 'text-gray-500'
            }`}>
              {storyState?.storyEnded 
                ? 'ENDED' 
                : storyState?.storyStarted 
                ? 'ACTIVE' 
                : 'NOT STARTED'}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <div className="text-gray-400 text-sm mb-1">Winner</div>
            <div className="text-xl font-bold text-white">
              {storyState?.winnerTeamName || 'None'}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <div className="text-gray-400 text-sm mb-1">Outcome</div>
            <div className={`text-xl font-bold ${
              storyState?.finalOutcome === 'CITY_SAVED' 
                ? 'text-emerald-400' 
                : storyState?.finalOutcome === 'BREACH_EXECUTED'
                ? 'text-red-400'
                : 'text-gray-500'
            }`}>
              {storyState?.finalOutcome || 'Pending'}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleStartStory}
            disabled={storyState?.storyStarted}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            🚀 Start Story
          </Button>
          <Button
            onClick={() => handleEndStory('CITY_SAVED')}
            disabled={!storyState?.storyStarted || storyState?.storyEnded}
            className="bg-blue-600 hover:bg-blue-500"
          >
            ✅ End - City Saved
          </Button>
          <Button
            onClick={() => handleEndStory('BREACH_EXECUTED')}
            disabled={!storyState?.storyStarted || storyState?.storyEnded}
            className="bg-red-600 hover:bg-red-500"
          >
            ❌ End - Breach Executed
          </Button>
          <Button
            onClick={handleResetStory}
            className="bg-yellow-600 hover:bg-yellow-500"
          >
            🔄 Reset Story
          </Button>
        </div>
      </Card>

      {/* Teams Progress */}
      <Card className="p-6 bg-gray-900 border-emerald-900">
        <h3 className="text-2xl font-bold text-white mb-4">👥 Team Progress</h3>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Team</TableHead>
                <TableHead className="text-center text-white">Current Round</TableHead>
                <TableHead className="text-center text-white">Round 1</TableHead>
                <TableHead className="text-center text-white">Round 2</TableHead>
                <TableHead className="text-center text-white">Round 3</TableHead>
                <TableHead className="text-center text-white">Winner</TableHead>
                <TableHead className="text-center text-white">Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamsProgress.map((progress) => (
                <TableRow key={progress.id}>
                  <TableCell className="font-semibold text-white">
                    {progress.team?.name}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="px-3 py-1 rounded bg-emerald-900 text-emerald-300 text-sm font-mono">
                      Round {progress.currentRound}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {progress.round1Completed ? (
                      <span className="text-2xl">✅</span>
                    ) : (
                      <span className="text-2xl opacity-30">⭕</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {progress.round2Completed ? (
                      <span className="text-2xl">✅</span>
                    ) : (
                      <span className="text-2xl opacity-30">⭕</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {progress.round3Completed ? (
                      <span className="text-2xl">✅</span>
                    ) : (
                      <span className="text-2xl opacity-30">⭕</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {progress.round3Winner && (
                      <span className="text-2xl">🏆</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-gray-400 text-sm">
                    {new Date(progress.updatedAt).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {teamsProgress.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No teams have started the story yet
          </div>
        )}
      </Card>

      {/* Story Overview */}
      <Card className="p-6 bg-gray-900 border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">📋 Story Overview</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div>
            <strong className="text-emerald-400">Round 1:</strong> The Leak - Decode intercepted messages (ROT13 cipher)
          </div>
          <div>
            <strong className="text-red-400">Round 2:</strong> The Breach - Crack password hashes and Base64 tokens
          </div>
          <div>
            <strong className="text-yellow-400">Round 3:</strong> The Countdown - Find and submit the deactivation flag (first team wins)
          </div>
        </div>
      </Card>
    </div>
  );
}
