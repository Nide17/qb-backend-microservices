# QB Microservices API Documentation

## 🚀 **API Gateway Overview**

The API Gateway serves as the central entry point for all client requests, providing:
- **Data Aggregation**: Combines data from multiple microservices
- **Intelligent Caching**: Redis + in-memory caching with fallback
- **Health Monitoring**: Real-time service status monitoring
- **Request Routing**: Routes requests to appropriate microservices

**Base URL**: `http://localhost:5000`

---

## 📊 **Aggregated Endpoints**

### 1. **Quiz Aggregation** - `GET /api/aggregated/quiz/:id`

Fetches a complete quiz with all related data in a single request.

**Response includes:**
- Quiz details
- Category information
- Questions with answers
- User comments
- Score statistics

**Example Response:**
```json
{
  "title": "JavaScript Fundamentals",
  "description": "Test your JavaScript knowledge",
  "category": {
    "name": "Programming",
    "slug": "programming"
  },
  "questions": [...],
  "comments": [...],
  "scores": [...],
  "_aggregated": true,
  "_cached": false
}
```

---

### 2. **Quizzes List** - `GET /api/aggregated/quizzes`

Fetches paginated quizzes with enriched data.

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 12) - Items per page
- `category` - Filter by category ID
- `search` - Search in quiz titles/descriptions
- `difficulty` - Filter by difficulty level
- `created_by` - Filter by creator

**Enhanced Data:**
- Category names and slugs
- Creator information
- Question counts
- Estimated completion time
- Difficulty levels

---

### 3. **Dashboard Statistics** - `GET /api/aggregated/dashboard`

Provides comprehensive system overview.

**Response includes:**
- Total counts for all entities
- Real-time statistics
- Last updated timestamp

---

### 4. **User Profile** - `GET /api/aggregated/user/:id`

Complete user profile with related data.

**Response includes:**
- User information
- Quiz scores and history
- Created quizzes
- User comments
- Performance statistics

---

### 5. **Category Details** - `GET /api/aggregated/category/:id`

Category information with related quizzes and questions.

**Response includes:**
- Category details
- Associated quizzes
- Question statistics
- Difficulty analysis

---

### 6. **Global Search** - `GET /api/aggregated/search`

Cross-service search functionality.

**Query Parameters:**
- `q` (required) - Search query
- `type` - Search type (quizzes, users, posts, courses, all)
- `page` - Page number
- `limit` - Results per page

**Search Types:**
- **All**: Searches across all services
- **Quizzes**: Quiz-specific search
- **Users**: User search
- **Posts**: Blog post search
- **Courses**: Course search

---

## 🔍 **Health Monitoring**

### Health Check - `GET /api/health`

Comprehensive health status of all services.

**Response includes:**
- Overall system status
- Individual service health
- Response times
- Cache statistics (Redis + Memory)
- Service uptime

---

## 🗄️ **Cache Management**

### Cache Statistics
- **Redis Status**: Connection status and performance
- **Memory Cache**: Size and key information
- **Hit Rates**: Cache effectiveness metrics

### Cache Invalidation
- Automatic TTL-based expiration
- Pattern-based invalidation
- Related data invalidation

---

## 🛠️ **Service Endpoints**

### Users Service
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Quizzing Service
- `GET /api/categories` - List categories
- `GET /api/quizzes` - List quizzes
- `GET /api/questions` - List questions

### Posts Service
- `GET /api/blog-posts` - List blog posts
- `GET /api/faqs` - List FAQs
- `GET /api/adverts` - List advertisements

### Schools Service
- `GET /api/schools` - List schools
- `GET /api/levels` - List education levels
- `GET /api/faculties` - List faculties

### Courses Service
- `GET /api/courses` - List courses
- `GET /api/chapters` - List chapters
- `GET /api/notes` - List course notes

### Scores Service
- `GET /api/scores` - List scores
- `POST /api/scores` - Submit score

### Downloads Service
- `GET /api/downloads` - List downloads
- `POST /api/downloads` - Create download

### Contacts Service
- `GET /api/contacts` - List contacts
- `GET /api/broadcasts` - List broadcasts
- `GET /api/chat-rooms` - List chat rooms

### Feedbacks Service
- `GET /api/feedbacks` - List feedbacks
- `POST /api/feedbacks` - Submit feedback

### Comments Service
- `GET /api/quizzes-comments` - List quiz comments
- `GET /api/questions-comments` - List question comments

### Statistics Service
- `GET /api/statistics` - Get statistics

---

## 📝 **Request/Response Format**

