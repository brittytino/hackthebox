@echo off
REM ============================================
REM Operation Cipher Strike CTF Platform
REM START -- Daily use, preserves all data
REM Run setup.bat ONCE for initial installation
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Operation Cipher Strike CTF Platform
echo   Starting Services (data preserved)
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
echo [1/3] Starting existing containers (no data wipe)...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start containers.
    echo If this is your first run, use setup.bat instead.
    echo.
    echo Common fixes:
    echo   1. Restart Docker Desktop
    echo   2. Check ports 3000, 3001, 5433, 6380 are free
    pause
    exit /b 1
)
echo [OK] Containers started

echo.
echo [2/3] Waiting for services to be ready...
set RETRIES=30
:wait_db
docker-compose exec -T postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    set /a RETRIES-=1
    if !RETRIES! LSS 1 (
        echo [ERROR] Database did not start in 60 seconds.
        echo Run: docker-compose logs postgres
        pause
        exit /b 1
    )
    timeout /t 2 /nobreak >nul
    goto wait_db
)
echo [OK] Database is ready

REM Brief wait for backend to fully connect
timeout /t 4 /nobreak >nul
echo [OK] Backend ready

echo.
echo [3/3] Service status:
docker-compose ps
echo.

echo ========================================
echo   Platform is Running!
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
echo   docker-compose logs -f            (all logs)
echo   docker-compose logs -f backend    (backend only)
echo   docker-compose logs -f frontend   (frontend only)
echo   docker-compose down               (stop, keep data)
echo   docker-compose restart backend    (restart a service)
echo   docker-compose ps                 (status)
echo.
echo NOTE: To reset all data and re-seed, run setup.bat
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://10.1.50.223:3000
echo.
pause
