'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Swords,
  Trophy,
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  User,
  X,
  Radio,
} from 'lucide-react';

interface HalfCircleMenuProps {
  isAdmin?: boolean;
}

const menuItems = [
  {
    href: '/dashboard',
    label: 'MISSION HQ',
    icon: LayoutDashboard,
    color: '#ef4444',
  },
  {
    href: '/challenges',
    label: 'MISSIONS',
    icon: Swords,
    color: '#f87171',
  },
  {
    href: '/story',
    label: 'BRIEFING',
    icon: BookOpen,
    color: '#fca5a5',
  },
  {
    href: '/leaderboard',
    label: 'RANKINGS',
    icon: Trophy,
    color: '#fbbf24',
  },
];

export default function HalfCircleMenu({ isAdmin }: HalfCircleMenuProps) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ username?: string; role?: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (open && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const trigger = document.getElementById('half-menu-trigger');
        if (trigger && !trigger.contains(e.target as Node)) {
          setOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setOpen(false);
    router.push('/login');
  };

  const allItems = isAdmin || user?.role === 'ADMIN'
    ? [...menuItems, { href: '/admin', label: 'ADMIN OPS', icon: ShieldAlert, color: '#ff2a4b' }]
    : menuItems;

  return (
    <>
      {/* Scanlines overlay for cyberpunk effect */}
      <div className="scanlines" />

      {/* Trigger Tab */}
      <button
        id="half-menu-trigger"
        className="half-menu-trigger"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        title="Menu"
      >
        <div
          style={{ color: '#ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
        >
          {open ? (
            <X size={18} />
          ) : (
            <>
              <ChevronLeft size={18} />
              <div style={{ fontSize: 9, letterSpacing: 2, fontWeight: 700, writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', color: '#fee2e2', fontFamily: 'monospace' }}>
                TERMINAL
              </div>
            </>
          )}
        </div>
      </button>

      {/* Slide-out Panel */}
      <div
        ref={panelRef}
        className={`half-menu-panel ${open ? 'open' : ''}`}
      >
        {/* Header */}
        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(220,38,38,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 6,
                background: 'linear-gradient(135deg, #7f1d1d, #dc2626)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(248,113,113,0.5)',
                flexShrink: 0,
                boxShadow: '0 0 12px rgba(220,38,38,0.4)',
              }}
            >
              <User size={16} color="#fee2e2" />
            </div>
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, lineHeight: 1.2, fontFamily: 'monospace' }}>
                {user?.username || 'OPERATIVE'}
              </div>
              <div style={{ color: '#ef4444', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                {user?.role === 'ADMIN' ? 'SYS_ADMINISTRATOR' : 'CLASSIFIED_AGENT'}
              </div>
            </div>
          </div>

          {/* Logo badge */}
          <div
            style={{
              textAlign: 'center',
              padding: '8px 0',
              background: 'rgba(220,38,38,0.08)',
              borderRadius: 6,
              border: '1px solid rgba(220,38,38,0.3)',
            }}
          >
            <div style={{ color: '#ef4444', fontSize: 9, letterSpacing: 3, fontWeight: 700, textTransform: 'uppercase', fontFamily: 'monospace' }}>
              // OPERATION //
            </div>
            <div style={{ color: '#f87171', fontSize: 13, letterSpacing: 2, fontWeight: 900, textTransform: 'uppercase' }}>
              THE EXTRACTION
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {allItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`half-menu-item ${active ? 'active' : ''}`}
                onClick={() => setOpen(false)}
                style={{ color: active ? '#ffffff' : undefined }}
              >
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                    background: active ? 'rgba(220,38,38,0.3)' : 'rgba(220,38,38,0.08)',
                    border: `1px solid ${active ? '#ef4444' : 'rgba(220,38,38,0.25)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: active ? '0 0 10px rgba(220,38,38,0.4)' : 'none',
                  }}
                >
                  <Icon size={15} color={active ? '#ffffff' : '#ef4444'} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>{item.label}</div>
                  {active && (
                    <div style={{ width: 16, height: 2, background: '#ef4444', borderRadius: 1, marginTop: 2 }} />
                  )}
                </div>
                {active && (
                  <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.8, color: '#ef4444' }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(220,38,38,0.25)' }}>
          <button
            className="half-menu-item danger"
            onClick={handleLogout}
            style={{ width: '100%', background: 'none', border: '1px solid transparent', cursor: 'pointer' }}
          >
            <div
              style={{
                width: 32, height: 32, borderRadius: 6,
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <LogOut size={14} color="#f87171" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: '#f87171' }}>EXTRACT / LOGOUT</span>
          </button>
        </div>

        {/* Status */}
        <div style={{ marginTop: 12, textAlign: 'center', padding: '6px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span className="status-dot active" />
            <span style={{ color: '#ef4444', fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase', fontFamily: 'monospace' }}>
              TACTICAL NETWORK ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 998,
            backdropFilter: 'blur(3px)',
          }}
        />
      )}
    </>
  );
}
