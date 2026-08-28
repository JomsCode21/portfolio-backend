import { Router } from 'express';
import { login, me } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
const router = Router();
router.post('/login', login);
router.get('/me', protect, authorize('admin'), me);
export default router;
