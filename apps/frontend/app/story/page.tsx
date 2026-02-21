'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ChevronRight, SkipForward, ArrowLeft } from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Scene = {
  bg: string;
  speaker: string;
  speakerColor: string;
  text: string;
  image: string;
  imagePos?: 'left' | 'right' | 'center';
};

/* ─── INTRO SCENES (no param) → /dashboard ──────────────────────────────── */
const INTRO_SCENES: Scene[] = [
  {
    bg: '/images/background/1.jpg',
    speaker: 'NARRATOR',
    speakerColor: '#9ca3af',
    text: 'February 1st, 2026. 3:44 AM. Codissia Trade Fair Complex, Coimbatore — Tamil Nadu\'s largest event venue. Tonight it is a warzone. A coordinated terror cell has taken 1,200 civilians hostage across three buildings. What happens next will determine whether 50,000 jobs survive the morning.',
    image: '/images/characters/narrator.png',
    imagePos: 'right',
  },
  {
    bg: '/images/background/1.jpg',
    speaker: 'UMAR SAIF',
    speakerColor: '#ef4444',
    text: '"Listen carefully. I am Umar Saif. In exactly six hours, you will release Farooq Shah from NSA custody — or I will execute one hostage every ten minutes on national television. The cameras are already positioned. Do not test me."',
    image: '/images/characters/umar_threatening.png',
    imagePos: 'left',
  },
  {
    bg: '/images/background/5.jpg',
    speaker: 'UMAR SAIF',
    speakerColor: '#ef4444',
    text: '"And when Farooq walks free — Operation BLACKOUT goes live. Your power grids. Your hospitals. Your financial networks. All of it, gone before morning prayer. The people of Coimbatore will curse your government\'s name for a generation. Release him. Now."',
    image: '/images/characters/umar_angry.png',
    imagePos: 'left',
  },
  {
    bg: '/images/background/2.jpg',
    speaker: 'PREETHI',
    speakerColor: '#f472b6',
    text: '"Sir Althaf, NSA cyber division has confirmed BLACKOUT is real. It\'s a dormant worm planted months ago inside twelve Tamil Nadu power grids. Activation date: February 14th. If Saif triggers it early, we lose hospitals, banks, emergency services — simultaneously. 50,000 businesses dark overnight."',
    image: '/images/characters/preethi_worried.png',
    imagePos: 'right',
  },
  {
    bg: '/images/background/6.jpg',
    speaker: 'ALTHAF',
    speakerColor: '#34d399',
    text: '"We will not negotiate. Not with terrorists. Not today. Veera — you are already inside that building. I am authorising Level-5 cyber operations. Find Saif\'s command network. We need the BLACKOUT kill switch before dawn or this city burns."',
    image: '/images/characters/althaf_commanding.png',
    imagePos: 'left',
  },
  {
    bg: '/images/background/4.jpg',
    speaker: 'VEERA',
    speakerColor: '#a78bfa',
    text: '"I\'m in the basement — B2 sub-level. There\'s a server room down here, ER-42. Their entire communication relay is running through this node. I can intercept Saif\'s encrypted traffic. But I need a cyber unit outside to decode what I pull. Who\'s working comms tonight?"',
    image: '/images/characters/veera_determined.png',
    imagePos: 'right',
  },
  {
    bg: '/images/background/4.jpg',
    speaker: 'VIKRAM',
    speakerColor: '#38bdf8',
    text: '"Veera sir — Vikram here. NSA relay patched. I\'m pulling your signal now. Listen — every intercepted file is triple-encrypted. We have a 20-minute window before Saif rotates his keys. We need a team that can crack ciphers under pressure. Real field cryptography. No tools — just skill."',
    image: '/images/characters/vikram_urgent.png',
    imagePos: 'left',
  },
  {
    bg: '/images/background/6.jpg',
    speaker: 'ALTHAF',
    speakerColor: '#34d399',
    text: '"That team is you. Your team. I am authorising you for Level-5 NSA cyber-operations — effective immediately. Nine cipher challenges stand between Coimbatore and catastrophe. Solve them in strict sequence. Each solution advances Veera deeper into the network. No skipping. No shortcuts. Begin."',
    image: '/images/characters/althaf_commanding.png',
    imagePos: 'left',
  },
  {
    bg: '/images/background/7.jpg',
    speaker: 'NARRATOR',
    speakerColor: '#9ca3af',
    text: 'Three rounds. Nine missions. Base64, binary, Caesar, MD5, SHA-256, JWT tokens, logic bombs — real cryptography used in real field operations. Every flag you decode is intelligence that pushes Veera closer to Saif\'s command server. The clock is running.',
    image: '/images/characters/narrator.png',
    imagePos: 'right',
  },
  {
    bg: '/images/background/9.jpg',
    speaker: 'VEERA',
    speakerColor: '#a78bfa',
    text: '"You decode, I move. You crack the hash, I advance. You find the kill switch — I pull it. 1,200 hostages are counting on you tonight. You are not playing a game. You are the cyber unit. Let\'s move."',
    image: '/images/characters/veera_determined.png',
    imagePos: 'right',
  },
];

