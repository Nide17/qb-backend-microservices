import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper, handlePending, handleRejected } from '../configHelpers'

// Async actions with createAsyncThunk
export const getDownloads = createAsyncThunk("downloads/getDownloads", async (pageNo, { getState }) =>
  apiCallHelper(`/api/downloads?pageNo=${pageNo}`, 'get', null, getState, 'getDownloads'))

export const getCreatorDownloads = createAsyncThunk("downloads/getCreatorDownloads", async (uId, { getState }) =>
  apiCallHelper(`/api/downloads/notes-creator/${uId}`, 'get', null, getState, 'getCreatorDownloads'))

export const getUserDownloads = createAsyncThunk("downloads/getUserDownloads", async (userId, { getState }) =>
  apiCallHelper(`/api/downloads/downloaded-by/${userId}`, 'get', null, getState, 'getUserDownloads'))

export const saveDownload = createAsyncThunk("downloads/saveDownload", async (newDownload, { getState }) =>
  apiCallHelper('/api/downloads', 'post', newDownload, getState, 'saveDownload'))

export const deleteDownload = createAsyncThunk("downloads/deleteDownload", async (downloadID, { getState }) =>
  apiCallHelper(`/api/downloads/${downloadID}`, 'delete', null, getState, 'deleteDownload'))

// Downloads slice
const initialState = {
  isLoading: false,
  totalPages: 0,
  allDownloads: [],
  creatorDownloads: [],
  userDownloads: [],
  error: null
}

const downloadsSlice = createSlice({
  name: 'downloads',
  initialState,
  reducers: {
    clearDownloads: state => {
      state.isLoading = false
      state.totalPages = 0
      state.allDownloads = []
      state.creatorDownloads = []
      state.userDownloads = []
    }
  },
  extraReducers: (builder) => {

    // Pending actions
    builder.addCase(getDownloads.fulfilled, (state, action) => {
      state.allDownloads = action.payload.downloads
      state.totalPages = action.payload.totalPages
      state.isLoading = false
    })
    builder.addCase(getCreatorDownloads.fulfilled, (state, action) => {
      state.creatorDownloads = action.payload
      state.isLoading = false
    })
    builder.addCase(getUserDownloads.fulfilled, (state, action) => {
      state.userDownloads = action.payload
      state.isLoading = false
    })
    builder.addCase(saveDownload.fulfilled, (state, action) => {
      state.allDownloads.push(action.payload)
      state.isLoading = false
    })
    builder.addCase(deleteDownload.fulfilled, (state, action) => {
      state.allDownloads = state.allDownloads.filter(download => download._id !== action.payload)
      state.isLoading = false
    })

    // Pending actions
    builder.addCase(getDownloads.pending, handlePending)
    builder.addCase(getCreatorDownloads.pending, handlePending)
    builder.addCase(getUserDownloads.pending, handlePending)
    builder.addCase(saveDownload.pending, handlePending)
    builder.addCase(deleteDownload.pending, handlePending)

    // Rejected actions
    builder.addCase(getDownloads.rejected, handleRejected)
    builder.addCase(getCreatorDownloads.rejected, handleRejected)
    builder.addCase(getUserDownloads.rejected, handleRejected)
    builder.addCase(saveDownload.rejected, handleRejected)
    builder.addCase(deleteDownload.rejected, handleRejected)
  }
})

export const { clearDownloads } = downloadsSlice.actions
export default downloadsSlice.reducer