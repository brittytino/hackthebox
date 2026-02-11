# 🎯 Operation Cipher Strike - CTF Platform

A production-grade Capture The Flag (CTF) competition platform with modern character-driven visual storytelling, built with Next.js, NestJS, and PostgreSQL.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

## ✨ Features

### 🎮 Participant Experience
- **OTP-based Authentication** - Secure email-based registration
- **Team Management** - 2-member teams with real-time tracking
- **Character-Driven Story** - 5 characters with 15 unique expressions
- **Progressive Challenges** - Sequential challenge unlocking
- **Live Scoreboard** - Real-time rankings and activity feed
- **Modern UI** - Cyberpunk-themed, responsive design

### 👨‍💼 Admin Panel
- **Challenge Management** - CRUD operations for challenges
- **Team Oversight** - View, qualify, disqualify teams
- **Live Monitoring** - Real-time submission tracking
- **Score Adjustments** - Manual point modifications
- **Competition Control** - Start, pause, reset events

### 🔧 Technical Features
- **RESTful API** - NestJS with Prisma ORM
- **Type-Safe** - Full TypeScript coverage
- **Dockerized** - One-command deployment
- **Real-time Updates** - Live activity feeds
- **Secure** - JWT authentication, bcrypt hashing
- **Rate Limited** - Redis-based rate limiting
- **Email Integration** - SMTP for OTP delivery

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (recommended)
- Node.js 18+ (for local dev)
- PostgreSQL 16+ (if not using Docker)

### Start with Docker (easiest)

```bash
# 1. Clone and navigate
git clone <repository-url>
cd hackthebox

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Start all services
docker-compose up -d

# 4. Initialize database
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed

# 5. Access the platform
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```

**Default Admin Login:**
- Email: `admin@hackthebox.local`
- Password: `admin123`

📖 **Full Documentation:** See [GETTING-STARTED.md](./GETTING-STARTED.md)

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Next.js 15     │────────▶│   NestJS 10     │────────▶│ PostgreSQL 16   │
│  Frontend       │   HTTP  │   Backend API   │  Prisma │   Database      │
│  (Port 3000)    │◀────────│  (Port 3001)    │◀────────│  (Port 5433)    │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                     │
                                     │
                                     ▼
                            ┌─────────────────┐
                            │                 │
                            │   Redis 7       │
                            │   Cache/Queue   │
                            │   (Port 6380)   │
                            │                 │
                            └─────────────────┘
```

## 📁 Project Structure

```
hackthebox/
├── apps/
│   ├── backend/              # NestJS API Server
│   │   ├── src/
│   │   │   ├── auth/         # JWT authentication
│   │   │   ├── challenges/   # Challenge CRUD
│   │   │   ├── submissions/  # Flag validation
│   │   │   ├── teams/        # Team management
│   │   │   ├── scoreboard/   # Rankings & stats
│   │   │   └── admin/        # Admin operations
│   │   ├── prisma/
│   │   │   ├── schema.prisma # Database schema
│   │   │   └── seed.ts       # Initial data
│   │   └── Dockerfile
│   │
│   └── frontend/             # Next.js Frontend
│       ├── app/              # App router pages
│       │   ├── page.tsx      # Landing page
│       │   ├── login/        # Authentication
│       │   ├── challenges/   # Challenge interface
│       │   ├── dashboard/    # User dashboard
│       │   ├── scoreboard/   # Live rankings
│       │   └── admin/        # Admin panel
│       ├── components/       # React components
│       │   ├── story/        # Character dialogues
│       │   └── ui/           # UI primitives
│       ├── lib/
│       │   └── api.ts        # API client
│       └── Dockerfile
│
├── docs/                     # Documentation
├── docker-compose.yml        # Container orchestration
├── .env.example              # Environment template
├── GETTING-STARTED.md        # Setup guide
└── README.md                 # This file
```

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3
- **UI Components:** Custom + shadcn/ui
- **State:** React Hooks
- **HTTP Client:** Native Fetch API

### Backend
- **Framework:** NestJS 10
- **Language:** TypeScript 5
- **Database:** PostgreSQL 16 with Prisma ORM
- **Authentication:** JWT + bcrypt
- **Validation:** class-validator
- **Email:** Nodemailer (SMTP)
- **Cache:** Redis 7

### DevOps
- **Containerization:** Docker + Docker Compose
- **Database Migrations:** Prisma Migrate
- **Process Manager:** Node.js
- **Reverse Proxy:** (add nginx/Caddy for production)

## 🔐 Environment Configuration

Required environment variables:

```env
# Database
POSTGRES_PASSWORD=secure_password
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=minimum-32-character-secret-key

