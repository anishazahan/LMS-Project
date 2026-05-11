import mongoose from 'mongoose';

// `user` (any buyer — student or instructor) is intentionally still named `student`
// to avoid breaking the existing controller during the migration. Treat semantically as buyer.
const paymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    stripeSessionId: { type: String, index: true, unique: true, sparse: true },
    stripePaymentIntentId: { type: String, index: true, unique: true, sparse: true },
    transactionId: { type: String, index: true },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'canceled', 'expired'],
      default: 'pending',
    },
    paidAt: { type: Date },
    failureReason: { type: String },
    confirmationEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

paymentSchema.index({ student: 1, createdAt: -1 });
paymentSchema.index({ instructor: 1, status: 1 });
paymentSchema.index({ course: 1, status: 1 });

export default mongoose.model('Payment', paymentSchema);
