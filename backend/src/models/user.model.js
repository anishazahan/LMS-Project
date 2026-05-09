import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import { ALL_ROLES, ROLES } from '../constants/roles.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: { type: String, enum: ALL_ROLES, default: ROLES.STUDENT },
    profileImage: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    bio: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.verificationToken;
        delete ret.twoFactorSecret;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

userSchema.methods.matchPassword = function (entered) {
  return bcryptjs.compare(entered, this.password);
};

export default mongoose.model('User', userSchema);
