import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper, handlePending, handleRejected } from '../configHelpers'

// Async actions with createAsyncThunk
export const getCourseCategories = createAsyncThunk("courseCategories/getCourseCategories", async (_, { getState }) =>
  apiCallHelper('/api/course-categories', 'get', null, getState, 'getCourseCategories'))

export const createCourseCategory = createAsyncThunk("courseCategories/createCourseCategory", async (newCourseCategory, { getState }) =>
  apiCallHelper('/api/course-categories', 'post', newCourseCategory, getState, 'createCourseCategory'))

export const updateCourseCategory = createAsyncThunk("courseCategories/updateCourseCategory", async (updatedCourseCatg, { getState }) =>
  apiCallHelper(`/api/course-categories/${updatedCourseCatg.idToUpdate}`, 'put', updatedCourseCatg, getState, 'updateCourseCategory'))

export const deleteCourseCategory = createAsyncThunk("courseCategories/deleteCourseCategory", async (courseCatgID, { getState }) =>
  apiCallHelper(`/api/course-categories/${courseCatgID}`, 'delete', null, getState, 'deleteCourseCategory'))

// Course categories slice
const initialState = {
  allCourseCategories: [],
  isLoading: false,
  error: null
}

const courseCategoriesSlice = createSlice({
  name: 'courseCategories',
  initialState,
  reducers: {
    clearCourseCategories: state => {
      state.allCourseCategories = []
      state.isLoading = true
    }
  },
  extraReducers: (builder) => {

    // Fullfilled actions
    builder.addCase(getCourseCategories.fulfilled, (state, action) => {
      state.allCourseCategories = action.payload
      state.isLoading = false
    })
    builder.addCase(createCourseCategory.fulfilled, (state, action) => {
      state.allCourseCategories.push(action.payload)
      state.isLoading = false
    })
    builder.addCase(updateCourseCategory.fulfilled, (state, action) => {
      state.allCourseCategories = state.allCourseCategories.map(courseCategory => courseCategory._id === action.payload._id ? action.payload : courseCategory)
      state.isLoading = false
    })
    builder.addCase(deleteCourseCategory.fulfilled, (state, action) => {
      state.allCourseCategories = state.allCourseCategories.filter(courseCategory => courseCategory._id !== action.payload)
      state.isLoading = false
    })

    // Pending actions
    builder.addCase(getCourseCategories.pending, handlePending)
    builder.addCase(createCourseCategory.pending, handlePending)
    builder.addCase(updateCourseCategory.pending, handlePending)
    builder.addCase(deleteCourseCategory.pending, handlePending)

    // Rejected actions
    builder.addCase(getCourseCategories.rejected, handleRejected)
    builder.addCase(createCourseCategory.rejected, handleRejected)
    builder.addCase(updateCourseCategory.rejected, handleRejected)
    builder.addCase(deleteCourseCategory.rejected, handleRejected)
  }
})

export const { clearCourseCategories } = courseCategoriesSlice.actions
export default courseCategoriesSlice.reducer