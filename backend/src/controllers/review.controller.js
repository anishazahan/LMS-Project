import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess, paginate } from '../utils/ApiResponse.js';
import { HTTP } from '../constants/httpStatus.js';
import { parsePagination } from '../utils/pagination.js';
import Review from '../models/review.model.js';
import Course from '../models/course.model.js';
import Enrollment from '../models/enrollment.model.js';
import { recomputeCourseRating } from '../services/review.service.js';

const REVIEW_USER_FIELDS = 'name profileImage';

const populateReview = (query) => query.populate('user', REVIEW_USER_FIELDS);

export const addReview = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { rating, comment } = req.body;

  const course = await Course.findById(courseId).select('_id');
  if (!course) throw ApiError.notFound('Course not found');

  const enrolled = await Enrollment.findOne({
    student: req.userId,
    course: courseId,
    paymentStatus: 'completed',
  }).select('_id');
  if (!enrolled) {
    throw new ApiError(HTTP.FORBIDDEN, 'You must purchase this course before reviewing it', {
      code: 'MUST_PURCHASE_FIRST',
    });
  }

  let review;
  try {
    review = await Review.create({
      user: req.userId,
      course: courseId,
      rating,
      comment,
    });
  } catch (err) {
    if (err?.code === 11000) {
      throw new ApiError(HTTP.CONFLICT, 'You have already reviewed this course', {
        code: 'ALREADY_REVIEWED',
      });
    }
    throw err;
  }

  await recomputeCourseRating(courseId);
  const populated = await populateReview(Review.findById(review._id));

  return sendSuccess(res, {
    statusCode: HTTP.CREATED,
    message: 'Review submitted',
    data: { review: populated },
  });
});

export const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) throw ApiError.notFound('Review not found');
  if (!review.user.equals(req.userId)) {
    throw ApiError.forbidden('You can only edit your own review');
  }

  const ratingChanged = req.body.rating !== undefined && req.body.rating !== review.rating;
  if (req.body.rating !== undefined) review.rating = req.body.rating;
  if (req.body.comment !== undefined) review.comment = req.body.comment;
  review.isEdited = true;
  await review.save();

  if (ratingChanged) await recomputeCourseRating(review.course);

  const populated = await populateReview(Review.findById(review._id));
  return sendSuccess(res, { message: 'Review updated', data: { review: populated } });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) throw ApiError.notFound('Review not found');
  if (!review.user.equals(req.userId)) {
    throw ApiError.forbidden('You can only delete your own review');
  }

  const courseId = review.course;
  await review.deleteOne();
  await recomputeCourseRating(courseId);

  return sendSuccess(res, { message: 'Review deleted', data: { id } });
});

export const getCourseReviews = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { page, limit, skip } = parsePagination(req.query);

  const [items, total] = await Promise.all([
    populateReview(
      Review.find({ course: courseId }).sort('-createdAt').skip(skip).limit(limit)
    ),
    Review.countDocuments({ course: courseId }),
  ]);

  return sendSuccess(res, paginate(items, { page, limit, total }));
});

export const getRatingSummary = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const courseObjectId = new mongoose.Types.ObjectId(courseId);

  const [overall, buckets] = await Promise.all([
    Review.aggregate([
      { $match: { course: courseObjectId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
    Review.aggregate([
      { $match: { course: courseObjectId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]),
  ]);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const b of buckets) distribution[b._id] = b.count;
  const avg = overall[0] ? Math.round(overall[0].avg * 10) / 10 : 0;
  const count = overall[0] ? overall[0].count : 0;

  return sendSuccess(res, { data: { summary: { avg, count, distribution } } });
});

export const getTestimonials = asyncHandler(async (req, res) => {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));

  const items = await Review.find({ rating: { $gte: 4 } })
    .sort('-createdAt')
    .limit(limit)
    .populate('user', REVIEW_USER_FIELDS)
    .populate('course', 'title thumbnail');

  return sendSuccess(res, { data: { items } });
});

export const getMyReviews = asyncHandler(async (req, res) => {
  const items = await Review.find({ user: req.userId })
    .sort('-createdAt')
    .populate('course', 'title thumbnail');
  return sendSuccess(res, { data: { items } });
});

export const getInstructorAnalytics = asyncHandler(async (req, res) => {
  const instructorObjectId = new mongoose.Types.ObjectId(req.userId);

  // Find this instructor's courses once; reuse the id list for the aggregations.
  const courses = await Course.find({ instructor: instructorObjectId }).select(
    '_id title rating reviewCount'
  );
  const courseIds = courses.map((c) => c._id);

  if (courseIds.length === 0) {
    return sendSuccess(res, {
      data: {
        analytics: {
          totalReviews: 0,
          avgRating: 0,
          recentFeedback: [],
          mostReviewed: [],
        },
      },
    });
  }

  const [agg, recentFeedback] = await Promise.all([
    Review.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: null, totalReviews: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
    ]),
    Review.find({ course: { $in: courseIds } })
      .sort('-createdAt')
      .limit(10)
      .populate('user', REVIEW_USER_FIELDS)
      .populate('course', 'title'),
  ]);

  const totalReviews = agg[0] ? agg[0].totalReviews : 0;
  const avgRating = agg[0] ? Math.round(agg[0].avgRating * 10) / 10 : 0;

  const mostReviewed = courses
    .map((c) => ({
      _id: c._id,
      title: c.title,
      reviewCount: c.reviewCount || 0,
      rating: c.rating || 0,
    }))
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 5);

  return sendSuccess(res, {
    data: {
      analytics: { totalReviews, avgRating, recentFeedback, mostReviewed },
    },
  });
});
