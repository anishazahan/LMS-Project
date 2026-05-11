import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, minlength: 1, maxlength: 2000 },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One review per (user, course)
reviewSchema.index({ user: 1, course: 1 }, { unique: true });
// Paginated listing on course details page
reviewSchema.index({ course: 1, createdAt: -1 });
// Testimonial top-rated queries
reviewSchema.index({ rating: -1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
