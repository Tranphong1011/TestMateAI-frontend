import { API_URL } from '@/utils/config';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface User {
  name: string;
  email: string;
  user_id: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await fetch(API_URL+'/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      let err_d = await response.json();
      console.log("err_d",err_d)
      // err_d = null
      throw new Error(`Error: ${err_d?.['message']}`);
    }

    const data = await response.json();
    return data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
    },
    setToken: (state, action) => {
      state.token = action.payload; // Set the token from the action payload
    },
    setUser: (state, action) => {
      state.user = action.payload; // Set the token from the action payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      });
  },
});

export const { logout,setToken,setUser } = authSlice.actions;
export default authSlice.reducer; 