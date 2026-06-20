import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ─── Async Thunks ───

export const startInterview = createAsyncThunk(
  'interview/start',
  async (config, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/interviews/start', config);
      return data.interview;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start interview');
    }
  }
);

export const submitAnswer = createAsyncThunk(
  'interview/submitAnswer',
  async ({ interviewId, questionIndex, answer, timeSpent }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/interviews/${interviewId}/answer`, {
        questionIndex,
        answer,
        timeSpent,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit answer');
    }
  }
);

export const completeInterview = createAsyncThunk(
  'interview/complete',
  async ({ interviewId, duration }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/interviews/${interviewId}/complete`, { duration });
      return data.interview;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete interview');
    }
  }
);

export const fetchInterviews = createAsyncThunk(
  'interview/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/interviews');
      return data.interviews;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch interviews');
    }
  }
);

export const fetchInterview = createAsyncThunk(
  'interview/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/interviews/${id}`);
      return data.interview;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch interview');
    }
  }
);

// ─── Slice ───

const initialState = {
  currentSession: null,       // active in-progress interview
  currentEvaluation: null,    // last AI evaluation result
  history: [],                // past interviews list
  selectedInterview: null,    // detail view
  loading: false,
  evaluating: false,          // separate loading for answer eval
  completing: false,
  error: null,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    clearCurrentSession: (state) => {
      state.currentSession = null;
      state.currentEvaluation = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start interview
      .addCase(startInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentSession = null;
        state.currentEvaluation = null;
      })
      .addCase(startInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(startInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Submit answer
      .addCase(submitAnswer.pending, (state) => {
        state.evaluating = true;
        state.error = null;
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.evaluating = false;
        state.currentEvaluation = action.payload.evaluation;
        if (state.currentSession) {
          state.currentSession.currentQuestionIndex = action.payload.currentQuestionIndex;
        }
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.evaluating = false;
        state.error = action.payload;
      })

      // Complete interview
      .addCase(completeInterview.pending, (state) => {
        state.completing = true;
      })
      .addCase(completeInterview.fulfilled, (state, action) => {
        state.completing = false;
        state.currentSession = null;
        state.selectedInterview = action.payload;
      })
      .addCase(completeInterview.rejected, (state, action) => {
        state.completing = false;
        state.error = action.payload;
      })

      // Fetch all
      .addCase(fetchInterviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInterviews.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchInterviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch one
      .addCase(fetchInterview.pending, (state) => {
        state.loading = true;
        state.selectedInterview = null;
      })
      .addCase(fetchInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedInterview = action.payload;
      })
      .addCase(fetchInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentSession, clearError } = interviewSlice.actions;
export default interviewSlice.reducer;
