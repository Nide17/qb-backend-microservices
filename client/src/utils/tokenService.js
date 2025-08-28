/**
 * Service for managing authentication tokens
 * Handles storing, retrieving, and removing tokens from localStorage and Redux store
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set the authentication token in localStorage
 * @param {string} token - The JWT token to store
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Remove the authentication token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Get the user data from localStorage
 * @returns {Object|null} The user data or null if not found
 */
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * Set the user data in localStorage
 * @param {Object} user - The user data to store
 */
export const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/**
 * Remove the user data from localStorage
 */
export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if a valid token exists, false otherwise
 */
export const isAuthenticated = () => {
  const token = getToken();
  return !!token && !isTokenExpired(token);
};

/**
 * Check if a token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} True if the token is expired, false otherwise
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = parseJwt(token);
    return decoded.exp < Date.now() / 1000;
  } catch (error) {
    return true; // If there's an error parsing the token, consider it expired
  }
};

/**
 * Parse a JWT token
 * @param {string} token - The JWT token to parse
 * @returns {Object} The decoded token payload
 */
export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return {};
  }
};

/**
 * Get the token expiration date
 * @param {string} token - The JWT token
 * @returns {Date|null} The expiration date or null if token is invalid
 */
export const getTokenExpirationDate = (token) => {
  try {
    const decoded = parseJwt(token);
    if (!decoded.exp) return null;
    
    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  } catch (error) {
    return null;
  }
};

/**
 * Get the time remaining until token expiration in milliseconds
 * @param {string} token - The JWT token
 * @returns {number} The time remaining in milliseconds, or 0 if expired/invalid
 */
export const getTokenTimeRemaining = (token) => {
  try {
    const expirationDate = getTokenExpirationDate(token);
    if (!expirationDate) return 0;
    
    const now = new Date();
    return expirationDate.getTime() - now.getTime();
  } catch (error) {
    return 0;
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  removeToken();
  removeUser();
};

export default {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  isAuthenticated,
  isTokenExpired,
  parseJwt,
  getTokenExpirationDate,
  getTokenTimeRemaining,
  clearAuthData,
};
