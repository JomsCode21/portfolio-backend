import express, { Router } from 'express';
import { renderFile, uploadResume } from '../controllers/uploadController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/render', renderFile);
router.post(
  '/resume',
  protect,
  authorize('admin'),
  express.raw({ type: '*/*', limit: '10mb' }),
  uploadResume,
);

export default router;
