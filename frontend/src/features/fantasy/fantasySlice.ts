import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FantasyTeamSummary {
  id: number;
  matchId: number;
  matchSummary: string;
  matchStatus: string;
  teamName: string;
  captainName: string;
  viceCaptainName: string;
  totalPoints: number;
  isLocked: boolean;
  createdAt: string;
}

export interface FantasyState {
  userTeams: FantasyTeamSummary[];
  loading: boolean;
  error: string | null;
}

const initialState: FantasyState = {
  userTeams: [],
  loading: false,
  error: null,
};

export const fantasySlice = createSlice({
  name: 'fantasy',
  initialState,
  reducers: {
    setUserTeams: (state, action: PayloadAction<FantasyTeamSummary[]>) => {
      state.userTeams = action.payload;
      state.loading = false;
      state.error = null;
    },
    setFantasyLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setFantasyError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setUserTeams, setFantasyLoading, setFantasyError } = fantasySlice.actions;
export default fantasySlice.reducer;

