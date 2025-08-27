import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper, apiCallHelperUpload, handlePending, handleRejected } from '../configHelpers'

// Async actions with createAsyncThunk
export const getNotes = createAsyncThunk("notes/getNotes", async (_, { getState }) =>
  apiCallHelper('/api/notes', 'get', null, getState, 'getNotes'))

export const getLandingDisplayNotes = createAsyncThunk("notes/getLandingDisplayNotes", async (limit, { getState }) =>
  apiCallHelper(`/api/notes/limited?limit=${limit ? limit : 10}`, 'get', null, getState, 'getLandingDisplayNotes'))

export const getOneNotePaper = createAsyncThunk("notes/getOneNotePaper", async (noteSlug, { getState }) =>
  apiCallHelper(`/api/notes/${noteSlug}`, 'get', null, getState, 'getOneNotePaper'))

export const getNotesByChapter = createAsyncThunk("notes/getNotesByChapter", async (chapterId, { getState }) =>
  apiCallHelper(`/api/notes/chapter/${chapterId}`, 'get', null, getState, 'getNotesByChapter'))

export const getNotesByCCatg = createAsyncThunk("notes/getNotesByCCatg", async (ccatgID, { getState }) =>
  apiCallHelper(`/api/notes/category/${ccatgID}`, 'get', null, getState, 'getNotesByCCatg'))

export const createNotes = createAsyncThunk("notes/createNotes", async (newNotes, { getState }) =>
  apiCallHelperUpload('/api/notes', 'post', newNotes, getState, 'createNotes'))

export const updateNotes = createAsyncThunk("notes/updateNotes", async (updatedNotes, { getState }) =>
  apiCallHelper(`/api/notes/${updatedNotes.idToUpdate}`, 'put', updatedNotes, getState, 'updateNotes'))

export const addNotesQuizes = createAsyncThunk("notes/addNotesQuizes", async (notesQuizzes, { getState }) =>
  apiCallHelper(`/api/notes/notes-quizzes/${notesQuizzes.noteID}`, 'put', notesQuizzes, getState, 'addNotesQuizes'))

export const deleteNotes = createAsyncThunk("notes/deleteNotes", async (noteID, { getState }) =>
  apiCallHelper(`/api/notes/${noteID}`, 'delete', null, getState, 'deleteNotes'))

export const removeQzNt = createAsyncThunk("notes/removeQzNt", async ({ noteID, quizID }, { getState }) =>
  apiCallHelper(`/api/notes/notes-quizzes/remove/${noteID}`, 'put', { noteID, quizID }, getState, 'removeQzNt'))

// Notes slice
const initialState = {
  isLoading: false,
  allNotes: [],
  limitedLandingDisplayNotes: [],
  oneNotePaper: {},
  notesByChapter: [],
  notesByCCatg: [],
  allDownloads: [],
  error: null
}

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearNotes: state => {
      state.isLoading = false
      state.allNotes = []
      state.limitedLandingDisplayNotes = []
      state.oneNotePaper = {}
      state.notesByChapter = []
      state.notesByCCatg = []
      state.allDownloads = []
    }
  },
  extraReducers: (builder) => {

    // Fullfilled actions
    builder.addCase(getNotes.fulfilled, (state, action) => {
      state.allNotes = action.payload
      state.isLoading = false
    })
    builder.addCase(getLandingDisplayNotes.fulfilled, (state, action) => {
      state.limitedLandingDisplayNotes = action.payload
      state.isLoading = false
    })
    builder.addCase(getOneNotePaper.fulfilled, (state, action) => {
      state.oneNotePaper = action.payload
      state.isLoading = false
    })
    builder.addCase(getNotesByChapter.fulfilled, (state, action) => {
      state.notesByChapter = action.payload
      state.isLoading = false
    })
    builder.addCase(getNotesByCCatg.fulfilled, (state, action) => {
      state.notesByCCatg = action.payload
      state.isLoading = false
    })
    builder.addCase(createNotes.fulfilled, (state, action) => {
      state.allNotes.push(action.payload)
      state.isLoading = false
    })
    builder.addCase(updateNotes.fulfilled, (state, action) => {
      state.allNotes = state.allNotes.map(note => note._id === action.payload._id ? action.payload : note)
      state.isLoading = false
    })
    builder.addCase(addNotesQuizes.fulfilled, (state, action) => {
      state.allNotes = state.allNotes.map(note => note._id === action.payload._id ? action.payload : note)
      state.isLoading = false
    })
    builder.addCase(deleteNotes.fulfilled, (state, action) => {
      state.allNotes = state.allNotes.filter(note => note._id !== action.payload)
      state.isLoading = false
    })
    builder.addCase(removeQzNt.fulfilled, (state, action) => {
      state.allNotes = state.allNotes.map(note => note._id === action.payload._id ? action.payload : note)
      state.isLoading = false
    })

    // Pending actions
    builder.addCase(getNotes.pending, handlePending)
    builder.addCase(getLandingDisplayNotes.pending, handlePending)
    builder.addCase(getOneNotePaper.pending, handlePending)
    builder.addCase(getNotesByChapter.pending, handlePending)
    builder.addCase(getNotesByCCatg.pending, handlePending)
    builder.addCase(createNotes.pending, handlePending)
    builder.addCase(updateNotes.pending, handlePending)
    builder.addCase(addNotesQuizes.pending, handlePending)
    builder.addCase(deleteNotes.pending, handlePending)
    builder.addCase(removeQzNt.pending, handlePending)

    // Rejected actions
    builder.addCase(getNotes.rejected, handleRejected)
    builder.addCase(getLandingDisplayNotes.rejected, handleRejected)
    builder.addCase(getOneNotePaper.rejected, handleRejected)
    builder.addCase(getNotesByChapter.rejected, handleRejected)
    builder.addCase(getNotesByCCatg.rejected, handleRejected)
    builder.addCase(createNotes.rejected, handleRejected)
    builder.addCase(updateNotes.rejected, handleRejected)
    builder.addCase(addNotesQuizes.rejected, handleRejected)
    builder.addCase(deleteNotes.rejected, handleRejected)
    builder.addCase(removeQzNt.rejected, handleRejected)
  }
})

export const { clearNotes } = notesSlice.actions
export default notesSlice.reducer