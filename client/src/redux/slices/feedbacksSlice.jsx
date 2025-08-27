import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper, handlePending, handleRejected } from '../configHelpers'
import { notify } from '../../utils/notifyToast'

// Async actions with createAsyncThunk
export const getFeedbacks = createAsyncThunk("feedbacks/getFeedbacks", async (pageNo, { getState }) =>
  apiCallHelper(`/api/feedbacks?pageNo=${pageNo}`, 'get', null, getState, 'getFeedbacks'))

export const saveFeedback = createAsyncThunk("feedbacks/saveFeedback", async (feedback, { getState }) =>
  apiCallHelper('/api/feedbacks', 'post', feedback, getState, 'saveFeedback'))

// Feedback slice
const initialState = {
  allFeedbacks: [],
  totalPages: 0,
  oneFeedback: '',
  isLoading: false,
  error: null
}

const feedbackSlice = createSlice({
  name: 'feedbacks',
  initialState,
  reducers: {
    clearFeedbacks: state => {
      state.allFeedbacks = []
      state.isLoading = false
    }
  },
  extraReducers: (builder) => {

    // Fullfilled actions
    builder.addCase(getFeedbacks.fulfilled, (state, action) => {
      state.allFeedbacks = action.payload.feedbacks
      state.totalPages = action.payload.totalPages
      state.isLoading = false
    })
    builder.addCase(saveFeedback.fulfilled, (state, action) => {
      state.allFeedbacks.push(action.payload)
      state.isLoading = false
      notify('Your feedback has been received!')
    })

    // Pending actions
    builder.addCase(getFeedbacks.pending, handlePending)
    builder.addCase(saveFeedback.pending, handlePending)

    // Rejected actions
    builder.addCase(getFeedbacks.rejected, handleRejected)
    builder.addCase(saveFeedback.rejected, handleRejected)
  }
})

export const { clearFeedbacks } = feedbackSlice.actions
export default feedbackSlice.reducer