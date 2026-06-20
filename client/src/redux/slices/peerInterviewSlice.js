import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ─── Async Thunks ───

export const schedulePeerInterview = createAsyncThunk(
  'peerInterview/schedule',
  async (interviewData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/peer-interviews', interviewData);
      return data.interview;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to schedule interview');
    }
  }
);

export const fetchPeerInterviews = createAsyncThunk(
  'peerInterview/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/peer-interviews');
      return data.interviews;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch peer interviews');
    }
  }
);

export const fetchPeerInterview = createAsyncThunk(
  'peerInterview/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/peer-interviews/${id}`);
      return data.interview;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch interview details');
    }
  }
);

export const updatePeerInterview = createAsyncThunk(
  'peerInterview/update',
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/peer-interviews/${id}`, { status, notes });
      return data.interview;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update interview');
    }
  }
);

export const cancelPeerInterview = createAsyncThunk(
  'peerInterview/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/api/peer-interviews/${id}`);
      return data.interview;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel interview');
    }
  }
);

// Fetch registered users who completed onboarding
export const fetchUsers = createAsyncThunk(
  'peerInterview/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/users');
      return data.users;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

// ─── Slice ───

const initialState = {
  interviews: [],
  users: [],
  selectedInterview: null,
  loading: false,
  error: null,
};

const peerInterviewSlice = createSlice({
  name: 'peerInterview',
  initialState,
  reducers: {
    clearPeerError: (state) => {
      state.error = null;
    },
    clearSelectedPeerInterview: (state) => {
      state.selectedInterview = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Schedule
      .addCase(schedulePeerInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(schedulePeerInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.interviews.push(action.payload);
      })
      .addCase(schedulePeerInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch All
      .addCase(fetchPeerInterviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPeerInterviews.fulfilled, (state, action) => {
        state.loading = false;
        state.interviews = action.payload;
      })
      .addCase(fetchPeerInterviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch One
      .addCase(fetchPeerInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedInterview = null;
      })
      .addCase(fetchPeerInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedInterview = action.payload;
      })
      .addCase(fetchPeerInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updatePeerInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePeerInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedInterview = action.payload;
        state.interviews = state.interviews.map((i) =>
          i._id === action.payload._id ? action.payload : i
        );
      })
      .addCase(updatePeerInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel
      .addCase(cancelPeerInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelPeerInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.interviews = state.interviews.map((i) =>
          i._id === action.payload._id ? action.payload : i
        );
        if (state.selectedInterview?._id === action.payload._id) {
          state.selectedInterview = action.payload;
        }
      })
      .addCase(cancelPeerInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Users
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      });
  },
});

export const { clearPeerError, clearSelectedPeerInterview } = peerInterviewSlice.actions;
export default peerInterviewSlice.reducer;
