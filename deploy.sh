#!/bin/bash

# Quick deployment script for updates
# Use this for subsequent deployments after initial setup

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

DEPLOY_DIR="/opt/dentist-api"

echo -e "${BLUE}🚀 Quick Deploy: DentistNearMe API${NC}"

# Navigate to deployment directory


# Pull latest changes
echo -e "${BLUE}📥 Pulling latest changes...${NC}"
git pull origin main

# Rebuild and restart containers
echo -e "${BLUE}🔄 Rebuilding and restarting containers...${NC}"
docker-compose down
docker-compose up -d --build

# Wait for services
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 30

# Health check
if curl -f http://localhost:3001/api/v1/ping/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Deployment successful! API is responding.${NC}"
    echo -e "${GREEN}🌐 API URL: http://$(hostname -I | awk '{print $1}'):3001/api/v1${NC}"
else
    echo -e "${RED}❌ Deployment failed! API is not responding.${NC}"
    echo "Check logs with: docker-compose logs api"
    exit 1
fi

# Show container status
echo -e "${BLUE}📊 Container Status:${NC}"
docker-compose ps