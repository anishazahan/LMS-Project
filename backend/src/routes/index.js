import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import courseRoutes from './course.routes.js';
import moduleRoutes from './module.routes.js';
import lessonRoutes from './lesson.routes.js';
import enrollmentRoutes from './enrollment.routes.js';
import paymentRoutes from './payment.routes.js';
import reviewRoutes from './review.routes.js';
import emailRoutes from './email.routes.js';

const router = Router();

router.get('/health', (_req, res) =>
  res.json({ success: true, status: 'ok', uptime: process.uptime() })
);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/modules', moduleRoutes);
router.use('/modules', lessonRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/emails', emailRoutes);

export default router;
