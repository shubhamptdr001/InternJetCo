import express from 'express';
import { protect } from '../middleware/auth.js';
import { getUsers } from '../controllers/userController.js';

const router = express.Router();

// User routes are protected by JWT auth
router.use(protect);

router.get('/', getUsers);

export default router;
