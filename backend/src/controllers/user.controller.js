import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess, paginate } from '../utils/ApiResponse.js';
import { parsePagination } from '../utils/pagination.js';
import { uploadFromBuffer, destroy } from '../services/cloudinary.service.js';
import { ROLES } from '../constants/roles.js';
import User from '../models/user.model.js';
import Course from '../models/course.model.js';

const PUBLIC_FIELDS = 'name role profileImage bio socialLinks createdAt';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw ApiError.notFound('User not found');
  return sendSuccess(res, { data: { user } });
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid user id');

  const user = await User.findById(id).select(PUBLIC_FIELDS);
  if (!user) throw ApiError.notFound('User not found');
  return sendSuccess(res, { data: { user } });
});

export const listInstructors = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { role: ROLES.INSTRUCTOR };
  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: 'i' };
  }

  const [items, total] = await Promise.all([
    User.find(filter).select(PUBLIC_FIELDS).sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  // Decorate with public course counts so cards can show stats.
  const ids = items.map((i) => i._id);
  const counts = await Course.aggregate([
    { $match: { instructor: { $in: ids }, isPublished: true } },
    { $group: { _id: '$instructor', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));

  const data = items.map((u) => ({
    ...u.toObject(),
    publishedCourseCount: countMap[u._id.toString()] || 0,
  }));

  return sendSuccess(res, paginate(data, { page, limit, total }));
});

export const getInstructorWithCourses = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid user id');

  const instructor = await User.findOne({ _id: id, role: ROLES.INSTRUCTOR }).select(PUBLIC_FIELDS);
  if (!instructor) throw ApiError.notFound('Instructor not found');

  const courses = await Course.find({ instructor: id, isPublished: true })
    .select('title shortDescription thumbnail price category level rating reviewCount createdAt')
    .sort('-createdAt');

  return sendSuccess(res, { data: { instructor, courses } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.bio !== undefined) updates.bio = req.body.bio;

  if (req.body.socialLinks && typeof req.body.socialLinks === 'object') {
    const current = (await User.findById(req.userId).select('socialLinks'))?.socialLinks || {};
    updates.socialLinks = {
      linkedin: req.body.socialLinks.linkedin ?? current.linkedin ?? '',
      github: req.body.socialLinks.github ?? current.github ?? '',
      website: req.body.socialLinks.website ?? current.website ?? '',
    };
  }

  const user = await User.findByIdAndUpdate(req.userId, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw ApiError.notFound('User not found');
  return sendSuccess(res, { message: 'Profile updated', data: { user } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.userId).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const ok = await user.matchPassword(currentPassword);
  if (!ok) throw ApiError.unauthorized('Current password is incorrect');

  user.password = newPassword;
  await user.save();
  return sendSuccess(res, { message: 'Password changed' });
});

export const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image uploaded (field name: image)');

  const user = await User.findById(req.userId);
  if (!user) throw ApiError.notFound('User not found');

  if (user.profileImage?.publicId) {
    await destroy(user.profileImage.publicId, 'image').catch(() => {});
  }

  const result = await uploadFromBuffer(req.file.buffer, {
    folder: `users/${user._id}/profile`,
    resourceType: 'image',
  });

  user.profileImage = { url: result.url, publicId: result.publicId };
  await user.save();

  return sendSuccess(res, { message: 'Profile image updated', data: { profileImage: user.profileImage } });
});

export const deleteProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw ApiError.notFound('User not found');

  if (user.profileImage?.publicId) {
    await destroy(user.profileImage.publicId, 'image').catch(() => {});
  }

  user.profileImage = { url: null, publicId: null };
  await user.save();
  return sendSuccess(res, { message: 'Profile image removed' });
});
