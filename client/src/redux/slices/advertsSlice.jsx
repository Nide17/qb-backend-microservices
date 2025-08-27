import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper, apiCallHelperUpload, handlePending, handleRejected } from '../configHelpers'

// Async actions with createAsyncThunk
export const getAdverts = createAsyncThunk("adverts/getAdverts", async (_, { getState }) =>
  apiCallHelper('/api/adverts', 'get', null, getState, 'getAdverts'))

export const getActiveAdverts = createAsyncThunk("adverts/getActiveAdverts", async (_, { getState }) =>
  apiCallHelper('/api/adverts/active', 'get', null, getState, 'getActiveAdverts'))

export const getOneAdvert = createAsyncThunk("adverts/getOneAdvert", async (AdvertID, { getState }) =>
  apiCallHelper(`/api/adverts/${AdvertID}`, 'get', null, getState, 'getOneAdvert'))

export const createAdvert = createAsyncThunk("adverts/createAdvert", async (formData, { getState }) =>
  apiCallHelperUpload('/api/adverts', 'post', formData, getState, 'createAdvert'))

export const changeStatus = createAsyncThunk("adverts/changeStatus", async (advert, { getState }) =>
  apiCallHelper(`/api/adverts/status/${advert.advertID}`, 'put', advert, getState, 'changeStatus'))

export const updateAdvert = createAsyncThunk("adverts/updateAdvert", async (updatedAdvert, { getState }) =>
  apiCallHelper(`/api/adverts/${updatedAdvert.AdvertID}`, 'put', updatedAdvert, getState, 'updateAdvert'))

export const deleteAdvert = createAsyncThunk("adverts/deleteAdvert", async (id, { getState }) =>
  apiCallHelper(`/api/adverts/${id}`, 'delete', null, getState, 'deleteAdvert'))

// Adverts slice
const initialState = {
  allAdverts: [],
  activeAdverts: [],
  isLoading: false,
  oneAdvert: '',
  error: null
}

const advertsSlice = createSlice({
  name: 'adverts',
  initialState,
  reducers: {
    clearAdverts: state => {
      state.allAdverts = []
      state.activeAdverts = []
      state.isLoading = false
      state.oneAdvert = '',
        state.error = null
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getAdverts.fulfilled, (state, action) => {
      state.allAdverts = action.payload
      state.isLoading = false
    })
    builder.addCase(getActiveAdverts.fulfilled, (state, action) => {
      state.activeAdverts = action.payload
      state.isLoading = false
    })
    builder.addCase(getOneAdvert.fulfilled, (state, action) => {
      state.oneAdvert = action.payload
      state.isLoading = false
    })
    builder.addCase(createAdvert.fulfilled, (state, action) => {
      state.allAdverts.push(action.payload)
      state.isLoading = false
    })
    builder.addCase(changeStatus.fulfilled, (state, action) => {
      state.activeAdverts = state.activeAdverts.map(advert => 
        advert._id === action.payload._id ? action.payload : advert
      );
      state.isLoading = false;
    })
    builder.addCase(updateAdvert.fulfilled, (state, action) => {
      state.allAdverts = state.allAdverts.map(advert => advert._id === action.payload._id ? action.payload : advert)
      state.isLoading = false
    })
    builder.addCase(deleteAdvert.fulfilled, (state, action) => {
      state.allAdverts = state.allAdverts.filter(advert => advert._id !== action.payload)
      state.activeAdverts = state.activeAdverts.filter(advert => advert._id !== action.payload)
      state.isLoading = false
    })

    // Pending actions
    builder.addCase(getAdverts.pending, handlePending)
    builder.addCase(getActiveAdverts.pending, handlePending)
    builder.addCase(getOneAdvert.pending, handlePending)
    builder.addCase(createAdvert.pending, handlePending)
    builder.addCase(changeStatus.pending, handlePending)
    builder.addCase(updateAdvert.pending, handlePending)
    builder.addCase(deleteAdvert.pending, handlePending)
    
    // Rejected actions
    builder.addCase(getAdverts.rejected, handleRejected)
    builder.addCase(getActiveAdverts.rejected, handleRejected)
    builder.addCase(getOneAdvert.rejected, handleRejected)
    builder.addCase(createAdvert.rejected, handleRejected)
    builder.addCase(changeStatus.rejected, handleRejected)
    builder.addCase(updateAdvert.rejected, handleRejected)
    builder.addCase(deleteAdvert.rejected, handleRejected)

  }
})

export const { clearAdverts } = advertsSlice.actions
export default advertsSlice.reducer
