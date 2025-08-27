import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper, handlePending, handleRejected } from '../configHelpers'
import { notify } from '../../utils/notifyToast'

// Async actions with createAsyncThunk
export const getSubscribers = createAsyncThunk("subscribers/getSubscribers", async (_, { getState }) =>
  apiCallHelper('/api/subscribed-users', 'get', null, getState, 'getSubscribers'))

export const subscribeToPosts = createAsyncThunk("subscribers/subscribeToPosts", async (subscribedUser, { getState }) =>
  apiCallHelper('/api/subscribed-users', 'post', subscribedUser, getState, 'subscribeToPosts'))

export const deleteSubscriber = createAsyncThunk("subscribers/deleteSubscriber", async (uemail, { getState }) =>
  apiCallHelper(`/api/subscribed-users/${uemail}`, 'delete', null, getState, 'deleteSubscriber'))

// Subscribers slice
const initialState = {
  subscribedUsers: [],
  isLoading: false,
  error: null
}

const subscribersSlice = createSlice({
  name: 'subscribers',
  initialState,
  reducers: {
    clearSubscribers: state => {
      state.subscribedUsers = []
      state.isLoading = false
    }
  },
  extraReducers: (builder) => {

    // Fulfilled actions
    builder.addCase(getSubscribers.fulfilled, (state, action) => {
      state.subscribedUsers = action.payload
      state.isLoading = false
    })
    builder.addCase(subscribeToPosts.fulfilled, (state, action) => {
      state.subscribedUsers.push(action.payload)
      state.isLoading = false
      notify('Thank for subscribing to our posts!')
    })
    builder.addCase(deleteSubscriber.fulfilled, (state, action) => {
      state.subscribedUsers = state.subscribedUsers.filter(subscriber => subscriber.email !== action.payload)
      state.isLoading = false
    })

    // Pending actions
    builder.addCase(getSubscribers.pending, handlePending)
    builder.addCase(subscribeToPosts.pending, handlePending)
    builder.addCase(deleteSubscriber.pending, handlePending)

    // Rejected actions
    builder.addCase(getSubscribers.rejected, handleRejected)
    builder.addCase(subscribeToPosts.rejected, handleRejected)
    builder.addCase(deleteSubscriber.rejected, handleRejected)
  }
})

export const { clearSubscribers } = subscribersSlice.actions
export default subscribersSlice.reducer