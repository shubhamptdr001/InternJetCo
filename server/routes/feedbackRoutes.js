import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  submitFeedback,
  getFeedbackForInterview,
  getMyFeedback,
  getFeedbackAnalytics,
} from '../controllers/feedbackController.js';

const router = express.Router();

// All feedback routes are protected by JWT auth
router.use(protect);

router.post('/', submitFeedback);
router.get('/my', getMyFeedback);
router.get('/analytics', getFeedbackAnalytics);
router.get('/interview/:id', getFeedbackForInterview);

export default router;
