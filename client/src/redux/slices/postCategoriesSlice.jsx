import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper, handlePending, handleRejected } from '../configHelpers'

// Async actions with createAsyncThunk
export const getPostCategories = createAsyncThunk("postCategories/getPostCategories", async (_, { getState }) =>
  apiCallHelper('/api/post-categories', 'get', null, getState, 'getPostCategories'))

export const createPostCategory = createAsyncThunk("postCategories/createPostCategory", async (newPostCategory, { getState }) =>
  apiCallHelper('/api/post-categories', 'post', newPostCategory, getState, 'createPostCategory'))

export const updatePostCategory = createAsyncThunk("postCategories/updatePostCategory", async (updatedPostCatg, { getState }) =>
  apiCallHelper(`/api/post-categories/${updatedPostCatg.idToUpdate}`, 'put', updatedPostCatg, getState, 'updatePostCategory'))

export const deletePostCategory = createAsyncThunk("postCategories/deletePostCategory", async (postCatgID, { getState }) =>
  apiCallHelper(`/api/post-categories/${postCatgID}`, 'delete', null, getState, 'deletePostCategory'))

// Post categories slice
const initialState = {
  allPostCategories: [],
  isLoading: false,
  error: null
}

const postCategoriesSlice = createSlice({
  name: 'postCategories',
  initialState,
  reducers: {
    clearPostCategories: state => {
      state.allPostCategories = []
      state.isLoading = false
    }
  },
  extraReducers: (builder) => {

    // Fullfilled actions
    builder.addCase(getPostCategories.fulfilled, (state, action) => {
      state.allPostCategories = action.payload
      state.isLoading = false
    })
    builder.addCase(createPostCategory.fulfilled, (state, action) => {
      state.allPostCategories.push(action.payload)
      state.isLoading = false
    })
    builder.addCase(updatePostCategory.fulfilled, (state, action) => {
      state.allPostCategories = state.allPostCategories.map(postCategory => postCategory._id === action.payload._id ? action.payload : postCategory)
      state.isLoading = false
    })
    builder.addCase(deletePostCategory.fulfilled, (state, action) => {
      state.allPostCategories = state.allPostCategories.filter(postCategory => postCategory._id !== action.payload)
      state.isLoading = false
    })

    // Pending actions
    builder.addCase(getPostCategories.pending, handlePending)
    builder.addCase(createPostCategory.pending, handlePending)
    builder.addCase(updatePostCategory.pending, handlePending)
    builder.addCase(deletePostCategory.pending, handlePending)

    // Rejected actions
    builder.addCase(getPostCategories.rejected, handleRejected)
    builder.addCase(createPostCategory.rejected, handleRejected)
    builder.addCase(updatePostCategory.rejected, handleRejected)
    builder.addCase(deletePostCategory.rejected, handleRejected)
  }
})

export const { clearPostCategories } = postCategoriesSlice.actions
export default postCategoriesSlice.reducer