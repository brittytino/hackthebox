'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VictoryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/credits');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: '#020104', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontFamily: 'monospace', letterSpacing: 3 }}>
      REDIRECTING TO MARVEL POST-CREDITS FINALE...
    </div>
  );
}

