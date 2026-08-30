import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as controller from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many contact requests. Please try again later.' },
});

router.post('/', contactLimiter, controller.submit);
router.use(protect, authorize('admin'));
router.get('/', controller.list);
router.get('/:id', controller.get);
router.put('/:id/read', controller.markRead);
router.delete('/:id', controller.remove);
export default router;
