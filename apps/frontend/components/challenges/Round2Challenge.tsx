'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

interface Round2Props {
  onSuccess: () => void;
}

export default function Round2Challenge({ onSuccess }: Round2Props) {
  const [masterKey, setMasterKey] = useState('');
  const [backdoorLocation, setBackdoorLocation] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, []);

  const systemLogs = [
    {
      id: 1,
      title: 'Password Hash',
      content: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      hint: 'SHA256 hash - common password',
      type: 'hash',
    },
    {
      id: 2,
      title: 'Encrypted Master Key Token',
      content: 'U0NDQ19NQVNURVJfS0VZXzdGOEU5RDBB',
      hint: 'Base64 encoding',
      type: 'base64',
    },
    {
      id: 3,
      title: 'VPN Log Fragment',
      content: 'U0NDQ19WUE5fTk9ERV80Nw==',
      hint: 'Base64 encoding',
      type: 'base64',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const data = await api.story.submitRound2({
        masterKey,
        backdoorLocation,
      });

      if (data.success) {
        setMessage('✅ ' + data.message);
        setTimeout(() => onSuccess(), 2000);
      } else {
        setMessage('❌ ' + data.message);
        gsap.to('.submit-button', {
          x: [-10, 10, -10, 10, 0],
          duration: 0.4,
        });
      }
    } catch (error: any) {
      setMessage('❌ ' + (error.message || 'Connection error. Try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Story Context */}
      <Card className="p-6 bg-gradient-to-br from-red-950/30 to-gray-800 border-red-900">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🔓</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-red-400 mb-2">
              ROUND 2: THE BREACH
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Using decoded intelligence from Round 1, you've traced the breach to 
              <span className="text-emerald-400 font-semibold"> Ukkadam Water Treatment Plant's</span> 
              {' '}maintenance VPN. The attackers left password hashes and encrypted tokens in system logs. 
              Crack these to obtain the <span className="text-yellow-400 font-semibold">SCCC Master Key</span> and 
              locate the backdoor installation point.
            </p>
            <div className="text-xs text-red-400 font-mono animate-pulse">
              ⚠️ WARNING: Unauthorized VPN access detected | THREAT LEVEL: HIGH
            </div>
          </div>
        </div>
      </Card>

      {/* System Logs */}
      <div className="grid md:grid-cols-3 gap-4">
        {systemLogs.map((log) => (
          <Card key={log.id} className="p-4 bg-gray-900 border-gray-700 hover:border-red-600 transition-colors">
            <div className="text-red-400 text-xs font-mono mb-2 uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {log.title}
            </div>
            <div className="font-mono text-sm text-white bg-black p-3 rounded mb-3 break-all overflow-x-auto">
              {log.content}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span>💡</span>
              <span>{log.hint}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Context */}
      <Card className="p-4 bg-yellow-950/20 border-yellow-900/50">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📋</div>
          <div className="text-sm text-yellow-200">
            <strong>Analysis Notes:</strong> The password hash appears in multiple breach databases. 
            The encrypted tokens use standard encoding. Decode all artifacts to reconstruct full access credentials.
          </div>
        </div>
      </Card>

      {/* Solution Form */}
      <Card className="p-6 bg-gray-900 border-red-900">
        <h3 className="text-xl font-bold text-white mb-6">Submit Cracked Credentials</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="masterKey" className="text-gray-300">
              SCCC Master Access Key
            </Label>
            <Input
              id="masterKey"
              value={masterKey}
              onChange={(e) => setMasterKey(e.target.value)}
              placeholder="Enter decoded master key..."
              className="mt-1 bg-black border-gray-700 text-white font-mono"
              required
            />
          </div>

          <div>
            <Label htmlFor="backdoorLocation" className="text-gray-300">
              Backdoor Installation Location
            </Label>
            <Input
              id="backdoorLocation"
              value={backdoorLocation}
              onChange={(e) => setBackdoorLocation(e.target.value)}
              placeholder="Enter VPN node identifier..."
              className="mt-1 bg-black border-gray-700 text-white font-mono"
              required
            />
          </div>

          {message && (
            <div className={`p-3 rounded ${
              message.includes('✅') ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300'
            }`}>
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="submit-button w-full bg-red-600 hover:bg-red-500 text-white font-semibold"
          >
            {isLoading ? 'Validating Access...' : 'Submit Credentials'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
