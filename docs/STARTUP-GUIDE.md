# 🚀 STARTUP GUIDE - Production Ready Commands

All commands to get Operation Cipher Strike running on localhost network.

## 📋 Prerequisites Checklist

- [ ] Docker Desktop installed and running
- [ ] Git installed
- [ ] Text editor (VS Code, Notepad++, etc.)
- [ ] Gmail account with App Password (for OTP emails)

## ⚡ One-Line Quick Start

### Windows
```powershell
.\start.bat
```

### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

This will automatically:
1. Check Docker status
2. Create `.env` from template
3. Start all services
4. Run migrations
5. Seed admin user
6. Open browser to http://localhost:3000

---

## 🔧 Manual Setup (Step-by-Step)

### 1. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
notepad .env  # Windows
nano .env     # Linux/Mac
```

**Required changes in `.env`:**
```env
# Strong passwords
POSTGRES_PASSWORD=your_secure_postgres_password_here
REDIS_PASSWORD=your_secure_redis_password_here

# JWT Secret (generate 32+ random characters)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Email configuration (required for OTP)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

### 2. Start Services

```bash
# Start all containers in detached mode
docker-compose up -d

# View live logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. Initialize Database

```bash
# Run database migrations
docker-compose exec backend npm run prisma:migrate:deploy

# Seed database (creates admin user)
docker-compose exec backend npm run prisma:seed
```

Output will show:
```
✅ Admin user created: admin
   📧 Email: admin@hackthebox.local
   🔑 Password: admin123
```

### 4. Verify Services

```bash
# Check all containers are running
docker-compose ps

# Test backend health
curl http://localhost:3001/health

# Test frontend (should return HTML)
curl http://localhost:3000
```

Expected output:
```
NAME                      STATUS          PORTS
hackthebox_backend        Up 30 seconds   0.0.0.0:3001->3001/tcp
hackthebox_frontend       Up 30 seconds   0.0.0.0:3000->3000/tcp
hackthebox_postgres       Up 30 seconds   0.0.0.0:5433->5432/tcp
hackthebox_redis          Up 30 seconds   0.0.0.0:6380->6379/tcp
```

### 5. Access Platform

- **Frontend UI:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Admin Panel:** http://localhost:3000/admin

**Login as Admin:**
- Email: `admin@hackthebox.local`
- Password: `admin123`

---

## 🌐 Network Access (Access from Other Devices)

### Find Your IP Address

**Windows (PowerShell):**
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"} | Select-Object IPAddress
```

**Linux:**
```bash
hostname -I | awk '{print $1}'
```

**Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'
```

Example output: `192.168.1.100`

### Update Frontend Configuration

Edit `apps/frontend/.env`:
```env
# Replace localhost with your IP
NEXT_PUBLIC_API_URL=http://192.168.1.100:3001
```

Restart frontend:
```bash
docker-compose restart frontend
```

### Access from Other Devices

Users on same network can now access:
- **Frontend:** `http://192.168.1.100:3000`
- **Backend:** `http://192.168.1.100:3001`

---

## 📦 Docker Commands Reference

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v

# Restart specific service
docker-compose restart backend

# Restart all services
docker-compose restart
```

### View Logs

```bash
# All services (live tail)
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres

# Last 50 lines
docker-compose logs --tail=50 backend

# Since specific time
docker-compose logs --since 10m backend
```

### Container Management

```bash
# List running containers
docker-compose ps

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec postgres psql -U postgres -d hackthebox

# View container stats
docker stats
```

### Rebuild After Code Changes

```bash
# Rebuild specific service
docker-compose up -d --build backend

# Rebuild all services
docker-compose up -d --build

# Force clean rebuild (removes cache)
docker-compose build --no-cache
docker-compose up -d
```

---

## 🗄️ Database Commands

### Migrations

```bash
# Run pending migrations
docker-compose exec backend npm run prisma:migrate:deploy

# Create new migration
docker-compose exec backend npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
docker-compose exec backend npm run prisma:migrate:reset

# View migration status
docker-compose exec backend npx prisma migrate status
```

### Prisma Studio (Database GUI)

```bash
# Open Prisma Studio
docker-compose exec backend npx prisma studio

# Access at: http://localhost:5555
```

### Database Backup/Restore

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres hackthebox > backup_$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T postgres psql -U postgres hackthebox < backup_20260211.sql

# Export specific table
docker-compose exec postgres pg_dump -U postgres -t teams hackthebox > teams_backup.sql
```

### Direct Database Access

