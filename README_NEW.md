# 🎯 HACK-THE-BOX: Operation Cipher Strike

A production-ready cybersecurity competition platform with an engaging storyline, progressive challenges, and real-time scoring.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Gmail account (for OTP emails)

### 1. Install Dependencies & Setup

```powershell
# Run the automated setup script
.\setup.ps1
```

This will:
- ✅ Install all backend dependencies
- ✅ Run database migrations
- ✅ Seed 9 challenges into the database
- ✅ Install frontend dependencies
- ✅ Create environment files

### 2. Configure Environment

Update `apps/backend/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/hackthebox"
JWT_SECRET="your-secret-key-here"
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-gmail-app-password"
PORT=3001
```

**Get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Use that 16-character password in SMTP_PASS

### 3. Start the Application

**Terminal 1 - Backend:**
```powershell
cd apps/backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```powershell
cd apps/frontend
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📖 Competition Flow

### Phase 1: Registration (10-15 min)
1. **Landing Page** → User sees hero section with mission briefing
2. **Email Entry** → User enters email
3. **OTP Verification** → Receives 6-digit code (10min expiry, 3 attempts)
4. **Team Creation** → Creates team with name + 2 member names
5. **Dashboard** → Redirected to competition dashboard

### Phase 2: Competition (3-4 hours)
**Round 1: THE BREACH DISCOVERY** (Cryptography)
- Level 1.1: Triple-Layer Encoding (100pts)
- Level 1.2: Multi-Fragment Puzzle (150pts)
- Level 1.3: Time-Locked Vault (200pts)

**Round 2: INFILTRATION** (Hash Cracking)
- Level 2.1: Hash Trail (200pts)
- Level 2.2: JWT Inception (250pts)
- Level 2.3: Pattern Lock - Team-Specific! (300pts)

**Round 3: THE FINAL STRIKE** (Integrated CTF)
- Level 3.1: Payload Hunt (300pts)
- Level 3.2: Time Bomb Defusal (400pts)
- Level 3.3: The Kill Switch (500pts + DOUBLE for first team!)

### Phase 3: Victory
- First team to complete Level 3.3 wins
- Real-time leaderboard shows all teams
- Save Coimbatore from Operation BLACKOUT!

## 🎨 Design Features

### Dark Cyber Theme
- Pure black background (`#000000`)
- Cyber green accents (`#00ff41`)
- Danger red for threats (`#ff0040`)
- GSAP animations for smooth interactions
- Three.js support for 3D models

### Typography
- **Headings:** Orbitron (cyber style)
- **Body:** Inter (clean, readable)
- **Code:** Fira Code (monospace)

### UI Components
- Glowing cyber buttons
- Animated grid background
- Card hover effects
- Real-time countdown timers
- Progress indicators for rounds

## 🔧 API Endpoints

### Authentication
```
POST /auth/request-otp
Body: { email: string }

POST /auth/verify-otp
Body: { email: string, otp: string }

POST /auth/register-team
Body: { email: string, teamName: string, member1Name: string, member2Name: string }

GET /auth/team/:teamId
```

### Challenges
```
GET /challenges
GET /challenges/round/:roundNumber
GET /challenges/:level

POST /challenges/submit
Body: { teamId: string, challengeLevel: string, answer: string }

POST /challenges/hint
Body: { teamId: string, challengeLevel: string }
```

### Scoreboard
```
GET /scoreboard?limit=10
GET /scoreboard/team/:teamId
GET /scoreboard/live (SSE - Server-Sent Events)
```

## 🧪 Testing Challenge Answers

```typescript
// Round 1
HTB{DARKNET_2026_COR}
HTB{SERV-ER-42-FINAL-LAB}
HTB{024A4F93}

// Round 2
HTB{WHIONEPAS42}
HTB{6202_SSECCA_TENKRAD}
HTB{<team-specific-hash>} // Calculate: SHA256(TeamName + "25CIPHER2026")[0:8]

// Round 3
HTB{BLACK_OUT_CODE_TWENTYTWO}
HTB{DEFUSE_COMPOSITE}
HTB{KILL_SWITCH_OPERATION_BLACKOUT_ABORTED_SUCCESS}
```

## 📂 Project Structure