/* ─── POST-CHALLENGE SCENES → /timeline ─────────────────────────────────── */
const CHALLENGE_SCENES: Record<number, Scene[]> = {
  1: [
    {
      bg: '/images/background/1.jpg',
      speaker: 'VEERA',
      speakerColor: '#a78bfa',
      text: '"Transmission decoded! Server Room ER-42, East Wing, sub-level 3. Vikram — routing now. That transmission was dated 47 minutes ago. Saif\'s command team is already there. I\'m moving, but I need the access codes before the patrol sweeps back. Keep working."',
      image: '/images/characters/veera_determined.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/1.jpg',
      speaker: 'NARRATOR',
      speakerColor: '#9ca3af',
      text: 'The first cipher falls. Veera has a destination — East Wing, ER-42. But the server room has three layers of access control: a fragmented map, a biometric lock, and a team-specific hash vault. Two more challenges stand between him and the attack blueprint.',
      image: '/images/characters/narrator.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/1.jpg',
      speaker: 'VIKRAM',
      speakerColor: '#38bdf8',
      text: '"Good work. But we are not done. The server room access code has been split into three fragments — three different encodings. Veera reaches a locked door in four minutes. You have three. Decode all three fragments and assemble them in order. Go."',
      image: '/images/characters/vikram_urgent.png',
      imagePos: 'left',
    },
  ],
  2: [
    {
      bg: '/images/background/2.jpg',
      speaker: 'VEERA',
      speakerColor: '#a78bfa',
      text: '"Door is open. I\'m in ER-42. Their relay server is right here — it\'s active. I can see Saif\'s entire command traffic. But there\'s a biometric time-lock on the main vault. The code changes every hour. We need to generate it from the team identity formula — fast."',
      image: '/images/characters/veera_determined.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/2.jpg',
      speaker: 'NARRATOR',
      speakerColor: '#9ca3af',
      text: 'Server Room ER-42 is breached. Inside: the backbone of Saif\'s encrypted network. The vault holding his complete attack blueprint is one mathematical formula away. But this lock is personalised — every team must solve their own unique combination.',
      image: '/images/characters/narrator.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/2.jpg',
      speaker: 'ALTHAF',
      speakerColor: '#34d399',
      text: '"Listen carefully. The vault uses a team-specific hash. Your team name, your parameters, your formula. No one else\'s answer will work. This is intentional — Saif designed his network to prevent answer sharing between agents. Compute your unique code. Unlock that vault."',
      image: '/images/characters/althaf_commanding.png',
      imagePos: 'left',
    },
  ],
  3: [
    {
      bg: '/images/background/3.jpg',
      speaker: 'VEERA',
      speakerColor: '#a78bfa',
      text: '"Vault is open! I have the attack plans — Saif\'s full blueprint is in my hands. Listen — this is bigger than we thought. There are two targets. The mall is a distraction. The real objective is the city power grid. And there\'s a second operator — someone named Saravana. The Phantom."',
      image: '/images/characters/veera_intense.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/3.jpg',
      speaker: 'ALTHAF',
      speakerColor: '#34d399',
      text: '"Saravana. I know that name. He\'s been off the grid for three years. If he\'s running the tech side of BLACKOUT, this operation has a level of sophistication we underestimated. Veera — the attack is not over. Round Two begins now. Infiltrate the next layer."',
      image: '/images/characters/althaf_concerned.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/3.jpg',
      speaker: 'NARRATOR',
      speakerColor: '#9ca3af',
      text: 'Round 1 complete. The Breach is over. Three ciphers cracked, one server room compromised, one attack blueprint extracted. But a second operator — The Phantom — changes everything. Round 2 begins: Infiltration. Three encrypted databases. Crack them all.',
      image: '/images/characters/narrator.png',
      imagePos: 'right',
    },
  ],
  4: [
    {
      bg: '/images/background/4.jpg',
      speaker: 'PREETHI',
      speakerColor: '#f472b6',
      text: '"The hard drive contains three password-protected databases — sleeper cell identities, financial backers, and the BLACKOUT payload code. All three are hashed. MD5, SHA-1, SHA-256. If we crack all three before dawn, we have enough evidence to block Farooq\'s release legally. Move."',
      image: '/images/characters/preethi_worried.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/4.jpg',
      speaker: 'NARRATOR',
      speakerColor: '#9ca3af',
      text: 'Hash trail broken. The sleeper cell database is exposed. Financial backers identified. BLACKOUT\'s payload structure is partially visible. Farooq\'s release is now politically impossible — the evidence is too damning. But Saif knows you are inside his network.',
      image: '/images/characters/narrator.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/4.jpg',
      speaker: 'VIKRAM',
      speakerColor: '#38bdf8',
      text: '"Veera — Saif has changed tactics. He\'s got a token — a JWT admin token — that gives him direct access to the government\'s emergency broadcast system. If he gets in, he triggers a mass panic before we can respond. We need to decode and invalidate that token. Now."',
      image: '/images/characters/vikram_serious.png',
      imagePos: 'left',
    },
  ],
  5: [
    {
      bg: '/images/background/5.jpg',
      speaker: 'VEERA',
      speakerColor: '#a78bfa',
      text: '"Token decoded. The admin credential inside was reversed — classic field obfuscation. And the logs confirm it: the Home Minister\'s \'execution\' three weeks ago was staged. She is alive. Saif has been using her as blackmail leverage against the government. This changes the entire political calculus."',
      image: '/images/characters/veera_intense.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/5.jpg',
      speaker: 'ALTHAF',
      speakerColor: '#34d399',
      text: '"If the Minister is alive, the government has been coerced into cooperating. That means there are insiders. People we trusted. This information must not leave this channel until we have everyone identified. Keep working — one database remains. The BLACKOUT worm blueprint is inside."',
      image: '/images/characters/althaf_commanding.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/5.jpg',
      speaker: 'NARRATOR',
      speakerColor: '#9ca3af',
      text: 'The government conspiracy unravels. The Minister lives. Saif\'s leverage crumbles — if this proof reaches the public. One challenge remains in Round 2: the final pattern-locked database protecting the complete BLACKOUT worm code. Your team\'s identity is the only key.',
      image: '/images/characters/narrator.png',
      imagePos: 'right',
    },
  ],
  6: [
    {
      bg: '/images/background/6.jpg',
      speaker: 'VEERA',
      speakerColor: '#a78bfa',
      text: '"Pattern lock is cracked. I have the BLACKOUT worm code. It\'s a self-replicating payload — it targets industrial control systems in the power grid, financial sector, and hospital networks simultaneously. But buried inside the code… I see a kill switch. Someone built a way to stop it."',
      image: '/images/characters/veera_intense.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/6.jpg',
      speaker: 'PREETHI',
      speakerColor: '#f472b6',
      text: '"The kill switch is in a separate encrypted module — three parts. Payload fragment, defusal code, master vault key. Saravana split them across different systems. He did not want anyone finding all three. Veera — we need to run all three down before February 14th. You have 72 hours."',
      image: '/images/characters/preethi_hopeful.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/6.jpg',
      speaker: 'NARRATOR',
      speakerColor: '#9ca3af',
      text: 'Round 2 complete. The Infiltration is over. Six missions cracked. The BLACKOUT worm is mapped. A kill switch exists — hidden across three final systems. Round 3 begins: The Final Strike. Veera and Aparna race against time to find all three components before the malware activates at midnight.',
      image: '/images/characters/narrator.png',
      imagePos: 'right',
    },
  ],
  7: [
    {
      bg: '/images/background/7.jpg',
      speaker: 'VEERA',
      speakerColor: '#a78bfa',
      text: '"Aparna came through — the payload fragments are decoded. BLACKOUT activates February 14th at 23:59. The kill switch works by flooding the activation endpoint with a specific encoded sequence. But there\'s a logic bomb in the deployment script — a trap Saravana set. If we trigger it wrong, BLACKOUT goes live tonight."',
      image: '/images/characters/veera_concerned.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/7.jpg',
      speaker: 'NARRATOR',
      speakerColor: '#9ca3af',
      text: 'The kill switch mechanism is understood. But deploying it is a minefield. Saravana buried a logic bomb five encoding layers deep in the activation script. One wrong decode and the city burns tonight. This is the most dangerous challenge yet — there is no margin for error.',
      image: '/images/characters/narrator.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/7.jpg',
      speaker: 'VIKRAM',
      speakerColor: '#38bdf8',
      text: '"Logic bomb is armed. The defusal code is buried under multiple nested encoding layers — we counted five. Each layer hides the next. One misstep, one wrong decode, and the trigger fires. Veera is standing by at the kill switch server. He cannot pull it until you give him the correct defusal code. This is on you."',
      image: '/images/characters/vikram_urgent.png',
      imagePos: 'left',
    },
  ],
  8: [
    {
      bg: '/images/background/8.jpg',
      speaker: 'VEERA',
      speakerColor: '#a78bfa',
      text: '"Logic bomb is dead! Kill switch server is isolated from the grid. The mall siege is collapsing — Saif\'s command and control is gone. Umar Saif is in custody. But Saravana — The Phantom — went dark the moment we breached his server. He has a contingency. The Master Vault. If he reaches that vault, BLACKOUT goes live manually."',
      image: '/images/characters/veera_determined.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/8.jpg',
      speaker: 'ALTHAF',
      speakerColor: '#34d399',
      text: '"Joint RAW-Police raid has seized Saravana\'s secondary server. But the Master Vault — his final failsafe — is still locked. Every encoding technique in this operation converges in that vault. The kill switch code is inside. If your team cracks it before Saravana reaches a backup trigger, this is over."',
      image: '/images/characters/althaf_commanding.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/8.jpg',
      speaker: 'NARRATOR',
      speakerColor: '#9ca3af',
      text: 'One mission remains. The Master Vault — Saravana\'s final stronghold. Every cipher, every technique, every skill your team has developed across eight missions converges here. The first team to crack the vault gives Veera the kill switch. Coimbatore is waiting. The city is counting on you.',
      image: '/images/characters/narrator.png',
      imagePos: 'right',
    },
  ],
  9: [
    {
      bg: '/images/background/9.jpg',
      speaker: 'VEERA',
      speakerColor: '#a78bfa',
      text: '"Kill switch is live. BLACKOUT has been terminated. All twelve grid endpoints are clean. Saravana Krishnamurthy — The Phantom — is in custody. The worm is dead. It. Is. Over."',
      image: '/images/characters/veera_relieved.png',
      imagePos: 'right',
    },
    {
      bg: '/images/background/9.jpg',
      speaker: 'ALTHAF',
      speakerColor: '#34d399',
      text: '"Home Minister Kavitha is alive and safe — we extracted her from the safe house forty minutes ago. All 1,200 hostages are released. Umar Saif, Farooq Shah, and Saravana Krishnamurthy are in NSA custody. Operation BLACKOUT is terminated. Operation Cipher Strike — is complete."',
      image: '/images/characters/althaf_commanding.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/9.jpg',
      speaker: 'VIKRAM',
      speakerColor: '#38bdf8',
      text: '"50,000 businesses. 12 power grids. 8 hospital networks. All operational. None of this happens without your team. You cracked nine ciphers under pressure, in the dark, while real people were in danger. That is not a drill. That is field craft. I will remember this team."',
      image: '/images/characters/vikram_serious.png',
      imagePos: 'left',
    },
    {
      bg: '/images/background/9.jpg',
      speaker: 'NARRATOR',
      speakerColor: '#9ca3af',
      text: 'Three terror operatives arrested. 1,200 hostages freed. Operation BLACKOUT permanently neutralised. The city of Coimbatore never knew how close it came to darkness. And the team that stopped it? Their names will never appear in a public report. That is the nature of the work.',
      image: '/images/characters/narrator.png',
      imagePos: 'right',
    },
  ],
};

