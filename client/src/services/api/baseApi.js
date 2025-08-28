import { createApiService } from '../../utils/createApiService';

// Create a base API service with common configuration
export const api = createApiService({
  reducerPath: 'api',
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  tagTypes: [
    'User', 
    'Auth', 
    'Post', 
    'Comment', 
    'Category', 
    'Tag',
    'Quiz',
    'Question',
    'Course',
    'Chapter',
    'Download',
    'Feedback',
    'School',
    'Faculty',
    'Level',
    'Broadcast',
    'Contact',
    'FAQ',
    'BlogPost',
    'Statistics'
  ],
});

export default api;
