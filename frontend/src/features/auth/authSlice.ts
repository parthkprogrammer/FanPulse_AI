import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  id: number;
  email: string;
  displayName: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  createdAt?: string;
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'failed';
}

const getStoredToken = (): string | null => {
  return localStorage.getItem('fanpulse_token');
};

const getStoredUser = (): UserProfile | null => {
  const userJson = localStorage.getItem('fanpulse_user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as UserProfile;
  } catch {
    return null;
  }
};

const initialToken = getStoredToken();
const initialUser = getStoredUser();

const initialState: AuthState = {
  token: initialToken,
  user: initialUser,
  isAuthenticated: Boolean(initialToken),
  status: 'idle',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: UserProfile }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.status = 'idle';

      localStorage.setItem('fanpulse_token', action.payload.token);
      localStorage.setItem('fanpulse_user', JSON.stringify(action.payload.user));
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('fanpulse_user', JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';

      localStorage.removeItem('fanpulse_token');
      localStorage.removeItem('fanpulse_user');
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.status = action.payload ? 'loading' : 'idle';
    },
  },
});

export const { setCredentials, updateProfile, logout, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;

