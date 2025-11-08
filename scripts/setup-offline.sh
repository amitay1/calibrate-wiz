#!/bin/bash

# Scan Master - Inspection Pro - Offline Setup Script
# This script helps set up the application in offline/air-gapped environments

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Scan Master - Inspection Pro - Offline Setup            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f "${PROJECT_ROOT}/.env" ]; then
    echo "📝 Creating .env file from template..."
    cp "${PROJECT_ROOT}/.env.example" "${PROJECT_ROOT}/.env"
    
    # Generate secure secrets
    JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')
    POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')
    
    # Update .env with generated secrets
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|g" "${PROJECT_ROOT}/.env"
        sed -i '' "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|g" "${PROJECT_ROOT}/.env"
    else
        # Linux
        sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|g" "${PROJECT_ROOT}/.env"
        sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|g" "${PROJECT_ROOT}/.env"
    fi
    
    echo "✅ .env file created with secure secrets"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "Step 1: Pull Docker Images (requires internet)"
echo "════════════════════════════════════════════════════════════"
echo ""

read -p "Do you want to pull Docker images now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📥 Pulling Docker images..."
    cd "${PROJECT_ROOT}"
    docker-compose pull
    echo "✅ Docker images pulled successfully"
else
    echo "⏭️  Skipping image pull"
    echo "   Make sure to load images manually using:"
    echo "   docker load -i <image-file>.tar"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "Step 2: Build Application Image"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "🔨 Building application Docker image..."
cd "${PROJECT_ROOT}"
docker-compose build app
echo "✅ Application image built successfully"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "Step 3: Initialize Database"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "🚀 Starting database container..."
docker-compose up -d supabase-db
echo "⏳ Waiting for database to be ready..."
sleep 10

echo "✅ Database initialized"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "Step 4: Start All Services"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "🚀 Starting all services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 15

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete! ✅                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Application URLs:"
echo "   • Web App:       http://localhost:8080"
echo "   • Supabase UI:   http://localhost:3000"
echo "   • API Gateway:   http://localhost:8000"
echo ""
echo "📊 Service Status:"
docker-compose ps
echo ""
echo "📝 Next Steps:"
echo "   1. Open http://localhost:8080 in your browser"
echo "   2. Create your first user account"
echo "   3. Start creating technique sheets!"
echo ""
echo "💡 Useful Commands:"
echo "   • View logs:        docker-compose logs -f"
echo "   • Stop services:    docker-compose down"
echo "   • Restart services: docker-compose restart"
echo "   • View status:      docker-compose ps"
echo ""
echo "📖 For more information, see DEPLOYMENT.md"
echo ""
