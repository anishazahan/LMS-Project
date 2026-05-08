import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  uploadVideo as uploadVideoMw,
  uploadDocument,
  handleMulter,
} from '../middlewares/upload.middleware.js';
import { ROLES } from '../constants/roles.js';
import {
  listByCourse,
  createModule,
  updateModule,
  deleteModule,
  togglePublish,
  uploadVideo,
  uploadResource,
} from '../controllers/module.controller.js';
import {
  createModuleSchema,
  updateModuleSchema,
  publishModuleSchema,
} from '../validators/module.validator.js';
import { idParam, objectIdSchema } from '../validators/common.validator.js';
import { z } from 'zod';

const router = Router();

router.get(
  '/course/:courseId',
  validate({ params: z.object({ courseId: objectIdSchema }) }),
  listByCourse
);

router.use(protect);

router.post(
  '/',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({ body: createModuleSchema }),
  createModule
);
router.patch(
  '/:id',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({ params: idParam, body: updateModuleSchema }),
  updateModule
);
router.delete(
  '/:id',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({ params: idParam }),
  deleteModule
);
router.patch(
  '/:id/publish',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({ params: idParam, body: publishModuleSchema }),
  togglePublish
);
router.post(
  '/:id/video',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({ params: idParam }),
  handleMulter(uploadVideoMw.single('video')),
  uploadVideo
);
router.post(
  '/:id/resources',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({ params: idParam }),
  handleMulter(uploadDocument.single('file')),
  uploadResource
);

export default router;
