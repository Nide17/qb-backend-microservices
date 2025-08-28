namespace NodeJS {
  interface ProcessEnv {
    // Common environment variables
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    CLIENT_URL?: string;
    
    // JWT
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    
    // Database
    MONGODB_URI: string;
    
    // Redis
    REDIS_HOST?: string;
    REDIS_PORT?: string;
    REDIS_PASSWORD?: string;
    REDIS_DB?: string;
    
    // Service URLs (for API Gateway)
    USERS_SERVICE_URL?: string;
    COMMENTS_SERVICE_URL?: string;
    CONTACTS_SERVICE_URL?: string;
    COURSES_SERVICE_URL?: string;
    DOWNLOADS_SERVICE_URL?: string;
    FEEDBACKS_SERVICE_URL?: string;
    POSTS_SERVICE_URL?: string;
    QUIZZING_SERVICE_URL?: string;
    SCHOOLS_SERVICE_URL?: string;
    SCORES_SERVICE_URL?: string;
    STATISTICS_SERVICE_URL?: string;
  }
}

// This file doesn't need to export anything since it augments the global namespace
