import { toast } from 'react-toastify';

/**
 * Handle API errors consistently across the application
 * @param {Error} error - The error object
 * @param {string} [context=''] - Additional context for the error message
 * @param {boolean} [showToast=true] - Whether to show a toast notification
 * @returns {string} - The error message
 */
export const handleApiError = (error, context = '', showToast = true) => {
  let errorMessage = 'An unexpected error occurred';
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { data, status } = error.response;
    
    if (data?.message) {
      errorMessage = data.message;
    } else if (status === 401) {
      errorMessage = 'Unauthorized: Please log in again';
    } else if (status === 403) {
      errorMessage = 'You do not have permission to perform this action';
    } else if (status === 404) {
      errorMessage = 'The requested resource was not found';
    } else if (status >= 500) {
      errorMessage = 'A server error occurred. Please try again later.';
    }
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'No response from server. Please check your connection.';
  } else if (error.message) {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message;
  }

  // Add context if provided
  if (context) {
    errorMessage = `${context}: ${errorMessage}`;
  }

  // Show toast notification if enabled
  if (showToast) {
    toast.error(errorMessage, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }

  // Log the full error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }

  return errorMessage;
};

/**
 * Handle successful API responses consistently
 * @param {string} message - The success message to display
 * @param {Object} [options] - Additional options
 * @param {string} [options.position='top-right'] - Position of the toast
 * @param {number} [options.autoClose=3000] - Auto close delay in ms
 */
export const handleApiSuccess = (message, options = {}) => {
  const { position = 'top-right', autoClose = 3000 } = options;
  
  toast.success(message, {
    position,
    autoClose,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};
