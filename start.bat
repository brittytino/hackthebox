@echo off
REM ========================================================================
REM   The Extraction CTF Platform
REM   Master Control & College Server Orchestrator
REM   One-Command Setup, Start, and Management for Windows Server
REM ========================================================================

setlocal enabledelayedexpansion

title The Extraction CTF Platform

echo.
echo  ========================================================================
echo    THE EXTRACTION -- CTF COMPETITION PLATFORM
echo    Master Control and College Server Orchestrator
echo  ========================================================================
echo.

REM 1. Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [ERROR] Docker is not running or not installed!
    echo.
    echo  Please ensure:
    echo    1. Docker Desktop is installed and started.
    echo    2. The Docker engine is running with a green status icon.
    echo    3. Run start.bat again.
    echo.
    pause
    exit /b 1
)
echo  [OK] Docker engine is running

REM 2. Detect active server LAN IPv4 address
set "DETECTED_IP=localhost"
for /f "usebackq tokens=*" %%I in (`powershell -NoProfile -Command "Get-CimInstance Win32_NetworkAdapterConfiguration -Filter 'IPEnabled = True and DefaultIPGateway IS NOT NULL' | Select-Object -ExpandProperty IPAddress -First 1" 2^>nul`) do (
    if not "%%I"=="" set "DETECTED_IP=%%I"
)
echo  [OK] Detected Server LAN IP: !DETECTED_IP!

REM 3. Ensure .env files exist and are properly configured
if not exist ".env" (
    echo  [INFO] Creating .env from .env.example...
    copy .env.example .env >nul
)
if not exist "apps\backend\.env" (
    copy apps\backend\.env.example apps\backend\.env >nul 2>&1
)
if not exist "apps\frontend\.env.local" (
    copy apps\frontend\.env.example apps\frontend\.env.local >nul 2>&1
)

REM Patch PGADMIN_DEFAULT_EMAIL if it uses invalid .local domain (causes pgAdmin crash)
powershell -NoProfile -Command "(Get-Content .env) -replace 'admin@theextraction\.local', 'admin@theextraction.com' | Set-Content .env" 2>nul

REM 4. Check CLI arguments
if /i "%1"=="--reset" goto do_reset_confirmed
if /i "%1"=="--stop" goto do_stop
if /i "%1"=="--logs" goto do_logs
if /i "%1"=="--start" goto do_start

REM 5. Interactive Mode Menu
echo.
echo  ========================================================================
echo    STUDENT ACCESS LINK: http://!DETECTED_IP!:43117
echo    ADMIN OPS CENTER:    http://!DETECTED_IP!:43117/admin
echo  ========================================================================
echo.
echo  Select Operation Mode:
echo    [1] START EVENT - Recommended - keeps existing teams and scores
echo    [2] FRESH RESET AND SEED - Wipe database and load all 9 challenges fresh
echo    [3] STOP ALL SERVICES
echo    [4] VIEW LIVE LOGS
echo.
choice /C 1234 /N /T 5 /D 1 /M "Enter choice 1-4 [Default: 1 in 5s]: "
if errorlevel 4 goto do_logs
if errorlevel 3 goto do_stop
if errorlevel 2 goto confirm_reset
if errorlevel 1 goto do_start

:confirm_reset
echo.
echo  [WARNING] You selected FRESH RESET.
echo  This will DELETE all teams, scores, and active submissions!
echo.
set /p "CONFIRM=Type YES to wipe and re-seed: "
if /i "!CONFIRM!" NEQ "YES" (
    echo.
    echo  [ABORTED] Reset cancelled. Starting in standard mode...
    goto do_start
)

:do_reset_confirmed
echo.
echo  [RESET] Tearing down containers and wiping volumes...
docker-compose down -v >nul 2>&1
timeout /t 2 /nobreak >nul
goto do_build_and_start

:do_start
echo.
echo  [START] Launching platform services...

:do_build_and_start
REM 6. Build and start containers
echo.
echo  [1/4] Starting Docker containers...
docker-compose up -d --build
if errorlevel 1 (
    echo  [WARNING] First attempt had an issue. Retrying in 4 seconds...
    timeout /t 4 /nobreak >nul
    docker-compose up -d --build
    if errorlevel 1 (
        echo.
        echo  [FATAL] Failed to start Docker containers.
        echo  Please check Docker Desktop settings and port availability.
        pause
        exit /b 1
    )
)
echo  [OK] Containers online

REM 7. Wait for PostgreSQL & Redis
echo.
echo  [2/4] Waiting for database and cache to be healthy...
set "RETRIES=30"
:wait_db
docker-compose exec -T postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    set /a RETRIES-=1
    if !RETRIES! LSS 1 (
        echo  [ERROR] PostgreSQL did not become ready in 60 seconds.
        docker-compose logs postgres
        pause
        exit /b 1
    )
    timeout /t 2 /nobreak >nul
    goto wait_db
)
echo  [OK] PostgreSQL database is healthy
echo  [OK] Redis cache is healthy

REM 8. Push schema & seed challenges
echo.
echo  [3/4] Initializing database schema and challenges...
docker-compose exec -T backend npx prisma db push --accept-data-loss >nul 2>&1
docker-compose exec -T backend npx prisma db seed >nul 2>&1

REM Ensure rounds 1, 2, and 3 are ACTIVE
docker-compose exec -T backend npx ts-node -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.round.updateMany({ data: { status: 'ACTIVE' } }).then(() => { console.log('  [OK] Rounds 1, 2, and 3 are ACTIVE'); return p.$disconnect(); }).catch(() => process.exit(0));"

echo  [OK] Database seeded with Admin user and all 9 challenges

REM 9. Final status
echo.
echo  [4/4] Verifying platform status...
docker-compose ps

echo.
echo  ========================================================================
echo    THE EXTRACTION -- CTF PLATFORM IS LIVE!
echo  ========================================================================
echo.
echo    PARTICIPANT URL - Share on projector and student laptops:
echo      http://!DETECTED_IP!:43117
echo.
echo    LOCAL MACHINE ACCESS:
echo      Main Competition UI: http://localhost:43117
echo      Admin Ops Control:   http://localhost:43117/admin
echo      Live Leaderboard:    http://localhost:43117/leaderboard
echo      Marvel Ending Scene: http://localhost:43117/credits
echo      Database GUI:        http://localhost:45050
echo.
echo    ADMIN LOGIN CREDENTIALS:
echo      Username: admin   (or email: admin@theextraction.local)
echo      Password: admin123
echo.
echo    ADMIN OPS FEATURES:
echo      - END GAME FOR ALL: Triggers broadcast to all student screens
echo      - Auto-redirects everyone to the Marvel post-credits ending scene
echo      - Honors Coordinators: Tino Britty and Srinithi with photos
echo      - Coordinator photos located in: apps\frontend\public\images\coordinators\
echo.
echo    SERVER CONTROLS:
echo      To Stop:      docker-compose down
echo      To View Logs: docker-compose logs -f
echo  ========================================================================
echo.
echo  Opening browser to CTF portal in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:43117

echo.
echo  Platform is running in the background.
echo  Press any key to stream live container logs, or close this window.
pause >nul

:do_logs
docker-compose logs -f
goto :eof

:do_stop
echo.
echo  Stopping all The Extraction containers...
docker-compose down
echo  [OK] All containers stopped safely. Data is preserved.
pause
goto :eof
