#!/usr/bin/env pwsh

Write-Host "🎯 HACK-THE-BOX: Complete Redesign Setup Script" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Step 1: Install Backend Dependencies
Write-Host "📦 Step 1: Installing backend dependencies..." -ForegroundColor Cyan
Set-Location "apps/backend"
npm install nodemailer @types/nodemailer
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend dependencies installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Run Database Migration
Write-Host "🗄️  Step 2: Running database migration..." -ForegroundColor Cyan
npx prisma migrate dev --name complete_redesign
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database migration failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Database migrated successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Generate Prisma Client
Write-Host "⚙️  Step 3: Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma client generation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma client generated" -ForegroundColor Green
Write-Host ""

# Step 4: Seed Database
Write-Host "🌱 Step 4: Seeding database with challenges..." -ForegroundColor Cyan
npm run prisma:seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database seeding failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Database seeded with 9 challenges" -ForegroundColor Green
Write-Host ""

# Step 5: Install Frontend Dependencies
Write-Host "📦 Step 5: Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location "../frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend dependencies installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 6: Environment Check
Write-Host "🔍 Step 6: Checking environment variables..." -ForegroundColor Cyan
Set-Location "../backend"
if (!(Test-Path ".env")) {
    Write-Host "⚠️  Creating .env file..." -ForegroundColor Yellow
    @"
DATABASE_URL="postgresql://user:password@localhost:5432/hackthebox?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
PORT=3001
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created! PLEASE UPDATE WITH YOUR CREDENTIALS!" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}
Write-Host ""

Set-Location "../frontend"
if (!(Test-Path ".env.local")) {
    Write-Host "⚠️  Creating frontend .env.local..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_API_URL=http://localhost:3001
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ .env.local created" -ForegroundColor Green
} else {
    Write-Host "✅ .env.local exists" -ForegroundColor Green
}
Write-Host ""

# Final Summary
Set-Location "../.."
Write-Host "🎉 SETUP COMPLETE!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 What was configured:" -ForegroundColor Cyan
Write-Host "  ✓ Database schema updated with OTP, Teams, 9 Challenges" -ForegroundColor White
Write-Host "  ✓ Backend services created (OTP, Registration, Validation)" -ForegroundColor White
Write-Host "  ✓ Frontend dependencies installed (GSAP, Three.js, etc.)" -ForegroundColor White
Write-Host "  ✓ All challenges seeded with correct answers" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Update apps/backend/.env with your database and SMTP credentials" -ForegroundColor White
Write-Host "  2. Start PostgreSQL database" -ForegroundColor White
Write-Host "  3. Run backend: cd apps/backend && npm run start:dev" -ForegroundColor White
Write-Host "  4. Run frontend: cd apps/frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📖 Challenge Answers (for testing):" -ForegroundColor Cyan
Write-Host "  Round 1.1: HTB{DARKNET_2026_COR}" -ForegroundColor Gray
Write-Host "  Round 1.2: HTB{SERV-ER-42-FINAL-LAB}" -ForegroundColor Gray
Write-Host "  Round 1.3: HTB{024A4F93}" -ForegroundColor Gray
Write-Host "  Round 2.1: HTB{WHIONEPAS42}" -ForegroundColor Gray
Write-Host "  Round 2.2: HTB{6202_SSECCA_TENKRAD}" -ForegroundColor Gray
Write-Host "  Round 2.3: DYNAMIC (team-specific)" -ForegroundColor Gray
Write-Host "  Round 3.1: HTB{BLACK_OUT_CODE_TWENTYTWO}" -ForegroundColor Gray
Write-Host "  Round 3.2: HTB{DEFUSE_COMPOSITE}" -ForegroundColor Gray
Write-Host "  Round 3.3: HTB{KILL_SWITCH_OPERATION_BLACKOUT_ABORTED_SUCCESS}" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 Competition Flow:" -ForegroundColor Cyan
Write-Host "  1. User enters email → Receives OTP" -ForegroundColor White
Write-Host "  2. Verifies OTP (3 attempts, 10min expiry)" -ForegroundColor White
Write-Host "  3. Creates team (name + 2 members)" -ForegroundColor White
Write-Host "  4. Dashboard → Linear progression through 9 challenges" -ForegroundColor White
Write-Host "  5. Real-time scoreboard tracks all teams" -ForegroundColor White
Write-Host ""
Write-Host "💡 Need help? Check IMPLEMENTATION-GUIDE.md" -ForegroundColor Yellow
Write-Host ""
