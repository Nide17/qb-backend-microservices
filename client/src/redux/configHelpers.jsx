import axios from 'axios'
import { notify } from '../utils/notifyToast'

export const qbURL = 'https://myqb-245fdbd30c9b.herokuapp.com/'
export const qbTestURL = 'https://qb-test-c6396eeaa356.herokuapp.com/'
export const qbApiGateway = 'https://qb-api-gateway-faaa805537e5.herokuapp.com/'
export const apiURL = 'https://quiz-blog-rw-server.onrender.com/'
export const devApiURL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/'

// Enhanced Axios instance with interceptors and better configuration
const axiosInstance = axios.create({
    baseURL: import.meta.env.NODE_ENV === 'development' ? devApiURL : (qbApiGateway || qbURL),
    timeout: 30000, // 30 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor for adding auth token and request logging
axiosInstance.interceptors.request.use(
    (config) => {
        // Add timestamp for request tracking
        config.metadata = { startTime: new Date() }
        
        // Log requests in development
        if (import.meta.env.NODE_ENV === 'development') {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        }
        
        return config
    },
    (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
    }
)

// Response interceptor for logging and error handling
axiosInstance.interceptors.response.use(
    (response) => {
        // Calculate request duration
        const duration = new Date() - response.config.metadata.startTime
        
        // Log successful responses in development
        if (import.meta.env.NODE_ENV === 'development') {
            console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`)
        }
        
        return response
    },
    (error) => {
        // Calculate request duration even for errors
        const duration = error.config?.metadata ? new Date() - error.config.metadata.startTime : 0
        
        // Log errors in development
        if (import.meta.env.NODE_ENV === 'development') {
            console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`, error.response?.data || error.message)
        }
        
        // Handle specific error cases
        if (error.response?.status === 401) {
            // Token expired or invalid - redirect to login
            localStorage.removeItem('token')
            if (window.location.pathname !== '/login') {
                notify('Session expired. Please login again.', 'warning')
                setTimeout(() => window.location.reload(), 2000)
            }
        } else if (error.response?.status >= 500) {
            // Server errors
            notify('Server error. Please try again later.', 'error')
        } else if (error.code === 'ECONNABORTED') {
            // Timeout errors
            notify('Request timeout. Please check your connection.', 'error')
        }
        
        return Promise.reject(error)
    }
)

// List of action types that doesn't require a reload
const reloadActionTypes = ['verify', 'login', 'changeStatus']
const noToastActionTypes = ['loadUser', 'createBlogPostView']

// Default reload timeout
const RELOAD_TIMEOUT = 4000

// Enhanced API call helper with retry logic and better error handling
export const apiCallHelper = async (url, method, body, getState, actionType, retries = 3) => {
    const makeRequest = async (attempt = 1) => {
        try {
            const token = getState().auth.token
            const config = {
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token && { 'x-auth-token': token })
                }
            }

            let response
            if (method === 'get' || method === 'delete') {
                response = await axiosInstance[method](url, config)
            } else {
                response = await axiosInstance[method](url, body, config)
            }

            // Handle successful responses
            if ((response.status === 200 || response.status === 201) && method !== 'get') {
                if (reloadActionTypes.includes(actionType)) {
                    setTimeout(() => { window.location.reload() }, RELOAD_TIMEOUT)
                } else {
                    if (!noToastActionTypes.includes(actionType)) {
                        const message = response.data.error || response.data.msg || '✅ Success'
                        notify(message, response.data.error ? 'error' : 'success')
                    }
                }
            }

            return response.data
        } catch (err) {
            // Retry logic for network errors and 5xx errors
            if (attempt < retries && (
                !err.response || 
                err.response.status >= 500 || 
                err.code === 'ECONNABORTED' ||
                err.code === 'NETWORK_ERROR'
            )) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // Exponential backoff, max 5s
                await new Promise(resolve => setTimeout(resolve, delay))
                return makeRequest(attempt + 1)
            }

            // Handle error responses
            if (err.response?.data) {
                const errorData = err.response.data
                
                if (errorData.error && !noToastActionTypes.includes(actionType)) {
                    notify(errorData.error, 'error')
                }
                
                if (errorData.id === 'CONFIRM_ERR') {
                    return Promise.reject(errorData.id)
                }
                
                return Promise.reject(errorData.error || errorData.message || 'An error occurred')
            }
            
            return Promise.reject(err.message || 'Network error occurred')
        }
    }

    return makeRequest()
}

// Enhanced file upload helper with progress tracking and better error handling
export const apiCallHelperUpload = async (url, method, formData, getState, actionType, onProgress) => {
    try {
        const token = getState().auth.token
        const config = {
            headers: { 
                'Content-Type': 'multipart/form-data',
                ...(token && { 'x-auth-token': token })
            },
            timeout: 120000, // 2 minutes for file uploads
            ...(onProgress && {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    onProgress(percentCompleted)
                }
            })
        }

        const response = await axiosInstance[method](url, formData, config)

        if ((response.status === 200 || response.status === 201)) {
            if (reloadActionTypes.includes(actionType)) {
                setTimeout(() => { window.location.reload() }, RELOAD_TIMEOUT)
            } else if (!noToastActionTypes.includes(actionType)) {
                notify(response.data.msg || 'File uploaded successfully', 'success')
            }
        }

        return response.data
    } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || 'Upload failed'
        
        if (!noToastActionTypes.includes(actionType)) {
            notify(errorMessage, 'error')
        }
        
        return Promise.reject(errorMessage)
    }
}


export const handlePending = (state) => {
    state.isLoading = true;
};

export const handleRejected = (state) => {
    state.isLoading = false;
};
