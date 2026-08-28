import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
export function resourceRoutes(controller) {
  const router = Router();
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', protect, authorize('admin'), controller.create);
  router.put('/:id', protect, authorize('admin'), controller.update);
  router.delete('/:id', protect, authorize('admin'), controller.remove);
  return router;
}
