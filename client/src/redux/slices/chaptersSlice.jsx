import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper, handlePending, handleRejected } from '../configHelpers'

// Async actions with createAsyncThunk
export const getChapters = createAsyncThunk("chapters/getChapters", async (_, { getState }) =>
  apiCallHelper('/api/chapters', 'get', null, getState, 'getChapters'))

export const getChaptersByCourse = createAsyncThunk("chapters/getChaptersByCourse", async (courseId, { getState }) =>
  apiCallHelper(`/api/chapters/course/${courseId}`, 'get', null, getState, 'getChaptersByCourse'))

export const createChapter = createAsyncThunk("chapters/createChapter", async (newChapter, { getState }) =>
  apiCallHelper('/api/chapters', 'post', newChapter, getState, 'createChapter'))

export const updateChapter = createAsyncThunk("chapters/updateChapter", async (updatedChapter, { getState }) =>
  apiCallHelper(`/api/chapters/${updatedChapter.idToUpdate}`, 'put', updatedChapter, getState, 'updateChapter'))

export const deleteChapter = createAsyncThunk("chapters/deleteChapter", async (chapterID, { getState }) =>
  apiCallHelper(`/api/chapters/${chapterID}`, 'delete', null, getState, 'deleteChapter'))

// Chapters slice
const initialState = {
  allChapters: [],
  isLoading: false,
  chaptersByCourse: [],
  error: null
}

const chaptersSlice = createSlice({
  name: 'chapters',
  initialState,
  reducers: {
    clearChapters: state => {
      state.allChapters = []
      state.isLoading = false
      state.chaptersByCourse = []
    }
  },
  extraReducers: (builder) => {

    // Fullfilled actions
    builder.addCase(getChapters.fulfilled, (state, action) => {
      state.allChapters = action.payload
      state.isLoading = false
    })
    builder.addCase(getChaptersByCourse.fulfilled, (state, action) => {
      state.chaptersByCourse = action.payload
      state.isByCourseLoading = false
    })
    builder.addCase(createChapter.fulfilled, (state, action) => {
      state.allChapters.push(action.payload)
      state.isLoading = false
    })
    builder.addCase(updateChapter.fulfilled, (state, action) => {
      state.allChapters = state.allChapters.map(chapter => chapter._id === action.payload._id ? action.payload : chapter)
      state.isLoading = false
    })
    builder.addCase(deleteChapter.fulfilled, (state, action) => {
      state.allChapters = state.allChapters.filter(chapter => chapter._id !== action.payload)
      state.isLoading = false
    })

    // Pending actions
    builder.addCase(getChapters.pending, handlePending)
    builder.addCase(getChaptersByCourse.pending, handlePending)
    builder.addCase(createChapter.pending, handlePending)
    builder.addCase(updateChapter.pending, handlePending)
    builder.addCase(deleteChapter.pending, handlePending)

    // Rejected actions
    builder.addCase(getChapters.rejected, handleRejected)
    builder.addCase(getChaptersByCourse.rejected, handleRejected)
    builder.addCase(createChapter.rejected, handleRejected)
    builder.addCase(updateChapter.rejected, handleRejected)
    builder.addCase(deleteChapter.rejected, handleRejected)
  }
})

export const { clearChapters } = chaptersSlice.actions
export default chaptersSlice.reducer