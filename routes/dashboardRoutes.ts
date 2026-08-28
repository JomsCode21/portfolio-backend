import { Router } from 'express';
import { stats } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/stats', protect, authorize('admin'), stats);
export default router;
