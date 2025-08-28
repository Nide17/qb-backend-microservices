import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux state
    const token = (getState() as any)?.auth?.token;
    
    // If we have a token, add it to the headers
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 Unauthorized responses
  if (result.error?.status === 401) {
    // TODO: Add token refresh logic here
    // const refreshResult = await baseQuery('/auth/refresh', api, extraOptions);
    // if (refreshResult.data) {
    //   // Retry the initial query
    //   result = await baseQuery(args, api, extraOptions);
    // } else {
    //   // Refresh failed - log out user
    //   api.dispatch(logout());
    //   window.location.href = '/login';
    // }
  }
  
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User', 'Quiz', 'Question', 'Category', 'Score',
    'BlogPost', 'Comment', 'Feedback', 'Contact'
  ],
  endpoints: () => ({}), // Endpoints are injected from feature slices
});

// Export hooks for usage in functional components
export const {
  middleware,
  reducer,
  reducerPath,
  util: { updateQueryData },
} = api;
