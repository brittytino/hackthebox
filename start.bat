@echo off
REM ============================================
REM Operation Cipher Strike CTF Platform
REM Quick Start Script for Windows
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Operation Cipher Strike CTF Platform
echo   Quick Start Script
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
    echo   - POSTGRES_PASSWORD
    echo   - REDIS_PASSWORD  
    echo   - SMTP_USER (your Gmail address)
    echo   - SMTP_PASS (Gmail app password - 16 chars with spaces)
    echo.
    echo Waiting for you to edit .env file...
    start notepad .env
    echo.
    echo Press any key after editing .env file...
    pause
)

echo [1/5] Pre-pulling required Docker images...
echo Pulling PostgreSQL 16 Alpine...
docker pull postgres:16-alpine >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Could not pre-pull postgres, will try during compose
)

echo Pulling Redis 7 Alpine...
docker pull redis:7-alpine >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Could not pre-pull redis, will try during compose
)

echo.
echo [2/5] Starting Docker containers...
docker-compose down -v >nul 2>&1
timeout /t 2 /nobreak >nul

docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start containers
    echo Trying again...
    timeout /t 5 /nobreak >nul
    docker-compose up -d
    if errorlevel 1 (
        echo [ERROR] Still failed. Check Docker Desktop is running properly.
        pause
        exit /b 1
    )
)
echo.

echo [3/5] Waiting for services to be healthy...
echo Waiting for PostgreSQL (database)...
:wait_postgres
docker-compose exec -T postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto wait_postgres
)
echo Database is ready!
echo.

echo [4/5] Running database initialization...
echo Running migrations...
docker-compose exec -T backend npm run prisma:migrate:deploy >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Migrations may have failed, trying seed anyway...
)

echo Seeding database...
docker-compose exec -T backend npm run prisma:seed
echo.

echo [5/5] Checking service status...
docker-compose ps
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Access points:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:3001
echo   Database:  localhost:5433 (PostgreSQL)
echo   Redis:     localhost:6380
echo.
echo Admin Login:
echo   Email:     admin@hackthebox.local
echo   Password:  admin123
echo.
echo Useful commands:
echo   docker-compose logs -f           (view logs)
echo   docker-compose down              (stop all)
echo   docker-compose restart backend   (restart service)
echo.
echo Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000
echo.
echo [SUCCESS] Platform is running!
echo.
pause
