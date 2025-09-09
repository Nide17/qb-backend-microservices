#!/bin/bash

# Docker Environment Setup for QB Microservices
# Creates Docker-compatible .env files with service names instead of localhost

set -e

echo "🐳 Setting up Docker environment configuration..."
echo "=============================================="

services=("api-gateway" "users-service" "quizzing-service" "posts-service" "schools-service" "courses-service" "scores-service" "downloads-service" "contacts-service" "feedbacks-service" "comments-service" "statistics-service")

# API Gateway specific environment
echo "📝 Creating API Gateway Docker environment..."
cat > api-gateway/.env << EOF
NODE_ENV=development
PORT=5000
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

USERS_SERVICE_URL=http://users-service:5001
QUIZZING_SERVICE_URL=http://quizzing-service:5002
POSTS_SERVICE_URL=http://posts-service:5003
SCHOOLS_SERVICE_URL=http://schools-service:5004
COURSES_SERVICE_URL=http://courses-service:5005
SCORES_SERVICE_URL=http://scores-service:5006
DOWNLOADS_SERVICE_URL=http://downloads-service:5007
CONTACTS_SERVICE_URL=http://contacts-service:5008
FEEDBACKS_SERVICE_URL=http://feedbacks-service:5009
COMMENTS_SERVICE_URL=http://comments-service:5010
STATISTICS_SERVICE_URL=http://statistics-service:5011

JWT_SECRET=sl_myJwtSecret
EOF

# Users Service
echo "📝 Creating Users Service Docker environment..."
cat > users-service/.env << EOF
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://mongodb:27017/users-service
JWT_SECRET=sl_myJwtSecret

USERS_SERVICE_URL=http://users-service:5001
QUIZZING_SERVICE_URL=http://quizzing-service:5002
POSTS_SERVICE_URL=http://posts-service:5003
SCHOOLS_SERVICE_URL=http://schools-service:5004
COURSES_SERVICE_URL=http://courses-service:5005
SCORES_SERVICE_URL=http://scores-service:5006
DOWNLOADS_SERVICE_URL=http://downloads-service:5007
CONTACTS_SERVICE_URL=http://contacts-service:5008
FEEDBACKS_SERVICE_URL=http://feedbacks-service:5009
COMMENTS_SERVICE_URL=http://comments-service:5010
STATISTICS_SERVICE_URL=http://statistics-service:5011

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-2
S3_BUCKET=quizblog
LOG_LEVEL=info
EOF

# Quizzing Service
echo "📝 Creating Quizzing Service Docker environment..."
cat > quizzing-service/.env << EOF
NODE_ENV=development
PORT=5002
MONGODB_URI=mongodb://mongodb:27017/quizzing-service
JWT_SECRET=sl_myJwtSecret

USERS_SERVICE_URL=http://users-service:5001
QUIZZING_SERVICE_URL=http://quizzing-service:5002
POSTS_SERVICE_URL=http://posts-service:5003
SCHOOLS_SERVICE_URL=http://schools-service:5004
COURSES_SERVICE_URL=http://courses-service:5005
SCORES_SERVICE_URL=http://scores-service:5006
DOWNLOADS_SERVICE_URL=http://downloads-service:5007
CONTACTS_SERVICE_URL=http://contacts-service:5008
FEEDBACKS_SERVICE_URL=http://feedbacks-service:5009
COMMENTS_SERVICE_URL=http://comments-service:5010
STATISTICS_SERVICE_URL=http://statistics-service:5011

LOG_LEVEL=info
EOF

# Posts Service
echo "📝 Creating Posts Service Docker environment..."
cat > posts-service/.env << EOF
NODE_ENV=development
PORT=5003
MONGODB_URI=mongodb://mongodb:27017/posts-service
JWT_SECRET=sl_myJwtSecret

USERS_SERVICE_URL=http://users-service:5001
QUIZZING_SERVICE_URL=http://quizzing-service:5002
POSTS_SERVICE_URL=http://posts-service:5003
SCHOOLS_SERVICE_URL=http://schools-service:5004
COURSES_SERVICE_URL=http://courses-service:5005
SCORES_SERVICE_URL=http://scores-service:5006
DOWNLOADS_SERVICE_URL=http://downloads-service:5007
CONTACTS_SERVICE_URL=http://contacts-service:5008
FEEDBACKS_SERVICE_URL=http://feedbacks-service:5009
COMMENTS_SERVICE_URL=http://comments-service:5010
STATISTICS_SERVICE_URL=http://statistics-service:5011

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET=quizblog
LOG_LEVEL=info
EOF

