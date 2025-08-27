import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper, handlePending, handleRejected } from '../configHelpers'

// Async actions with createAsyncThunk
export const getFaqs = createAsyncThunk("faqs/getFaqs", async (_, { getState }) =>
  apiCallHelper('/api/faqs', 'get', null, getState, 'getFaqs'))

export const getOneFaq = createAsyncThunk("faqs/getOneFaq", async (faqId, { getState }) =>
  apiCallHelper(`/api/faqs/${faqId}`, 'get', null, getState, 'getOneFaq'))

export const createFq = createAsyncThunk("faqs/createFq", async (newFaq, { getState }) =>
  apiCallHelper('/api/faqs', 'post', newFaq, getState, 'createFq'))

export const updateFaq = createAsyncThunk("faqs/updateFaq", async (updatedFaq, { getState }) =>
  apiCallHelper(`/api/faqs/${updatedFaq.faqID}`, 'put', updatedFaq, getState, 'updateFaq'))

export const addFaqVidLink = createAsyncThunk("faqs/addFaqVidLink", async ({ newVidLink, faqID }, { getState }) =>
  apiCallHelper(`/api/faqs/add-video/${faqID}`, 'put', newVidLink, getState, 'addFaqVidLink'))

export const deleteFaqVideo = createAsyncThunk("faqs/deleteFaqVideo", async ({ vidData, vId }, { getState }) =>
  apiCallHelper(`/api/faqs/delete-video/${vId}`, 'put', vidData, getState, 'deleteFaqVideo'))

export const deleteFaq = createAsyncThunk("faqs/deleteFaq", async (id, { getState }) =>
  apiCallHelper(`/api/faqs/${id}`, 'delete', null, getState, 'deleteFaq'))

// Faqs slice
const initialState = {
  allFaqs: [],
  isLoading: false,
  oneFaq: '',
  error: null
}

const faqsSlice = createSlice({
  name: 'faqs',
  initialState,
  reducers: {
    clearFaqs: state => {
      state.allFaqs = []
      state.isLoading = false
      state.oneFaq = ''
    }
  },
  extraReducers: (builder) => {

    // Fullfilled actions
    builder.addCase(getFaqs.fulfilled, (state, action) => {
      state.allFaqs = action.payload
      state.isLoading = false
    })
    builder.addCase(getOneFaq.fulfilled, (state, action) => {
      state.oneFaq = action.payload
      state.isLoading = false
    })
    builder.addCase(createFq.fulfilled, (state, action) => {
      state.allFaqs.push(action.payload)
      state.isLoading = false
    })
    builder.addCase(updateFaq.fulfilled, (state, action) => {
      state.allFaqs = state.allFaqs.map(faq => faq._id === action.payload._id ? action.payload : faq)
      state.isLoading = false
    })
    builder.addCase(addFaqVidLink.fulfilled, (state, action) => {
      state.allFaqs = state.allFaqs.map(faq => faq._id === action.payload._id ? action.payload : faq)
      state.isLoading = false
    })
    builder.addCase(deleteFaqVideo.fulfilled, (state, action) => {
      state.allFaqs = state.allFaqs.map(faq => faq._id === action.payload._id ? action.payload : faq)
      state.isLoading = false
    })
    builder.addCase(deleteFaq.fulfilled, (state, action) => {
      state.allFaqs = state.allFaqs.filter(faq => faq._id !== action.payload)
      state.isLoading = false
    })

    // Pending actions
    builder.addCase(getFaqs.pending, handlePending)
    builder.addCase(getOneFaq.pending, handlePending)
    builder.addCase(createFq.pending, handlePending)
    builder.addCase(updateFaq.pending, handlePending)
    builder.addCase(addFaqVidLink.pending, handlePending)
    builder.addCase(deleteFaqVideo.pending, handlePending)
    builder.addCase(deleteFaq.pending, handlePending)

    // Rejected actions
    builder.addCase(getFaqs.rejected, handleRejected)
    builder.addCase(getOneFaq.rejected, handleRejected)
    builder.addCase(createFq.rejected, handleRejected)
    builder.addCase(updateFaq.rejected, handleRejected)
    builder.addCase(addFaqVidLink.rejected, handleRejected)
    builder.addCase(deleteFaqVideo.rejected, handleRejected)
    builder.addCase(deleteFaq.rejected, handleRejected)
  }
})

export const { clearFaqs } = faqsSlice.actions
export default faqsSlice.reducer