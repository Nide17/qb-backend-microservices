import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api/baseApi';

export const getLandingDisplayNotes = createAsyncThunk(
  'notes/getLandingDisplay',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notes/landing-display');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch landing display notes');
    }
  }
);

export const getNotes = createAsyncThunk(
  'notes/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notes');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notes');
    }
  }
);

export const createNote = createAsyncThunk(
  'notes/create',
  async (noteData, { rejectWithValue }) => {
    try {
      const response = await api.post('/notes', noteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create note');
    }
  }
);

export const updateNote = createAsyncThunk(
  'notes/update',
  async ({ id, ...noteData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/notes/${id}`, noteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update note');
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/notes/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete note');
    }
  }
);
