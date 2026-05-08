import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Course title is required'], trim: true, index: 'text' },
    description: { type: String, required: [true, 'Course description is required'] },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    thumbnail: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['programming', 'design', 'business', 'personal-development', 'marketing', 'other'],
      default: 'other',
      index: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
      index: true,
    },
    isPublished: { type: Boolean, default: false, index: true },
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

courseSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Course', courseSchema);
