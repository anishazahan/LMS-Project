import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a module title'],
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    videoUrl: {
      type: String,
      required: [true, 'Please provide a video URL']
    },
    videoType: {
      type: String,
      enum: ['youtube', 'cloudinary', 'external'],
      default: 'youtube'
    },
    duration: {
      type: Number,
      default: 0
    },
    content: {
      type: String,
      default: ''
    },
    resources: [
      {
        title: String,
        url: String,
        type: String
      }
    ],
    isPublished: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Module', moduleSchema);