```bash
# PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d hackthebox

# Common SQL commands:
# \dt           - List tables
# \d+ users     - Describe users table
# \q            - Quit
# SELECT * FROM users LIMIT 5;
```

---

## 🔧 Troubleshooting Commands

### Port Already in Use

**Find process using port (Windows):**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

**Find process using port (Linux/Mac):**
```bash
lsof -ti:3000 | xargs kill -9
```

**Or change port in `.env`:**
```env
BACKEND_PORT=4000
NEXTJS_PORT=3001
```

### Clear Docker Cache

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes (WARNING: deletes data)
docker volume prune

# Nuclear option - clean everything
docker system prune -a --volumes
```

### Database Connection Errors

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check database connection string
docker-compose exec backend sh -c 'echo $DATABASE_URL'
```

### Frontend Can't Connect to Backend

```bash
# Test backend from within frontend container
docker-compose exec frontend curl backend:3001/health

# Test from host machine
curl http://localhost:3001/health

# Check environment variables
docker-compose exec frontend sh -c 'echo $NEXT_PUBLIC_API_URL'
```

### Email OTP Not Working

```bash
# View backend logs for email errors
docker-compose logs backend | grep -i smtp

# Test SMTP connection from backend
docker-compose exec backend node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
transporter.verify().then(console.log).catch(console.error);
"
```

---

## 🧪 Testing Platform

### 1. Test Admin Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hackthebox.local","password":"admin123"}'
```

Should return JWT token.

### 2. Test Team Registration Flow

1. Go to http://localhost:3000
2. Click "Register"
3. Enter your email
4. Check email for OTP code
5. Enter OTP and create team
6. Verify team appears in admin panel

### 3. Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Database connection
docker-compose exec backend npm run prisma:studio

# Redis connection
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping
# Should return: PONG
```

---

## 🔄 Common Workflows

### Full Reset (Clean Start)

```bash
# Stop and remove everything
docker-compose down -v

# Remove all images (optional)
docker-compose rm -f

# Start fresh
docker-compose up -d

# Reinitialize
docker-compose exec backend npm run prisma:migrate:deploy
docker-compose exec backend npm run prisma:seed
```

### Update After Code Changes

```bash
# Backend changes
docker-compose up -d --build backend

# Frontend changes  
docker-compose up -d --build frontend

# Database schema changes
docker-compose exec backend npm run prisma:migrate:dev
```

### View Real-Time Activity

```bash
# Terminal 1: Backend logs
docker-compose logs -f backend

# Terminal 2: Frontend logs
docker-compose logs -f frontend

# Terminal 3: Database queries
docker-compose exec postgres psql -U postgres hackthebox -c "SELECT * FROM pg_stat_activity;"
```

---

## 📊 Production Deployment Checklist

Before deploying to production:

- [ ] Change all default passwords in `.env`
- [ ] Set `JWT_SECRET` to 32+ random characters
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper SMTP credentials
- [ ] Enable HTTPS (use nginx/Caddy reverse proxy)
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Enable rate limiting (verify Redis is configured)
- [ ] Set up monitoring (Sentry, New Relic, etc.)
- [ ] Test email delivery
- [ ] Review CORS settings
- [ ] Set up automated backups
- [ ] Document disaster recovery procedure

---

## 📞 Quick Help

### Something Not Working?

1. **Check logs:** `docker-compose logs [service]`
2. **Restart service:** `docker-compose restart [service]`
3. **Check status:** `docker-compose ps`
4. **View errors:** `docker-compose logs --tail=100 [service]`
5. **Full reset:** `docker-compose down -v && docker-compose up -d`

### Need to Stop Everything?

```bash
docker-compose down
```

### Need to Start Again?

```bash
docker-compose up -d
```

---

## 🎯 Quick Reference Card

| Task | Command |
|------|---------|
| Start all | `docker-compose up -d` |
| Stop all | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Restart service | `docker-compose restart backend` |
| Rebuild | `docker-compose up -d --build` |
| Database shell | `docker-compose exec postgres psql -U postgres hackthebox` |
| Backend shell | `docker-compose exec backend sh` |
| Prisma Studio | `docker-compose exec backend npx prisma studio` |
| Check status | `docker-compose ps` |
| View logs (last 50) | `docker-compose logs --tail=50 backend` |

**Default URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Admin: http://localhost:3000/admin

**Default Credentials:**
- Admin Email: `admin@hackthebox.local`
- Admin Password: `admin123`

---

**Everything ready! Start hacking! 🎉**
