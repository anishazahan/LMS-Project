import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  myEnrollments,
  getEnrollment,
  completeModule,
} from '../controllers/enrollment.controller.js';
import { completeModuleSchema } from '../validators/enrollment.validator.js';
import { idParam } from '../validators/common.validator.js';

const router = Router();

router.use(protect);

router.get('/me', myEnrollments);
router.get('/:id', validate({ params: idParam }), getEnrollment);
router.post(
  '/:id/complete-module',
  validate({ params: idParam, body: completeModuleSchema }),
  completeModule
);

export default router;
