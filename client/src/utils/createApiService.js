import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { handleApiError } from './apiErrorHandler';

/**
 * Create a base API service with common configuration
 * @param {Object} options - Configuration options
 * @param {string} options.reducerPath - The reducer path for the API slice
 * @param {string} options.baseUrl - The base URL for the API
 * @param {Object} options.tagTypes - Tag types for cache invalidation
 * @param {Function} [options.prepareHeaders] - Function to prepare headers
 * @param {Function} [options.fetchFn] - Custom fetch implementation
 * @returns {Object} The configured API service
 */
export const createApiService = ({
  reducerPath,
  baseUrl,
  tagTypes = [],
  prepareHeaders = (headers, { getState }) => {
    // Get the token from the auth state
    const token = getState()?.auth?.token;
    
    // If we have a token, add it to the headers
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Add content type for non-GET requests
    if (headers.get('content-type') === null) {
      headers.set('Content-Type', 'application/json');
    }
    
    return headers;
  },
  fetchFn = fetch,
  ...rest
}) => {
  return createApi({
    reducerPath,
    baseQuery: fetchBaseQuery({
      baseUrl,
      prepareHeaders,
      fetchFn,
      // Global error handler
      async fetchBaseQuery(
        args,
        { signal, dispatch, getState },
        extraOptions
      ) {
        try {
          const result = await fetchFn(args, { signal, ...extraOptions });
          
          // Handle 401 Unauthorized
          if (result.status === 401) {
            // Optionally dispatch logout action here if needed
            // dispatch(logout());
          }
          
          return result;
        } catch (error) {
          // Handle network errors
          handleApiError(error, 'Network request failed');
          throw error;
        }
      },
    }),
    tagTypes: [...tagTypes, ...['Auth', 'User', 'List']],
    endpoints: () => ({}), // Start with no endpoints
    ...rest,
  });
};

/**
 * Helper to create standard CRUD endpoints for a resource
 * @param {Object} api - The API service instance
 * @param {string} path - The base path for the resource
 * @param {string} tagType - The tag type for cache invalidation
 * @returns {Object} Object with standard CRUD endpoints
 */
export const createCrudEndpoints = (api, path, tagType) => {
  return {
    getList: api.query({
      query: (params = {}) => ({
        url: path,
        params,
      }),
      providesTags: (result = [], error, arg) => [
        { type: tagType, id: 'LIST' },
        ...result.map(({ id }) => ({ type: tagType, id })),
      ],
    }),
    
    getById: api.query({
      query: (id) => `${path}/${id}`,
      providesTags: (result, error, id) => [{ type: tagType, id }],
    }),
    
    create: api.mutation({
      query: (body) => ({
        url: path,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tagType, id: 'LIST' }],
    }),
    
    update: api.mutation({
      query: ({ id, ...body }) => ({
        url: `${path}/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: tagType, id },
        { type: tagType, id: 'LIST' },
      ],
    }),
    
    delete: api.mutation({
      query: (id) => ({
        url: `${path}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: tagType, id },
        { type: tagType, id: 'LIST' },
      ],
    }),
  };
};
