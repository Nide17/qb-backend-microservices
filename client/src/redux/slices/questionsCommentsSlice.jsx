import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper } from '../configHelpers'

// Async actions with createAsyncThunk
export const getAllQuestionsComments = createAsyncThunk("questionsComments/getAllQuestionsComments", async (_, { getState }) =>
  apiCallHelper('/api/questions-comments', 'get', null, getState, 'getAllQuestionsComments'))

export const getPaginatedQuestionsComments = createAsyncThunk("questionsComments/getPaginatedQuestionsComments", async (pageNo, { getState }) =>
  apiCallHelper(`/api/questions-comments/paginated/?pageNo=${pageNo}`, 'get', null, getState, 'getPaginatedQuestionsComments'))

export const getPendingQnsComments = createAsyncThunk("questionsComments/getPendingQnsComments", async (_, { getState }) =>
  apiCallHelper(`/api/questions-comments/pending`, 'get', null, getState, 'getPendingQnsComments'))

export const getCommentsByQuiz = createAsyncThunk("questionsComments/getCommentsByQuiz", async (quizID, { getState }) =>
  apiCallHelper(`/api/questions-comments/quiz/${quizID}`, 'get', null, getState, 'getCommentsByQuiz'))

export const getOneQuestionComments = createAsyncThunk("questionsComments/getOneQuestionComments", async (questionID, { getState }) =>
  apiCallHelper(`/api/questions-comments/comments-on/${questionID}`, 'get', null, getState, 'getOneQuestionComments'))

export const getOneComment = createAsyncThunk("questionsComments/getOneComment", async (commentId, { getState }) =>
  apiCallHelper(`/api/questions-comments/${commentId}`, 'get', null, getState, 'getOneComment'))

export const createComment = createAsyncThunk("questionsComments/createComment", async (newComment, { getState }) =>
  apiCallHelper('/api/questions-comments', 'post', newComment, getState, 'createComment'))

export const updateComment = createAsyncThunk("questionsComments/updateComment", async (updatedComment, { getState }) =>
  apiCallHelper(`/api/questions-comments/${updatedComment.commentID}`, 'put', updatedComment, getState, 'updateComment'))

export const approveComment = createAsyncThunk("questionsComments/approveComment", async (approvedComment, { getState }) =>
  apiCallHelper(`/api/questions-comments/approve/${approvedComment.commentID}`, 'put', approvedComment, getState, 'approveComment'))

export const rejectComment = createAsyncThunk("questionsComments/rejectComment", async (rejectedComment, { getState }) =>
  apiCallHelper(`/api/questions-comments/reject/${rejectedComment.commentID}`, 'put', rejectedComment, getState, 'rejectComment'))

export const deleteComment = createAsyncThunk("questionsComments/deleteComment", async (id, { getState }) =>
  apiCallHelper(`/api/comments/${id}`, 'delete', null, getState, 'deleteComment'))

// Helper function to handle fulfilled cases
const handleFulfilled = (state, action, key) => {
  state[key] = action.payload
  state.isLoading[key] = false
}

// Helper function to handle pending cases
const handlePending = (state, key) => {
  state.isLoading[key] = true
}

// Helper function to handle rejected cases
const handleRejected = (state, action, key) => {
  state.isLoading[key] = false
  state.error = action.error.message
}

// QuestionsComments slice
const initialState = {
  allQuestionsComments: [],
  commentsByQuiz: [],
  isLoading: {
    allQuestionsComments: false,
    commentsByQuiz: false,
    oneComment: false,
    oneQuestionComments: false,
    paginatedComments: false,
    pendingComments: false,
  },
  oneComment: '',
  oneQuestionComments: [],
  paginatedComments: [],
  pendingComments: [],
  error: null
}