```
hackthebox/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── otp.service.ts          # OTP generation & email
│   │   │   │   └── auth.controller.ts
│   │   │   ├── challenges/
│   │   │   │   ├── challenge-validator.service.ts
│   │   │   │   ├── challenges.service.ts
│   │   │   │   └── challenges.controller.ts
│   │   │   ├── teams/
│   │   │   │   └── registration.service.ts  # Team creation & leaderboard
│   │   │   └── scoreboard/
│   │   │       └── scoreboard.controller.ts  # Real-time SSE
│   │   └── prisma/
│   │       ├── schema.prisma                # Database schema
│   │       └── seed.ts                      # 9 challenges seeded
│   │
│   └── frontend/
│       ├── app/
│       │   ├── page.tsx                    # Hero landing page
│       │   ├── register/
│       │   ├── verify-otp/
│       │   ├── team-setup/
│       │   └── dashboard/
│       ├── components/
│       │   ├── Hero3D.tsx                  # 3D character
│       │   ├── ChallengeCard.tsx
│       │   └── Scoreboard.tsx
│       └── lib/
│           └── api.ts                      # API client
│
├── COMPLETE-REDESIGN-PLAN.md              # Full competition design doc
├── IMPLEMENTATION-GUIDE.md                # Setup instructions
└── setup.ps1                              # Automated setup script
```

## 🎯 Key Features

✅ **Email-Based Registration** with OTP verification  
✅ **Team System** (exactly 2 members required)  
✅ **Linear Progression** (must solve challenges in order)  
✅ **9 Progressive Challenges** (Easy → Medium → Hard)  
✅ **Real-Time Scoreboard** via Server-Sent Events  
✅ **Hint System** (with point penalties)  
✅ **Attempt Limits** (3-5 attempts per challenge)  
✅ **Time Tracking** (for tiebreakers)  
✅ **Team-Specific Challenge** (Level 2.3 - anti-cheating)  
✅ **First-Place Bonus** (double points for first team to complete)  
✅ **Engaging Storyline** (Operation Cipher Strike narrative)  
✅ **Dark Cyber Theme** (pure black + cyber green)  
✅ **GSAP Animations** (smooth, professional UI)  
✅ **Responsive Design** (desktop-optimized)

## 🛠️ Technologies Used

### Backend
- NestJS (Node.js framework)
- Prisma ORM (PostgreSQL)
- JWT Authentication
- Nodemailer (OTP emails)
- bcrypt (password hashing)
- Server-Sent Events (real-time updates)

### Frontend
- Next.js 15 (React 19)
- TypeScript
- TailwindCSS (styling)
- GSAP (animations)
- Three.js + React Three Fiber (3D models)
- Framer Motion (micro-interactions)
- Axios (API calls)
- Zustand (state management)
- React Hot Toast (notifications)

## 📝 Database Schema

```prisma
model OTP {
  email, otpHash, attempts, expiresAt, isVerified
}

model Team {
  name, email, member1Name, member2Name
  currentChallenge, totalPoints, timeElapsed, hintsUsed
}

model Round {
  roundNumber, title, theme, storyArc
}

model Challenge {
  level, title, narrative, points, answerHash
  hintText, hintPenalty, maxAttempts
}

model Submission {
  teamId, challengeId, submittedAnswer, isCorrect
  pointsAwarded, attemptNumber, timeTaken
}
```

## 🔒 Security Features

- OTP expires in 10 minutes
- Maximum 3 OTP attempts per email
- Rate limiting on OTP requests (2 minutes)
- bcrypt hashing for all answers
- JWT tokens for authentication
- Team-specific challenge (Level 2.3) prevents answer sharing
- Linear progression (can't skip levels)
- Attempt limits per challenge

## 🎮 Gameplay Mechanics

### Scoring
- Base points per challenge (100-500pts)
- Hint penalties (-20 to -150pts)
- Time-based tiebreaker (faster = better)
- First team to complete final challenge gets double points

### Progression
- Must complete challenges in order (1.1 → 1.2 → 1.3 → 2.1...)
- Rounds unlock sequentially
- Can't jump ahead or skip challenges
- Current challenge tracked per team

### Hints
- Optional for each challenge
- Deducts points when used
- Can only be used once per challenge
- Penalty ranges from 20-150 points

## 🐛 Troubleshooting

### Database Issues
```powershell
# Reset database
cd apps/backend
npx prisma migrate reset
npx prisma generate
npm run prisma:seed
```

### OTP Not Sending
1. Check SMTP credentials in `.env`
2. Ensure Gmail 2FA is enabled
3. Generate new App Password
4. Check spam folder

### Port Already in Use
```powershell
# Kill process on port 3001 (backend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process

# Kill process on port 3000 (frontend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

## 📞 Support

For issues or questions:
1. Check [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md)
2. Review [COMPLETE-REDESIGN-PLAN.md](./COMPLETE-REDESIGN-PLAN.md)
3. Check database logs: `apps/backend/prisma/migrations`
4. Enable debug mode: Set `LOG_LEVEL=debug` in `.env`

## 📄 License

This project is created for educational purposes as part of a cybersecurity competition.

---

**🎯 Mission:** Save Coimbatore from Operation BLACKOUT!  
**⏰ Deadline:** February 14, 2026, 23:59:59 IST  
**🏆 Prize:** Glory, knowledge, and bragging rights!

Good luck, cyber warriors! 💚🔐
