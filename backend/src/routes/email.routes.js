import { Router } from 'express';
import { z } from 'zod';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { ROLES } from '../constants/roles.js';
import { moduleReleaseNotification } from '../controllers/email.controller.js';
import { objectIdSchema } from '../validators/common.validator.js';

const router = Router();

router.use(protect);

router.post(
  '/module-release',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({
    body: z.object({
      courseId: objectIdSchema,
      moduleName: z.string().min(1),
    }),
  }),
  moduleReleaseNotification
);

export default router;
