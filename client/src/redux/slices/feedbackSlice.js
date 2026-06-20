import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ─── Async Thunks ───

export const submitFeedback = createAsyncThunk(
  'feedback/submit',
  async (feedbackData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/feedback', feedbackData);
      return data.feedback;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit feedback');
    }
  }
);

export const fetchMyFeedback = createAsyncThunk(
  'feedback/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/feedback/my');
      return data.feedbacks;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feedback list');
    }
  }
);

export const fetchFeedbackForInterview = createAsyncThunk(
  'feedback/fetchForInterview',
  async (interviewId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/feedback/interview/${interviewId}`);
      return data.feedback;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feedback details');
    }
  }
);

export const fetchFeedbackAnalytics = createAsyncThunk(
  'feedback/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/feedback/analytics');
      return data.feedbacks;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

// ─── Slice ───

const initialState = {
  feedbacks: [],
  interviewFeedback: null,
  analytics: [],
  loading: false,
  error: null,
};

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    clearFeedbackError: (state) => {
      state.error = null;
    },
    clearInterviewFeedback: (state) => {
      state.interviewFeedback = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit
      .addCase(submitFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks.unshift(action.payload);
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch My
      .addCase(fetchMyFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks = action.payload;
      })
      .addCase(fetchMyFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch for interview
      .addCase(fetchFeedbackForInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.interviewFeedback = null;
      })
      .addCase(fetchFeedbackForInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.interviewFeedback = action.payload;
      })
      .addCase(fetchFeedbackForInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Analytics
      .addCase(fetchFeedbackAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbackAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchFeedbackAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFeedbackError, clearInterviewFeedback } = feedbackSlice.actions;
export default feedbackSlice.reducer;
