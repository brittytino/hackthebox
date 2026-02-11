# 🚀 Getting Started - Operation Cipher Strike CTF Platform

Complete guide to run the CTF platform locally on your network.

## 📋 Prerequisites

Before starting, ensure you have:

- **Docker Desktop** (with Docker Compose)
- **Node.js** 18+ and npm (for local development)
- **Git** for version control
- **PostgreSQL** client tools (optional, for database inspection)

## ⚡ Quick Start with Docker (Recommended)

### 1. Clone and Setup Environment

```bash
# Clone the repository
git clone <repository-url>
cd hackthebox

# Copy environment file
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` and update these critical values:

```env
# Database
POSTGRES_PASSWORD=your_secure_password_here

# Redis
REDIS_PASSWORD=your_secure_redis_password_here

# JWT
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Email (Required for OTP login)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

**📧 Gmail Setup for SMTP:**
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password: https://myaccount.google.com/apppasswords
4. Use that 16-character password for `SMTP_PASS`

### 3. Start All Services

```bash
# Build and start all containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Initialize Database

```bash
# Run database migrations
docker-compose exec backend npm run prisma:migrate

# Seed the database (creates admin user)
docker-compose exec backend npm run prisma:seed
```

**🔑 Default Admin Credentials:**
- **Email:** `admin@hackthebox.local`
- **Password:** `admin123`

### 5. Access the Platform

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Docs:** http://localhost:3001/api (if Swagger enabled)
- **Database:** localhost:5433 (PostgreSQL)
- **Redis:** localhost:6380

## 🛠️ Local Development (Without Docker)

### 1. Setup Backend

```bash
cd apps/backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your local database URL

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start development server
npm run start:dev
```

Backend runs on: http://localhost:3001

### 2. Setup Frontend

```bash
cd apps/frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm run dev
```

Frontend runs on: http://localhost:3000

### 3. Start PostgreSQL and Redis Locally

**Option A: Using Docker for databases only**
```bash
# In root directory
docker-compose up -d postgres redis
```

**Option B: Native installations**
- PostgreSQL: Default port 5432
- Redis: Default port 6379

Update your backend `.env` accordingly:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hackthebox?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🌐 Network Access Configuration

### Access from Other Devices on Local Network

**1. Find your machine's local IP:**

Windows (PowerShell):
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}
```

Linux/Mac:
```bash
hostname -I | awk '{print $1}'
```

**2. Update Frontend Environment:**

Edit `apps/frontend/.env`:
```env
NEXT_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3001
```

**3. Update Backend CORS:**

Backend automatically allows frontend URL from environment.

**4. Access from network devices:**
- Frontend: `http://YOUR_LOCAL_IP:3000`
- Backend: `http://YOUR_LOCAL_IP:3001`

## 📦 Docker Commands Cheat Sheet

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart backend

# Rebuild after code changes
docker-compose up -d --build

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh

# Run database migrations
docker-compose exec backend npm run prisma:migrate

# Reset database (WARNING: Deletes all data)
docker-compose exec backend npm run prisma:migrate:reset

# View database with Prisma Studio
docker-compose exec backend npx prisma studio
```

## 🔧 Common Issues & Fixes

### Port Already in Use

If ports 3000, 3001, or 5433 are already in use:

1. Find and kill the process:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

2. Or change ports in `.env`:
```env
BACKEND_PORT=4000
NEXTJS_PORT=3001
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Frontend Can't Connect to Backend

1. Check backend is running: `curl http://localhost:3001/health`
2. Verify `NEXT_PUBLIC_API_URL` in frontend `.env`
3. Check browser console for CORS errors
4. Ensure backend CORS is configured for frontend URL

### Email OTP Not Working

1. Verify SMTP credentials in `.env`
2. For Gmail: Ensure App Password is used (not regular password)
3. Check backend logs: `docker-compose logs backend`
4. Test SMTP connection manually

### Docker Build Fails

```bash
# Clean Docker cache
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

## 🧪 Testing the Platform

### 1. Register a Team

1. Go to http://localhost:3000
2. Click "Register"
3. Enter email
4. Check email for OTP code
5. Create team with 2 member names

### 2. Login as Admin

1. Go to http://localhost:3000/login
2. Email: `admin@hackthebox.local`
3. Password: `admin123`
4. Access admin panel at `/admin`

### 3. Verify Services

```bash
# Health check
curl http://localhost:3001/health

# Database connection
docker-compose exec backend npm run prisma:studio

# Redis connection
docker-compose exec redis redis-cli -a your_redis_password ping
```

## 📚 Project Structure

```
hackthebox/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── src/          # Source code
│   │   ├── prisma/       # Database schema & migrations
│   │   └── Dockerfile
│   └── frontend/         # Next.js App
│       ├── app/          # Pages & routing
│       ├── components/   # React components
│       ├── lib/          # Utilities
│       └── Dockerfile
├── docs/                 # Documentation
├── docker-compose.yml    # Docker orchestration
├── .env.example          # Environment template
└── GETTING-STARTED.md    # This file
```

## 🚀 Production Deployment

For production deployment:

1. **Never use default passwords**
2. **Enable HTTPS** (use nginx/Caddy reverse proxy)
3. **Set strong JWT_SECRET** (32+ characters, random)
4. **Configure firewall** rules
5. **Enable rate limiting**
6. **Set NODE_ENV=production**
7. **Use managed database** services
8. **Enable logging** and monitoring
9. **Backup database** regularly
10. **Update dependencies** regularly

## 📞 Support

For issues, check:
- Backend logs: `docker-compose logs backend`
- Frontend logs: `docker-compose logs frontend`
- Database logs: `docker-compose logs postgres`

## 🎯 Next Steps

1. ✅ Start services: `docker-compose up -d`
2. ✅ Initialize database: `docker-compose exec backend npm run prisma:seed`
3. ✅ Access platform: http://localhost:3000
4. ✅ Login as admin and configure challenges
5. ✅ Test team registration flow
6. ✅ Start the competition!

---

**Happy Hacking! 🎉**
