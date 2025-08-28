import { useCallback } from 'react';
import { handleApiError, handleApiSuccess } from '../utils/apiErrorHandler';

/**
 * A custom hook to handle API mutations with RTK Query
 * @param {Function} mutationHook - The RTK Query mutation hook to use
 * @param {Object} options - Additional options
 * @param {string} [options.successMessage] - Success message to show on success
 * @param {string} [options.errorMessage] - Custom error message
 * @param {boolean} [options.showError=true] - Whether to show error toasts
 * @param {boolean} [options.showSuccess=true] - Whether to show success toasts
 * @param {Function} [options.onSuccess] - Callback for successful mutation
 * @param {Function} [options.onError] - Callback for failed mutation
 * @returns {Array} [mutationTrigger, mutationState]
 */
const useApiMutation = (mutationHook, options = {}) => {
  const {
    successMessage,
    errorMessage,
    showError = true,
    showSuccess = true,
    onSuccess,
    onError,
    ...mutationOptions
  } = options;

  const [trigger, result] = mutationHook();
  const { isError, error, isSuccess, data } = result;

  // Handle errors
  const handleError = useCallback(
    (error) => {
      if (showError) {
        handleApiError(
          error,
          errorMessage || 'Operation failed',
          showError
        );
      }
      if (onError) {
        onError(error);
      }
    },
    [errorMessage, onError, showError]
  );

  // Handle successful mutations
  const handleSuccess = useCallback(
    (response) => {
      if (showSuccess && successMessage) {
        handleApiSuccess(successMessage);
      }
      if (onSuccess) {
        onSuccess(response);
      }
      return response;
    },
    [onSuccess, showSuccess, successMessage]
  );

  // Wrapper around the mutation trigger
  const wrappedTrigger = useCallback(
    async (arg) => {
      try {
        const result = await trigger(arg);
        if (result.error) {
          handleError(result.error);
        } else if (result.data) {
          return handleSuccess(result.data);
        }
        return result;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    [handleError, handleSuccess, trigger]
  );

  // Handle side effects
  useEffect(() => {
    if (isError) {
      handleError(error);
    } else if (isSuccess && data) {
      handleSuccess(data);
    }
  }, [isError, error, isSuccess, data, handleError, handleSuccess]);

  return [wrappedTrigger, { ...result, isError, isSuccess }];
};

export default useApiMutation;
