# 🎬 OPERATION DARKWEAVE - Story-Driven CTF

## 📖 Story Synopsis

**Setting:** Coimbatore Smart City Control Center (SCCC), February 2026

**Premise:**  
A senior engineer at Coimbatore Municipal Corporation's Smart City Control Center has been leaking credentials to an unknown group. The city's newly integrated infrastructure management system—controlling power distribution to 50+ textile factories, traffic signals across 300+ junctions, and the automated water treatment facility—has been quietly compromised over 3 months.

Participants play the role of an Emergency Cyber Response Cell activated by the Commissioner of Police to prevent a catastrophic ransomware attack scheduled for midnight.

---

## 🎯 Round Structure

### **Round 1: THE LEAK** (Decode the Secret)

**Narrative:**  
Coimbatore Police cybercrime division intercepts encrypted chat logs between the insider and an unknown handler. The engineer used a home-grown cipher (ROT13) to hide system details.

**Challenge Type:** Cryptography / Decoding

**Required Artifacts to Extract:**
- System Target: `UKKADAM_WATER_TREATMENT`
- Project Codename: `DARKWEAVE_2026_COIMB`
- Credential Hash: `a1b2c3d4e5f6`

**Encrypted Messages:**
1. `VNNBEBZ_XBGRV_TVRGZAGR` → ROT13 decode
2. `EBVNXGBXG_2026_EQKZO` → ROT13 decode
3. `b1o2p3q4r5s6` → Direct hash (substitution cipher)

**Victory Condition:**  
Submit all three decoded artifacts correctly. System validates and unlocks Round 2.

---

### **Round 2: THE BREACH** (Find & Crack)

**Narrative:**  
Using decoded intel, teams trace the breach to Ukkadam Water Treatment Plant's maintenance VPN. The attacker left behind password hashes, encrypted tokens, and system logs showing backdoor installation.

**Challenge Type:** Hash Cracking / Token Decoding

**Required Artifacts to Extract:**
- Master Access Key: `SCCC_MASTER_KEY_7F8E9D0A`
- Backdoor Location: `SCCC_VPN_NODE_47`

**System Evidence:**
1. Password Hash: `5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8` (SHA256 of "password")
2. Encrypted Token: `U0NDQ19NQVNURVJfS0VZXzdGOEU5RDBB` (Base64 encoded)
3. VPN Log: `U0NDQ19WUE5fTk9ERV80Nw==` (Base64 encoded)

**Victory Condition:**  
Crack/decode all artifacts and submit master key + backdoor location. Round 3 unlocks.

---

### **Round 3: THE COUNTDOWN** (Catch the Flag)

**Narrative:**  
Teams have breached SCCC's network. Ransomware is scheduled for midnight, targeting:
- Textile factory power grid → Overload
- Traffic control → Chaos mode
- Water treatment → Shutdown
- Emergency services → Communication blackout

Only ONE team can disable the kill switch. First valid submission wins.

**Challenge Type:** CTF Flag Hunt

**The Flag:**  
`HTB{COIMBATORE_DARKWEAVE_DEACTIVATED_2026}`

**Victory Condition:**  
First team to submit correct flag becomes the winner. All other teams are notified that the kill switch has been disabled. Story ends with "City Saved" outcome.

---

## 🔒 Round Gating System

### Backend Enforcement
- **Round 1 → Round 2:** Requires Round 1 completion
- **Round 2 → Round 3:** Requires Round 1 AND Round 2 completion
- **Round 3:** Atomic first-win logic (only one winner possible)

### Database Tracking
Each team has a `StoryProgress` record tracking:
- Current round number
- Completion status for each round
- Artifacts collected (stored as JSON)
- Winner status (for Round 3)

### API Validation
All endpoints validate:
- Team membership (no solo play)
- Round accessibility based on previous completions
- Solution correctness before progression
- First-win atomic transaction for Round 3

---

## 🎨 UI/UX Features

### Cinematic Elements
1. **Story Intro** (GSAP animated)
   - 5-scene intro sequence
   - Establishes setting, threat, and mission
   - Progress indicator
   - Smooth transitions

