# Operation Cipher Strike - CTF Platform

A complete Capture The Flag (CTF) platform with Docker support for Windows, Linux, and macOS.

## 🚀 Quick Start

### Prerequisites
- **Docker Desktop** installed and running
- **4GB RAM** minimum available for Docker
- **Git** (optional, for cloning)

### Installation & Setup

#### Windows
1. Make sure Docker Desktop is running
2. Double-click `start.bat` or run in PowerShell/CMD:
   ```cmd
   start.bat
   ```

#### Linux/Mac
1. Make Docker is running
2. Run the startup script:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

The script will:
- ✅ Check if Docker is running
- 📝 Create `.env` file if it doesn't exist (from `.env.example`)
- 🐳 Pull required Docker images
- 🏗️ Build and start all containers
- 🗄️ Initialize the database with migrations
- 🌱 Seed admin user and challenges
- 🌐 Open your browser to `http://localhost:3000`

### First Time Setup

If it's your first time running the platform:

1. The script will create a `.env` file and open it in Notepad (Windows)
2. Update these values **before** proceeding:
   - `POSTGRES_PASSWORD` - Strong database password
   - `REDIS_PASSWORD` - Strong Redis password
   - `SMTP_USER` - Your Gmail address (for OTP emails)
   - `SMTP_PASS` - Gmail app password (16 characters from Google)
3. Save the file and press any key to continue

> **Note:** To get a Gmail app password:
> 1. Go to your Google Account → Security
> 2. Enable 2-Step Verification
> 3. Go to App Passwords
> 4. Generate a new app password for "Mail"
> 5. Copy the 16-character password (with spaces)

## 🎯 Access the Platform

Once running, access these URLs:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

### Default Admin Credentials

```
Email:    admin@hackthebox.local
Password: admin123
```

⚠️ **Change these credentials after first login!**

## 🛠️ Docker Commands

### View logs (all services)
```bash
docker-compose logs -f
```

### View logs (specific service)
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop all services
```bash
docker-compose down
```

### Stop and remove all data (fresh start)
```bash
docker-compose down -v
```

### Restart a specific service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Check service status
```bash
docker-compose ps
```

### Rebuild containers after code changes
```bash
docker-compose up -d --build
```

## 📦 What's Included

### Services
- **PostgreSQL 16** - Database on port `5433`
- **Redis 7** - Cache/Session store on port `6380`
- **Backend** - NestJS API on port `3001`
- **Frontend** - Next.js 15 on port `3000`

### Features
- ✅ User authentication with JWT
- ✅ Team management
- ✅ Multi-round CTF challenges
- ✅ Real-time scoreboard with SSE
- ✅ Admin dashboard
- ✅ Email OTP verification
- ✅ Challenge submission tracking
- ✅ Story-driven gameplay
- ✅ Responsive UI with Tailwind CSS

## 🔧 Troubleshooting

### Docker not running
**Error**: `Docker is not running!`
**Fix**: Start Docker Desktop and wait until it's fully running

### Port already in use
**Error**: `bind: address already in use`
**Fix**: Stop services using ports 3000, 3001, 5433, or 6380
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
sudo lsof -ti:3000 | xargs kill -9
```

### Build fails
**Error**: Build errors during `docker-compose up`
**Fix**: Clean Docker cache and rebuild
```bash
docker system prune -a
docker-compose up -d --build
```

### Database connection failed
**Error**: `Connection refused` or `ECONNREFUSED`
**Fix**: Wait for PostgreSQL to fully start (can take 10-20 seconds)
```bash
docker-compose logs postgres
```

### Frontend shows errors
**Error**: API connection errors
**Fix**: Ensure backend is running and check `.env.local`:
```bash
docker-compose logs backend
# Verify NEXT_PUBLIC_API_URL=http://localhost:3001 in apps/frontend/.env.local
```

## 📁 Project Structure

```
hackthebox/
├── apps/
│   ├── backend/          # NestJS backend API
│   │   ├── src/          # Source code
│   │   ├── prisma/       # Database schema & migrations
│   │   └── Dockerfile
│   └── frontend/         # Next.js frontend
│       ├── app/          # App router pages
│       ├── components/   # React components
│       └── Dockerfile
├── docs/                 # Documentation
├── docker-compose.yml    # Docker orchestration
├── start.bat            # Windows startup script
├── start.sh             # Linux/Mac startup script
└── .env                 # Environment variables
```

## 🔐 Security Notes

1. **Change default passwords** after initial setup
2. **Never commit** `.env` files to version control
3. **Use strong passwords** for production deployments
4. **Configure SMTP** properly for email functionality
5. **Firewall rules** - Ensure proper network security

## 🌐 Production Deployment

For production deployment:

1. Update `.env` with production values:
   - Strong database passwords
   - Production domain URLs
   - Real SMTP credentials
   - Secure JWT secret (32+ characters)

2. Configure reverse proxy (nginx/traefik)

3. Enable HTTPS/SSL

4. Set `NODE_ENV=production` in backend

5. Configure backup strategy for PostgreSQL volumes

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify Docker is running: `docker info`
3. Ensure all ports are available
4. Try a clean restart: `docker-compose down -v && start.bat`

## 📄 License

This project is for educational purposes. See LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please follow standard Git workflow:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Happy Hacking!** 🎯🔐
