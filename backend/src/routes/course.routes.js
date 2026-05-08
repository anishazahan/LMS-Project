import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadImage, handleMulter } from '../middlewares/upload.middleware.js';
import { ROLES } from '../constants/roles.js';
import {
  listCourses,
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
  publishSchema,
} from '../validators/course.validator.js';
import { idParam } from '../validators/common.validator.js';

const router = Router();

router.get('/', validate({ query: listCourseQuery }), listCourses);
router.get('/:id', validate({ params: idParam }), getCourse);

router.use(protect);

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
