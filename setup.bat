@echo off
REM ============================================
REM Operation Cipher Strike CTF Platform
REM INITIAL SETUP — Run ONCE before the event
REM This will WIPE and re-seed the database.
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Operation Cipher Strike — SETUP
echo   Initial Installation ^& Database Seed
echo   WARNING: This RESETS all data!
echo ========================================
echo.

REM Safety confirmation
set /p CONFIRM=This will DELETE all existing data and re-seed. Type YES to continue: 
if /i "!CONFIRM!" NEQ "YES" (
    echo.
    echo [ABORTED] Setup cancelled. No changes made.
    pause
    exit /b 0
)
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

REM Create .env files if missing
if not exist ".env" (
    echo [INFO] Creating .env from .env.example...
    copy .env.example .env >nul
    echo [IMPORTANT] Edit .env with your passwords before continuing.
    start notepad .env
    pause
)
if not exist "apps\backend\.env" (
    echo [INFO] Creating backend .env...
    copy apps\backend\.env.example apps\backend\.env >nul 2>&1
)
if not exist "apps\frontend\.env.local" (
    echo [INFO] Creating frontend .env.local...
    copy apps\frontend\.env.example apps\frontend\.env.local >nul 2>&1
)

echo.
echo [1/5] Pre-pulling Docker images...
docker pull postgres:16-alpine >nul 2>&1
docker pull redis:7-alpine >nul 2>&1
echo [OK] Images ready

echo.
echo [2/5] Removing old containers and volumes (full reset)...
docker-compose down -v >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/5] Building and starting containers...
docker-compose up -d --build
if errorlevel 1 (
    echo [ERROR] Failed to start containers. Retrying in 5s...
    timeout /t 5 /nobreak >nul
    docker-compose up -d --build
    if errorlevel 1 (
        echo [ERROR] Still failed. Check Docker Desktop logs.
        echo   Common fixes:
        echo     1. Restart Docker Desktop
        echo     2. Check ports 3000, 3001, 5433, 6380 are free
        echo     3. Run: docker system prune -a
        pause
        exit /b 1
    )
)
echo [OK] Containers started

echo.
echo [3/5] Waiting for PostgreSQL to be ready...
set RETRIES=30
:wait_postgres
docker-compose exec -T postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    set /a RETRIES-=1
    if !RETRIES! LSS 1 (
        echo [ERROR] Database failed to start in 60 seconds.
        echo Run: docker-compose logs postgres
        pause
        exit /b 1
    )
    timeout /t 2 /nobreak >nul
    goto wait_postgres
)
echo [OK] Database is ready

echo.
echo [4/5] Running database migrations...
docker-compose exec -T backend npx prisma migrate deploy
if errorlevel 1 (
    echo [WARNING] Migrations failed, generating Prisma client...
    docker-compose exec -T backend npx prisma generate
)
echo [OK] Migrations complete

echo [4/5] Seeding database (admin account + all 9 challenges)...
docker-compose exec -T backend npx prisma db seed
echo [OK] Database seeded

echo.
echo [5/5] Service status:
docker-compose ps
echo.

echo ========================================
echo   Initial Setup Complete!
echo ========================================
echo.
echo Access points:
echo   Frontend:  http://10.1.50.223:3000
echo   Backend:   http://10.1.50.223:3001
echo.
echo Admin Login:
echo   Email:     admin@hackthebox.local
echo   Password:  admin123
echo.
echo To START the platform on event day (without resetting data):
echo   Run start.bat   (NOT this file)
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://10.1.50.223:3000
echo.
pause
