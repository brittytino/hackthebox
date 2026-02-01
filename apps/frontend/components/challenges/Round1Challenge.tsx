'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

interface Round1Props {
  onSuccess: () => void;
}

export default function Round1Challenge({ onSuccess }: Round1Props) {
  const [systemTarget, setSystemTarget] = useState('');
  const [darkweaveCode, setDarkweaveCode] = useState('');
  const [credentialHash, setCredentialHash] = useState('');
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

  const encryptedMessages = [
    {
      id: 1,
      content: 'VNNBEBZ_XBGRV_TVRGZAGR',
      hint: 'Simple substitution cipher - ROT13',
      label: 'Message 1 (System Target)',
    },
    {
      id: 2,
      content: 'EBVNXGBXG_2026_EQKZO',
      hint: 'Same cipher as message 1',
      label: 'Message 2 (Project Code)',
    },
    {
      id: 3,
      content: 'b1o2p3q4r5s6',
      hint: 'Direct credential fragment',
      label: 'Message 3 (Credential Hash)',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const data = await api.story.submitRound1({
        systemTarget,
        darkweaveCode,
        credentialHash,
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
      <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-emerald-900">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🔒</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">
              ROUND 1: THE LEAK
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Coimbatore Police cybercrime division has intercepted encrypted chat logs between 
              a Municipal Corporation engineer and an unknown handler. The messages were encrypted 
              using a home-grown cipher. Decode these messages to uncover critical information 
              about the compromised infrastructure.
            </p>
            <div className="text-xs text-gray-500 font-mono">
              EVIDENCE ID: CBE-2026-LEAK-001 | CLASSIFICATION: RESTRICTED
            </div>
          </div>
        </div>
      </Card>

      {/* Encrypted Messages */}
      <div className="grid md:grid-cols-3 gap-4">
        {encryptedMessages.map((msg) => (
          <Card key={msg.id} className="p-4 bg-gray-900 border-gray-700 hover:border-emerald-600 transition-colors">
            <div className="text-emerald-400 text-xs font-mono mb-2 uppercase">
              {msg.label}
            </div>
            <div className="font-mono text-lg text-white bg-black p-3 rounded mb-3 break-all">
              {msg.content}
            </div>
            <div className="text-xs text-gray-500">
              💡 Hint: {msg.hint}
            </div>
          </Card>
        ))}
      </div>

      {/* Solution Form */}
      <Card className="p-6 bg-gray-900 border-emerald-900">
        <h3 className="text-xl font-bold text-white mb-6">Submit Decoded Intelligence</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="systemTarget" className="text-gray-300">
              System Target (Decoded Message 1)
            </Label>
            <Input
              id="systemTarget"
              value={systemTarget}
              onChange={(e) => setSystemTarget(e.target.value)}
              placeholder="Enter decoded system name..."
              className="mt-1 bg-black border-gray-700 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="darkweaveCode" className="text-gray-300">
              Project Codename (Decoded Message 2)
            </Label>
            <Input
              id="darkweaveCode"
              value={darkweaveCode}
              onChange={(e) => setDarkweaveCode(e.target.value)}
              placeholder="Enter project code..."
              className="mt-1 bg-black border-gray-700 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="credentialHash" className="text-gray-300">
              Credential Hash (Message 3)
            </Label>
            <Input
              id="credentialHash"
              value={credentialHash}
              onChange={(e) => setCredentialHash(e.target.value)}
              placeholder="Enter credential hash..."
              className="mt-1 bg-black border-gray-700 text-white"
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
            className="submit-button w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
          >
            {isLoading ? 'Validating...' : 'Submit Intelligence'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