2. **Three.js Background**
   - Animated cyber grid
   - Floating data particles (200 nodes)
   - Connection lines
   - Subtle fog effect
   - Performance-optimized (30-60 FPS)

3. **Round Interfaces**
   - **Round 1:** Emerald theme, encrypted message cards
   - **Round 2:** Red/warning theme, system log fragments
   - **Round 3:** Critical alert, countdown timer, pulsing danger indicators

4. **Story Ending Screen**
   - Victory/defeat outcome
   - Winner team announcement
   - Cinematic fade-in with GSAP
   - Redirect to scoreboard

### Transitions
- Page load: Fade-in with stagger
- Form submission: Shake animation on error
- Success: Smooth green glow pulse
- Error: Red flash feedback

---

## 🎮 Admin Controls

### Story Management
- **Start Story:** Activate Operation DARKWEAVE
- **End Story - City Saved:** Manual good ending trigger
- **End Story - Breach Executed:** Manual bad ending (if time runs out)
- **Reset Story:** Clear all progress (destructive)

### Team Progress Dashboard
Real-time view of:
- Current round for each team
- Completion checkmarks (✅/⭕)
- Winner indicator (🏆)
- Last update timestamp
- 5-second auto-refresh

### Solutions Reference
Built-in panel showing:
- Round 1 decoding solutions
- Round 2 cracking solutions
- Round 3 final flag

---

## 🛠️ Technical Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (Dark theme)
- **Three.js** (v0.170+) - Background effects
- **GSAP** (v3.12+) - Animations
- **shadcn/ui** - UI components

### Backend
- **NestJS** (TypeScript)
- **Prisma ORM**
- **PostgreSQL** (Docker)
- **JWT Authentication**
- **RESTful APIs**

### Infrastructure
- **Docker Compose**
- **Redis** (future realtime features)
- **Local network deployment**

---

## 📁 Key Files Created/Modified

### Backend
- `apps/backend/prisma/schema.prisma` - StoryProgress & StoryState models
- `apps/backend/src/story/story.module.ts`
- `apps/backend/src/story/story.service.ts` - Core story logic
- `apps/backend/src/story/story.controller.ts` - API endpoints
- `apps/backend/src/app.module.ts` - Added StoryModule

### Frontend
- `apps/frontend/components/CyberBackground.tsx` - Three.js scene
- `apps/frontend/components/StoryIntro.tsx` - Animated intro
- `apps/frontend/components/StoryEnding.tsx` - Ending screen
- `apps/frontend/components/challenges/Round1Challenge.tsx`
- `apps/frontend/components/challenges/Round2Challenge.tsx`
- `apps/frontend/components/challenges/Round3Challenge.tsx`
- `apps/frontend/components/admin/StoryControl.tsx` - Admin panel
- `apps/frontend/app/challenges/page.tsx` - Main story orchestrator
- `apps/frontend/app/globals.css` - Custom animations

---

## 🚀 Deployment Steps

### 1. Update Environment Variables
```bash
# Backend .env
DATABASE_URL="postgresql://user:password@localhost:5432/hackthebox"
JWT_SECRET="your-secure-secret"
PORT=3001

# Frontend .env.local
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 2. Database Migration
```bash
cd apps/backend
npx prisma migrate dev --name add-story-system
npx prisma generate
```

### 3. Install Dependencies
```bash
# Backend
cd apps/backend
npm install

# Frontend
cd apps/frontend
npm install three @types/three gsap
```

### 4. Start Services
```bash
# Start Docker services
docker-compose up -d

# Start backend
cd apps/backend
npm run dev

# Start frontend
cd apps/frontend
npm run dev
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Admin Panel: http://localhost:3000/admin

---

## 🎯 Event Flow

### Pre-Event
1. Admin logs in
2. Creates teams or allows self-registration
3. Reviews story control dashboard
4. Briefs judges on narrative

### Event Start
1. Admin clicks "🚀 Start Story"
2. Participants log in
3. Story intro plays (90 seconds)
4. Round 1 unlocks automatically

