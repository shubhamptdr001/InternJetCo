import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import { getUsers, uploadUserAvatar, deleteUserAvatar } from '../controllers/userController.js';

const router = express.Router();

// In-memory storage for avatar uploads (max 5MB, images only)
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatars.'), false);
    }
  },
});

// All user routes require authentication
router.use(protect);

router.get('/', getUsers);
router.post('/avatar', avatarUpload.single('avatar'), uploadUserAvatar);
router.delete('/avatar', deleteUserAvatar);

// Handle multer errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

export default router;
