@echo off
echo 🏥 NAMASTE Healthcare API Setup
echo ================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Check if .env.local exists
if not exist .env.local (
    echo 📝 Creating .env.local from template...
    copy env.example .env.local
    echo ✅ .env.local created. Please review and update if needed.
) else (
    echo ✅ .env.local already exists
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Start Docker services
echo 🐳 Starting Docker services...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Push database schema
echo 🗄️ Setting up database...
npm run db:push

REM Seed database
echo 🌱 Seeding database...
npm run db:seed

echo.
echo 🎉 Setup completed successfully!
echo.
echo 🌐 Access the application:
echo    Web UI: http://localhost:3000
echo    HAPI FHIR: http://localhost:8080/fhir
echo.
echo 🔧 Useful commands:
echo    npm run dev          # Start development server
echo    npm run db:studio    # Open database studio
echo    docker-compose down  # Stop all services
echo.
echo 🔐 Test with ABHA token: mock-valid-token
pause
