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

REM Load .env values (fallbacks for display)
set FRONTEND_URL=http://10.1.50.223:43117
set BACKEND_PORT=43118
set POSTGRES_HOST_PORT=45432
set REDIS_HOST_PORT=46379
set PGADMIN_HOST_PORT=45050
if exist ".env" (
    for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
        if /i "%%A"=="FRONTEND_URL" set FRONTEND_URL=%%B
        if /i "%%A"=="BACKEND_PORT" set BACKEND_PORT=%%B
        if /i "%%A"=="POSTGRES_HOST_PORT" set POSTGRES_HOST_PORT=%%B
        if /i "%%A"=="REDIS_HOST_PORT" set REDIS_HOST_PORT=%%B
        if /i "%%A"=="PGADMIN_HOST_PORT" set PGADMIN_HOST_PORT=%%B
    )
)
set HOST_NAME=10.1.50.223
for /f "tokens=1,2,3 delims=/" %%A in ("%FRONTEND_URL%") do set HOST_PORT=%%C
for /f "tokens=1 delims=:" %%A in ("%HOST_PORT%") do set HOST_NAME=%%A
set BACKEND_URL=http://%HOST_NAME%:%BACKEND_PORT%

echo.
echo [1/3] Starting existing containers (no data wipe)...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start containers.
    echo If this is your first run, use setup.bat instead.
    echo.
    echo Common fixes:
    echo   1. Restart Docker Desktop
    echo   2. Check ports 43117, 43118, 45432, 46379, 45050 are free
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
echo   Frontend:  %FRONTEND_URL%
echo   Backend:   %BACKEND_URL%
echo   Database:  %HOST_NAME%:%POSTGRES_HOST_PORT% (PostgreSQL)
echo   Redis:     %HOST_NAME%:%REDIS_HOST_PORT%
echo   pgAdmin:   http://%HOST_NAME%:%PGADMIN_HOST_PORT%
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
start %FRONTEND_URL%
echo.
pause
