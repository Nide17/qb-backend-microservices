import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper, handlePending, handleRejected } from '../configHelpers'

// Async actions with createAsyncThunk
export const getFaculties = createAsyncThunk("faculties/getFaculties", async (_, { getState }) =>
  apiCallHelper('/api/faculties', 'get', null, getState, 'getFaculties'))

export const fetchLevelFaculties = createAsyncThunk("faculties/fetchLevelFaculties", async (levelID, { getState }) =>
  apiCallHelper(`/api/faculties/level/${levelID}`, 'get', null, getState, 'fetchLevelFaculties'))

export const createFaculty = createAsyncThunk("faculties/createFaculty", async (newFaculty, { getState }) =>
  apiCallHelper('/api/faculties', 'post', newFaculty, getState, 'createFaculty'))

export const updateFaculty = createAsyncThunk("faculties/updateFaculty", async (updatedFac, { getState }) =>
  apiCallHelper(`/api/faculties/${updatedFac.idToUpdate}`, 'put', updatedFac, getState, 'updateFaculty'))

export const deleteFaculty = createAsyncThunk("faculties/deleteFaculty", async (facultyID, { getState }) =>
  apiCallHelper(`/api/faculties/${facultyID}`, 'delete', null, getState, 'deleteFaculty'))

// Faculties slice
const initialState = {
  allFaculties: [],
  levelFaculties: [],
  isLoading: false,
  error: null
}

const facultiesSlice = createSlice({
  name: 'faculties',
  initialState,
  reducers: {
    clearFaculties: state => {
      state.allFaculties = []
      state.levelFaculties = []
      state.isLoading = false
    }
  },
  extraReducers: (builder) => {

    // Fullfilled actions
    builder.addCase(getFaculties.fulfilled, (state, action) => {
      state.allFaculties = action.payload
      state.isLoading = false
    })
    builder.addCase(fetchLevelFaculties.fulfilled, (state, action) => {
      state.levelFaculties = action.payload
      state.isLoading = false
    })
    builder.addCase(createFaculty.fulfilled, (state, action) => {
      state.allFaculties.push(action.payload)
      state.isLoading = false
    })
    builder.addCase(updateFaculty.fulfilled, (state, action) => {
      state.allFaculties = state.allFaculties.map(faculty => faculty._id === action.payload._id ? action.payload : faculty)
      state.isLoading = false
    })
    builder.addCase(deleteFaculty.fulfilled, (state, action) => {
      state.allFaculties = state.allFaculties.filter(faculty => faculty._id !== action.payload)
      state.isLoading = false
    })

    // Pending actions
    builder.addCase(getFaculties.pending, handlePending)
    builder.addCase(fetchLevelFaculties.pending, handlePending)
    builder.addCase(createFaculty.pending, handlePending)
    builder.addCase(updateFaculty.pending, handlePending)
    builder.addCase(deleteFaculty.pending, handlePending)

    // Rejected actions
    builder.addCase(getFaculties.rejected, handleRejected)
    builder.addCase(fetchLevelFaculties.rejected, handleRejected)
    builder.addCase(createFaculty.rejected, handleRejected)
    builder.addCase(updateFaculty.rejected, handleRejected)
    builder.addCase(deleteFaculty.rejected, handleRejected)
  }
})

export const { clearFaculties } = facultiesSlice.actions
export default facultiesSlice.reducer