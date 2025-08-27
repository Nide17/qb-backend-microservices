import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper, handlePending, handleRejected } from '../configHelpers'

// Async actions with createAsyncThunk
export const get50NewUsers = createAsyncThunk("statistics/get50NewUsers", async (_, { getState }) =>
  apiCallHelper('/api/statistics/50-new-users', 'get', null, getState, 'get50NewUsers'))

export const getAllUsers = createAsyncThunk("statistics/getAllUsers", async (_, { getState }) =>
  apiCallHelper('/api/statistics/all-users', 'get', null, getState, 'getAllUsers'))

export const getUsersWithImage = createAsyncThunk("statistics/getUsersWithImage", async (_, { getState }) =>
  apiCallHelper('/api/statistics/users-with-image', 'get', null, getState, 'getUsersWithImage'))

export const getUsersWithSchool = createAsyncThunk("statistics/getUsersWithSchool", async (_, { getState }) =>
  apiCallHelper('/api/statistics/users-with-school', 'get', null, getState, 'getUsersWithSchool'))

export const getUsersWithLevel = createAsyncThunk("statistics/getUsersWithLevel", async (_, { getState }) =>
  apiCallHelper('/api/statistics/users-with-level', 'get', null, getState, 'getUsersWithLevel'))

export const getUsersWithFaculty = createAsyncThunk("statistics/getUsersWithFaculty", async (_, { getState }) =>
  apiCallHelper('/api/statistics/users-with-faculty', 'get', null, getState, 'getUsersWithFaculty'))

export const getUsersWithInterests = createAsyncThunk("statistics/getUsersWithInterests", async (_, { getState }) =>
  apiCallHelper('/api/statistics/users-with-interests', 'get', null, getState, 'getUsersWithInterests'))

export const getUsersWithAbout = createAsyncThunk("statistics/getUsersWithAbout", async (_, { getState }) =>
  apiCallHelper('/api/statistics/users-with-about', 'get', null, getState, 'getUsersWithAbout'))

export const getTop100Quizzing = createAsyncThunk("statistics/getTop100Quizzing", async (_, { getState }) =>
  apiCallHelper('/api/statistics/top-100-quizzing', 'get', null, getState, 'getTop100Quizzing'))

export const getTop100Downloaders = createAsyncThunk("statistics/getTop100Downloaders", async (_, { getState }) =>
  apiCallHelper('/api/statistics/top-100-downloaders', 'get', null, getState, 'getTop100Downloaders'))

export const getTop20Quizzes = createAsyncThunk("statistics/getTop20Quizzes", async (_, { getState }) =>
  apiCallHelper('/api/statistics/top-20-quizzes', 'get', null, getState, 'getTop20Quizzes'))

export const getQuizzesStats = createAsyncThunk("statistics/getQuizzesStats", async (_, { getState }) =>
  apiCallHelper('/api/statistics/quizzes-stats', 'get', null, getState, 'getQuizzesStats'))

export const getTop20Notes = createAsyncThunk("statistics/getTop20Notes", async (_, { getState }) =>
  apiCallHelper('/api/statistics/top-20-notes', 'get', null, getState, 'getTop20Notes'))

export const getNotesStats = createAsyncThunk("statistics/getNotesStats", async (_, { getState }) =>
  apiCallHelper('/api/statistics/notes-stats', 'get', null, getState, 'getNotesStats'))

export const getQuizCategoriesStats = createAsyncThunk("statistics/getQuizCategoriesStats", async (_, { getState }) =>
  apiCallHelper('/api/statistics/quiz-categories-stats', 'get', null, getState, 'getQuizCategoriesStats'))

export const getNotesCategoriesStats = createAsyncThunk("statistics/getNotesCategoriesStats", async (_, { getState }) =>
  apiCallHelper('/api/statistics/notes-categories-stats', 'get', null, getState, 'getNotesCategoriesStats'))

export const getDailyUserRegistration = createAsyncThunk("statistics/getDailyUserRegistration", async (_, { getState }) =>
  apiCallHelper('/api/statistics/daily-user-registration', 'get', null, getState, 'getDailyUserRegistration'))