# Email (for OTP)
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-specific-password

# Redis
REDIS_PASSWORD=secure_redis_password

# Ports
BACKEND_PORT=3001
NEXTJS_PORT=3000
```

See `.env.example` for complete configuration.

## 📚 Documentation

- [Getting Started Guide](./GETTING-STARTED.md) - Complete setup instructions
- [Database Schema](./apps/backend/prisma/schema.prisma) - Prisma schema
- [Character System](./docs/implementation/COMIC-BOOK-IMPLEMENTATION.md) - Visual storytelling
- [Deployment Guide](./docs/DEPLOYMENT-COMPLETE.md) - Production deployment

## 🧪 Development

### Run Tests
```bash
# Backend
cd apps/backend
npm run test

# Frontend
cd apps/frontend
npm run test
```

### Database Operations
```bash
# Create migration
docker-compose exec backend npx prisma migrate dev --name migration_name

# Reset database
docker-compose exec backend npx prisma migrate reset

# Open Prisma Studio
docker-compose exec backend npx prisma studio
```

### Rebuild Containers
```bash
# Rebuild specific service
docker-compose up -d --build backend

# Rebuild all
docker-compose up -d --build
```

## 🌐 Network Access

To access from other devices on your local network:

1. Find your machine's IP: `ipconfig` (Windows) or `ifconfig` (Linux/Mac)
2. Update frontend `.env`: `NEXT_PUBLIC_API_URL=http://YOUR_IP:3001`
3. Access from other devices: `http://YOUR_IP:3000`

## 🔒 Security Considerations

- ✅ OTP-based authentication (no passwords for participants)
- ✅ JWT tokens with expiration
- ✅ Bcrypt password hashing
- ✅ Input validation with class-validator
- ⚠️ Rate limiting (Redis required)
- ⚠️ CORS configured for frontend origin
- 🔴 HTTPS required for production
- 🔴 Change all default credentials
- 🔴 Strong JWT_SECRET (32+ chars)

## 📦 Docker Services

| Service | Internal Port | External Port | Purpose |
|---------|--------------|---------------|---------|
| Frontend | 3000 | 3000 | Next.js App |
| Backend | 3001 | 3001 | NestJS API |
| PostgreSQL | 5432 | 5433 | Database |
| Redis | 6379 | 6380 | Cache/Queue |

## 🐛 Troubleshooting

### Port Conflicts
```bash
# Check what's using port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Change ports in .env
BACKEND_PORT=4000
NEXTJS_PORT=3001
```

### Database Issues
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Frontend Can't Connect
1. Verify backend is running: `curl http://localhost:3001/health`
2. Check `NEXT_PUBLIC_API_URL` in frontend `.env`
3. Inspect browser console for errors

## 📝 License

MIT License - see LICENSE file for details

## 👥 Contributors

Built with ❤️ for the cybersecurity community

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📞 Support

For issues and questions:
- Check [GETTING-STARTED.md](./GETTING-STARTED.md)
- Review logs: `docker-compose logs [service]`
- Open an issue on GitHub

---

**Built with ❤️ for the cybersecurity community**
