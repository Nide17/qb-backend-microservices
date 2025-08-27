import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper, handlePending, handleRejected } from '../configHelpers'

// Async actions with createAsyncThunk
export const setScores = createAsyncThunk("scores/setScores", async (pageNo, { getState }) =>
  apiCallHelper(`/api/scores?pageNo=${pageNo}`, 'get', null, getState, 'setScores'))

export const setRankingScores = createAsyncThunk("scores/setRankingScores", async (quizID, { getState }) =>
  apiCallHelper(`/api/scores/ranking/${quizID}`, 'get', null, getState, 'setRankingScores'))

export const getTakerScores = createAsyncThunk("scores/getTakerScores", async (takerId, { getState }) =>
  apiCallHelper(`/api/scores/taken-by/${takerId}`, 'get', null, getState, 'getTakerScores'))

export const getCreatorScores = createAsyncThunk("scores/getCreatorScores", async (uId, { getState }) =>
  apiCallHelper(`/api/scores/quiz-creator/${uId}`, 'get', null, getState, 'getCreatorScores'))

export const getOneScore = createAsyncThunk("scores/getOneScore", async (scoreId, { getState }) =>
  apiCallHelper(`/api/scores/${scoreId}`, 'get', null, getState, 'getOneScore'))

export const getPopularToday = createAsyncThunk("scores/getPopularToday", async (_, { getState }) =>
  apiCallHelper('/api/scores/popular-quizes', 'get', null, getState, 'getPopularToday'))

export const getUserOfMonth = createAsyncThunk("scores/getUserOfMonth", async (_, { getState }) =>
  apiCallHelper('/api/scores/monthly-user', 'get', null, getState, 'getUserOfMonth'))

export const createScore = createAsyncThunk("scores/createScore", async (newScore, { getState }) =>
  apiCallHelper('/api/scores', 'post', newScore, getState, 'createScore'))

export const updateScore = createAsyncThunk("scores/updateScore", async (updatedScore, { getState }) =>
  apiCallHelper(`/api/scores/${updatedScore.sId}`, 'put', updatedScore, getState, 'updateScore'))

export const deleteScore = createAsyncThunk("scores/deleteScore", async (id, { getState }) =>
  apiCallHelper(`/api/scores/${id}`, 'delete', null, getState, 'deleteScore'))

// Scores slice
const initialState = {
  allScores: [],
  totalPages: 0,
  oneScore: '',
  monthlyUser: '',
  takerScores: [],
  rankingScores: [],
  creatorScores: [],
  popularQuizes: [],
  feedbacks: [],
  isLoading: false,
  error: null
}

const scoresSlice = createSlice({
  name: 'scores',
  initialState,
  reducers: {
    clearScores: state => {
      state.allScores = []
      state.totalPages = 0
      state.oneScore = ''
      state.monthlyUser = ''
      state.takerScores = []
      state.rankingScores = []
      state.creatorScores = []
      state.popularQuizes = []
      state.feedbacks = []
      state.isLoading = false
    },
  },
  extraReducers: (builder) => {

    // Fullfilled actions
    builder.addCase(setScores.fulfilled, (state, action) => {
      state.allScores = action.payload.scores
      state.totalPages = action.payload.totalPages
      state.isLoading = false
    })
    builder.addCase(setRankingScores.fulfilled, (state, action) => {
      state.rankingScores = action.payload
      state.isLoading = false
    })
    builder.addCase(getTakerScores.fulfilled, (state, action) => {
      state.takerScores = action.payload
      state.isLoading = false
    })
    builder.addCase(getCreatorScores.fulfilled, (state, action) => {
      state.creatorScores = action.payload
      state.isLoading = false
    })
    builder.addCase(getOneScore.fulfilled, (state, action) => {
      state.oneScore = action.payload
      state.isLoading = false
    })
    builder.addCase(getPopularToday.fulfilled, (state, action) => {
      state.popularQuizes = action.payload
      state.isLoading = false
    })
    builder.addCase(getUserOfMonth.fulfilled, (state, action) => {
      state.monthlyUser = action.payload
      state.isLoading = false
    })
    builder.addCase(createScore.fulfilled, (state, action) => {
      state.allScores.push(action.payload)
      state.isLoading = false
    })
    builder.addCase(updateScore.fulfilled, (state, action) => {
      state.allScores = state.allScores.map(score => score._id === action.payload._id ? action.payload : score)
      state.isLoading = false
    })
    builder.addCase(deleteScore.fulfilled, (state, action) => {
      state.allScores = state.allScores.filter(score => score._id !== action.payload)
      state.isLoading = false
    })

    // Pending actions
    builder.addCase(setScores.pending, handlePending)
    builder.addCase(setRankingScores.pending, handlePending)
    builder.addCase(getTakerScores.pending, handlePending)
    builder.addCase(getCreatorScores.pending, handlePending)
    builder.addCase(getOneScore.pending, handlePending)
    builder.addCase(getPopularToday.pending, handlePending)
    builder.addCase(getUserOfMonth.pending, handlePending)
    builder.addCase(createScore.pending, handlePending)
    builder.addCase(updateScore.pending, handlePending)
    builder.addCase(deleteScore.pending, handlePending)

    // Rejected actions
    builder.addCase(setScores.rejected, handleRejected)
    builder.addCase(setRankingScores.rejected, handleRejected)
    builder.addCase(getTakerScores.rejected, handleRejected)
    builder.addCase(getCreatorScores.rejected, handleRejected)
    builder.addCase(getOneScore.rejected, handleRejected)
    builder.addCase(getPopularToday.rejected, handleRejected)
    builder.addCase(getUserOfMonth.rejected, handleRejected)
    builder.addCase(createScore.rejected, handleRejected)
    builder.addCase(updateScore.rejected, handleRejected)
    builder.addCase(deleteScore.rejected, handleRejected)
  }
})

export const { clearScores } = scoresSlice.actions
export default scoresSlice.reducer