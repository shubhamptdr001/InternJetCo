import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviews,
  getInterview,
} from '../controllers/interviewController.js';

const router = express.Router();

// All interview routes are protected
router.use(protect);

router.post('/start', startInterview);
router.get('/', getInterviews);
router.get('/:id', getInterview);
router.post('/:id/answer', submitAnswer);
router.post('/:id/complete', completeInterview);

export default router;
