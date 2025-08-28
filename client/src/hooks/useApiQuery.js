import { useEffect, useRef } from 'react';
import { handleApiError } from '../utils/apiErrorHandler';

/**
 * A custom hook to handle API queries with RTK Query
 * @param {Function} queryHook - The RTK Query hook to use
 * @param {Object} queryParams - Parameters to pass to the query
 * @param {Object} options - Additional options
 * @param {boolean} [options.skip=false] - Whether to skip the query
 * @param {string} [options.errorMessage] - Custom error message
 * @param {boolean} [options.showError=true] - Whether to show error toasts
 * @returns {Object} The query result with additional helper methods
 */
const useApiQuery = (queryHook, queryParams = {}, options = {}) => {
  const {
    skip = false,
    errorMessage,
    showError = true,
    ...queryOptions
  } = options;

  const skipRef = useRef(skip);
  
  // If skip changes from true to false, we need to update the ref
  // to prevent the effect from running on the first render
  useEffect(() => {
    skipRef.current = skip;
  }, [skip]);

  const result = queryHook(queryParams, {
    skip: skipRef.current,
    ...queryOptions,
  });

  const { isError, error, isSuccess, isFetching, isUninitialized } = result;

  // Handle errors
  useEffect(() => {
    if (isError && showError) {
      handleApiError(
        error,
        errorMessage || 'Failed to fetch data',
        showError
      );
    }
  }, [isError, error, errorMessage, showError]);

  // Handle successful responses
  useEffect(() => {
    if (isSuccess && !isFetching && !isUninitialized && options.onSuccess) {
      options.onSuccess(result.data);
    }
  }, [isSuccess, isFetching, isUninitialized, result.data, options]);

  // Return the result with additional helper methods
  return {
    ...result,
    isLoading: isFetching && !isUninitialized,
    isInitialLoading: isFetching && isUninitialized,
    isSuccess,
    isError,
    isEmpty: isSuccess && !result.data?.length,
  };
};

export default useApiQuery;
