# Local Development Setup Guide

## Quick Start (Minimal Setup)

### Option 1: Core Services Only
Run only the services that work without external dependencies:

```bash
node start-local.js
```

This starts:
- ✅ API Gateway (port 5000) - with Socket.io and memory cache
- ✅ Statistics Service (port 5011) - no database required

### Option 2: Full Setup with MongoDB

1. **Install MongoDB locally** or use MongoDB Atlas free tier
2. **Copy environment variables** to each service:
   ```bash
   # Copy local-dev.env to .env in each service directory
   cp local-dev.env users-service/.env
   cp local-dev.env quizzing-service/.env
   cp local-dev.env schools-service/.env
   # ... repeat for all services
   ```
3. **Update MongoDB URI** in each .env file:
   ```
   MONGODB_URI=mongodb://localhost:27017/qb-local
   # OR for MongoDB Atlas:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/qb-local
   ```
4. **Run all services**:
   ```bash
   npm run dev-all
   ```

## Service Status

### ✅ Working Services (No External Dependencies)
- **API Gateway** (5000) - Routes requests, Socket.io, memory cache
- **Statistics** (5011) - Analytics without database

### ⚠️ MongoDB Required Services
- **Users** (5001) - User management, authentication
- **Quizzing** (5002) - Quiz creation and management  
- **Schools** (5004) - School/faculty management
- **Scores** (5006) - Quiz scoring and results
- **Contacts** (5008) - Chat and messaging
- **Feedbacks** (5009) - User feedback system
- **Comments** (5010) - Quiz/question comments

### 🔧 S3 Configuration Required Services
- **Posts** (5003) - Blog posts with image uploads
- **Courses** (5005) - Course materials with file uploads
- **Downloads** (5007) - File download management

## Client Integration

Your React client is configured to work with:
- **Development**: `http://localhost:3000` (direct client)
- **Production**: `http://localhost` (nginx proxy)
- **API Gateway**: `http://localhost:5000` (all API calls)
- **Socket.io**: `ws://localhost:5000/socket.io/` (real-time features)

## Next Steps

1. **Test Core Services**: Start with `node start-local.js`
2. **Add MongoDB**: Set up local MongoDB or Atlas for full functionality
3. **Configure S3**: Add AWS credentials for file upload features
4. **Test Client**: Run client at `http://localhost:3000`

## Troubleshooting

- **Port conflicts**: Check if services are already running
- **MongoDB auth**: Ensure correct credentials in .env files
- **S3 errors**: Disable file upload features or configure AWS
- **Redis warnings**: API Gateway uses memory fallback automatically
