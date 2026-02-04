'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { Shield, Terminal, Users, Trophy } from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // GSAP animations
    if (titleRef.current) {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: -50,
        duration: 1,
        ease: 'power3.out',
      });

      // Glitch effect
      gsap.to(titleRef.current, {
        textShadow:
          '2px 2px 0px #00ff41, -2px -2px 0px #ff0040',
        duration: 0.1,
        repeat: -1,
        yoyo: true,
        repeatDelay: 3,
      });
    }

    // Animate feature cards
    gsap.from('.feature-card', {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.2,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: '.features-section',
        start: 'top 80%',
      },
    });
  }, []);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Title */}
          <h1
            ref={titleRef}
            className="font-cyber text-6xl md:text-8xl lg:text-9xl font-bold mb-6"
          >
            <span className="text-cyber">OPERATION</span>
            <br />
            <span className="text-white">CIPHER STRIKE</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-3xl mx-auto">
            A Cybersecurity Competition by CERT-In Tamil Nadu Division
          </p>

          {/* Event Details */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyber" />
              <span className="text-gray-300">
                <strong className="text-cyber">Duration:</strong> 3-4 hours
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyber" />
              <span className="text-gray-300">
                <strong className="text-cyber">Team Size:</strong> 2 members
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-cyber" />
              <span className="text-gray-300">
                <strong className="text-cyber">Rounds:</strong> 3 × 3 levels = 9 challenges
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="btn-cyber px-8 py-4 rounded-lg font-cyber text-lg font-bold"
            >
              🚀 REGISTER NOW
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-lg font-cyber text-lg font-bold border-2 border-primary/50 hover:border-primary transition-all duration-300"
            >
              📊 VIEW LEADERBOARD
            </Link>
          </div>

          {/* Mission Briefing */}
          <div className="card-cyber max-w-4xl mx-auto p-8 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-danger" />
              <h2 className="font-cyber text-2xl font-bold text-danger">
                🚨 MISSION BRIEFING
              </h2>
            </div>
            <p className="text-gray-300 text-left leading-relaxed">
              <strong className="text-white">Date:</strong> February 1, 2026, 2:47 AM
              <br />
              <strong className="text-white">Location:</strong> Coimbatore Tech Hub, Tamil Nadu
              <br />
              <br />
              A cybersecurity breach has been detected. <strong className="text-cyber">Saravana Subramanian</strong> (The Cipher Master),
              a former CTL at Coimbatore Tech Hub, has initiated <strong className="text-danger">Operation BLACKOUT</strong> - a
              massive cyber attack targeting 50,000+ tech employees and ₹2,000+ crore in assets.
              <br />
              <br />
              <strong className="text-cyber">Your Mission:</strong> Work with <strong className="text-white">Kavya Raghavan</strong> (The Tech Goddess)
              and <strong className="text-white">Inspector Vikram Singaravelan</strong> to decode encrypted transmissions, crack security systems,
              and stop the attack before Valentine's Day midnight (Feb 14, 2026).
              <br />
              <br />
              <span className="text-danger font-bold">⏰ Countdown: 13 days remaining</span>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-cyber text-4xl md:text-5xl font-bold text-center mb-16 text-cyber">
            COMPETITION FEATURES
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="feature-card card-cyber p-6 rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Terminal className="w-6 h-6 text-cyber" />
              </div>
              <h3 className="font-cyber text-xl font-bold mb-2 text-white">
                Progressive Challenges
              </h3>
              <p className="text-gray-400">
                3 rounds, 9 levels total. From cryptography to CTF challenges. Linear progression - no skipping!
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card card-cyber p-6 rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-cyber" />
              </div>
              <h3 className="font-cyber text-xl font-bold mb-2 text-white">
                Team-Based Competition
              </h3>
              <p className="text-gray-400">
                Form teams of exactly 2 members. Collaborate, strategize, and compete together!
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card card-cyber p-6 rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-cyber" />
              </div>
              <h3 className="font-cyber text-xl font-bold mb-2 text-white">
                Real-Time Scoring
              </h3>
              <p className="text-gray-400">
                Live leaderboard updates. First team to complete the final challenge gets double points!
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card card-cyber p-6 rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-cyber" />
              </div>
              <h3 className="font-cyber text-xl font-bold mb-2 text-white">
                Engaging Storyline
              </h3>
              <p className="text-gray-400">
                Every challenge is part of a cohesive narrative. Experience an immersive cyber thriller!
              </p>
            </div>

            {/* Feature 5 */}
            <div className="feature-card card-cyber p-6 rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="font-cyber text-xl font-bold mb-2 text-white">
                Learn By Doing
              </h3>
              <p className="text-gray-400">
                Newbie-friendly with hints available. Master concepts like encoding, hashing, and JWT tokens!
              </p>
            </div>

            {/* Feature 6 */}
            <div className="feature-card card-cyber p-6 rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-cyber text-xl font-bold mb-2 text-white">
                Time Pressure
              </h3>
              <p className="text-gray-400">
                Elapsed time tracked. Faster solutions break ties. Can you save Coimbatore in time?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center card-cyber p-12 rounded-lg">
          <h2 className="font-cyber text-4xl font-bold mb-6 text-white">
            READY TO SAVE COIMBATORE?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Register now and join the elite cyber defense team. The clock is ticking...
          </p>
          <Link
            href="/register"
            className="btn-cyber px-12 py-4 rounded-lg font-cyber text-xl font-bold inline-block"
          >
            🎯 START YOUR MISSION
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-primary/20">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p className="font-mono-cyber">
            © 2026 CERT-In Tamil Nadu Division | Coimbatore Tech Hub
          </p>
          <p className="text-sm mt-2">
            Operation Cipher Strike - A Cybersecurity Competition
          </p>
        </div>
      </footer>
    </main>
  );
}
