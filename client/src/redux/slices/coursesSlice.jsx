import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper, handlePending, handleRejected } from '../configHelpers'

// Async actions with createAsyncThunk
export const getCourses = createAsyncThunk("courses/getCourses", async (_, { getState }) =>
  apiCallHelper('/api/courses', 'get', null, getState, 'getCourses'))

export const getOneCourse = createAsyncThunk("courses/getOneCourse", async (courseId, { getState }) =>
  apiCallHelper(`/api/courses/${courseId}`, 'get', null, getState, 'getOneCourse'))

export const getCoursesByCategory = createAsyncThunk("courses/getCoursesByCategory", async (cCId, { getState }) =>
  apiCallHelper(`/api/courses/category/${cCId}`, 'get', null, getState, 'getCoursesByCategory'))

export const createCourse = createAsyncThunk("courses/createCourse", async (newCourses, { getState }) =>
  apiCallHelper('/api/courses', 'post', newCourses, getState, 'createCourse'))

export const updateCourse = createAsyncThunk("courses/updateCourse", async (updatedCourse, { getState }) =>
  apiCallHelper(`/api/courses/${updatedCourse.idToUpdate}`, 'put', updatedCourse, getState, 'updateCourse'))

export const deleteCourse = createAsyncThunk("courses/deleteCourse", async (id, { getState }) =>
  apiCallHelper(`/api/courses/${id}`, 'delete', null, getState, 'deleteCourse'))

// Courses slice
const initialState = {
  allCourses: [],
  coursesByCategory: [],
  oneCourse: {},
  isLoading: false,
  error: null
}

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCourses: state => {
      state.allCourses = []
      state.coursesByCategory = []
      state.oneCourse = {}
      isLoading: false
    }
  },
  extraReducers: (builder) => {

    // Fullfilled actions
    builder.addCase(getCourses.fulfilled, (state, action) => {
      state.allCourses = action.payload
      state.isLoading = false
    })
    builder.addCase(getOneCourse.fulfilled, (state, action) => {
      state.oneCourse = action.payload
      state.isLoading = false
    })
    builder.addCase(getCoursesByCategory.fulfilled, (state, action) => {
      state.coursesByCategory = action.payload
      state.isLoading = false
    })
    builder.addCase(createCourse.fulfilled, (state, action) => {
      state.allCourses.push(action.payload)
      state.isLoading = false
    })
    builder.addCase(updateCourse.fulfilled, (state, action) => {
      state.allCourses = state.allCourses.map(course => course._id === action.payload._id ? action.payload : course)
      state.isLoading = false
    })
    builder.addCase(deleteCourse.fulfilled, (state, action) => {
      state.allCourses = state.allCourses.filter(course => course._id !== action.payload)
      state.isLoading = false
    })

    // Pending actions
    builder.addCase(getCourses.pending, handlePending)
    builder.addCase(getOneCourse.pending, handlePending)
    builder.addCase(getCoursesByCategory.pending, handlePending)
    builder.addCase(createCourse.pending, handlePending)
    builder.addCase(updateCourse.pending, handlePending)
    builder.addCase(deleteCourse.pending, handlePending)

    // Rejected actions
    builder.addCase(getCourses.rejected, handleRejected)
    builder.addCase(getOneCourse.rejected, handleRejected)
    builder.addCase(getCoursesByCategory.rejected, handleRejected)
    builder.addCase(createCourse.rejected, handleRejected)
    builder.addCase(updateCourse.rejected, handleRejected)
    builder.addCase(deleteCourse.rejected, handleRejected)
  }
})

export const { clearCourses } = coursesSlice.actions
export default coursesSlice.reducer