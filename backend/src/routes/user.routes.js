import { Router } from 'express';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadImage, handleMulter } from '../middlewares/upload.middleware.js';
import {
  getProfile,
  getPublicProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
  deleteProfileImage,
  listInstructors,
  getInstructorWithCourses,
} from '../controllers/user.controller.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  instructorListQuery,
} from '../validators/user.validator.js';
import { idParam } from '../validators/common.validator.js';

const router = Router();

// Public — instructors directory (used by landing page)
router.get('/instructors', validate({ query: instructorListQuery }), listInstructors);
router.get(
  '/instructors/:id',
  optionalAuth,
  validate({ params: idParam }),
  getInstructorWithCourses
);

router.use(protect);

router.get('/me', getProfile);
router.patch('/me', validate({ body: updateProfileSchema }), updateProfile);
router.patch('/me/password', validate({ body: changePasswordSchema }), changePassword);
router.post('/me/profile-image', handleMulter(uploadImage.single('image')), uploadProfileImage);
router.delete('/me/profile-image', deleteProfileImage);

router.get('/:id', getPublicProfile);

export default router;
