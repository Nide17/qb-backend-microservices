#!/bin/bash

# QB Microservices Development Setup Script
# This script sets up the development environment for all microservices

set -e

echo "🚀 QB Microservices Development Setup"
echo "====================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Create logs directory for shared utilities
echo "📁 Creating logs directory..."
mkdir -p logs

# Create .env files for all services
echo "🔧 Creating environment files..."

# API Gateway .env
cat > api-gateway/.env << EOF
NODE_ENV=development
PORT=5000
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
USERS_SERVICE_URL=http://localhost:5001
QUIZZING_SERVICE_URL=http://localhost:5002
POSTS_SERVICE_URL=http://localhost:5003
SCHOOLS_SERVICE_URL=http://localhost:5004
COURSES_SERVICE_URL=http://localhost:5005
SCORES_SERVICE_URL=http://localhost:5006
DOWNLOADS_SERVICE_URL=http://localhost:5007
CONTACTS_SERVICE_URL=http://localhost:5008
FEEDBACKS_SERVICE_URL=http://localhost:5009
COMMENTS_SERVICE_URL=http://localhost:5010
STATISTICS_SERVICE_URL=http://localhost:5011
EOF

# Users Service .env
cat > users-service/.env << EOF
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://admin:password123@localhost:27017/users?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-in-production
LOG_LEVEL=info
EOF

# Quizzing Service .env
cat > quizzing-service/.env << EOF
NODE_ENV=development
PORT=5002
MONGODB_URI=mongodb://admin:password123@localhost:27017/quizzing?authSource=admin
API_GATEWAY_URL=http://localhost:5000
LOG_LEVEL=info
EOF

# Posts Service .env
cat > posts-service/.env << EOF
NODE_ENV=development
PORT=5003
MONGODB_URI=mongodb://admin:password123@localhost:27017/posts?authSource=admin
LOG_LEVEL=info
EOF

# Schools Service .env
cat > schools-service/.env << EOF
NODE_ENV=development
PORT=5004
MONGODB_URI=mongodb://admin:password123@localhost:27017/schools?authSource=admin
LOG_LEVEL=info
EOF

# Courses Service .env
cat > courses-service/.env << EOF
NODE_ENV=development
PORT=5005
MONGODB_URI=mongodb://admin:password123@localhost:27017/courses?authSource=admin
LOG_LEVEL=info
EOF

# Scores Service .env
cat > scores-service/.env << EOF
NODE_ENV=development
PORT=5006
MONGODB_URI=mongodb://admin:password123@localhost:27017/scores?authSource=admin
LOG_LEVEL=info
EOF

# Downloads Service .env
cat > downloads-service/.env << EOF
NODE_ENV=development
PORT=5007
MONGODB_URI=mongodb://admin:password123@localhost:27017/downloads?authSource=admin
LOG_LEVEL=info
EOF

# Contacts Service .env
cat > contacts-service/.env << EOF
NODE_ENV=development
PORT=5008
MONGODB_URI=mongodb://admin:password123@localhost:27017/contacts?authSource=admin
LOG_LEVEL=info
EOF

# Feedbacks Service .env
cat > feedbacks-service/.env << EOF
NODE_ENV=development
PORT=5009
MONGODB_URI=mongodb://admin:password123@localhost:27017/feedbacks?authSource=admin
LOG_LEVEL=info
EOF

# Comments Service .env
cat > comments-service/.env << EOF
NODE_ENV=development
PORT=5010
MONGODB_URI=mongodb://admin:password123@localhost:27017/comments?authSource=admin
LOG_LEVEL=info
EOF

# Statistics Service .env
cat > statistics-service/.env << EOF
NODE_ENV=development
PORT=5011
MONGODB_URI=mongodb://admin:password123@localhost:27017/statistics?authSource=admin
LOG_LEVEL=info
EOF

echo "✅ Environment files created"

# Install dependencies for shared utilities
echo "📦 Installing shared utilities dependencies..."
cd shared-utils
npm install
cd ..

# Install dependencies for API Gateway
echo "📦 Installing API Gateway dependencies..."
cd api-gateway
npm install
cd ..

# Install dependencies for all services
echo "📦 Installing service dependencies..."

echo "  - Users Service..."
cd users-service && npm install && cd ..

echo "  - Quizzing Service..."
cd quizzing-service && npm install && cd ..

echo "  - Posts Service..."
cd posts-service && npm install && cd ..

echo "  - Schools Service..."
cd schools-service && npm install && cd ..

echo "  - Courses Service..."
cd courses-service && npm install && cd ..

echo "  - Scores Service..."
cd scores-service && npm install && cd ..

echo "  - Downloads Service..."
cd downloads-service && npm install && cd ..

echo "  - Contacts Service..."
cd contacts-service && npm install && cd ..

echo "  - Feedbacks Service..."
cd feedbacks-service && npm install && cd ..

echo "  - Comments Service..."
cd comments-service && npm install && cd ..

echo "  - Statistics Service..."
cd statistics-service && npm install && cd ..

echo "✅ All dependencies installed"

# Start Redis for development
echo "🔴 Starting Redis for development..."
docker run -d --name qb-redis-dev -p 6379:6379 redis:7-alpine

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
sleep 3

# Test Redis connection
if docker exec qb-redis-dev redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis is running and accessible"
else
    echo "❌ Redis connection failed"
    exit 1
fi

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start MongoDB: docker run -d --name qb-mongodb-dev -p 27017:27017 mongo:7.0"
echo "2. Start API Gateway: cd api-gateway && npm start"
echo "3. Start individual services as needed"
echo "4. Or use Docker Compose: docker-compose up -d"
echo ""
echo "🔗 Services will be available at:"
echo "  - API Gateway: http://localhost:5000"
echo "  - Users Service: http://localhost:5001"
echo "  - Quizzing Service: http://localhost:5002"
echo "  - Posts Service: http://localhost:5003"
echo "  - Schools Service: http://localhost:5004"
echo "  - Courses Service: http://localhost:5005"
echo "  - Scores Service: http://localhost:5006"
echo "  - Downloads Service: http://localhost:5007"
echo "  - Contacts Service: http://localhost:5008"
echo "  - Feedbacks Service: http://localhost:5009"
echo "  - Comments Service: http://localhost:5010"
echo "  - Statistics Service: http://localhost:5011"
echo ""
echo "📊 Redis: localhost:6379"
echo "🗄️  MongoDB: localhost:27017"
echo ""
echo "📚 Check API_DOCUMENTATION.md for detailed API information"
echo "🏥 Health check: http://localhost:5000/api/health"
