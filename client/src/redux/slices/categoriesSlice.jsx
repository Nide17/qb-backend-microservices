import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper, handlePending, handleRejected } from '../configHelpers'

// Async actions with createAsyncThunk
export const getCategories = createAsyncThunk("categories/getCategories", async (_, { getState }) =>
  apiCallHelper('/api/categories', 'get', null, getState, 'getCategories'))

export const getOneCategory = createAsyncThunk("categories/getOneCategory", async (categoryID, { getState }) =>
  apiCallHelper(`/api/categories/${categoryID}`, 'get', null, getState, 'getOneCategory'))

export const createCategory = createAsyncThunk("categories/createCategory", async (newCategory, { getState }) =>
  apiCallHelper('/api/categories', 'post', newCategory, getState, 'createCategory'))

export const updateCategory = createAsyncThunk("categories/updateCategory", async (updatedCatg, { getState }) =>
  apiCallHelper(`/api/categories/${updatedCatg.catID}`, 'put', updatedCatg, getState, 'updateCategory'))

export const deleteCategory = createAsyncThunk("categories/deleteCategory", async (catID, { getState }) =>
  apiCallHelper(`/api/categories/${catID}`, 'delete', null, getState, 'deleteCategory'))

// Categories slice
const initialState = {
  allcategories: [],
  isLoading: false,
  oneCategory: '',
  error: null
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategories: state => {
      state.allcategories = []
      state.isLoading = false
      state.oneCategory = ''
    }
  },
  extraReducers: (builder) => {

    // Fullfilled actions
    builder.addCase(getCategories.fulfilled, (state, action) => {
      state.allcategories = action.payload
      state.isLoading = false
    })
    builder.addCase(getOneCategory.fulfilled, (state, action) => {
      state.oneCategory = action.payload
      state.isLoading = false
    })
    builder.addCase(createCategory.fulfilled, (state, action) => {
      state.allcategories.push(action.payload)
      state.isLoading = false
    })
    builder.addCase(updateCategory.fulfilled, (state, action) => {
      state.allcategories = state.allcategories.map(category => category._id === action.payload._id ? action.payload : category)
      state.isLoading = false
    })
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.allcategories = state.allcategories.filter(category => category._id !== action.payload)
      state.isLoading = false
    })

    // Pending actions
    builder.addCase(getCategories.pending, handlePending)
    builder.addCase(getOneCategory.pending, handlePending)
    builder.addCase(createCategory.pending, handlePending)
    builder.addCase(updateCategory.pending, handlePending)
    builder.addCase(deleteCategory.pending, handlePending)

    // Rejected actions
    builder.addCase(getCategories.rejected, handleRejected)
    builder.addCase(getOneCategory.rejected, handleRejected)
    builder.addCase(createCategory.rejected, handleRejected)
    builder.addCase(updateCategory.rejected, handleRejected)
    builder.addCase(deleteCategory.rejected, handleRejected)
  }
})

export const { clearCategories } = categoriesSlice.actions
export default categoriesSlice.reducer