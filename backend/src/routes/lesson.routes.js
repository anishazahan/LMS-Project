import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { ROLES } from '../constants/roles.js';
import {
  listLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  togglePublishLesson,
} from '../controllers/lesson.controller.js';
import {
  createLessonSchema,
  updateLessonSchema,
  publishLessonSchema,
  moduleAndLessonParams,
  moduleIdParam,
} from '../validators/lesson.validator.js';

const router = Router();

router.get('/:moduleId/lessons', validate({ params: moduleIdParam }), listLessons);

router.use(protect);

router.post(
  '/:moduleId/lessons',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({ params: moduleIdParam, body: createLessonSchema }),
  createLesson
);
router.patch(
  '/:moduleId/lessons/:lessonId',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({ params: moduleAndLessonParams, body: updateLessonSchema }),
  updateLesson
);
router.delete(
  '/:moduleId/lessons/:lessonId',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({ params: moduleAndLessonParams }),
  deleteLesson
);
router.patch(
  '/:moduleId/lessons/:lessonId/publish',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({ params: moduleAndLessonParams, body: publishLessonSchema }),
  togglePublishLesson
);

export default router;
