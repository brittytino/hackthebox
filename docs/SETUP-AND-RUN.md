# 🚀 COMPLETE SETUP & RUN GUIDE
## Operation Cipher Strike - Production Ready

---

## 🎯 QUICKEST START (Docker - Recommended)

### Prerequisites
- Docker & Docker Compose installed
- SMTP credentials (Gmail recommended)

### Steps

```bash
# 1. Navigate to project
cd d:\25mx354\Others\hackthebox

# 2. Setup environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# 3. Edit apps/backend/.env - ADD YOUR SMTP CREDENTIALS!
# SMTP_USER="your-email@gmail.com"
# SMTP_PASS="your-app-password"

# 4. Start everything
docker-compose up -d --build

# 5. Setup database
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed

# 6. Access the platform
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
```

**DONE! ✅ Platform is ready!**

---

## 📧 SMTP SETUP (REQUIRED for OTP emails)

### Gmail Setup (Easiest):
1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication
3. Go to https://myaccount.google.com/apppasswords
4. Generate an "App Password" for "Mail"
5. Copy the 16-character password
6. Add to `apps/backend/.env`:
```env
SMTP_USER="your-email@gmail.com"
SMTP_PASS="xxxx xxxx xxxx xxxx"  # The app password
```

### Alternative: Mailtrap (Testing)
- Sign up at mailtrap.io
- Use their SMTP credentials (no real emails sent)

---

## 🧪 TEST THE FULL FLOW

### 1. Registration
- Visit http://localhost:3000
- Click "JOIN THE OPERATION"
- Enter email → Receive OTP
- Verify OTP → Create team

### 2. Solve First Challenge
```
Challenge 1.1: The Intercepted Message
Decode: VkVILUhDRVQtRUJDLU5FVEtSQUQtNjIwMi10Y2VqX3JQ
Steps: Base64 → ROT13 → Reverse
Answer: HTB{DARKNET_2026_COR}
```

### 3. View Progress
- Leaderboard updates in real-time
- Activity feed shows all team actions
- Story context appears with each challenge

---

## 🛠️ LOCAL DEVELOPMENT (Alternative to Docker)

### Backend
```bash
cd apps\backend
npm install
cp .env.example .env
# Configure SMTP in .env

npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev  # Runs on port 4000
```

### Frontend
```bash
cd apps\frontend
npm install
cp .env.example .env.local
# Set: NEXT_PUBLIC_API_URL=http://localhost:4000

npm run dev  # Runs on port 3000
```

### Database (Docker)
```bash
docker run --name htb-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hackthebox -p 5432:5432 -d postgres:15
```

---

## 📊 WHAT'S INCLUDED

### ✅ Backend (NestJS)
-  OTP-based email registration
- ✅ JWT authentication
- ✅ Linear challenge progression
- ✅ Real-time leaderboard
- ✅ Activity feed
- ✅ Story progress tracking

### ✅ Frontend (Next.js)
- ✅ Beast-inspired landing page
- ✅ 3-step registration (Email → OTP → Team)
- ✅ Challenge dashboard with story integration
- ✅ Leaderboard & activity feed
- ✅ Responsive cyber-themed UI

### ✅ Database (PostgreSQL + Prisma)
- ✅ 9 Challenges with story context
- ✅ 3 Rounds (linear progression)
- ✅ User, Team, Submission, Score models
- ✅ OTP logs & rate limiting
- ✅ Activity tracking

---

## 🎮 ALL 9 CHALLENGES (Test Answers)

| Level | Challenge | Answer |
|-------|-----------|--------|
| 1.1 | The Intercepted Message | `HTB{DARKNET_2026_COR}` |
| 1.2 | The Fragmented Map | `HTB{SERV-ER-42-FINAL-LAB}` |
| 1.3 | The Time-Locked Vault | `HTB{024A4F93}` |
| 2.1 | The Corrupted Hash Trail | `HTB{WHIONEPAS42}` |
| 2.2 | The JWT Inception | `HTB{6202_SSECCA_TENKRAD}` |
| 2.3 | The Pattern Lock | `HTB{a3f7b891}` (team-specific) |
| 3.1 | The Payload Hunt | `HTB{BLACK_OUT_CODE_TWENTYTWO}` |
| 3.2 | The Time Bomb Defusal | `HTB{DEFUSED}` |
| 3.3 | The Master Vault | `HTB{OPERATION_BLACKOUT_TERMINATED}` |

---

## 🐛 TROUBLESHOOTING

### Backend won't start
```bash
# Check database
docker ps
docker-compose logs db

# Regenerate Prisma
cd apps\backend
npm run prisma:generate
```

### OTP emails not sending
```bash
# Check logs
docker-compose logs backend | findstr "OTP"

# Verify SMTP config in apps/backend/.env
# Test with real Gmail + App Password
```

### Frontend can't connect
```bash
# Verify in apps/frontend/.env.local:
# NEXT_PUBLIC_API_URL=http://localhost:4000

# Test backend health:
curl http://localhost:4000/health
```

### Database errors
```bash
# Full reset
docker-compose down -v
docker-compose up -d --build
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed
```

---

## 📁 PROJECT STRUCTURE

```
hackthebox/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   ├── auth/     # OTP registration
│   │   │   ├── challenges/
│   │   │   ├── email/    # SMTP service
│   │   │   └── ...
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── seed.ts   # All 9 challenges
│   └── frontend/         # Next.js app
│       └── app/
│           ├── page.tsx       # Landing
│           ├── register/      # OTP flow
│           └── dashboard/     # Main app
├── docs/                 # Story documentation
└── docker-compose.yml
```

---

## ⚙️ CONFIGURATION

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/hackthebox"
JWT_SECRET="change-this-secret"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_HOST="smtp.gmail.com"
PORT=4000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 🚀 DEPLOY TO PRODUCTION

### Security Checklist:
- [ ] Change JWT_SECRET to strong random value
- [ ] Use production SMTP service (SendGrid/AWS SES)
- [ ] Enable HTTPS
- [ ] Configure proper CORS
- [ ] Set up environment-specific databases
- [ ] Enable rate limiting
- [ ] Set up monitoring/logging

### Docker Production:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 📞 NEED HELP?

- **Full Story:** `COMPLETE-REDESIGN-PLAN.md`
- **Implementation Guide:** `docs/implementation/INTEGRATION-GUIDE.md`
- **Story Content:** `docs/story/BEAST-STORY-NARRATIVE.md`

---

## ✅ SUCCESS CRITERIA

Platform is working when you can:
1. ✅ Visit landing page with countdown timer
2. ✅ Register with email → Receive OTP → Create team
3. ✅ Login and see first challenge with story context
4. ✅ Submit correct flag and advance to next level
5. ✅ View leaderboard and activity feed updating
6. ✅ Complete all 9 challenges with story progression

---

**Platform Status:** ✅ FULLY FUNCTIONAL
**Ready Date:** February 11, 2026  
**Mission:** Operation Cipher Strike
**Goal:** Save Coimbatore. Stop Operation BLACKOUT.

🎯 **START NOW:** http://localhost:3000
