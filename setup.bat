@echo off
echo ========================================
echo OPERATION CIPHER STRIKE - AUTO SETUP
echo ========================================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running! Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [1/7] Setting up environment files...
if not exist "apps\backend\.env" (
    copy "apps\backend\.env.example" "apps\backend\.env"
    echo Created apps\backend\.env
)
if not exist "apps\frontend\.env.local" (
    copy "apps\frontend\.env.example" "apps\frontend\.env.local"
    echo Created apps\frontend\.env.local
)
echo.

echo [2/7] Building Docker containers...
docker-compose down -v
docker-compose build
echo.

echo [3/7] Starting services...
docker-compose up -d
echo.

echo [4/7] Waiting for database...
timeout /t 10 /nobreak >nul
echo.

echo [5/7] Running database migrations...
docker-compose exec -T backend npm run prisma:generate
docker-compose exec -T backend npx prisma migrate deploy
echo.

echo [6/7] Seeding database with 9 challenges...
docker-compose exec -T backend npm run prisma:seed
echo.

echo [7/7] Setup complete!
echo.
echo ========================================
echo      PLATFORM IS READY!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:4000
echo Health:   http://localhost:4000/health
echo.
echo IMPORTANT: Configure SMTP in apps\backend\.env
echo for OTP emails to work!
echo.
echo Open apps\backend\.env and set:
echo   SMTP_USER=your-email@gmail.com
echo   SMTP_PASS=your-app-password
echo.
echo Then restart: docker-compose restart backend
echo.
pause
