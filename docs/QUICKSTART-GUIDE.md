# 🚀 OPERATION CIPHER STRIKE - QUICK START

## ✅ Prerequisites

Before starting, ensure you have:
- **Windows 10/11** (with Admin rights)
- **Docker Desktop** installed and running
- **Node.js 18+** installed
- **Git** installed (optional, but recommended)

---

## 🎯 ONE-COMMAND SETUP (Windows)

### Step 1: Run as Administrator

Right-click `SETUP-COMPLETE.bat` and select **"Run as administrator"**

That's it! The script will:
- ✅ Fix PowerShell execution policy
- ✅ Install all dependencies
- ✅ Start Docker containers
- ✅ Run database migrations
- ✅ Seed all 9 challenges
- ✅ Configure environment files

---

## 📝 Manual Setup (If Script Fails)

### 1. Fix PowerShell Execution Policy

```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

### 2. Create Environment Files

**Root `.env`:**
```env
POSTGRES_USER=hackthebox
POSTGRES_PASSWORD=hackthebox123
POSTGRES_DB=hackthebox
REDIS_PASSWORD=redis123
```

**Backend `apps/backend/.env`:**
```env
DATABASE_URL=postgresql://hackthebox:hackthebox123@localhost:5432/hackthebox
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRATION=7d

# SMTP Settings (REQUIRED for OTP emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Operation Cipher Strike <your-email@gmail.com>"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123
```

**Frontend `apps/frontend/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Install Dependencies

```cmd
cd apps/backend
npm install
cd ../frontend
npm install
cd ../..
```

### 4. Start Docker Services

```cmd
docker-compose up -d --build
```

Wait 15 seconds for database initialization.

### 5. Run Migrations

```cmd
cd apps/backend
npm run prisma:migrate
npm run prisma:generate
```

### 6. Seed Database

```cmd
npm run prisma:seed
```

---

## 🔐 SMTP Configuration (CRITICAL!)

The OTP registration flow **requires working SMTP**. Without it, users cannot register.

### Option 1: Gmail (Recommended for Testing)

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to: https://myaccount.google.com/security
   - Select "2-Step Verification"
   - Scroll down to "App passwords"
   - Create password for "Mail"
3. Update `apps/backend/.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-digit-app-password
   SMTP_FROM="Operation Cipher Strike <your-email@gmail.com>"
   ```

### Option 2: SendGrid (For Production)

1. Sign up at: https://sendgrid.com
2. Create API key
3. Update `.env`:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   SMTP_FROM="Operation Cipher Strike <verified-sender@yourdomain.com>"
   ```

---

## 🎮 TESTING THE PLATFORM

### Test Registration Flow

1. Go to http://localhost:3000
2. Click "Register Team"
3. Enter your email → receive OTP
4. Enter OTP → verify
5. Create team (name + 2 members)
6. Login and access challenges

### Test Challenge Solving

Use these flags to test (all 9 challenges seeded):

```
Level 1.1: CTF{b4s3_r0t_r3v3rs3}
Level 1.2: CTF{c0mb1n3d_k3y_42}
Level 1.3: CTF{t1m3_l0ck_0p3n}
Level 2.1: CTF{p4ss42_cr4ck3d}
Level 2.2: CTF{jwt42_d3c0d3d}
Level 2.3: CTF{t34m_h4sh_p4tt3rn}
Level 3.1: CTF{p4yl04d_d3c0d3d}
Level 3.2: CTF{l0g1c_b0mb_d3fus3d}
Level 3.3: CTF{m4st3r_v4ult_cr4ck3d}
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Scripts are disabled"

**Fix:** Run PowerShell as Admin:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

### Issue: "Docker is not running"

**Fix:** 
1. Open Docker Desktop
2. Wait for it to fully start (whale icon in system tray)
3. Run setup again

### Issue: "OTP emails not sending"

**Fix:**
1. Check `apps/backend/.env` SMTP settings
2. Verify Gmail App Password is correct
3. Check backend logs: `docker-compose logs backend`

### Issue: "Database connection failed"

**Fix:**
```cmd
docker-compose down
docker-compose up -d
timeout /t 15
cd apps/backend
npm run prisma:migrate
```

### Issue: "Frontend shows connection error"

**Fix:** Check `apps/frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Issue: "Port already in use"

**Fix:** Stop conflicting services:
```cmd
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432

taskkill /PID <process-id> /F
```

---

## 📂 PROJECT STRUCTURE

```
hackthebox/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── prisma/       # Database schema & seeds
│   │   └── src/          # Backend code
│   └── frontend/         # Next.js 14 App
│       ├── app/          # Pages
│       ├── components/   # React components
│       │   └── story/    # Character dialogue system
│       └── public/
│           └── images/
│               └── characters/  # All character images
├── docs/                 # Documentation
├── docker-compose.yml    # Container orchestration
└── SETUP-COMPLETE.bat    # One-command setup
```

---

## 🎬 CHARACTER IMAGES

All character images are in: `apps/frontend/public/images/characters/`

Available characters:
- **Veera**: neutral, intense, determined, concerned, relieved
- **Vikram**: neutral, serious, urgent
- **Althaf**: neutral, commanding, concerned
- **Preethi**: worried, hopeful
- **Umar**: threatening, angry

---

## 🚀 DAILY STARTUP

After initial setup, start the platform with:

```cmd
docker-compose up -d
```

Stop with:

```cmd
docker-compose down
```

---

## 🏆 COMPETITION DAY CHECKLIST

### Before Event

- [ ] SMTP configured and tested
- [ ] All services running (`docker-compose up -d`)
- [ ] Test registration flow
- [ ] Test solving one challenge
- [ ] Backup database
- [ ] Monitor system resources

### During Event

- [ ] Monitor `docker-compose logs -f`
- [ ] Check `/scoreboard` for live updates
- [ ] Watch activity feed for stuck teams
- [ ] Have backup SMTP ready

---

## 📞 SUPPORT

### View Logs

```cmd
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Database only
docker-compose logs -f postgres
```

### Access Database

```cmd
docker exec -it hackthebox-postgres psql -U hackthebox -d hackthebox
```

### Restart Services

```cmd
docker-compose restart backend
docker-compose restart frontend
```

---

## 🌟 FEATURES

✅ **Character-Driven Story**: 5 characters with multiple expressions  
✅ **Visual Dialogue System**: Animated character dialogues with story context  
✅ **Modern UI**: Cyber-themed design with animations  
✅ **OTP Registration**: Email-based verification system  
✅ **Linear Progression**: Solve challenges in order  
✅ **Real-time Leaderboard**: Live score updates  
✅ **Activity Feed**: See what other teams are solving  
✅ **Story Integration**: Every challenge moves the narrative forward  

---

**🎯 Ready to start Operation Cipher Strike!**

Run `SETUP-COMPLETE.bat` as Administrator and let the mission begin! 🚀
