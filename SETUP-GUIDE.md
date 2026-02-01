# 🚀 Quick Setup Guide - Operation DARKWEAVE

## Prerequisites
- Node.js 18+ installed
- Docker & Docker Compose installed
- Git installed
- PostgreSQL (via Docker)

---

## Step-by-Step Setup

### 1️⃣ Clone & Install

```bash
# Navigate to project
cd d:\College\hackthebox

# Install backend dependencies
cd apps/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2️⃣ Configure Environment

**Backend** (`apps/backend/.env`):
```env
DATABASE_URL="postgresql://hackthebox:securepass123@localhost:5432/hackthebox"
JWT_SECRET="your-super-secure-jwt-secret-change-this"
PORT=3001
NODE_ENV=development
```

**Frontend** (`apps/frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 3️⃣ Start Database

```bash
# From project root
docker-compose up -d postgres
```

Verify it's running:
```bash
docker ps
```

### 4️⃣ Run Database Migrations

```bash
cd apps/backend
npx prisma migrate dev --name init-story-system
npx prisma generate
```

### 5️⃣ (Optional) Seed Database

```bash
cd apps/backend
npx prisma db seed
```

This creates:
- Admin user (email: admin@hackthebox.local, password: admin123)
- Sample teams
- Story-driven rounds

### 6️⃣ Start Backend

```bash
cd apps/backend
npm run dev
```

You should see:
```
[Nest] INFO [NestApplication] Nest application successfully started
Application is running on: http://localhost:3001
```

### 7️⃣ Start Frontend

```bash
cd apps/frontend
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000
```

---

## 🎯 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Create account |
| Backend API | http://localhost:3001 | N/A |
| Admin Panel | http://localhost:3000/admin | admin@hackthebox.local / admin123 |
| API Docs | http://localhost:3001/api | N/A |

---

## 🧪 Testing the Story Flow

### 1. Create Admin Account (if not seeded)
```bash
# Register via frontend or use seeded admin
Email: admin@hackthebox.local
Password: admin123
```

### 2. Create Test Team
1. Login as regular user
2. Go to Dashboard
3. Create team: "Test Team Alpha"

### 3. Start Story (Admin)
1. Login as admin
2. Navigate to Admin Panel
3. Click **Story Control** tab
4. Click **🚀 Start Story**

### 4. Test Round 1
1. Login as team member
2. Go to Challenges page
3. Watch story intro (or skip)
4. Solve Round 1:
   - System Target: `UKKADAM_WATER_TREATMENT`
   - Darkweave Code: `DARKWEAVE_2026_COIMB`
   - Credential Hash: `a1b2c3d4e5f6`

### 5. Test Round 2
After Round 1 completion:
- Master Key: `SCCC_MASTER_KEY_7F8E9D0A`
- Backdoor Location: `SCCC_VPN_NODE_47`

### 6. Test Round 3
After Round 2 completion:
- Flag: `HTB{COIMBATORE_DARKWEAVE_DEACTIVATED_2026}`

---

## 🐛 Common Issues

### "Cannot connect to database"
```bash
# Check Docker container
docker ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### "Port 3000 already in use"
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in package.json
```

### "Module not found" errors
```bash
# Clear node_modules and reinstall
cd apps/frontend
rm -rf node_modules package-lock.json
npm install

# Same for backend
cd ../backend
rm -rf node_modules package-lock.json
npm install
```

### Three.js rendering issues
- Update graphics drivers
- Try different browser (Chrome recommended)
- Reduce particle count in `CyberBackground.tsx`

### GSAP animations not playing
```bash
# Verify GSAP installation
npm list gsap

# Reinstall if needed
npm install gsap --save
```

---

## 📊 Admin Dashboard Preview

### Story Control Panel
- View real-time team progress
- Start/end story
- Monitor round completions
- See winner declaration

### Team Management
- View all teams
- Check member lists
- Monitor submissions

---

## 🔒 Security Notes

### For Production Deployment

1. **Change default credentials**
   ```env
   JWT_SECRET="<generate-random-256-bit-key>"
   ```

2. **Use strong database password**
   ```env
   DATABASE_URL="postgresql://user:<strong-password>@host:5432/db"
   ```

3. **Enable CORS restrictions**
   ```typescript
   // apps/backend/src/main.ts
   app.enableCors({
     origin: ['http://your-domain.com'],
     credentials: true,
   });
   ```

4. **Use HTTPS**
   - Configure reverse proxy (nginx)
   - Obtain SSL certificate (Let's Encrypt)

---

## 🎮 Event Day Checklist

### Pre-Event (1 hour before)
- [ ] Verify all services running
- [ ] Test database connectivity
- [ ] Create participant accounts
- [ ] Reset story progress
- [ ] Test admin controls
- [ ] Verify network connectivity
- [ ] Test story intro playback
- [ ] Check browser compatibility

### Event Start
- [ ] Admin starts story
- [ ] Monitor first team login
- [ ] Watch Round 1 completion
- [ ] Verify round gating works

### During Event
- [ ] Monitor team progress
- [ ] Watch for errors
- [ ] Be ready to manually end story
- [ ] Track winner submission

### Post-Event
- [ ] Trigger story ending
- [ ] Export scoreboard
- [ ] Backup database
- [ ] Collect feedback

---

## 📈 Performance Optimization

### Frontend
```bash
# Build for production
cd apps/frontend
npm run build
npm start
```

### Backend
```bash
# Build for production
cd apps/backend
npm run build
npm run start:prod
```

### Database
```sql
-- Add indexes for faster queries
CREATE INDEX idx_story_progress_team ON "StoryProgress"("teamId");
CREATE INDEX idx_story_progress_round ON "StoryProgress"("currentRound");
```

---

## 🆘 Emergency Contacts

### Critical Issues
1. Stop all services: `docker-compose down`
2. Backup database: `docker exec -t postgres pg_dump -U hackthebox hackthebox > backup.sql`
3. Review logs: `docker-compose logs --tail=100`

### Recovery
```bash
# Restore from backup
docker exec -i postgres psql -U hackthebox hackthebox < backup.sql

# Reset story only (keeps users/teams)
# Admin Panel → Story Control → Reset Story
```

---

## ✅ Verification Commands

```bash
# Check services
docker-compose ps

# Test backend
curl http://localhost:3001/health

# Test database connection
docker exec -it postgres psql -U hackthebox -d hackthebox -c "SELECT NOW();"

# View story state
curl http://localhost:3001/story/state
```

---

## 🎯 Success Indicators

✅ Story intro plays smoothly  
✅ Three.js background renders at 60 FPS  
✅ Round gating prevents skipping  
✅ First team to complete Round 3 becomes winner  
✅ Story ending screen displays correctly  
✅ Admin panel shows real-time progress  

---

**Setup Time:** ~15 minutes  
**First Test Run:** ~5 minutes  
**Production Ready:** After thorough testing  

**Need Help?** Check `STORY-GUIDE.md` for detailed documentation.

🎬 **Ready to deploy Operation DARKWEAVE!**
