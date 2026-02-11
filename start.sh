#!/bin/bash
# ============================================
# Operation Cipher Strike CTF Platform
# Quick Start Script for Linux/Mac
# ============================================

set -e

echo ""
echo "========================================"
echo "  Operation Cipher Strike CTF Platform"
echo "  Quick Start Script"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

echo "[OK] Docker is running"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "[WARNING] .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "[IMPORTANT] Please edit .env file and update:"
    echo "  - POSTGRES_PASSWORD"
    echo "  - REDIS_PASSWORD"
    echo "  - JWT_SECRET (32+ characters)"
    echo "  - SMTP_USER and SMTP_PASS (for email)"
    echo ""
    echo "Press Enter after editing .env file..."
    read -r
fi

echo "[1/5] Starting Docker containers..."
docker-compose up -d
echo ""

echo "[2/5] Waiting for database to be ready..."
sleep 10
echo ""

echo "[3/5] Running database migrations..."
docker-compose exec -T backend npm run prisma:migrate:deploy || echo "[WARNING] Migration failed"
echo ""

echo "[4/5] Seeding database with admin user..."
docker-compose exec -T backend npm run prisma:seed
echo ""

echo "[5/5] Checking service status..."
docker-compose ps
echo ""

echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "Access points:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:3001"
echo "  Database:  localhost:5433 (PostgreSQL)"
echo "  Redis:     localhost:6380"
echo ""
echo "Admin Login:"
echo "  Email:     admin@hackthebox.local"
echo "  Password:  admin123"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f           (view logs)"
echo "  docker-compose down              (stop all)"
echo "  docker-compose restart backend   (restart service)"
echo ""
echo "Opening browser..."
sleep 2

# Try to open browser
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000
elif command -v open > /dev/null; then
    open http://localhost:3000
else
    echo "Please open http://localhost:3000 in your browser"
fi

echo ""
echo "Press Enter to continue..."
read -r