### Standard Response Format
```json
{
  "status": "success",
  "data": {...},
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response Format
```json
{
  "status": "error",
  "error": "Error description",
  "message": "Detailed error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated Response Format
```json
{
  "status": "success",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  },
  "message": "Data retrieved successfully"
}
```

---

## 🔐 **Authentication**

### Headers
```
x-auth-token: <your-jwt-token>
Content-Type: application/json
```

---

## 🚦 **Rate Limiting**

- **Default**: 100 requests per minute per IP
- **Aggregated Endpoints**: 50 requests per minute per IP
- **Health Endpoints**: 200 requests per minute per IP

---

## 📊 **Performance Metrics**

### Response Times
- **Simple Queries**: < 100ms
- **Aggregated Queries**: < 500ms
- **Complex Aggregations**: < 1000ms

### Cache Performance
- **Redis Hit Rate**: Target > 80%
- **Memory Fallback**: Automatic on Redis failure
- **TTL Strategy**: Intelligent expiration based on data type

---

## 🛡️ **Error Handling**

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `502` - Bad Gateway
- `503` - Service Unavailable

### Error Categories
- **Validation Errors**: Request data validation failures
- **Service Errors**: Individual microservice failures
- **Network Errors**: Connection timeouts and failures
- **Cache Errors**: Cache operation failures

---

## 🔧 **Development Setup**

### Environment Variables
```bash
# API Gateway
PORT=5000
NODE_ENV=development

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Service URLs
USERS_SERVICE_URL=http://localhost:5001
QUIZZING_SERVICE_URL=http://localhost:5002
POSTS_SERVICE_URL=http://localhost:5003
# ... other services
```

### Local Development
```bash
# Install dependencies
npm install

# Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# Start API Gateway
npm start

# Start individual services
npm run start-all
```

---

## 📈 **Monitoring & Observability**

### Metrics Available
- Request/response times
- Cache hit/miss rates
- Service health status
- Error rates and types
- Database connection status

### Logging
- Structured JSON logging
- Request/response logging
- Error logging with stack traces
- Performance metrics logging

---

## 🔄 **Cache Strategies**

### Redis Cache
- **Primary Cache**: High-performance distributed caching
- **TTL Management**: Intelligent expiration based on data type
- **Pattern Invalidation**: Smart cache invalidation for related data

### Memory Cache
- **Fallback Cache**: Local in-memory storage
- **Automatic Cleanup**: Expired entry removal
- **Size Management**: Configurable maximum size limits

### Cache Invalidation
- **Time-based**: Automatic TTL expiration
- **Pattern-based**: Invalidate related data patterns
- **Manual**: Force invalidation when needed

---

## 🚀 **Best Practices**

### Frontend Integration
1. **Use Aggregated Endpoints**: Reduce API calls and improve performance
2. **Implement Caching**: Cache responses on the client side
3. **Handle Errors Gracefully**: Implement proper error handling
4. **Monitor Performance**: Track response times and cache hit rates

### API Usage
1. **Batch Requests**: Use aggregated endpoints for related data
2. **Pagination**: Implement proper pagination for large datasets
3. **Search Optimization**: Use type-specific search for better results
4. **Health Monitoring**: Regularly check service health status

---

## 📚 **Examples**

### Frontend Quiz Display
```javascript
// Instead of multiple API calls
const quiz = await fetch('/api/quizzes/123');
const category = await fetch('/api/categories/' + quiz.category);
const questions = await fetch('/api/questions?quiz=123');

// Use single aggregated call
const quizData = await fetch('/api/aggregated/quiz/123');
// Returns: quiz + category + questions + comments + scores
```

### Dashboard Implementation
```javascript
// Get comprehensive dashboard data
const dashboard = await fetch('/api/aggregated/dashboard');
// Returns: total counts for all entities
```

### User Profile
```javascript
// Get complete user profile
const userProfile = await fetch('/api/aggregated/user/456');
// Returns: user + scores + quizzes + comments + stats
```

---

## 🔮 **Future Enhancements**

### Planned Features
- **GraphQL Support**: Alternative to REST aggregation
- **Real-time Updates**: WebSocket support for live data
- **Advanced Caching**: Cache warming and predictive invalidation
- **API Versioning**: Versioned endpoints for backward compatibility
- **Analytics Dashboard**: Built-in performance monitoring

### Performance Improvements
- **Database Optimization**: Query optimization and indexing
- **Connection Pooling**: Improved database connection management
- **Load Balancing**: Intelligent request distribution
- **CDN Integration**: Content delivery network support

---

## 📞 **Support & Contact**

For technical support or questions:
- **Documentation**: This file and README.md
- **Issues**: GitHub repository issues
- **Development**: Local development setup guide

---

*Last Updated: January 2024*
*Version: 2.0.0*
