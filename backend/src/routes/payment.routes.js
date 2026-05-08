import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createIntent, myPayments } from '../controllers/payment.controller.js';
import { createIntentSchema } from '../validators/payment.validator.js';

const router = Router();

router.use(protect);

router.post('/create-intent', validate({ body: createIntentSchema }), createIntent);
router.get('/me', myPayments);

export default router;
