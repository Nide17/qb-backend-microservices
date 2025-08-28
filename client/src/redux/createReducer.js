import { combineReducers } from '@reduxjs/toolkit';

/**
 * Creates the main reducer with the asynchronously loaded ones
 */
export default function createReducer(injectedReducers = {}) {
  // Initially we don't have any injectedReducers, so returning identity function to avoid the error
  if (Object.keys(injectedReducers).length === 0) {
    return (state) => state || null;
  }
  
  return combineReducers({
    ...injectedReducers,
  });
}
