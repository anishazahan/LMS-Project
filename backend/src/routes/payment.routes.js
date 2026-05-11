import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { ROLES } from '../constants/roles.js';
import {
  createCheckoutSession,
  getPaymentBySession,
  myPayments,
  getReceiptData,
  getStudentPurchases,
  getInstructorStats,
  getInstructorSales,
} from '../controllers/payment.controller.js';
import {
  checkoutSessionSchema,
  sessionIdParamSchema,
  paymentIdParamSchema,
  instructorSalesQuerySchema,
} from '../validators/payment.validator.js';

const router = Router();

router.use(protect);

router.post(
  '/checkout-session',
  validate({ body: checkoutSessionSchema }),
  createCheckoutSession
);

router.get(
  '/by-session/:sessionId',
  validate({ params: sessionIdParamSchema }),
  getPaymentBySession
);

router.get('/me', myPayments);
router.get('/student/purchases', getStudentPurchases);

router.get(
  '/instructor/stats',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  getInstructorStats
);

router.get(
  '/instructor/sales',
  authorize(ROLES.INSTRUCTOR, ROLES.ADMIN),
  validate({ query: instructorSalesQuerySchema }),
  getInstructorSales
);

router.get(
  '/:id/receipt-data',
  validate({ params: paymentIdParamSchema }),
  getReceiptData
);

export default router;
