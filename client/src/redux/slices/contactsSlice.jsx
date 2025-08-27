import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiCallHelper, handlePending, handleRejected } from '../configHelpers'
import { socket } from '../../utils/socket'
import { notify } from '../../utils/notifyToast'

// Async actions with createAsyncThunk
export const getContacts = createAsyncThunk("contacts/getContacts", async (pageNo, { getState }) =>
  apiCallHelper(`/api/contacts?pageNo=${pageNo}`, 'get', null, getState, 'getContacts'))

export const getOneContact = createAsyncThunk("contacts/getOneContact", async (contactId, { getState }) =>
  apiCallHelper(`/api/contacts/${contactId}`, 'get', null, getState, 'getOneContact'))

export const getUserContacts = createAsyncThunk("contacts/getUserContacts", async (userEmail, { getState }) =>
  apiCallHelper(`/api/contacts/sender/${userEmail}`, 'get', null, getState, 'getUserContacts'))

export const sendMsg = createAsyncThunk("contacts/sendMsg", async (contactMsg, { getState }) =>
  apiCallHelper('/api/contacts', 'post', contactMsg, getState, 'sendMsg'))

export const replyContact = createAsyncThunk("contacts/replyContact", async ({ idToUpdate, reply }, { getState }) =>
  apiCallHelper(`/api/contacts/${idToUpdate}`, 'put', reply, getState, 'replyContact'))

export const deleteContact = createAsyncThunk("contacts/deleteContact", async (contactID, { getState }) =>
  apiCallHelper(`/api/contacts/${contactID}`, 'delete', null, getState, 'deleteContact'))

export const getCreateRoom = createAsyncThunk("contacts/getCreateRoom", async (oON1room, { getState }) =>
  apiCallHelper(`/api/chatrooms/rooms/room/${oON1room.roomName}`, 'post', oON1room, getState, 'getCreateRoom'))

export const getRoomMessages = createAsyncThunk("contacts/getRoomMessages", async (roomID, { getState }) =>
  apiCallHelper(`/api/chatrooms/messages/room/${roomID}`, 'get', null, getState, 'getRoomMessages'))

export const sendRoomMessage = createAsyncThunk("contacts/sendRoomMessage", async (roomMessage, { getState }) =>
  apiCallHelper('/api/chatrooms/messages', 'post', roomMessage, getState, 'sendRoomMessage'))


// Contacts slice
const initialState = {
  allContacts: [],
  userContacts: [],
  oneContact: null,
  totalPages: 0,
  oneChatRoom: null,
  oneRoomMessages: [],
  reply: null,
  isLoading: false,
  error: null
}

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    clearContacts: state => {
      state.allContacts = []
      state.userContacts = []
      state.oneContact = null
      state.totalPages = 0
      state.oneChatRoom = null
      state.oneRoomMessages = []
      state.reply = null
      state.isLoading = false
    }
  },
  extraReducers: (builder) => {

    // Fullfilled actions
    builder.addCase(getContacts.fulfilled, (state, action) => {
      state.allContacts = action.payload.contacts
      state.totalPages = action.payload.totalPages
      state.isLoading = false
    })
    builder.addCase(getOneContact.fulfilled, (state, action) => {
      state.oneContact = action.payload
      state.isLoading = false
    })
    builder.addCase(getUserContacts.fulfilled, (state, action) => {
      state.userContacts = action.payload
      state.isLoading = false
    })
    builder.addCase(sendMsg.fulfilled, (state, action) => {
      state.allContacts.push(action.payload)
      state.isLoading = false
    })
    builder.addCase(replyContact.fulfilled, (state, action) => {
      state.reply = action.payload
      state.isLoading = false
      socket.emit('newReply', action.payload)
    })
    builder.addCase(deleteContact.fulfilled, (state, action) => {
      state.allContacts = state.allContacts.filter(contact => contact._id !== action.payload)
      state.isLoading = false
      notify('Contact deleted', 'success')
    })
    builder.addCase(getCreateRoom.fulfilled, (state, action) => {
      state.oneChatRoom = action.payload
      state.isLoading = false
    })
    builder.addCase(getRoomMessages.fulfilled, (state, action) => {
      state.oneRoomMessages = action.payload
      state.isLoading = false
    })
    builder.addCase(sendRoomMessage.fulfilled, (state, action) => {
      state.oneRoomMessages.push(action.payload)
      state.isLoading = false
      socket.emit('room_message', action.payload)
    })

    // Pending actions
    builder.addCase(getContacts.pending, handlePending)
    builder.addCase(getOneContact.pending, handlePending)
    builder.addCase(getUserContacts.pending, handlePending)
    builder.addCase(sendMsg.pending, handlePending)
    builder.addCase(replyContact.pending, handlePending)
    builder.addCase(deleteContact.pending, handlePending)
    builder.addCase(getCreateRoom.pending, handlePending)
    builder.addCase(getRoomMessages.pending, handlePending)
    builder.addCase(sendRoomMessage.pending, handlePending)

    // Rejected actions
    builder.addCase(getContacts.rejected, handleRejected)
    builder.addCase(getOneContact.rejected, handleRejected)
    builder.addCase(getUserContacts.rejected, handleRejected)
    builder.addCase(sendMsg.rejected, handleRejected)
    builder.addCase(replyContact.rejected, handleRejected)
    builder.addCase(deleteContact.rejected, handleRejected)
    builder.addCase(getCreateRoom.rejected, handleRejected)
    builder.addCase(getRoomMessages.rejected, handleRejected)
    builder.addCase(sendRoomMessage.rejected, handleRejected)
  }
})

export const { clearContacts } = contactsSlice.actions
export default contactsSlice.reducer