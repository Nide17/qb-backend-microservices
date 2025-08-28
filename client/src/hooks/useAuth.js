import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useApiMutation, useApiQuery } from './useApiQuery';
import { 
  useLoginMutation, 
  useRegisterMutation, 
  useLoadUserQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLazyLoadUserQuery
} from '../services/api/authApi';
import { setCredentials, logout as logoutAction } from '../redux/slices/authSlice';

/**
 * Custom hook for authentication state and actions
 * Provides a clean API for authentication-related operations
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  
  // API hooks with custom error handling
  const [login, loginState] = useApiMutation(useLoginMutation, {
    errorMessage: 'Login failed. Please check your credentials and try again.',
  });
  
  const [register, registerState] = useApiMutation(useRegisterMutation, {
    successMessage: 'Registration successful! Please log in.',
    errorMessage: 'Registration failed. Please try again.',
  });
  
  const [logout, logoutState] = useApiMutation(useLogoutMutation, {
    successMessage: 'Logged out successfully',
    errorMessage: 'Logout failed. Please try again.',
  });
  
  const [updateProfile, updateProfileState] = useApiMutation(useUpdateProfileMutation, {
    successMessage: 'Profile updated successfully',
    errorMessage: 'Failed to update profile',
  });
  
  const [forgotPassword] = useApiMutation(useForgotPasswordMutation, {
    successMessage: 'Password reset instructions sent to your email',
    errorMessage: 'Failed to send password reset email',
  });
  
  const [resetPassword] = useApiMutation(useResetPasswordMutation, {
    successMessage: 'Password reset successful. You can now log in with your new password.',
    errorMessage: 'Failed to reset password',
  });
  
  // Auto-load user if token exists
  const { data: userData, isLoading: isUserLoading } = useLoadUserQuery(undefined, {
    skip: !token,
  });
  
  // Lazy load user data when needed
  const [triggerLoadUser] = useLazyLoadUserQuery();
  
  // Update user in Redux when user data is loaded
  useEffect(() => {
    if (userData && token) {
      dispatch(setCredentials({ user: userData, token }));
    }
  }, [userData, token, dispatch]);

  /**
   * Handle user login
   * @param {Object} credentials - Login credentials
   * @returns {Promise<{success: boolean, error?: any}>}
   */
  const handleLogin = useCallback(async (credentials) => {
    try {
      const result = await login(credentials).unwrap();
      if (result?.user && result?.token) {
        dispatch(setCredentials({ user: result.user, token: result.token }));
        return { success: true };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch, login]);

  /**
   * Handle user registration
   * @param {Object} userData - User registration data
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  const handleRegister = useCallback(async (userData) => {
    try {
      const result = await register(userData).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  }, [register]);

  /**
   * Handle user logout
   * @returns {Promise<void>}
   */
  const handleLogout = useCallback(async () => {
    try {
      await logout().unwrap();
    } finally {
      dispatch(logoutAction());
    }
  }, [dispatch, logout]);

  /**
   * Update user profile
   * @param {Object} updates - Profile updates
   * @returns {Promise<{success: boolean, error?: any}>}
   */
  const handleUpdateProfile = useCallback(async (updates) => {
    if (!user?._id) return { success: false, error: 'No user found' };
    
    try {
      const result = await updateProfile({
        ...updates,
        id: user._id,
      }).unwrap();
      
      // Update the user in the Redux store
      dispatch(setCredentials({ 
        user: { ...user, ...result },
        token,
      }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [user, token, updateProfile, dispatch]);
  
  /**
   * Refresh the current user's data
   * @returns {Promise<{success: boolean, error?: any}>}
   */
  const refreshUser = useCallback(async () => {
    if (!token) return { success: false, error: 'No token found' };
    
    try {
      const result = await triggerLoadUser().unwrap();
      if (result) {
        dispatch(setCredentials({ user: result, token }));
        return { success: true };
      }
      return { success: false, error: 'Failed to refresh user data' };
    } catch (error) {
      return { success: false, error };
    }
  }, [token, triggerLoadUser, dispatch]);

  return {
    // State
    user,
    token,
    isAuthenticated: !!token,
    isLoading: 
      loginState.isLoading || 
      registerState.isLoading || 
      isUserLoading || 
      updateProfileState.isLoading ||
      logoutState.isLoading,
    error: 
      loginState.error || 
      registerState.error || 
      updateProfileState.error ||
      logoutState.error,
    
    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    forgotPassword,
    resetPassword,
    refreshUser,
  };
};