// Statistics slice
const initialState = {
  new50Users: [],
  isLoading: false,
  allUsers: [],
  usersWithImage: [],
  usersWithSchool: [],
  usersWithLevel: [],
  usersWithFaculty: [],
  usersWithInterests: [],
  usersWithAbout: [],
  top100Quizzing: [],
  top100Downloaders: [],
  top20Quizzes: [],
  quizzesStats: [],
  top20Notes: [],
  notesStats: [],
  quizCategoriesStats: [],
  notesCategoriesStats: [],
  dailyUserRegistration: [],
  msg: null,
  error: null
}

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    clearStatistics: state => {
      state.new50Users = []
      state.isLoading = false
      state.allUsers = []
      state.usersWithImage = []
      state.usersWithSchool = []
      state.usersWithLevel = []
      state.usersWithFaculty = []
      state.usersWithInterests = []
      state.usersWithAbout = []
      state.top100Quizzing = []
      state.top100Downloaders = []
      state.top20Quizzes = []
      state.quizzesStats = []
      state.top20Notes = []
      state.notesStats = []
      state.quizCategoriesStats = []
      state.notesCategoriesStats = []
      state.dailyUserRegistration = []
      state.msg = null
    }
  },
  extraReducers: (builder) => {

    // Fullfilled actions
    builder.addCase(get50NewUsers.fulfilled, (state, action) => {
      state.new50Users = action.payload
      state.isLoading = false
    })
    builder.addCase(getAllUsers.fulfilled, (state, action) => {
      state.allUsers = action.payload
      state.isLoading = false
    })
    builder.addCase(getUsersWithImage.fulfilled, (state, action) => {
      state.usersWithImage = action.payload
      state.isLoading = false
    })
    builder.addCase(getUsersWithSchool.fulfilled, (state, action) => {
      state.usersWithSchool = action.payload
      state.isLoading = false
    })
    builder.addCase(getUsersWithLevel.fulfilled, (state, action) => {
      state.usersWithLevel = action.payload
      state.isLoading = false
    })
    builder.addCase(getUsersWithFaculty.fulfilled, (state, action) => {
      state.usersWithFaculty = action.payload
      state.isLoading = false
    })
    builder.addCase(getUsersWithInterests.fulfilled, (state, action) => {
      state.usersWithInterests = action.payload
      state.isLoading = false
    })
    builder.addCase(getUsersWithAbout.fulfilled, (state, action) => {
      state.usersWithAbout = action.payload
      state.isLoading = false
    })
    builder.addCase(getTop100Quizzing.fulfilled, (state, action) => {
      state.top100Quizzing = action.payload
      state.isLoading = false
    })
    builder.addCase(getTop100Downloaders.fulfilled, (state, action) => {
      state.top100Downloaders = action.payload
      state.isLoading = false
    })
    builder.addCase(getTop20Quizzes.fulfilled, (state, action) => {
      state.top20Quizzes = action.payload
      state.isLoading = false
    })
    builder.addCase(getQuizzesStats.fulfilled, (state, action) => {
      state.quizzesStats = action.payload
      state.isLoading = false
    })
    builder.addCase(getTop20Notes.fulfilled, (state, action) => {
      state.top20Notes = action.payload
      state.isLoading = false
    })
    builder.addCase(getNotesStats.fulfilled, (state, action) => {
      state.notesStats = action.payload
      state.isLoading = false
    })
    builder.addCase(getQuizCategoriesStats.fulfilled, (state, action) => {
      state.quizCategoriesStats = action.payload
      state.isLoading = false
    })
    builder.addCase(getNotesCategoriesStats.fulfilled, (state, action) => {
      state.notesCategoriesStats = action.payload
      state.isLoading = false
    })
    builder.addCase(getDailyUserRegistration.fulfilled, (state, action) => {
      state.dailyUserRegistration = action.payload
      state.isLoading = false
    })

    // Pending actions
    builder.addCase(get50NewUsers.pending, handlePending)
    builder.addCase(getAllUsers.pending, handlePending)
    builder.addCase(getUsersWithImage.pending, handlePending)
    builder.addCase(getUsersWithSchool.pending, handlePending)
    builder.addCase(getUsersWithLevel.pending, handlePending)
    builder.addCase(getUsersWithFaculty.pending, handlePending)
    builder.addCase(getUsersWithInterests.pending, handlePending)
    builder.addCase(getUsersWithAbout.pending, handlePending)
    builder.addCase(getTop100Quizzing.pending, handlePending)
    builder.addCase(getTop100Downloaders.pending, handlePending)
    builder.addCase(getTop20Quizzes.pending, handlePending)
    builder.addCase(getQuizzesStats.pending, handlePending)
    builder.addCase(getTop20Notes.pending, handlePending)
    builder.addCase(getNotesStats.pending, handlePending)
    builder.addCase(getQuizCategoriesStats.pending, handlePending)
    builder.addCase(getNotesCategoriesStats.pending, handlePending)
    builder.addCase(getDailyUserRegistration.pending, handlePending)

    // Rejected actions
    builder.addCase(get50NewUsers.rejected, handleRejected)
    builder.addCase(getAllUsers.rejected, handleRejected)
    builder.addCase(getUsersWithImage.rejected, handleRejected)
    builder.addCase(getUsersWithSchool.rejected, handleRejected)
    builder.addCase(getUsersWithLevel.rejected, handleRejected)
    builder.addCase(getUsersWithFaculty.rejected, handleRejected)
    builder.addCase(getUsersWithInterests.rejected, handleRejected)
    builder.addCase(getUsersWithAbout.rejected, handleRejected)
    builder.addCase(getTop100Quizzing.rejected, handleRejected)
    builder.addCase(getTop100Downloaders.rejected, handleRejected)
    builder.addCase(getTop20Quizzes.rejected, handleRejected)
    builder.addCase(getQuizzesStats.rejected, handleRejected)
    builder.addCase(getTop20Notes.rejected, handleRejected)
    builder.addCase(getNotesStats.rejected, handleRejected)
    builder.addCase(getQuizCategoriesStats.rejected, handleRejected)
    builder.addCase(getNotesCategoriesStats.rejected, handleRejected)
    builder.addCase(getDailyUserRegistration.rejected, handleRejected)
  }
})

export const { clearStatistics } = statisticsSlice.actions
export default statisticsSlice.reducer