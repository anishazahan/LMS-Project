import mongoose from 'mongoose';
import Course from '../models/course.model.js';
import Review from '../models/review.model.js';

/**
 * Recompute Course.rating + Course.reviewCount from the Review collection.
 * Called after every Review CRUD. Cheap: a single $group on an indexed field.
 * Returns the new values.
 */
export const recomputeCourseRating = async (courseId) => {
  const [agg] = await Review.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const rating = agg ? Math.round(agg.avg * 10) / 10 : 0;
  const reviewCount = agg ? agg.count : 0;

  await Course.findByIdAndUpdate(courseId, { rating, reviewCount });
  return { rating, reviewCount };
};
