/**
 * Standard API response formatter
 * Ensures consistent response format across all API calls
 */

/**
 * Creates a standardized success response
 * @param {any} data - The response data
 * @param {string} [message='Operation successful'] - Success message
 * @param {Object} [meta] - Additional metadata
 * @returns {Object} Standardized success response
 */
export const successResponse = (data, message = 'Operation successful', meta) => ({
  success: true,
  data,
  message,
  ...(meta && { meta }),
});

/**
 * Creates a standardized error response
 * @param {string} message - Error message
 * @param {string} [code='ERROR'] - Error code
 * @param {any} [details] - Additional error details
 * @returns {Object} Standardized error response
 */
export const errorResponse = (message, code = 'ERROR', details) => ({
  success: false,
  error: {
    code,
    message,
    ...(details && { details }),
  },
});

/**
 * Handles API responses and standardizes the format
 * @param {Promise} promise - The API promise to handle
 * @returns {Promise<Object>} Standardized response
 */
export const handleApiResponse = async (promise) => {
  try {
    const data = await promise;
    return successResponse(data);
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { data, status } = error.response;
      
      if (status === 401) {
        // Handle unauthorized (e.g., redirect to login)
        return errorResponse(
          data?.message || 'Your session has expired. Please log in again.',
          'UNAUTHORIZED',
          { statusCode: status }
        );
      }
      
      if (status === 403) {
        // Handle forbidden
        return errorResponse(
          data?.message || 'You do not have permission to perform this action.',
          'FORBIDDEN',
          { statusCode: status }
        );
      }
      
      if (status === 404) {
        // Handle not found
        return errorResponse(
          data?.message || 'The requested resource was not found.',
          'NOT_FOUND',
          { statusCode: status }
        );
      }
      
      if (status >= 500) {
        // Handle server errors
        return errorResponse(
          'A server error occurred. Please try again later.',
          'SERVER_ERROR',
          { statusCode: status }
        );
      }
      
      // Handle other API errors
      return errorResponse(
        data?.message || 'An error occurred',
        data?.code || 'API_ERROR',
        { statusCode: status, ...(data || {}) }
      );
    } else if (error.request) {
      // The request was made but no response was received
      return errorResponse(
        'No response from server. Please check your connection.',
        'NETWORK_ERROR'
      );
    } else {
      // Something happened in setting up the request
      return errorResponse(
        error.message || 'An unexpected error occurred',
        'UNKNOWN_ERROR'
      );
    }
  }
};

/**
 * Validates API response against a schema
 * @param {Object} response - The API response to validate
 * @param {Object} schema - Joi schema to validate against
 * @returns {Object} Validation result
 */
export const validateApiResponse = (response, schema) => {
  if (!response.success) {
    return response; // Don't validate error responses
  }
  
  const { error, value } = schema.validate(response.data);
  
  if (error) {
    return errorResponse(
      'Invalid response format from server',
      'VALIDATION_ERROR',
      { details: error.details }
    );
  }
  
  return successResponse(value, response.message, response.meta);
};