### During Event
1. Teams solve Round 1 → Round 2 unlocks
2. Teams solve Round 2 → Round 3 unlocks
3. First team to solve Round 3 → Winner declared
4. Admin monitors progress in real-time

### Event End
- **Scenario A:** Team wins Round 3 → Automatic "City Saved" ending
- **Scenario B:** Time expires → Admin triggers "Breach Executed" ending
- **Both:** Story ending screen shown to all participants

---

## 💡 Solutions Guide (For Admins/Judges)

### Round 1 Solutions
1. **Message 1:** `VNNBEBZ_XBGRV_TVRGZAGR`  
   - Cipher: ROT13  
   - Decoded: `UKKADAM_WATER_TREATMENT`

2. **Message 2:** `EBVNXGBXG_2026_EQKZO`  
   - Cipher: ROT13  
   - Decoded: `DARKWEAVE_2026_COIMB`

3. **Message 3:** `b1o2p3q4r5s6`  
   - Method: Simple character substitution (remove letters)  
   - Answer: `a1b2c3d4e5f6`

### Round 2 Solutions
1. **Password Hash:** `5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8`  
   - Type: SHA256  
   - Plaintext: `password`

2. **Master Key Token:** `U0NDQ19NQVNURVJfS0VZXzdGOEU5RDBB`  
   - Encoding: Base64  
   - Decoded: `SCCC_MASTER_KEY_7F8E9D0A`

3. **VPN Log:** `U0NDQ19WUE5fTk9ERV80Nw==`  
   - Encoding: Base64  
   - Decoded: `SCCC_VPN_NODE_47`

### Round 3 Solution
- **Flag:** `HTB{COIMBATORE_DARKWEAVE_DEACTIVATED_2026}`
- **Location:** Hidden in SCCC emergency override system (narrative element)
- **Format:** Standard HTB flag format

---

## 🔧 Troubleshooting

### Story Not Starting
- Verify backend is running
- Check JWT token in localStorage
- Ensure user is in a team

### Round Not Unlocking
- Verify previous round completion in database
- Check StoryProgress table
- Review backend logs for validation errors

### Three.js Performance Issues
- Reduce particle count in CyberBackground.tsx
- Disable fog effect
- Lower setPixelRatio value

### GSAP Animation Glitches
- Clear browser cache
- Verify GSAP installation
- Check console for timeline conflicts

---

## 📊 Metrics & Judging

### Automatic Tracking
- Round completion timestamps
- Submission attempts
- Winner declaration
- Team progression speed

### Judge View
- Real-time progress dashboard
- Story state overview
- Artifact validation logs

---

## 🎭 Participant Experience Goals

### Feel Like
✅ A real cyber incident response team  
✅ Under time pressure  
✅ Solving a connected story, not random puzzles  
✅ Part of something cinematic and memorable  

### NOT Feel Like
❌ Playing a generic CTF  
❌ Disconnected challenges  
❌ Childish or cringe narrative  
❌ Unfair or buggy system  

---

## 🏆 Success Criteria

- **Technical:** Zero runtime errors, smooth 60 FPS
- **Narrative:** Participants remember the story
- **Engagement:** 3+ hours of focused attention
- **Fairness:** Clear rules, validated progression
- **Impact:** "This felt real" feedback

---

## 📝 Future Enhancements

1. **Realtime Updates:** WebSocket notifications for Round 3 winner
2. **Audio:** Background music + sound effects
3. **Mobile Responsive:** Tablet-optimized layouts
4. **Replay System:** Save and replay story progression
5. **Analytics Dashboard:** Detailed team performance metrics
6. **Multiple Story Lines:** Different narratives per event

---

**Built for:** Coimbatore Hack-The-Box Event  
**Theme:** Local, believable, tech-thriller  
**Duration:** 3-4 hours  
**Target:** College-level cybersecurity enthusiasts  
**Outcome:** Memorable, immersive competition experience  

**🎯 Mission Status:** SYSTEM OPERATIONAL - Ready for deployment
