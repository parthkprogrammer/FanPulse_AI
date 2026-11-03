import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TeamBrief {
  id: number;
  name: string;
  shortName: string;
  code: string;
  logoUrl?: string;
}

export interface MatchSummary {
  id: number;
  format: 'TEST' | 'ODI' | 'T20';
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  venue: string;
  matchDate: string;
  team1: TeamBrief;
  team2: TeamBrief;
  resultSummary?: string;
}

export interface MatchFilter {
  format: 'ALL' | 'TEST' | 'ODI' | 'T20';
  status: 'ALL' | 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface MatchState {
  matches: MatchSummary[];
  selectedMatchId: number | null;
  filter: MatchFilter;
  loading: boolean;
  error: string | null;
}

const initialState: MatchState = {
  matches: [],
  selectedMatchId: null,
  filter: {
    format: 'ALL',
    status: 'ALL',
  },
  loading: false,
  error: null,
};

export const matchSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    setMatches: (state, action: PayloadAction<MatchSummary[]>) => {
      state.matches = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedMatchId: (state, action: PayloadAction<number | null>) => {
      state.selectedMatchId = action.payload;
    },
    setFilter: (state, action: PayloadAction<Partial<MatchFilter>>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    setMatchLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setMatchError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setMatches, setSelectedMatchId, setFilter, setMatchLoading, setMatchError } =
  matchSlice.actions;
export default matchSlice.reducer;

