import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api/baseApi';
import { setCredentials } from '../slices/authSlice';

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { dispatch }) => {
    try {
      const response = await api.get('/users/me');
      dispatch(setCredentials({ user: response.data }));
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to load user';
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/register', { name, email, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/login', { email, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/users/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
  return {};
});
