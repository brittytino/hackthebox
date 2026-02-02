'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

interface Round3Props {
  onSuccess: (isWinner: boolean, outcome: string) => void;
}

export default function Round3Challenge({ onSuccess }: Round3Props) {
  const [flag, setFlag] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(180); // 3 minutes countdown for effect
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, stagger: 0.1, duration: 0.8, ease: 'power3.out' }
      );
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const data = await api.story.submitRound3({ flag });

      if (data.success) {
        setMessage('✅ ' + data.message);
        const isWinner = data.winner || false;
        const outcome = data.finalOutcome || 'CITY_SAVED';
        setTimeout(() => onSuccess(isWinner, outcome), 2000);
      } else {
        if (data.alreadyWon) {
          setMessage('⏱️ ' + data.message);
        } else {
          setMessage('❌ ' + data.message);
          gsap.to('.submit-button', {
            x: [-10, 10, -10, 10, 0],
            duration: 0.4,
          });
        }
      }
    } catch (error: any) {
      setMessage('❌ ' + (error.message || 'Connection error. Try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const systemStatus = [
    { name: 'Textile Factory Grid', status: 'COMPROMISED', threat: 'Overload scheduled' },
    { name: 'Traffic Control', status: 'COMPROMISED', threat: 'Chaos mode armed' },
    { name: 'Water Treatment', status: 'COMPROMISED', threat: 'Shutdown queued' },
    { name: 'Emergency Services', status: 'VULNERABLE', threat: 'Comms at risk' },
  ];

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Critical Alert Banner */}
      <Card className="p-6 bg-gradient-to-r from-red-950 to-orange-950 border-red-600 border-2 animate-pulse-danger">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-5xl animate-pulse">🚨</div>
            <div>
              <h2 className="text-3xl font-bold text-red-400 mb-1">
                ROUND 3: THE COUNTDOWN
              </h2>
              <p className="text-orange-300 text-sm font-mono">
                CRITICAL THREAT | RANSOMWARE ACTIVE | CITY-WIDE IMPACT IMMINENT
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-red-400 mb-1">TIME TO MIDNIGHT</div>
            <div className={`text-4xl font-mono font-bold ${
              countdown < 60 ? 'text-red-500 animate-pulse' : 'text-red-400'
            }`}>
              {formatTime(countdown)}
            </div>
          </div>
        </div>
      </Card>

      {/* Story Context */}
      <Card className="p-6 bg-gray-900 border-red-900">
        <div className="flex items-start gap-4">
          <div className="text-4xl">⚡</div>
          <div className="flex-1">
            <p className="text-gray-300 leading-relaxed mb-4">
              You've breached the SCCC network using the master key. The situation is critical:
              <span className="text-red-400 font-semibold"> ransomware is scheduled to trigger at midnight</span>, 
              causing city-wide infrastructure chaos. Multiple systems are compromised and armed.
            </p>
            <p className="text-yellow-300 font-semibold text-lg">
              ⚠️ ONLY ONE TEAM CAN DISABLE THE KILL SWITCH
            </p>
            <p className="text-gray-400 text-sm mt-2">
              The deactivation code is hidden within the SCCC emergency override system. 
              Find it and submit before another team does.
            </p>
          </div>
        </div>
      </Card>

      {/* System Status Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {systemStatus.map((system, idx) => (
          <Card key={idx} className="p-4 bg-red-950/20 border-red-900/50">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-white">{system.name}</div>
              <div className={`text-xs font-mono px-2 py-1 rounded ${
                system.status === 'COMPROMISED' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-yellow-600 text-black'
              }`}>
                {system.status}
              </div>
            </div>
            <div className="text-sm text-red-400">🔥 {system.threat}</div>
          </Card>
        ))}
      </div>

      {/* Intel */}
      <Card className="p-4 bg-emerald-950/20 border-emerald-900/50">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔍</div>
          <div className="text-sm text-emerald-200">
            <strong>SCCC Network Access Granted:</strong> Emergency override panel located. 
            Deactivation code follows standard HTB flag format. Extract and submit immediately. 
            First valid submission wins. Others will be locked out.
          </div>
        </div>
      </Card>

      {/* Flag Submission */}
      <Card className="p-6 bg-gray-900 border-red-900 border-2">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          Submit Deactivation Code
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="flag" className="text-gray-300 text-lg">
              Kill Switch Deactivation Flag
            </Label>
            <Input
              id="flag"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              placeholder="HTB{...}"
              className="mt-2 bg-black border-red-700 text-white font-mono text-lg p-6"
              required
            />
            <div className="text-xs text-gray-500 mt-2">
              Format: HTB&#123;...&#125; | Extract from SCCC emergency override system
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded font-semibold ${
              message.includes('✅') 
                ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-600' 
                : message.includes('⏱️')
                ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-600'
                : 'bg-red-900/50 text-red-300 border border-red-600'
            }`}>
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="submit-button w-full bg-red-600 hover:bg-red-500 text-white font-bold text-lg py-6"
          >
            {isLoading ? 'DISABLING KILL SWITCH...' : '🚨 DISABLE KILL SWITCH'}
          </Button>
        </form>
      </Card>

      {/* Warning Footer */}
      <div className="text-center text-xs text-red-500 font-mono space-y-1">
        <div>OPERATION DARKWEAVE | EMERGENCY RESPONSE PROTOCOL ACTIVE</div>
        <div>COIMBATORE MUNICIPAL CORPORATION - SMART CITY CONTROL CENTER</div>
        <div>2.5 MILLION LIVES DEPEND ON YOUR SUCCESS</div>
      </div>
    </div>
  );
}
