import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Lesson title is required'], trim: true },
    description: { type: String, default: '' },
    videoUrl: { type: String, required: [true, 'YouTube video link is required'] },
    duration: { type: Number, default: 0, min: 0 },
    isFreePreview: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    order: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Module title is required'], trim: true },
    description: { type: String, default: '' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    order: { type: Number, required: true, min: 0 },
    isPublished: { type: Boolean, default: false },
    lessons: { type: [lessonSchema], default: [] },
  },
  { timestamps: true }
);

moduleSchema.index({ course: 1, order: 1 });

export default mongoose.model('Module', moduleSchema);
