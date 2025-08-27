# Client Integration Guide

## Overview
The React client has been successfully integrated into the microservices architecture. Here's how to run and use the system:

## Quick Start

### Option 1: Production Setup (with Nginx)
```bash
# Build and start all services including client with nginx reverse proxy
docker-compose up --build

# Access the application at: http://localhost
```

### Option 2: Development Setup (with hot reloading)
```bash
# Start backend services first
docker-compose up mongodb redis api-gateway users-service contacts-service courses-service quizzing-service posts-service

# Start client in development mode
docker-compose -f docker-compose.dev.yml up client
```

## Architecture

### Services Overview
- **Client**: React + Vite frontend (port 3000)
- **Nginx**: Reverse proxy routing (port 80)
- **API Gateway**: Central routing hub (port 5000)
- **Microservices**: Various backend services (ports 5001-5011)

### Network Flow
```
Browser → Nginx (port 80) → Client (port 3000) + API Gateway (port 5000) → Microservices
```

## Configuration

### Environment Variables
The client uses these environment variables:
- `REACT_APP_API_URL`: API Gateway URL
- `VITE_REACT_APP_CONTACTS_URL`: Contacts service URL for Socket.io
- `NODE_ENV`: Environment mode

### API Routing
- Frontend: `http://localhost/` 
- API calls: `http://localhost/api/*` → routes to API Gateway
- Socket.io: `http://localhost/socket.io/*` → routes to contacts service

## Files Modified/Created

### Modified Files
- `client/Dockerfile` - Fixed production build
- `client/src/redux/configHelpers.jsx` - Added environment variable support
- `client/src/utils/socket.js` - Added environment variable support
- `docker-compose.yml` - Added client and nginx services

### New Files
- `client/Dockerfile.dev` - Development container with hot reloading
- `client/.env.example` - Environment variables template
- `nginx.conf` - Reverse proxy configuration
- `docker-compose.dev.yml` - Development-specific compose file

## Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 80, 3000, 5000 are available
2. **Build failures**: Check if all dependencies are installed
3. **API connection**: Verify API Gateway is running and accessible

### Logs
```bash
# View client logs
docker logs qb-client

# View nginx logs
docker logs qb-nginx

# View all services
docker-compose logs
```

## Development Workflow

1. **Backend changes**: Restart specific service containers
2. **Frontend changes**: Use development mode for hot reloading
3. **Configuration changes**: Rebuild affected containers

## Security Notes
- JWT secret is currently static - consider using Docker secrets in production
- AWS credentials are in environment variables - secure these for production
- Nginx handles SSL termination in production deployments
