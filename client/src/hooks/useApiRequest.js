import { useState, useCallback } from 'react';
import apiClient from '../utils/apiClient';
import { handleApiError } from '../utils/apiErrorHandler';

/**
 * Custom hook for making API requests with loading and error states
 * @param {Function} apiMethod - The API method to call (e.g., api.get, api.post)
 * @param {Object} options - Additional options
 * @param {boolean} options.initialLoading - Initial loading state (default: false)
 * @param {boolean} options.throwOnError - Whether to throw errors (default: false)
 * @returns {Object} - The API request state and methods
 */
const useApiRequest = (apiMethod, options = {}) => {
  const { 
    initialLoading = false, 
    throwOnError = false,
    onSuccess,
    onError,
  } = options;
  
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [status, setStatus] = useState(null);

  /**
   * Execute the API request
   * @param {*} requestData - Data to pass to the API method
   * @param {Object} requestOptions - Additional request options
   * @returns {Promise} - The API response
   */
  const execute = useCallback(async (requestData = null, requestOptions = {}) => {
    setIsLoading(true);
    setError(null);
    setStatus('loading');
    
    try {
      const response = await apiMethod(requestData, requestOptions);
      
      if (response.success) {
        setData(response.data);
        setStatus('success');
        if (onSuccess) {
          onSuccess(response.data);
        }
        return response;
      } else {
        const error = new Error(response.error || 'An error occurred');
        error.status = response.status;
        throw error;
      }
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      setStatus('error');
      
      if (onError) {
        onError(apiError, err);
      }
      
      if (throwOnError) {
        throw apiError;
      }
      
      return { success: false, error: apiError };
    } finally {
      setIsLoading(false);
    }
  }, [apiMethod, onError, onSuccess, throwOnError]);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setStatus(null);
  }, []);

  return {
    // State
    data,
    error,
    isLoading,
    status,
    
    // Methods
    execute,
    reset,
    
    // Aliases for common states
    isIdle: status === null,
    isSuccess: status === 'success',
    isError: status === 'error',
    
    // Set data manually (useful for optimistic updates)
    setData,
  };
};

/**
 * Create a pre-configured API request hook
 * @param {Function} apiMethod - The API method to call
 * @param {Object} options - Default options for the hook
 * @returns {Function} - A custom hook for the API request
 */
const createApiHook = (apiMethod, defaultOptions = {}) => {
  return (options = {}) => useApiRequest(apiMethod, { ...defaultOptions, ...options });
};

// Pre-configured hooks for common HTTP methods
export const useGet = (url, options = {}) => {
  const get = useCallback((params = {}, config = {}) => 
    apiClient.get(url, params, { ...options, ...config }), 
    [url, options]
  );
  
  return useApiRequest(get, options);
};

export const usePost = (url, options = {}) => {
  const post = useCallback((data = {}, config = {}) => 
    apiClient.post(url, data, { ...options, ...config }), 
    [url, options]
  );
  
  return useApiRequest(post, options);
};

export const usePut = (url, options = {}) => {
  const put = useCallback((data = {}, config = {}) => 
    apiClient.put(url, data, { ...options, ...config }), 
    [url, options]
  );
  
  return useApiRequest(put, options);
};

export const usePatch = (url, options = {}) => {
  const patch = useCallback((data = {}, config = {}) => 
    apiClient.patch(url, data, { ...options, ...config }), 
    [url, options]
  );
  
  return useApiRequest(patch, options);
};

export const useDelete = (url, options = {}) => {
  const del = useCallback((config = {}) => 
    apiClient.delete(url, { ...options, ...config }), 
    [url, options]
  );
  
  return useApiRequest(del, options);
};

export const useUpload = (url, options = {}) => {
  const upload = useCallback((file, fieldName = 'file', config = {}) => 
    apiClient.upload(url, file, fieldName, { ...options, ...config }), 
    [url, options]
  );
  
  return useApiRequest(upload, options);
};

export default useApiRequest;