# Schools Service
echo "📝 Creating Schools Service Docker environment..."
cat > schools-service/.env << EOF
NODE_ENV=development
PORT=5004
MONGODB_URI=mongodb://mongodb:27017/schools-service
JWT_SECRET=sl_myJwtSecret

USERS_SERVICE_URL=http://users-service:5001
QUIZZING_SERVICE_URL=http://quizzing-service:5002
POSTS_SERVICE_URL=http://posts-service:5003
SCHOOLS_SERVICE_URL=http://schools-service:5004
COURSES_SERVICE_URL=http://courses-service:5005
SCORES_SERVICE_URL=http://scores-service:5006
DOWNLOADS_SERVICE_URL=http://downloads-service:5007
CONTACTS_SERVICE_URL=http://contacts-service:5008
FEEDBACKS_SERVICE_URL=http://feedbacks-service:5009
COMMENTS_SERVICE_URL=http://comments-service:5010
STATISTICS_SERVICE_URL=http://statistics-service:5011

LOG_LEVEL=info
EOF

# Courses Service
echo "📝 Creating Courses Service Docker environment..."
cat > courses-service/.env << EOF
NODE_ENV=development
PORT=5005
MONGODB_URI=mongodb://mongodb:27017/courses-service
JWT_SECRET=sl_myJwtSecret

USERS_SERVICE_URL=http://users-service:5001
QUIZZING_SERVICE_URL=http://quizzing-service:5002
POSTS_SERVICE_URL=http://posts-service:5003
SCHOOLS_SERVICE_URL=http://schools-service:5004
COURSES_SERVICE_URL=http://courses-service:5005
SCORES_SERVICE_URL=http://scores-service:5006
DOWNLOADS_SERVICE_URL=http://downloads-service:5007
CONTACTS_SERVICE_URL=http://contacts-service:5008
FEEDBACKS_SERVICE_URL=http://feedbacks-service:5009
COMMENTS_SERVICE_URL=http://comments-service:5010
STATISTICS_SERVICE_URL=http://statistics-service:5011

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET=quizblog
LOG_LEVEL=info
EOF

# Scores Service
echo "📝 Creating Scores Service Docker environment..."
cat > scores-service/.env << EOF
NODE_ENV=development
PORT=5006
MONGODB_URI=mongodb://mongodb:27017/scores-service
JWT_SECRET=sl_myJwtSecret

USERS_SERVICE_URL=http://users-service:5001
QUIZZING_SERVICE_URL=http://quizzing-service:5002
POSTS_SERVICE_URL=http://posts-service:5003
SCHOOLS_SERVICE_URL=http://schools-service:5004
COURSES_SERVICE_URL=http://courses-service:5005
SCORES_SERVICE_URL=http://scores-service:5006
DOWNLOADS_SERVICE_URL=http://downloads-service:5007
CONTACTS_SERVICE_URL=http://contacts-service:5008
FEEDBACKS_SERVICE_URL=http://feedbacks-service:5009
COMMENTS_SERVICE_URL=http://comments-service:5010
STATISTICS_SERVICE_URL=http://statistics-service:5011

LOG_LEVEL=info
EOF

# Downloads Service
echo "📝 Creating Downloads Service Docker environment..."
cat > downloads-service/.env << EOF
NODE_ENV=development
PORT=5007
MONGODB_URI=mongodb://mongodb:27017/downloads-service
JWT_SECRET=sl_myJwtSecret

USERS_SERVICE_URL=http://users-service:5001
QUIZZING_SERVICE_URL=http://quizzing-service:5002
POSTS_SERVICE_URL=http://posts-service:5003
SCHOOLS_SERVICE_URL=http://schools-service:5004
COURSES_SERVICE_URL=http://courses-service:5005
SCORES_SERVICE_URL=http://scores-service:5006
DOWNLOADS_SERVICE_URL=http://downloads-service:5007
CONTACTS_SERVICE_URL=http://contacts-service:5008
FEEDBACKS_SERVICE_URL=http://feedbacks-service:5009
COMMENTS_SERVICE_URL=http://comments-service:5010
STATISTICS_SERVICE_URL=http://statistics-service:5011

LOG_LEVEL=info
EOF

# Contacts Service
echo "📝 Creating Contacts Service Docker environment..."
cat > contacts-service/.env << EOF
NODE_ENV=development
PORT=5008
MONGODB_URI=mongodb://mongodb:27017/contacts-service
JWT_SECRET=sl_myJwtSecret

