import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { upload } from '../middleware/upload.js';
import {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getMonitorStats,
  getStudentStats
} from '../controllers/assignmentController.js';
import {
  submitAssignment,
  getAssignmentSubmissions
} from '../controllers/submissionController.js';

const router = Router();

router.use(authenticate);

// Assignment CRUD
router.post('/', authorize('admin', 'monitor'), createAssignment);
router.get('/', getAllAssignments);
router.get('/monitor/stats/overview', authorize('monitor', 'admin'), getMonitorStats);
router.get('/student/stats/overview', authorize('student'), getStudentStats);
router.get('/:id', getAssignmentById);
router.put('/:id', authorize('admin', 'monitor'), updateAssignment);
router.delete('/:id', authorize('admin', 'monitor'), deleteAssignment);

// Submission routes - students submit assignments
router.post('/:id/submit', authorize('student'), upload.single('file'), submitAssignment);

// Get submissions for an assignment - only for admins and monitors
router.get('/:id/submissions', authorize('admin', 'monitor'), getAssignmentSubmissions);

export default router;