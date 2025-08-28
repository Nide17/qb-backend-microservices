import { api } from '../services/api/baseApi';
import { getToken, isTokenExpired, getTokenTimeRemaining } from '../utils/tokenService';

// Minimum time remaining before token is considered expired (in milliseconds)
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

/**
 * Middleware to handle authentication and token refresh
 * @param {Object} api - The RTK Query API instance
 * @returns {Function} Middleware function
 */
export const createAuthMiddleware = (api) => {
  let refreshPromise = null;

  return (store) => (next) => async (action) => {
    // Skip if not a query/mutation action
    if (!action.type || !action.type.endsWith('/executeQuery')) {
      return next(action);
    }

    const state = store.getState();
    const token = getToken();
    const isAuthAction = action.meta?.arg?.endpointName?.startsWith('auth');

    // Skip auth handling for auth-related endpoints
    if (isAuthAction) {
      return next(action);
    }

    // Check if token is expired or about to expire
    if (token) {
      const timeRemaining = getTokenTimeRemaining(token);
      const isExpired = isTokenExpired(token);
      const needsRefresh = timeRemaining < TOKEN_REFRESH_THRESHOLD;

      // If token is expired and we're not already refreshing
      if (isExpired || needsRefresh) {
        try {
          // Only start a new refresh if one isn't in progress
          if (!refreshPromise) {
            refreshPromise = (async () => {
              try {
                // Call your refresh token endpoint here
                // Example: await store.dispatch(authApi.endpoints.refreshToken.initiate({}));
                // For now, we'll just clear the token if it's expired
                if (isExpired) {
                  store.dispatch({ type: 'auth/logout' });
                }
              } finally {
                refreshPromise = null;
              }
            })();
          }

          // Wait for the refresh to complete
          await refreshPromise;
        } catch (error) {
          console.error('Token refresh failed:', error);
          store.dispatch({ type: 'auth/logout' });
          throw new Error('Session expired. Please log in again.');
        }
      }
    }

    return next(action);
  };
};

// Create the middleware instance
export const authMiddleware = createAuthMiddleware(api);
