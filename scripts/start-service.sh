#!/bin/bash

# Individual Service Starter
# Usage: ./start-service.sh [service-name]

if [ $# -eq 0 ]; then
    echo "Usage: $0 [service-name]"
    echo ""
    echo "Available services:"
    echo "  api-gateway, users-service, quizzing-service, posts-service"
    echo "  schools-service, courses-service, scores-service, downloads-service" 
    echo "  contacts-service, feedbacks-service, comments-service, statistics-service"
    exit 1
fi

SERVICE=$1

if [ ! -d "$SERVICE" ]; then
    echo "❌ Service '$SERVICE' not found"
    exit 1
fi

echo "🚀 Starting $SERVICE locally..."
echo "📂 Directory: $SERVICE"
echo "🌐 Check logs for port information"
echo ""

cd "$SERVICE"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in $SERVICE"
    exit 1
fi

# Start the service
npm start