USERS_SERVICE_URL=http://users-service:5001
QUIZZING_SERVICE_URL=http://quizzing-service:5002
POSTS_SERVICE_URL=http://posts-service:5003
SCHOOLS_SERVICE_URL=http://schools-service:5004
COURSES_SERVICE_URL=http://courses-service:5005
SCORES_SERVICE_URL=http://scores-service:5006
DOWNLOADS_SERVICE_URL=http://downloads-service:5007
CONTACTS_SERVICE_URL=http://contacts-service:5008
FEEDBACKS_SERVICE_URL=http://feedbacks-service:5009
COMMENTS_SERVICE_URL=http://comments-service:5010
STATISTICS_SERVICE_URL=http://statistics-service:5011

LOG_LEVEL=info
EOF

# Feedbacks Service
echo "📝 Creating Feedbacks Service Docker environment..."
cat > feedbacks-service/.env << EOF
NODE_ENV=development
PORT=5009
MONGODB_URI=mongodb://mongodb:27017/feedbacks-service
JWT_SECRET=sl_myJwtSecret

USERS_SERVICE_URL=http://users-service:5001
QUIZZING_SERVICE_URL=http://quizzing-service:5002
POSTS_SERVICE_URL=http://posts-service:5003
SCHOOLS_SERVICE_URL=http://schools-service:5004
COURSES_SERVICE_URL=http://courses-service:5005
SCORES_SERVICE_URL=http://scores-service:5006
DOWNLOADS_SERVICE_URL=http://downloads-service:5007
CONTACTS_SERVICE_URL=http://contacts-service:5008
FEEDBACKS_SERVICE_URL=http://feedbacks-service:5009
COMMENTS_SERVICE_URL=http://comments-service:5010
STATISTICS_SERVICE_URL=http://statistics-service:5011

LOG_LEVEL=info
EOF

# Comments Service
echo "📝 Creating Comments Service Docker environment..."
cat > comments-service/.env << EOF
NODE_ENV=development
PORT=5010
MONGODB_URI=mongodb://mongodb:27017/comments-service
JWT_SECRET=sl_myJwtSecret

USERS_SERVICE_URL=http://users-service:5001
QUIZZING_SERVICE_URL=http://quizzing-service:5002
POSTS_SERVICE_URL=http://posts-service:5003
SCHOOLS_SERVICE_URL=http://schools-service:5004
COURSES_SERVICE_URL=http://courses-service:5005
SCORES_SERVICE_URL=http://scores-service:5006
DOWNLOADS_SERVICE_URL=http://downloads-service:5007
CONTACTS_SERVICE_URL=http://contacts-service:5008
FEEDBACKS_SERVICE_URL=http://feedbacks-service:5009
COMMENTS_SERVICE_URL=http://comments-service:5010
STATISTICS_SERVICE_URL=http://statistics-service:5011

LOG_LEVEL=info
EOF

# Statistics Service
echo "📝 Creating Statistics Service Docker environment..."
cat > statistics-service/.env << EOF
NODE_ENV=development
PORT=5011
MONGODB_URI=mongodb://mongodb:27017/statistics-service
JWT_SECRET=sl_myJwtSecret

USERS_SERVICE_URL=http://users-service:5001
QUIZZING_SERVICE_URL=http://quizzing-service:5002
POSTS_SERVICE_URL=http://posts-service:5003
SCHOOLS_SERVICE_URL=http://schools-service:5004
COURSES_SERVICE_URL=http://courses-service:5005
SCORES_SERVICE_URL=http://scores-service:5006
DOWNLOADS_SERVICE_URL=http://downloads-service:5007
CONTACTS_SERVICE_URL=http://contacts-service:5008
FEEDBACKS_SERVICE_URL=http://feedbacks-service:5009
COMMENTS_SERVICE_URL=http://comments-service:5010
STATISTICS_SERVICE_URL=http://statistics-service:5011

LOG_LEVEL=info
EOF

echo ""
echo "✅ Docker environment configuration completed!"
echo ""
echo "📋 Summary:"
echo "  - All services configured to use Docker service names"
echo "  - MongoDB: mongodb:27017 (internal Docker network)"
echo "  - Redis: redis:6379 (internal Docker network)"
echo "  - JWT_SECRET set for all services"
echo "  - Services communicate via Docker network names"
echo ""
echo "🚀 Ready to start with: ./start-all.sh"
