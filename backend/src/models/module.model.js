import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, default: null },
    type: { type: String, default: 'document' },
  },
  { _id: false }
);

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Module title is required'], trim: true },
    description: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    video: {
      url: { type: String, required: true },
      publicId: { type: String, default: null },
      type: { type: String, enum: ['youtube', 'cloudinary', 'external'], default: 'youtube' },
    },
    duration: { type: Number, default: 0 },
    content: { type: String, default: '' },
    resources: [resourceSchema],
    isPublished: { type: Boolean, default: false },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

moduleSchema.index({ course: 1, order: 1 });

export default mongoose.model('Module', moduleSchema);
