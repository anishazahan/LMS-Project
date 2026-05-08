import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadImage, handleMulter } from '../middlewares/upload.middleware.js';
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
  deleteProfileImage,
} from '../controllers/user.controller.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/user.validator.js';

const router = Router();

router.use(protect);

router.get('/me', getProfile);
router.patch('/me', validate({ body: updateProfileSchema }), updateProfile);
router.patch('/me/password', validate({ body: changePasswordSchema }), changePassword);
router.post('/me/profile-image', handleMulter(uploadImage.single('image')), uploadProfileImage);
router.delete('/me/profile-image', deleteProfileImage);

export default router;
