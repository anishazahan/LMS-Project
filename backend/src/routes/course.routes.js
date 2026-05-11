import { Router } from 'express';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadImage, handleMulter } from '../middlewares/upload.middleware.js';
import { ROLES } from '../constants/roles.js';
import {
  listCourses,
  listInstructorCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublish,
  uploadThumbnail,
} from '../controllers/course.controller.js';
import {
  createCourseSchema,
  updateCourseSchema,
  listCourseQuery,
  instructorListQuery,
  publishSchema,
} from '../validators/course.validator.js';
import { idParam } from '../validators/common.validator.js';

const router = Router();

// Public (optionalAuth so logged-in users get isEnrolled flags on each course)
router.get('/', optionalAuth, validate({ query: listCourseQuery }), listCourses);
router.get('/:id', optionalAuth, validate({ params: idParam }), getCourse);

// Authenticated routes below
router.use(protect);

// Instructor's own courses (all statuses)
router.get(
  '/instructor/me',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({ query: instructorListQuery }),
  listInstructorCourses
);

router.post(
  '/',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({ body: createCourseSchema }),
  createCourse
);
router.patch(
  '/:id',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({ params: idParam, body: updateCourseSchema }),
  updateCourse
);
router.delete(
  '/:id',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({ params: idParam }),
  deleteCourse
);
router.patch(
  '/:id/publish',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({ params: idParam, body: publishSchema }),
  togglePublish
);
router.post(
  '/:id/thumbnail',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({ params: idParam }),
  handleMulter(uploadImage.single('image')),
  uploadThumbnail
);

export default router;
