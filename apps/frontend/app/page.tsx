"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, User, BookOpen, Trophy, ChevronRight, Shield, Zap } from "lucide-react";

// Animated cyber grid
function CyberGrid() {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, zIndex: 2, pointerEvents: 'none' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#7c3aed" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    {
      id: 'login',
      href: '/login',
      label: 'CONTINUE MISSION',
      sub: 'Authenticate & Access Your Op',
      icon: User,
      color: '#a78bfa',
      glow: 'rgba(167,139,250,0.3)',
      key: 'F1',
    },
    {
      id: 'register',
      href: '/register',
      label: 'NEW OPERATIVE',
      sub: 'Enlist & Form Your Strike Team',
      icon: Play,
      color: '#67e8f9',
      glow: 'rgba(6,182,212,0.3)',
      key: 'F2',
    },
    {
      id: 'story',
      href: '/story',
      label: 'MISSION BRIEFING',
      sub: 'Read the Intel & Story',
      icon: BookOpen,
      color: '#f9a8d4',
      glow: 'rgba(249,168,212,0.3)',
      key: 'F3',
    },
    {
      id: 'leaderboard',
      href: '/leaderboard',
      label: 'AGENT RANKINGS',
      sub: 'View Live Leaderboard',
      icon: Trophy,
      color: '#fbbf24',
      glow: 'rgba(251,191,36,0.3)',
      key: 'F4',
    },
  ];

  return (
    <div className="game-root" style={{ overflow: 'hidden' }}>
      {/* Background */}
      <div
        className="game-bg"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1510511459019-5dda7724fd87?q=80&w=2070&auto=format&fit=crop')`,
          filter: 'brightness(0.25) saturate(0.8)',
        }}
      />
      <div className="game-bg-overlay" style={{ background: 'linear-gradient(135deg, rgba(5,2,18,0.95) 0%, rgba(10,4,30,0.9) 50%, rgba(5,2,18,0.97) 100%)' }} />
      <CyberGrid />

      {/* Particle dots */}
      {mounted && [...Array(25)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            borderRadius: '50%',
            background: i % 3 === 0 ? '#7c3aed' : i % 3 === 1 ? '#06b6d4' : '#a78bfa',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.2,
            zIndex: 3,
            animation: `float ${3 + Math.random() * 5}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Main container - centered layout */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '80px',
          padding: '0 60px',
        }}
      >
        {/* LEFT: Title block */}
        <div
          style={{
            flex: 1,
            maxWidth: 520,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateX(0)' : 'translateX(-40px)',
            transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Event badge */}
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px',
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.4)',
              borderRadius: 20,
              marginBottom: 28,
            }}
          >
            <span className="status-dot active" />
            <span style={{ color: '#a78bfa', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
              HACK THE BOX 2026 — LIVE
            </span>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 6,
                textTransform: 'uppercase',
                color: '#6b7280',
                marginBottom: 4,
              }}
            >
              ██ CLASSIFIED OPERATION ██
            </div>
            <h1
              className="game-title"
              style={{
                fontSize: 68,
                lineHeight: 0.92,
                background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 40%, #7c3aed 70%, #4c1d95 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: 8,
              }}
            >
              OPERATION
            </h1>
            <h1
              className="game-title"
              style={{
                fontSize: 56,
                lineHeight: 1,
                background: 'linear-gradient(135deg, #67e8f9 0%, #06b6d4 50%, #0891b2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: 20,
              }}
            >
              CIPHER STRIKE
            </h1>
          </div>

          {/* Subtitle */}
          <p style={{ color: '#9ca3af', fontSize: 16, lineHeight: 1.6, marginBottom: 36, maxWidth: 420 }}>
            The mall is under siege. 1,200 hostages. A nationwide cyber attack imminent.
            You are our last line of defence. Solve the ciphers. Stop the breach.
          </p>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 28 }}>
            {[
              { label: 'ROUNDS', value: '3', color: '#fca5a5' },
              { label: 'MISSIONS', value: '9', color: '#a78bfa' },
              { label: 'HOSTAGES', value: '1,200', color: '#67e8f9' },
            ].map(s => (
              <div key={s.label}>
                <div className="stat-card-value" style={{ fontSize: 28, color: s.color, fontWeight: 900 }}>{s.value}</div>
                <div className="game-label" style={{ fontSize: 10, color: '#4b5563' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ margin: '36px 0', height: 1, background: 'linear-gradient(90deg, rgba(124,58,237,0.5), transparent)' }} />

          {/* Shield icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Shield size={20} color="#7c3aed" />
            <span style={{ color: '#6b7280', fontSize: 13, letterSpacing: 1 }}>
              CERT-IN TAMIL NADU DIVISION — AUTHORIZED PERSONNEL ONLY
            </span>
          </div>
        </div>

        {/* RIGHT: Menu panel */}
        <div
          style={{
            width: 440,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateX(0)' : 'translateX(40px)',
            transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.15s',
          }}
        >
          {/* Panel header */}
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <div className="game-label" style={{ color: '#7c3aed', marginBottom: 4 }}>◆ MAIN TERMINAL ◆</div>
            <div style={{ width: 60, height: 2, background: 'linear-gradient(90deg, transparent, #7c3aed, transparent)', margin: '0 auto' }} />
          </div>

          {/* Menu items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              const isHover = hover === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="menu-btn"
                  onMouseEnter={() => setHover(item.id)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    animationDelay: `${i * 0.08}s`,
                    boxShadow: isHover ? `0 4px 30px ${item.glow}` : undefined,
                    borderColor: isHover ? `${item.color}55` : undefined,
                  }}
                >
                  {/* Key hint */}
                  <div
                    style={{
                      position: 'absolute', top: 8, right: 14,
                      fontSize: 10, color: '#374151', letterSpacing: 1, fontWeight: 700,
                    }}
                  >
                    {item.key}
                  </div>

                  {/* Icon */}
                  <div
                    style={{
                      width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                      background: isHover ? `${item.color}18` : 'rgba(109,40,217,0.1)',
                      border: `1px solid ${isHover ? item.color + '55' : 'rgba(109,40,217,0.25)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Icon size={20} color={isHover ? item.color : '#6b7280'} />
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
                        color: isHover ? item.color : '#d1d5db',
                        transition: 'color 0.2s',
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={{ fontSize: 12, color: '#4b5563', letterSpacing: 0.5, marginTop: 2 }}>
                      {item.sub}
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    color={isHover ? item.color : '#374151'}
                    style={{ transition: 'all 0.2s', transform: isHover ? 'translateX(3px)' : 'none' }}
                  />
                </Link>
              );
            })}
          </div>

          {/* Bottom version */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <div className="game-label" style={{ fontSize: 10, color: '#374151' }}>
              BUILD 2026.02.18 · CIPHER STRIKE ENGINE v3.0
            </div>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Zap size={12} color="#7c3aed" />
              <span style={{ color: '#4b5563', fontSize: 11, letterSpacing: 1 }}>POWERED BY HACKTHEBOX PLATFORM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, zIndex: 20,
          background: 'linear-gradient(90deg, transparent, #7c3aed, #06b6d4, #7c3aed, transparent)',
          opacity: 0.6,
        }}
      />
    </div>
  );
}
