import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import {
  getAllUsers,
  getPendingUsers,
  approveUser,
  updateUserRole,
  deleteUser,
  getAdminStats
} from '../controllers/userController.js';

const router = Router();

router.use(authenticate);

// Admin only routes
router.get('/', authorize('admin'), getAllUsers);
router.get('/pending', authorize('admin'), getPendingUsers);
router.post('/:id/approve', authorize('admin'), approveUser);
router.patch('/:id/role', authorize('admin'), updateUserRole);
router.delete('/:id', authorize('admin'), deleteUser);

// Stats routes
router.get('/admin/stats/overview', authorize('admin'), getAdminStats);

export default router;