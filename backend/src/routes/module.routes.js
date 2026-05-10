import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { ROLES } from '../constants/roles.js';
import {
  listByCourse,
  createModule,
  updateModule,
  deleteModule,
  togglePublish,
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

export default router;
