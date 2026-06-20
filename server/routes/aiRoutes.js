import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import {
  analyzeResume,
  reviewCode,
  getAIReports,
  getAIReport,
} from '../controllers/aiController.js';

const router = express.Router();

// Multer memory storage configuration for file uploads (resumes)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and plain text (.txt) files are allowed.'), false);
    }
  },
});

// All routes under this router require authentication
router.use(protect);

router.post('/resume-analyze', upload.single('resume'), analyzeResume);
router.post('/code-review', reviewCode);
router.get('/reports', getAIReports);
router.get('/reports/:id', getAIReport);

// Handle multer error separately
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

export default router;
