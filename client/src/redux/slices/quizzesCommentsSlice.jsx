import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper } from '../configHelpers'

// Async actions with createAsyncThunk
export const getAllQuizzesComments = createAsyncThunk("quizzesComments/getAllQuizzesComments", async (_, { getState }) =>
  apiCallHelper('/api/quizzes-comments', 'get', null, getState, 'getAllQuizzesComments'))

export const getOneQuizComments = createAsyncThunk("quizzesComments/getOneQuizComments", async (quizID, { getState }) =>
  apiCallHelper(`/api/quizzes-comments/quiz/${quizID}`, 'get', null, getState, 'getOneQuizComments'))

export const getOneComment = createAsyncThunk("quizzesComments/getOneComment", async (commentId, { getState }) =>
  apiCallHelper(`/api/quizzes-comments/${commentId}`, 'get', null, getState, 'getOneComment'))

export const createComment = createAsyncThunk("quizzesComments/createComment", async (newComment, { getState }) =>
  apiCallHelper('/api/quizzes-comments', 'post', newComment, getState, 'createComment'))

export const updateComment = createAsyncThunk("quizzesComments/updateComment", async (updatedComment, { getState }) =>
  apiCallHelper(`/api/quizzes-comments/${updatedComment.commentID}`, 'put', updatedComment, getState, 'updateComment'))

export const deleteComment = createAsyncThunk("quizzesComments/deleteComment", async (commentId, { getState }) =>
  apiCallHelper(`/api/quizzes-comments/${commentId}`, 'delete', null, getState, 'deleteComment'))


// Quiz Comments slice
const initialState = {
  allQuizzesComments: [],
  isLoading: {
    allQuizzesComments: false,
    quizzesComments: false,
    oneComment: false,
  },
  oneComment: '',
  oneQuizComments: [],
  error: null
}

const handlePending = (state, actionType) => {
  state.isLoading[actionType] = true;
};

const handleFulfilled = (state, action, actionType, dataKey) => {
  state[dataKey] = action.payload;
  state.isLoading[actionType] = false;
};

const handleRejected = (state, action, actionType) => {
  state.isLoading[actionType] = false;
  state.error = action.error.message;
};

const quizzesCommentsSlice = createSlice({
  name: 'quizzesComments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllQuizzesComments.pending, (state) => handlePending(state, 'allQuizzesComments'))
      .addCase(getAllQuizzesComments.fulfilled, (state, action) => handleFulfilled(state, action, 'allQuizzesComments', 'allQuizzesComments'))
      .addCase(getAllQuizzesComments.rejected, (state, action) => handleRejected(state, action, 'allQuizzesComments'))

      .addCase(getOneQuizComments.pending, (state) => handlePending(state, 'quizzesComments'))
      .addCase(getOneQuizComments.fulfilled, (state, action) => handleFulfilled(state, action, 'quizzesComments', 'oneQuizComments'))
      .addCase(getOneQuizComments.rejected, (state, action) => handleRejected(state, action, 'quizzesComments'))

      .addCase(getOneComment.pending, (state) => handlePending(state, 'oneComment'))
      .addCase(getOneComment.fulfilled, (state, action) => handleFulfilled(state, action, 'oneComment', 'oneComment'))
      .addCase(getOneComment.rejected, (state, action) => handleRejected(state, action, 'oneComment'))

      .addCase(createComment.pending, (state) => handlePending(state, 'allQuizzesComments'))
      .addCase(createComment.fulfilled, (state, action) => {
        state.allQuizzesComments.push(action.payload);
        state.isLoading.allQuizzesComments = false;
      })
      .addCase(createComment.rejected, (state, action) => handleRejected(state, action, 'allQuizzesComments'))

      .addCase(updateComment.pending, (state) => handlePending(state, 'allQuizzesComments'))
      .addCase(updateComment.fulfilled, (state, action) => {
        state.allQuizzesComments = state.allQuizzesComments.map(comment => comment._id === action.payload._id ? action.payload : comment);
        state.isLoading.allQuizzesComments = false;
      })
      .addCase(updateComment.rejected, (state, action) => handleRejected(state, action, 'allQuizzesComments'))

      .addCase(deleteComment.pending, (state) => handlePending(state, 'allQuizzesComments'))
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.allQuizzesComments = state.allQuizzesComments.filter(comment => comment._id !== action.payload);
        state.isLoading.allQuizzesComments = false;
      })
      .addCase(deleteComment.rejected, (state, action) => handleRejected(state, action, 'allQuizzesComments'));
  }
});

export default quizzesCommentsSlice.reducer;
