import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, parseApiResponse } from '@/utils/api';

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
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    const response = await fetch(getApiUrl('/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json().catch(() => ({} as Record<string, unknown>));

    // 401 with a token means auth succeeded but Jira is not connected/expired — still log in
    if (!response.ok && !(data.token && data.user)) {
      return rejectWithValue(data.error || data.message || 'Login failed');
    }

    return data as { user: User; token: string };
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (credentials: { name: string; email: string; password: string }) => {
    const response = await fetch(getApiUrl('/auth/signup'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await parseApiResponse<{
      user: User;
      token: string;
    }>(response);
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
    clearError: (state) => {
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
        state.error = (action.payload as string) || action.error.message || 'Login failed';
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Signup failed';
      });
  },
});

export const { logout, setToken, setUser, clearError } = authSlice.actions;
export default authSlice.reducer; 