/* ─── End destinations ───────────────────────────────────────────────────── */
function getDestination(challengeNum: number | null): string {
  if (challengeNum === null) return '/dashboard';
  if (challengeNum >= 9) return '__END__';
  return '/timeline';
}

/* ─── End Title Card ─────────────────────────────────────────────────────── */
function EndTitleCard({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' });
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: "'Share Tech Mono','Courier New',monospace" }}>
      {/* Stars bg */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, rgba(0,0,0,1) 70%)' }} />
      
      <div ref={cardRef} style={{ textAlign: 'center', padding: '40px 32px', maxWidth: 640, zIndex: 10 }}>
        {/* Emblem */}
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎖️</div>

        {/* Title */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 5, color: '#10b981', marginBottom: 12, textTransform: 'uppercase' }}>
          OPERATION COMPLETE
        </div>
        <h1 style={{ fontSize: 'clamp(24px,5vw,42px)', fontWeight: 900, color: '#e2e8f0', letterSpacing: 2, margin: '0 0 8px', textShadow: '0 0 40px rgba(16,185,129,0.6)' }}>
          OPERATION CIPHER STRIKE
        </h1>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981', letterSpacing: 3, marginBottom: 32 }}>
          MISSION ACCOMPLISHED
        </div>

        {/* Divider */}
        <div style={{ width: 80, height: 1, background: 'linear-gradient(90deg,transparent,#10b981,transparent)', margin: '0 auto 32px' }} />

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 36 }}>
          {[
            { label: 'MISSIONS CRACKED', value: '9 / 9' },
            { label: 'HOSTAGES FREED', value: '1,200' },
            { label: 'BLACKOUT STATUS', value: 'TERMINATED' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '16px 10px' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#6ee7b7', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: '#6b7280', letterSpacing: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Credits quote */}
        <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.8, fontStyle: 'italic', marginBottom: 32 }}>
          "The names of those who stood in the dark to protect the light will never appear in a public report. But Coimbatore remembers."
        </p>
        <p style={{ color: '#4b5563', fontSize: 11, letterSpacing: 2, marginBottom: 36 }}>— OPERATION CIPHER STRIKE, FEBRUARY 2026</p>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/leaderboard')}
            style={{ padding: '14px 28px', background: 'linear-gradient(135deg,rgba(16,185,129,0.8),rgba(5,150,105,0.8))', border: '1px solid rgba(16,185,129,0.5)', borderRadius: 10, cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 2, boxShadow: '0 0 30px rgba(16,185,129,0.3)' }}
          >
            🏆 VIEW FINAL RANKINGS
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, cursor: 'pointer', color: '#9ca3af', fontSize: 13, fontWeight: 700, letterSpacing: 2 }}
          >
            RETURN TO HQ
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Story Inner Component ──────────────────────────────────────────────── */
function StoryInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeParam = searchParams.get('challenge');
  const challengeNum = challengeParam ? parseInt(challengeParam, 10) : null;

  const scenes: Scene[] = challengeNum !== null
    ? (CHALLENGE_SCENES[challengeNum] ?? INTRO_SCENES)
    : INTRO_SCENES;

  const destination = getDestination(challengeNum);
  const isIntro = challengeNum === null;

  const [sceneIdx, setSceneIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [showEndCard, setShowEndCard] = useState(false);

  const bgRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const dialogueRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scene = scenes[sceneIdx];
  const isLast = sceneIdx === scenes.length - 1;

  const typeText = useCallback((text: string) => {
    setDisplayText('');
    setIsTyping(true);
    let i = 0;
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    typeTimerRef.current = setInterval(() => {
      i++;
      setDisplayText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(typeTimerRef.current!);
        setIsTyping(false);
      }
    }, 18);
  }, []);

  const animateScene = useCallback((idx: number) => {
    const s = scenes[idx];
    if (bgRef.current) gsap.fromTo(bgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.inOut' });
    if (portraitRef.current) {
      const fromX = s.imagePos === 'left' ? -50 : 50;
      gsap.fromTo(portraitRef.current, { opacity: 0, x: fromX, scale: 0.95 }, { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 });
    }
    if (dialogueRef.current) gsap.fromTo(dialogueRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', delay: 0.2 });
    if (nameRef.current) gsap.fromTo(nameRef.current, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out', delay: 0.25 });
    typeText(s.text);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes, typeText]);

  useEffect(() => {
    animateScene(sceneIdx);
    return () => { if (typeTimerRef.current) clearInterval(typeTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIdx]);

  const advance = () => {
    if (isTyping) {
      if (typeTimerRef.current) clearInterval(typeTimerRef.current);
      setDisplayText(scene.text);
      setIsTyping(false);
      return;
    }
    if (isLast) {
      if (destination === '__END__') {
        setShowEndCard(true);
      } else {
        router.push(destination);
      }
      return;
    }
    setSceneIdx(i => i + 1);
  };

  const handleSkip = () => {
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    if (destination === '__END__') {
      setShowEndCard(true);
    } else {
      router.push(destination);
    }
  };

  const speakerColor = scene.speakerColor || '#a78bfa';
  const isNarrator = scene.speaker === 'NARRATOR';
  const isUmar = scene.speaker.includes('UMAR');

  if (showEndCard) return <EndTitleCard onClose={() => router.push('/dashboard')} />;

  return (
    <div
      onClick={advance}
      style={{ position: 'fixed', inset: 0, cursor: 'pointer', userSelect: 'none', fontFamily: "'Inter',sans-serif", background: '#000' }}
    >
      {/* Background */}
      <div ref={bgRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Image
          src={scene.bg}
          alt="background"
          fill
          style={{ objectFit: 'cover', filter: `brightness(0.32) saturate(0.75) ${isUmar ? 'hue-rotate(-10deg)' : ''}` }}
          priority
        />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.72) 100%)' }} />
        {/* Red tint for Umar scenes */}
        {isUmar && <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.07)' }} />}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.05) 3px,rgba(0,0,0,0.05) 4px)', zIndex: 1, pointerEvents: 'none' }} />
      </div>

      {/* HUD top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: '14px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg,rgba(0,0,0,0.65) 0%,transparent 100%)' }}>
        {/* Back / context label */}
        <Link
          href={isIntro ? '/login' : '/timeline'}
          onClick={e => e.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 13px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 7, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textDecoration: 'none' }}
        >
          <ArrowLeft size={12} />{isIntro ? 'BACK' : 'TIMELINE'}
        </Link>

        {/* Scene dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {scenes.map((_, i) => (
            <div key={i} style={{ width: i === sceneIdx ? 18 : 6, height: 6, borderRadius: 3, background: i < sceneIdx ? '#10b981' : i === sceneIdx ? speakerColor : 'rgba(255,255,255,0.15)', transition: 'all 0.3s ease', boxShadow: i === sceneIdx ? `0 0 8px ${speakerColor}99` : 'none' }} />
          ))}
        </div>

        {/* Operation label */}
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
          {challengeNum ? `LEVEL ${challengeNum} — DEBRIEF` : 'OPERATION CIPHER STRIKE'}
        </div>

        {/* Skip */}
        <button
          onClick={e => { e.stopPropagation(); setShowSkipConfirm(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 13px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 7, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}
        >
          <SkipForward size={12} />SKIP
        </button>
      </div>

      {/* Character portrait */}
      <div
        ref={portraitRef}
        style={{
          position: 'absolute',
          bottom: 0,
          [scene.imagePos === 'left' ? 'left' : 'right']: '5vw',
          zIndex: 10,
          width: 'clamp(200px,26vw,380px)',
          height: 'clamp(320px,66vh,640px)',
          pointerEvents: 'none',
        }}
      >
        <Image
          src={scene.image}
          alt={scene.speaker}
          fill
          style={{
            objectFit: 'contain',
            objectPosition: 'bottom',
            filter: isNarrator
              ? 'drop-shadow(0 0 24px rgba(156,163,175,0.4)) drop-shadow(0 0 50px rgba(0,0,0,0.9))'
              : isUmar
              ? 'drop-shadow(0 0 32px rgba(239,68,68,0.5)) drop-shadow(0 0 60px rgba(0,0,0,0.85))'
              : 'drop-shadow(0 0 32px rgba(109,40,217,0.45)) drop-shadow(0 0 60px rgba(0,0,0,0.85))',
          }}
          priority
          onError={() => {}}
        />
      </div>

      {/* Dialogue box */}
      <div
        ref={dialogueRef}
        style={{ position: 'absolute', bottom: '3vh', left: '5vw', right: '5vw', zIndex: 15, pointerEvents: 'none' }}
      >
        {/* Name tag */}
        <div
          ref={nameRef}
          style={{
            display: 'inline-block',
            marginBottom: 8, marginLeft: 4,
            padding: '5px 18px',
            background: isUmar
              ? 'linear-gradient(90deg,rgba(239,68,68,0.85),rgba(239,68,68,0.3))'
              : isNarrator
              ? 'linear-gradient(90deg,rgba(75,85,99,0.85),rgba(75,85,99,0.3))'
              : 'linear-gradient(90deg,rgba(109,40,217,0.85),rgba(109,40,217,0.3))',
            border: `1px solid ${speakerColor}88`,
            borderRadius: '8px 8px 0 0',
            fontSize: 11, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase',
            color: speakerColor,
            backdropFilter: 'blur(10px)',
            boxShadow: `0 0 20px ${speakerColor}33`,
          }}
        >
          {scene.speaker}
        </div>

        {/* Dialogue panel */}
        <div style={{
          background: isUmar
            ? 'linear-gradient(135deg,rgba(20,3,3,0.94),rgba(40,8,8,0.92))'
            : 'linear-gradient(135deg,rgba(2,1,12,0.93),rgba(14,8,40,0.91))',
          border: `1px solid ${speakerColor}44`,
          borderRadius: '0 14px 14px 14px',
          padding: '18px 24px 22px',
          backdropFilter: 'blur(24px)',
          boxShadow: `0 8px 60px rgba(0,0,0,0.75), 0 0 30px ${speakerColor}14`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${speakerColor}55,transparent)` }} />
          <p style={{ margin: 0, fontSize: 'clamp(13px,1.55vw,17px)', color: '#e2e8f0', lineHeight: 1.78, minHeight: '3em', fontWeight: 400 }}>
            {displayText}
            {isTyping && <span style={{ opacity: 0.7, animation: 'blink 0.7s steps(1) infinite' }}>|</span>}
          </p>
          {!isTyping && (
            <div style={{ position: 'absolute', bottom: 14, right: 20, display: 'flex', alignItems: 'center', gap: 5, color: `${speakerColor}99`, fontSize: 10, fontWeight: 700, letterSpacing: 2, animation: 'nudge 1.5s ease-in-out infinite' }}>
              {isLast
                ? (destination === '__END__' ? 'FINISH' : challengeNum ? 'RETURN TO TIMELINE' : 'BEGIN MISSIONS')
                : 'CONTINUE'
              }
              <ChevronRight size={13} />
            </div>
          )}
        </div>
      </div>

      {/* Scene counter */}
      <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 20, color: 'rgba(255,255,255,0.18)', fontSize: 10, letterSpacing: 2 }}>
        {sceneIdx + 1} / {scenes.length}
      </div>

      {/* Skip confirm */}
      {showSkipConfirm && (
        <div
          onClick={e => e.stopPropagation()}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: 'linear-gradient(135deg,rgba(2,1,12,0.98),rgba(14,8,40,0.97))', border: '1px solid rgba(109,40,217,0.45)', borderRadius: 14, padding: '26px 30px', maxWidth: 380, width: '90vw', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>⏭</div>
            <h3 style={{ color: '#e9d5ff', fontSize: 16, fontWeight: 900, letterSpacing: 2, marginBottom: 8 }}>SKIP CUTSCENE?</h3>
            <p style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.65, marginBottom: 20 }}>
              {challengeNum
                ? 'Skip the mission debrief and return to the timeline.'
                : 'Skip the story introduction and proceed to the mission HQ.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setShowSkipConfirm(false)}
                style={{ padding: '10px 22px', background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(109,40,217,0.35)', borderRadius: 8, cursor: 'pointer', color: '#c4b5fd', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}
              >
                Keep Watching
              </button>
              <button
                onClick={handleSkip}
                style={{ padding: '10px 22px', background: 'rgba(109,40,217,0.7)', border: '1px solid rgba(167,139,250,0.5)', borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: 1, boxShadow: '0 0 20px rgba(109,40,217,0.35)' }}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes nudge { 0%,100%{opacity:0.6;transform:translateX(0)} 50%{opacity:1;transform:translateX(4px)} }
      `}</style>
    </div>
  );
}

/* ─── Page export (Suspense wrapper for useSearchParams) ─────────────────── */
export default function StoryPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontFamily: "'Share Tech Mono','Courier New',monospace" }}>
        Loading...
      </div>
    }>
      <StoryInner />
    </Suspense>
  );
}
