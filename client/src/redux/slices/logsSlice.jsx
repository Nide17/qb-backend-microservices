import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper, handlePending, handleRejected } from '../configHelpers'

// Async actions with createAsyncThunk
export const getLogs = createAsyncThunk("logs/getLogs", async (_, { getState }) =>
  apiCallHelper('/api/logs', 'get', null, getState, 'getLogs'))

export const getOneLog = createAsyncThunk("logs/getOneLog", async (logId, { getState }) =>
  apiCallHelper(`/api/logs/${logId}`, 'get', null, getState, 'getOneLog'))

export const deleteLog = createAsyncThunk("logs/deleteLog", async (id, { getState }) =>
  apiCallHelper(`/api/logs/${id}`, 'delete', null, getState, 'deleteLog'))

// Logs slice
const initialState = {
  isLoading: false,
  log: null,
  logs: [],
  error: null
}

const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    clearLogs: state => {
      isLoading = false
      state.log = null
      state.logs = []
    }
  },
  extraReducers: (builder) => {

    // Fullfilled actions
    builder.addCase(getLogs.fulfilled, (state, action) => {
      state.logs = action.payload
      isLoading = false
    })
    builder.addCase(getOneLog.fulfilled, (state, action) => {
      state.log = action.payload
      isLoading = false
    })
    builder.addCase(deleteLog.fulfilled, (state, action) => {
      state.logs = state.logs.filter(log => log._id !== action.payload)
      isLoading = false
    })

    // Pending actions
    builder.addCase(getLogs.pending, handlePending)
    builder.addCase(getOneLog.pending, handlePending)
    builder.addCase(deleteLog.pending, handlePending)

    // Rejected actions
    builder.addCase(getLogs.rejected, handleRejected)
    builder.addCase(getOneLog.rejected, handleRejected)
    builder.addCase(deleteLog.rejected, handleRejected)
  }
})

export const { clearLogs } = logsSlice.actions
export default logsSlice.reducer