import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import * as controller from '../controllers/pushController.js';

const router = Router();
router.use(protect, authorize('admin'));
router.get('/public-key', controller.publicKey);
router.post('/subscriptions', controller.subscribe);
router.delete('/subscriptions', controller.unsubscribe);

export default router;
