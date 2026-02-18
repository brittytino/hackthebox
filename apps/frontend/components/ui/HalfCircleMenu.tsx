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
  Shield,
  User,
  X,
} from 'lucide-react';

interface HalfCircleMenuProps {
  isAdmin?: boolean;
}

const menuItems = [
  {
    href: '/dashboard',
    label: 'MISSION HQ',
    icon: LayoutDashboard,
    color: '#a78bfa',
  },
  {
    href: '/challenges',
    label: 'MISSIONS',
    icon: Swords,
    color: '#67e8f9',
  },
  {
    href: '/story',
    label: 'BRIEFING',
    icon: BookOpen,
    color: '#f9a8d4',
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
    router.push('/');
  };

  const allItems = isAdmin || user?.role === 'ADMIN'
    ? [...menuItems, { href: '/admin', label: 'ADMIN', icon: Shield, color: '#f87171' }]
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
          style={{ color: '#a78bfa', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
        >
          {open ? (
            <X size={18} />
          ) : (
            <>
              <ChevronLeft size={18} />
              <div style={{ fontSize: 9, letterSpacing: 2, fontWeight: 700, writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', color: '#c4b5fd' }}>
                MENU
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
        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(109,40,217,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(167,139,250,0.4)',
                flexShrink: 0,
              }}
            >
              <User size={16} color="#e9d5ff" />
            </div>
            <div>
              <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
                {user?.username || 'AGENT'}
              </div>
              <div style={{ color: '#6b7280', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>
                {user?.role === 'ADMIN' ? 'ADMINISTRATOR' : 'OPERATIVE'}
              </div>
            </div>
          </div>

          {/* Logo */}
          <div
            style={{
              textAlign: 'center',
              padding: '10px 0',
              background: 'rgba(109,40,217,0.08)',
              borderRadius: 8,
              border: '1px solid rgba(109,40,217,0.2)',
            }}
          >
            <div style={{ color: '#7c3aed', fontSize: 9, letterSpacing: 3, fontWeight: 700, textTransform: 'uppercase' }}>
              OPERATION
            </div>
            <div style={{ color: '#c4b5fd', fontSize: 13, letterSpacing: 2, fontWeight: 900, textTransform: 'uppercase' }}>
              CIPHER STRIKE
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {allItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`half-menu-item ${active ? 'active' : ''}`}
                onClick={() => setOpen(false)}
                style={{ color: active ? item.color : undefined }}
              >
                <div
                  style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: active ? `${item.color}22` : 'rgba(109,40,217,0.1)',
                    border: `1px solid ${active ? item.color + '55' : 'rgba(109,40,217,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon size={15} color={active ? item.color : '#6b7280'} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5 }}>{item.label}</div>
                  {active && (
                    <div style={{ width: 16, height: 2, background: item.color, borderRadius: 1, marginTop: 2 }} />
                  )}
                </div>
                {active && (
                  <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6, color: item.color }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(109,40,217,0.2)' }}>
          <button
            className="half-menu-item danger"
            onClick={handleLogout}
            style={{ width: '100%', background: 'none', border: '1px solid transparent', cursor: 'pointer' }}
          >
            <div
              style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <LogOut size={15} color="#f87171" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, color: '#f87171' }}>EXTRACT</span>
          </button>
        </div>

        {/* Status */}
        <div style={{ marginTop: 12, textAlign: 'center', padding: '8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span className="status-dot active" />
            <span style={{ color: '#10b981', fontSize: 11, letterSpacing: 2, fontWeight: 600, textTransform: 'uppercase' }}>
              SYSTEM ONLINE
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
            background: 'rgba(0,0,0,0.3)',
            zIndex: 998,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}
    </>
  );
}
