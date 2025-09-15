#!/bin/bash

echo "🏥 NAMASTE Healthcare API Setup"
echo "================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp env.example .env.local
    echo "✅ .env.local created. Please review and update if needed."
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Push database schema
echo "🗄️ Setting up database..."
npm run db:push

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🌐 Access the application:"
echo "   Web UI: http://localhost:3000"
echo "   HAPI FHIR: http://localhost:8080/fhir"
echo ""
echo "🔧 Useful commands:"
echo "   npm run dev          # Start development server"
echo "   npm run db:studio    # Open database studio"
echo "   docker-compose down  # Stop all services"
echo ""
echo "🔐 Test with ABHA token: mock-valid-token"
