'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Crosshair, LayoutDashboard, Radio, BookOpen, Trophy, ShieldAlert, LogOut, Menu, X,
} from 'lucide-react';

export type NavKey = 'dashboard' | 'timeline' | 'story' | 'leaderboard' | 'challenges' | 'admin';

const LINKS: { key: NavKey; href: string; label: string; icon: any }[] = [
  { key: 'dashboard', href: '/dashboard', label: 'HQ', icon: LayoutDashboard },
  { key: 'timeline', href: '/timeline', label: 'TIMELINE', icon: Radio },
  { key: 'story', href: '/story', label: 'STORY', icon: BookOpen },
  { key: 'leaderboard', href: '/leaderboard', label: 'RANKINGS', icon: Trophy },
];

interface AppNavbarProps {
  /** which nav item to highlight as current */
  active: NavKey;
  /** show the admin link (only for admins) */
  isAdmin?: boolean;
  /** page-specific content rendered before the logout button (badges, counters, toggles) */
  right?: React.ReactNode;
  /** override the story link target, e.g. `/story?challenge=3` */
  storyHref?: string;
}

export default function AppNavbar({ active, isAdmin, right, storyHref }: AppNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(isAdmin || false);

  useEffect(() => {
    if (isAdmin !== undefined) {
      setIsAdminUser(isAdmin);
      return;
    }
    try {
      const u = localStorage.getItem('user');
      if (u) {
        const parsed = JSON.parse(u);
        setIsAdminUser(parsed?.role === 'ADMIN');
      }
    } catch {}
  }, [isAdmin]);

  const links = isAdminUser
    ? [...LINKS, { key: 'admin' as NavKey, href: '/admin', label: 'ADMIN OPS', icon: ShieldAlert }]
    : LINKS;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const resolveHref = (key: NavKey, href: string) => (key === 'story' && storyHref ? storyHref : href);
  const isActive = (key: NavKey) => active === key || pathname === LINKS.find(l => l.key === key)?.href;

  return (
    <header className="app-navbar">
      <Link href="/dashboard" className="app-nav-brand" aria-label="Mission HQ">
        <div className="app-nav-brand-icon">
          <Crosshair size={17} color="#fff" strokeWidth={2.5} />
        </div>
        <div className="app-nav-brand-text">
          <span className="app-nav-brand-title">OPERATION THE EXTRACTION</span>
          <span className="app-nav-brand-sub">TACTICAL COMMAND HQ</span>
        </div>
      </Link>

      <nav className="app-nav-links">
        {links.map(item => (
          <Link
            key={item.key}
            href={resolveHref(item.key, item.href)}
            className={`app-nav-link ${isActive(item.key) ? 'active' : ''}`}
          >
            <item.icon size={13} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <div className="app-nav-right">
        {right}
        <button type="button" onClick={handleLogout} className="app-nav-logout" title="Log out">
          <LogOut size={14} />
          <span className="app-nav-hide-narrow">EXTRACT</span>
        </button>
      </div>

      <button
        type="button"
        className="app-nav-mobile-toggle"
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {mobileOpen && (
        <div className="app-nav-mobile-panel">
          {links.map(item => (
            <Link
              key={item.key}
              href={resolveHref(item.key, item.href)}
              className={`app-nav-mobile-link ${isActive(item.key) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={14} />
              <span>{item.label}</span>
            </Link>
          ))}
          <button type="button" onClick={handleLogout} className="app-nav-mobile-link danger">
            <LogOut size={14} />
            <span>EXTRACT / LOGOUT</span>
          </button>
        </div>
      )}
    </header>
  );
}
