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
| **Frontend** | http://localhost:43117 | Main application UI |
| **Backend** | http://localhost:43118 | REST API |
| **Database** | localhost:45432 | PostgreSQL (user: postgres) |
| **Redis** | localhost:46379 | Cache store |

## Login

Default admin credentials (change after login!):
```
Email:    admin@hackthebox.local
Password: admin123
```

## Common Tasks

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
