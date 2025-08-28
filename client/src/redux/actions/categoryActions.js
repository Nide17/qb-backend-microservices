import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api/baseApi';

export const getCategories = createAsyncThunk(
  'categories/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, ...categoryData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);
