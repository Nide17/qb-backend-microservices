import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper, handlePending, handleRejected } from '../configHelpers'

// Async actions with createAsyncThunk
export const getBlogPostsViews = createAsyncThunk("blogPostsViews/getBlogPostsViews", async ({ limit, skip }, { getState }) =>
  apiCallHelper(`/api/blog-posts-views?limit=${limit}&skip=${skip ? skip : 0}`, 'get', null, getState, 'getBlogPostsViews'))

export const getRecentTenViews = createAsyncThunk("blogPostsViews/getRecentTenViews", async (_, { getState }) =>
  apiCallHelper('/api/blog-posts-views/recentTen', 'get', null, getState, 'getRecentTenViews'))

export const getOneBlogPostView = createAsyncThunk("blogPostsViews/getOneBlogPostView", async (id, { getState }) =>
  apiCallHelper(`/api/blog-posts-views/${id}`, 'get', null, getState, 'getOneBlogPostView'))

export const createBlogPostView = createAsyncThunk("blogPostsViews/createBlogPostView", async (newBlogPostView, { getState }) =>
  apiCallHelper('/api/blog-posts-views', 'post', newBlogPostView, getState, 'createBlogPostView'))

export const updateBlogPostView = createAsyncThunk("blogPostsViews/updateBlogPostView", async (updatedBPV, { getState }) =>
  apiCallHelper(`/api/blog-posts-views/${updatedBPV.blogPostViewID}`, 'put', updatedBPV, getState, 'updateBlogPostView'))

export const deleteBlogPostView = createAsyncThunk("blogPostsViews/deleteBlogPostView", async (id, { getState }) =>
  apiCallHelper(`/api/blog-posts-views/${id}`, 'delete', null, getState, 'deleteBlogPostView'))

// Blog posts views slice
const initialState = {
  allBlogPostsViews: [],
  recentTenViews: [],
  oneBlogPostView: '',
  blogPostsByCategory: [],
  isLoading: false,
  error: null
}

const blogPostsViewsSlice = createSlice({
  name: 'blogPostsViews',
  initialState,
  reducers: {
    clearBlogPostsViews: state => {
      state.allBlogPostsViews = []
      state.recentTenViews = []
      state.oneBlogPostView = ''
      state.blogPostsByCategory = []
      state.isLoading = false
    }
  },
  extraReducers: (builder) => {

    // Fullfilled actions
    builder.addCase(getBlogPostsViews.fulfilled, (state, action) => {
      state.allBlogPostsViews = action.payload
      state.isLoading = false
    })
    builder.addCase(getRecentTenViews.fulfilled, (state, action) => {
      state.recentTenViews = action.payload
      state.isLoading = false
    })
    builder.addCase(getOneBlogPostView.fulfilled, (state, action) => {
      state.oneBlogPostView = action.payload
      state.isLoading = false
    })
    builder.addCase(createBlogPostView.fulfilled, (state, action) => {
      state.allBlogPostsViews.push(action.payload)
      state.isLoading = false
    })
    builder.addCase(updateBlogPostView.fulfilled, (state, action) => {
      state.allBlogPostsViews = state.allBlogPostsViews.map(blogPostView => blogPostView._id === action.payload._id ? action.payload : blogPostView)
      state.isLoading = false
    })
    builder.addCase(deleteBlogPostView.fulfilled, (state, action) => {
      state.allBlogPostsViews = state.allBlogPostsViews.filter(blogPostView => blogPostView._id !== action.payload)
      state.isLoading = false
    })

    // Pending actions
    builder.addCase(getBlogPostsViews.pending, handlePending)
    builder.addCase(getRecentTenViews.pending, handlePending)
    builder.addCase(getOneBlogPostView.pending, handlePending)
    builder.addCase(createBlogPostView.pending, handlePending)
    builder.addCase(updateBlogPostView.pending, handlePending)
    builder.addCase(deleteBlogPostView.pending, handlePending)

    // Rejected actions
    builder.addCase(getBlogPostsViews.rejected, handleRejected)
    builder.addCase(getRecentTenViews.rejected, handleRejected)
    builder.addCase(getOneBlogPostView.rejected, handleRejected)
    builder.addCase(createBlogPostView.rejected, handleRejected)
    builder.addCase(updateBlogPostView.rejected, handleRejected)
    builder.addCase(deleteBlogPostView.rejected, handleRejected)
  }
})

export const { clearBlogPostsViews } = blogPostsViewsSlice.actions
export default blogPostsViewsSlice.reducer