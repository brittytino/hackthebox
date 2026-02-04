# 🎯 HACK-THE-BOX: Complete Redesign Implementation Guide

## ✅ Step 1: Database Migration

```powershell
cd apps/backend
npx prisma migrate dev --name complete_redesign
npx prisma generate
npm run seed
```

## ✅ Step 2: Install Required Dependencies

### Backend:
```powershell
cd apps/backend
npm install nodemailer @types/nodemailer crypto-js @types/crypto-js
```

### Frontend:
```powershell
cd apps/frontend
npm install gsap @gsap/react three @react-three/fiber @react-three/drei framer-motion react-hot-toast axios zustand
```

## ✅ Step 3: Environment Variables

Create `apps/backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/hackthebox?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
PORT=3001
```

Create `apps/frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## ✅ Step 4: File Structure Created

### Backend Services Created:
- ✅ `src/auth/otp.service.ts` - OTP generation and verification
- ⏳ `src/teams/registration.service.ts` - Team registration
- ⏳ `src/challenges/challenge-validator.service.ts` - Answer validation
- ⏳ `src/scoreboard/live-scoreboard.service.ts` - Real-time scores

### Frontend Pages Created:
- ⏳ `app/page.tsx` - Hero section with GLB model
- ⏳ `app/register/page.tsx` - Email registration
- ⏳ `app/verify-otp/page.tsx` - OTP verification
- ⏳ `app/team-setup/page.tsx` - Team creation
- ⏳ `app/dashboard/page.tsx` - Main competition dashboard
- ⏳ `app/challenge/[level]/page.tsx` - Challenge view

### Components Created:
- ⏳ `components/Hero3D.tsx` - 3D character with GSAP
- ⏳ `components/ChallengeCard.tsx` - Interactive challenge UI
- ⏳ `components/Scoreboard.tsx` - Live leaderboard
- ⏳ `components/ProgressTracker.tsx` - Round progress
- ⏳ `components/StoryNarrative.tsx` - Story display

## ✅ Step 5: Testing Checklist

### Registration Flow:
- [ ] Email validation works
- [ ] OTP sent successfully
- [ ] OTP verification with 3 attempts
- [ ] Team creation with 2 members

### Challenge System:
- [ ] Linear progression (can't skip levels)
- [ ] Answer validation works correctly
- [ ] Points awarded properly
- [ ] Hints deduct points
- [ ] Time tracking accurate

### UI/UX:
- [ ] Dark theme throughout
- [ ] GSAP animations smooth
- [ ] 3D models load properly
- [ ] Responsive on all devices
- [ ] Real-time scoreboard updates

## 🚀 Next Steps

I've created the foundation. Now we need to:

1. **Run the database migration** to update the schema
2. **Create the remaining backend services** for challenge validation
3. **Build the frontend pages** with dark theme and animations
4. **Add 3D GLB models** to the hero section
5. **Implement GSAP animations** for smooth interactions
6. **Test the entire flow** end-to-end

Would you like me to:
A) Continue creating the backend services?
B) Start building the frontend with dark theme + GSAP?
C) Focus on the 3D hero section first?
D) All of the above systematically?

## 📝 Notes

- Schema updated with OTP, Team (2 members), 9 Challenges
- OTP service created with email sending
- Storyline integrated into challenge narratives
- Anti-cheating: Level 2.3 has team-specific answers
- First team to complete Level 3.3 wins double points

## 🎨 Design Theme

**Colors:**
- Primary Background: `#000000` (pure black)
- Secondary Background: `#0a0a0a`
- Accent Green: `#00ff41` (cyber green)
- Text Primary: `#ffffff`
- Text Secondary: `#cccccc`
- Danger Red: `#ff0040`
- Warning Orange: `#ffaa00`

**Typography:**
- Headings: `'Orbitron', sans-serif` (cyber style)
- Body: `'Inter', sans-serif`
- Code: `'Fira Code', monospace`

**Animations:**
- GSAP for smooth transitions
- Three.js for 3D models
- Framer Motion for micro-interactions
