import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { HTTP } from '../constants/httpStatus.js';
import { signAccessToken } from '../services/token.service.js';
import { sendEmail } from '../services/email.service.js';
import User from '../models/user.model.js';
import { logger } from '../config/logger.js';

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage?.url || null,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('User already exists with this email');

  const user = await User.create({ name, email, password, role: role || 'student' });
  const token = signAccessToken({ id: user._id, role: user.role });

  // Fire-and-forget welcome email
  sendEmail(user.email, 'welcomeEmail', user.name).catch((e) =>
    logger.error(`Welcome email failed: ${e.message}`)
  );

  return sendSuccess(res, {
    statusCode: HTTP.CREATED,
    message: 'Registered successfully',
    data: { token, user: userPayload(user) },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid credentials');

  const ok = await user.matchPassword(password);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');

  const token = signAccessToken({ id: user._id, role: user.role });

  return sendSuccess(res, {
    message: 'Logged in',
    data: { token, user: userPayload(user) },
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId)
    .populate('enrolledCourses')
    .populate('createdCourses');
  return sendSuccess(res, { data: { user } });
});
