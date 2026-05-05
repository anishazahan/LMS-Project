import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a course description']
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    thumbnail: {
      type: String,
      default: null
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      enum: ['programming', 'design', 'business', 'personal-development', 'marketing', 'other'],
      default: 'other'
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    modules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
      }
    ],
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);
