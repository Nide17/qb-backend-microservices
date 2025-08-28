import { api } from './baseApi';

// Define the auth API endpoints
const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
    
    loadUser: builder.query({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      providesTags: ['Auth'],
    }),
    
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Clear the entire cache on logout
          dispatch(api.util.resetApiState());
        } catch (error) {
          console.error('Logout failed:', error);
        }
      },
    }),
    
    updateProfile: builder.mutation({
      query: (userData) => {
        const formData = new FormData();
        
        // Append all fields to form data for potential file uploads
        Object.entries(userData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
        
        return {
          url: '/auth/me',
          method: 'PUT',
          body: formData,
          // Don't set content-type, let the browser set it with the boundary
          headers: {},
        };
      },
      invalidatesTags: ['Auth'],
    }),
    
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
    
    resetPassword: builder.mutation({
      query: ({ token, password, passwordConfirm }) => ({
        url: `/auth/reset-password/${token}`,
        method: 'POST',
        body: { password, passwordConfirm },
      }),
    }),
    
    // Add more auth-related endpoints as needed
  }),
  overrideExisting: false,
});

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useRegisterMutation,
  useLoadUserQuery,
  useLazyLoadUserQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;

export default authApi;
