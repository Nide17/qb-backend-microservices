import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  error: null,
  status: null,
  timestamp: null,
};

// Create error slice
const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    /**
     * Set an error in the error state
     * @param {Object} state - Current state
     * @param {Object} action - Action containing error details
     */
    setError: (state, action) => {
      const { message, status } = action.payload || {};
      state.error = message || 'An unknown error occurred';
      state.status = status || 500;
      state.timestamp = new Date().toISOString();
    },
    
    /**
     * Clear the current error state
     * @param {Object} state - Current state
     */
    clearError: (state) => {
      state.error = null;
      state.status = null;
      state.timestamp = null;
    },
  },
});

// Export actions
export const { setError, clearError } = errorSlice.actions;

// Selectors
export const selectError = (state) => state.error.error;
export const selectErrorStatus = (state) => state.error.status;
export const selectErrorTimestamp = (state) => state.error.timestamp;

export default errorSlice.reducer;
