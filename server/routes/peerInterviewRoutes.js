import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  scheduleInterview,
  getPeerInterviews,
  getPeerInterview,
  updatePeerInterview,
  cancelPeerInterview,
  getZegoCredentials,
  getPeerInterviewByRoomId,
} from '../controllers/peerInterviewController.js';

const router = express.Router();

// All peer interview routes are protected by JWT auth
router.use(protect);

router.post('/', scheduleInterview);
router.get('/', getPeerInterviews);
router.get('/credentials', getZegoCredentials);
router.get('/room/:roomId', getPeerInterviewByRoomId);
router.get('/:id', getPeerInterview);
router.put('/:id', updatePeerInterview);
router.delete('/:id', cancelPeerInterview);

export default router;
