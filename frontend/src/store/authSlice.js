import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, isLoggedIn: false },
  reducers: {
    setCredentials: (s, a) => {
      s.user = a.payload.user
      s.token = a.payload.token
      s.isLoggedIn = true
    },
    logout: (s) => {
      s.user = null
      s.token = null
      s.isLoggedIn = false
    },
  }
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer