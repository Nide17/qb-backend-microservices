import axios from 'axios';
import { getToken, isTokenExpired } from './tokenService';
import { handleApiError } from './apiErrorHandler';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies, authorization headers with HTTPS
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  async (config) => {
    const token = getToken();
    
    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        // Handle token refresh here if needed
        // For now, we'll just remove the token
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response.data;
  },
  async (error) => {
    // Handle errors
    const originalRequest = error.config;
    
    // If the error status is 401 and there was no previous retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        // const response = await refreshToken();
        // const { token } = response.data;
        // setToken(token);
        // originalRequest.headers.Authorization = `Bearer ${token}`;
        // return apiClient(originalRequest);
        
        // For now, just redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        return Promise.reject(error);
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    return Promise.reject(handleApiError(error));
  }
);

/**
 * Make an API request
 * @param {Object} config - Axios request config
 * @returns {Promise} - The API response
 */
const request = async (config) => {
  try {
    const response = await apiClient({
      ...config,
      headers: {
        ...config.headers,
      },
    });
    
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// HTTP Methods
const api = {
  get: (url, params = {}, config = {}) => 
    request({ method: 'get', url, params, ...config }),
    
  post: (url, data = {}, config = {}) => 
    request({ method: 'post', url, data, ...config }),
    
  put: (url, data = {}, config = {}) => 
    request({ method: 'put', url, data, ...config }),
    
  patch: (url, data = {}, config = {}) => 
    request({ method: 'patch', url, data, ...config }),
    
  delete: (url, config = {}) => 
    request({ method: 'delete', url, ...config }),
    
  // File upload helper
  upload: (url, file, fieldName = 'file', config = {}) => {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    return request({
      method: 'post',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
      ...config,
    });
  },
};

export default api;
