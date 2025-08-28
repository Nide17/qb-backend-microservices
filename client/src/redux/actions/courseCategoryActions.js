import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api/baseApi';

export const getCourseCategories = createAsyncThunk(
  'courseCategories/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/course-categories');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course categories');
    }
  }
);

export const createCourseCategory = createAsyncThunk(
  'courseCategories/create',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/course-categories', categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create course category');
    }
  }
);

export const updateCourseCategory = createAsyncThunk(
  'courseCategories/update',
  async ({ id, ...categoryData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/course-categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update course category');
    }
  }
);

export const deleteCourseCategory = createAsyncThunk(
  'courseCategories/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/course-categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete course category');
    }
  }
);
