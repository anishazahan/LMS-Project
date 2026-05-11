import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { ROLES } from '../constants/roles.js';
import {
  addReview,
  updateReview,
  deleteReview,
  getCourseReviews,
  getRatingSummary,
  getTestimonials,
  getMyReviews,
  getInstructorAnalytics,
} from '../controllers/review.controller.js';
import {
  addReviewSchema,
  updateReviewSchema,
  courseIdParamSchema,
  reviewIdParamSchema,
  reviewListQuery,
  testimonialsQuery,
} from '../validators/review.validator.js';

const router = Router();

// Public
router.get('/testimonials', validate({ query: testimonialsQuery }), getTestimonials);
router.get(
  '/course/:courseId',
  validate({ params: courseIdParamSchema, query: reviewListQuery }),
  getCourseReviews
);
router.get(
  '/course/:courseId/summary',
  validate({ params: courseIdParamSchema }),
  getRatingSummary
);

router.use(protect);

router.get('/me', getMyReviews);
router.get(
  '/instructor/analytics',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  getInstructorAnalytics
);

router.post(
  '/course/:courseId',
  validate({ params: courseIdParamSchema, body: addReviewSchema }),
  addReview
);
router.patch(
  '/:id',
  validate({ params: reviewIdParamSchema, body: updateReviewSchema }),
  updateReview
);
router.delete('/:id', validate({ params: reviewIdParamSchema }), deleteReview);

export default router;
