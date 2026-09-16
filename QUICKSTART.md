# 🚀 QUICKSTART GUIDE

## One-Command Setup (Windows)

Just run:
```cmd
start.bat
```

That's it! The script will handle everything.

## What Happens Automatically

1. ✅ **Docker Check** - Verifies Docker Desktop is running
2. 📝 **Environment Setup** - Creates `.env` if needed (opens for editing)
3. 🐳 **Image Pull** - Downloads PostgreSQL and Redis images
4. 🏗️ **Container Build** - Builds backend and frontend containers
5. 🗄️ **Database Init** - Runs migrations automatically
6. 🌱 **Data Seeding** - Creates admin user and challenge data
7. 🌐 **Browser Launch** - Opens http://localhost:43117

**Total time:** ~2-3 minutes on first run

## Quick Access

Once running:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend (Local)** | http://localhost:43117 | Main CTF application |
| **Frontend (Campus LAN)** | http://<SERVER_IP>:43117 | Link for student participants |
| **Admin Ops Center** | http://localhost:43117/admin | Tactical Game Controller |
| **Marvel Ending Screen** | http://localhost:43117/credits | Post-credits tribute & winners |
| **Live Scoreboard** | http://localhost:43117/leaderboard | Real-time standings |
| **pgAdmin GUI** | http://localhost:45050 | Database admin |
| **Backend REST API** | http://localhost:43118 | Direct API access |

## 🔑 Login Credentials

### Admin Control Panel
```
URL:      http://localhost:43117/admin
Username: admin   (or email: admin@theextraction.local)
Password: admin123
```

### pgAdmin Database GUI
```
URL:      http://localhost:45050
Email:    admin@theextraction.com
Password: Tx7-vQ2m-Pk9r-Zw4e-Jh6c
```

## 🎮 Event Admin Features
- **Tactical Game Controller** (`/admin`):
  - **END GAME FOR ALL**: Instantly pushes an emergency broadcast modal to all student devices and transitions everyone to the cinematic Marvel credits.
  - **ACTIVATE ALL ROUNDS**: Ensures Rounds 1, 2, and 3 are active.
  - **RESUME LIVE GAME**: Allows reopening the competition if needed.
- **Marvel Movie Post-Credits Screen** (`/credits`):
  - Starfield / ember animations and ambient audio synthesizer.
  - Winner squad commendation & top solve roll.
  - Coordinator photo cards for **Tino Britty** & **Srinithi** (`apps/frontend/public/images/coordinators/`).
  - Stinger teaser: *"VEERA RAGHAVAN WILL RETURN"*.

### View logs
```bash
docker-compose logs -f
```

### Stop everything
```bash
docker-compose down
```

### Restart after code changes
```bash
docker-compose up -d --build
```

### Fresh database (clean slate)
```bash
docker-compose down -v
start.bat
```

## Troubleshooting 101

### ❌ "Docker is not running"
→ Start Docker Desktop, wait for icon to turn green

### ❌ Build fails
→ Run: `docker system prune -a` then `start.bat` again

### ❌ Port already in use
→ Stop other apps using ports 43117, 43118, 45432, 46379

### ❌ Can't connect to backend
→ Wait 30 seconds after startup, check: `docker-compose logs backend`

## Need Help?

See [README.md](README.md) for full documentation.

---

**Ready?** Just double-click `start.bat` and go! 🎯
