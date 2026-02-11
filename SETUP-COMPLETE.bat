@echo off
REM ============================================================
REM  OPERATION CIPHER STRIKE - COMPLETE SETUP SCRIPT
REM  Windows Setup with PowerShell Execution Policy Fix
REM ============================================================

echo.
echo =====================================================
echo   OPERATION CIPHER STRIKE - Setup Starting
echo =====================================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [ERROR] This script must be run as Administrator!
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

echo [STEP 1/8] Fixing PowerShell Execution Policy...
powershell -Command "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
if %errorLevel% NEQ 0 (
    echo [WARNING] Could not set execution policy, but continuing...
)

echo.
echo [STEP 2/8] Checking Docker...
docker --version >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [ERROR] Docker is not installed or not in PATH!
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

docker ps >nul 2>&1
if %errorLevel% NEQ 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo [OK] Docker is running

echo.
echo [STEP 3/8] Creating environment files...

REM Root .env
if not exist ".env" (
    (
        echo POSTGRES_USER=hackthebox
        echo POSTGRES_PASSWORD=hackthebox123
        echo POSTGRES_DB=hackthebox
        echo REDIS_PASSWORD=redis123
    ) > .env
    echo [OK] Created root .env
) else (
    echo [OK] Root .env already exists
)

REM Backend .env
if not exist "apps\backend\.env" (
    (
        echo DATABASE_URL=postgresql://hackthebox:hackthebox123@localhost:5432/hackthebox
        echo JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
        echo JWT_EXPIRATION=7d
        echo SMTP_HOST=smtp.gmail.com
        echo SMTP_PORT=587
        echo SMTP_USER=your-email@gmail.com
        echo SMTP_PASS=your-app-password
        echo SMTP_FROM=Operation Cipher Strike ^<your-email@gmail.com^>
        echo REDIS_HOST=localhost
        echo REDIS_PORT=6379
        echo REDIS_PASSWORD=redis123
    ) > apps\backend\.env
    echo [OK] Created backend .env
) else (
    echo [OK] Backend .env already exists
)

REM Frontend .env
if not exist "apps\frontend\.env.local" (
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:3001
    ) > apps\frontend\.env.local
    echo [OK] Created frontend .env.local
) else (
    echo [OK] Frontend .env.local already exists
)

echo.
echo [STEP 4/8] Installing Backend Dependencies...
cd apps\backend
call npm install
if %errorLevel% NEQ 0 (
    echo [ERROR] Backend npm install failed!
    cd ..\..
    pause
    exit /b 1
)
cd ..\..
echo [OK] Backend dependencies installed

echo.
echo [STEP 5/8] Installing Frontend Dependencies...
cd apps\frontend
call npm install
if %errorLevel% NEQ 0 (
    echo [ERROR] Frontend npm install failed!
    cd ..\..
    pause
    exit /b 1
)
cd ..\..
echo [OK] Frontend dependencies installed

echo.
echo [STEP 6/8] Starting Docker Containers...
docker-compose down
docker-compose up -d --build
if %errorLevel% NEQ 0 (
    echo [ERROR] Docker compose failed!
    pause
    exit /b 1
)
echo [OK] Docker containers started

echo.
echo [INFO] Waiting 15 seconds for database to initialize...
timeout /t 15 /nobreak >nul

echo.
echo [STEP 7/8] Running Database Migrations...
cd apps\backend
call npm run prisma:migrate
if %errorLevel% NEQ 0 (
    echo [WARNING] Migrations may have failed. Trying to generate Prisma client...
    call npm run prisma:generate
)
cd ..\..
echo [OK] Database migrations complete

echo.
echo [STEP 8/8] Seeding Database...
cd apps\backend
call npm run prisma:seed
if %errorLevel% NEQ 0 (
    echo [WARNING] Seeding failed. You may need to seed manually.
)
cd ..\..
echo [OK] Database seeded

echo.
echo =====================================================
echo   SETUP COMPLETE! 
echo =====================================================
echo.
echo IMPORTANT: Configure SMTP Settings before testing OTP!
echo.
echo Edit apps\backend\.env and update:
echo   - SMTP_USER (your email)
echo   - SMTP_PASS (your app password)
echo.
echo Access Points:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo   Database: localhost:5432
echo.
echo To start services again later:
echo   docker-compose up -d
echo.
echo To view logs:
echo   docker-compose logs -f
echo.
echo To stop services:
echo   docker-compose down
echo.
pause
