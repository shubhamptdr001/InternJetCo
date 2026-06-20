import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import interviewReducer from './slices/interviewSlice';
import peerInterviewReducer from './slices/peerInterviewSlice';
import feedbackReducer from './slices/feedbackSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    interview: interviewReducer,
    peerInterview: peerInterviewReducer,
    feedback: feedbackReducer,
  },
});

export default store;