const questionsCommentsSlice = createSlice({
  name: 'questionsComments',
  initialState,
  reducers: {
    clearComments: state => {
      state.allQuestionsComments = []
      state.isLoading.allQuestionsComments = false
    },
    clearCommentsByQuiz: state => {
      state.commentsByQuiz = []
      state.isLoading.commentsByQuiz = false
    },
    clearOneComment: state => {
      state.oneComment = ''
      state.isLoading.oneComment = false
    },
    clearQuestionsComments: state => {
      state.oneQuestionComments = []
      state.isLoading.oneQuestionComments = false
    },
    clearPaginatedComments: state => {
      state.paginatedComments = []
      state.isLoading.paginatedComments = false
    },
    clearPendingComments: state => {
      state.pendingComments = []
      state.isLoading.pendingComments = false
    }
  },
  extraReducers: (builder) => {
    // Fulfilled actions
    builder.addCase(getAllQuestionsComments.fulfilled, (state, action) => handleFulfilled(state, action, 'allQuestionsComments'))
    builder.addCase(getPaginatedQuestionsComments.fulfilled, (state, action) => handleFulfilled(state, action, 'paginatedComments'))
    builder.addCase(getPendingQnsComments.fulfilled, (state, action) => handleFulfilled(state, action, 'pendingComments'))
    builder.addCase(getCommentsByQuiz.fulfilled, (state, action) => handleFulfilled(state, action, 'commentsByQuiz'))
    builder.addCase(getOneQuestionComments.fulfilled, (state, action) => handleFulfilled(state, action, 'oneQuestionComments'))
    builder.addCase(getOneComment.fulfilled, (state, action) => handleFulfilled(state, action, 'oneComment'))
    builder.addCase(createComment.fulfilled, (state, action) => {
      state.allQuestionsComments.push(action.payload)
      state.isLoading.allQuestionsComments = false
    })
    builder.addCase(updateComment.fulfilled, (state, action) => {
      state.allQuestionsComments = state.allQuestionsComments.map(comment => comment._id === action.payload._id ? action.payload : comment)
      state.isLoading.allQuestionsComments = false
    })
    builder.addCase(approveComment.fulfilled, (state, action) => {
      state.allQuestionsComments = state.allQuestionsComments.map(comment => comment._id === action.payload._id ? action.payload : comment)
      state.isLoading.allQuestionsComments = false
    })
    builder.addCase(rejectComment.fulfilled, (state, action) => {
      state.allQuestionsComments = state.allQuestionsComments.map(comment => comment._id === action.payload._id ? action.payload : comment)
      state.isLoading.allQuestionsComments = false
    })
    builder.addCase(deleteComment.fulfilled, (state, action) => {
      state.allQuestionsComments = state.allQuestionsComments.filter(comment => comment._id !== action.payload)
      state.isLoading.allQuestionsComments = false
    })

    // Pending actions
    builder.addCase(getAllQuestionsComments.pending, (state) => handlePending(state, 'allQuestionsComments'))
    builder.addCase(getPaginatedQuestionsComments.pending, (state) => handlePending(state, 'paginatedComments'))
    builder.addCase(getPendingQnsComments.pending, (state) => handlePending(state, 'pendingComments'))
    builder.addCase(getCommentsByQuiz.pending, (state) => handlePending(state, 'commentsByQuiz'))
    builder.addCase(getOneQuestionComments.pending, (state) => handlePending(state, 'oneQuestionComments'))
    builder.addCase(getOneComment.pending, (state) => handlePending(state, 'oneComment'))
    builder.addCase(createComment.pending, (state) => handlePending(state, 'allQuestionsComments'))
    builder.addCase(updateComment.pending, (state) => handlePending(state, 'allQuestionsComments'))
    builder.addCase(approveComment.pending, (state) => handlePending(state, 'allQuestionsComments'))
    builder.addCase(rejectComment.pending, (state) => handlePending(state, 'allQuestionsComments'))
    builder.addCase(deleteComment.pending, (state) => handlePending(state, 'allQuestionsComments'))

    // Rejected actions
    builder.addCase(getAllQuestionsComments.rejected, (state, action) => handleRejected(state, action, 'allQuestionsComments'))
    builder.addCase(getPaginatedQuestionsComments.rejected, (state, action) => handleRejected(state, action, 'paginatedComments'))
    builder.addCase(getPendingQnsComments.rejected, (state, action) => handleRejected(state, action, 'pendingComments'))
    builder.addCase(getCommentsByQuiz.rejected, (state, action) => handleRejected(state, action, 'commentsByQuiz'))
    builder.addCase(getOneQuestionComments.rejected, (state, action) => handleRejected(state, action, 'oneQuestionComments'))
    builder.addCase(getOneComment.rejected, (state, action) => handleRejected(state, action, 'oneComment'))
    builder.addCase(createComment.rejected, (state, action) => handleRejected(state, action, 'allQuestionsComments'))
    builder.addCase(updateComment.rejected, (state, action) => handleRejected(state, action, 'allQuestionsComments'))
    builder.addCase(approveComment.rejected, (state, action) => handleRejected(state, action, 'allQuestionsComments'))
    builder.addCase(rejectComment.rejected, (state, action) => handleRejected(state, action, 'allQuestionsComments'))
    builder.addCase(deleteComment.rejected, (state, action) => handleRejected(state, action, 'allQuestionsComments'))
  }
})

export const { clearComments, clearCommentsByQuiz, clearOneComment, clearQuestionsComments, clearPaginatedComments, clearPendingComments } = questionsCommentsSlice.actions
export default questionsCommentsSlice.reducer