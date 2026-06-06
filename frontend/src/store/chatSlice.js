import { createSlice } from '@reduxjs/toolkit'

const chatSlice = createSlice({
  name: 'chat',
  initialState: { messages: [], isLoading: false },
  reducers: {
    addMessage:  (s, a) => { s.messages.push(a.payload) },
    setLoading:  (s, a) => { s.isLoading = a.payload },
    clearChat:   (s)    => { s.messages = [] },
  }
})

export const { addMessage, setLoading, clearChat } = chatSlice.actions
export default chatSlice.reducer