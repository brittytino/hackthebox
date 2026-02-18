@echo off
REM ============================================
REM Operation Cipher Strike CTF Platform
REM Universal Start Script for Windows
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Operation Cipher Strike CTF Platform
echo   Universal Start Script
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Check if .env exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env >nul
    echo.
    echo [IMPORTANT] Please edit .env file and update:
    echo   - POSTGRES_PASSWORD (strong password)
    echo   - REDIS_PASSWORD (strong password)
    echo   - SMTP_USER (your Gmail address)
    echo   - SMTP_PASS (Gmail app password - 16 chars)
    echo.
    echo Opening .env file in notepad...
    start notepad .env
    echo.
    pause
)

REM Check if backend/.env exists
if not exist "apps\backend\.env" (
    echo [INFO] Creating backend .env file...
    copy apps\backend\.env.example apps\backend\.env >nul 2>&1
)

REM Check if frontend/.env.local exists
if not exist "apps\frontend\.env.local" (
    echo [INFO] Creating frontend .env.local file...
    copy apps\frontend\.env.example apps\frontend\.env.local >nul 2>&1
)

echo [1/5] Pre-pulling required Docker images...
docker pull postgres:16-alpine >nul 2>&1
docker pull redis:7-alpine >nul 2>&1
echo [OK] Images ready
echo.

echo [2/5] Building and starting Docker containers...
docker-compose down -v >nul 2>&1
timeout /t 2 /nobreak >nul

docker-compose up -d --build
if errorlevel 1 (
    echo [ERROR] Failed to start containers
    echo Retrying...
    timeout /t 5 /nobreak >nul
    docker-compose up -d --build
    if errorlevel 1 (
        echo [ERROR] Still failed. Check Docker Desktop logs.
        echo.
        echo Common fixes:
        echo   1. Restart Docker Desktop
        echo   2. Check if ports 3000, 3001, 5433, 6380 are available
        echo   3. Run: docker system prune -a
        pause
        exit /b 1
    )
)
echo [OK] Containers started
echo.

echo [3/5] Waiting for services to be healthy...
echo Waiting for PostgreSQL database...
set RETRIES=30
:wait_postgres
docker-compose exec -T postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    set /a RETRIES-=1
    if !RETRIES! LSS 1 (
        echo [ERROR] Database failed to start within 60 seconds
        echo Check logs: docker-compose logs postgres
        pause
        exit /b 1
    )
    timeout /t 2 /nobreak >nul
    goto wait_postgres
)
echo [OK] Database is ready
echo.

echo [4/5] Initializing database...
echo Running migrations...
docker-compose exec -T backend npx prisma migrate deploy
if errorlevel 1 (
    echo [WARNING] Migrations failed, trying to generate Prisma client...
    docker-compose exec -T backend npx prisma generate
)

echo Seeding database with admin user and challenges...
docker-compose exec -T backend npx prisma db seed
echo [OK] Database initialized
echo.

echo [5/5] Checking service status...
docker-compose ps
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Access points:
echo   Frontend:  http://10.1.50.223:3000
echo   Backend:   http://10.1.50.223:3001
echo   Database:  10.1.50.223:5433 (PostgreSQL)
echo   Redis:     10.1.50.223:6380
echo.
echo Admin Login:
echo   Email:     admin@hackthebox.local
echo   Password:  admin123
echo.
echo Useful commands:
echo   docker-compose logs -f           (view logs)
echo   docker-compose logs -f backend   (backend logs only)
echo   docker-compose down              (stop all)
echo   docker-compose restart backend   (restart service)
echo   docker-compose ps                (service status)
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://10.1.50.223:3000
echo.
echo [SUCCESS] Platform is running!
echo.
pause
