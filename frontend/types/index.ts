import type { Role } from "@/lib/constants";

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  profileImage?: { url: string | null; publicId: string | null } | string | null;
  bio?: string;
  enrolledCourses?: string[];
  createdCourses?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicInstructor {
  _id: string;
  name: string;
  role: "instructor";
  profileImage?: { url: string | null; publicId: string | null };
  bio?: string;
  socialLinks?: { linkedin?: string; github?: string; website?: string };
  createdAt?: string;
  publishedCourseCount?: number;
}

export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseCategory =
  | "programming"
  | "design"
  | "business"
  | "personal-development"
  | "marketing"
  | "other";

export interface Course {
  _id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  category: CourseCategory;
  level: CourseLevel;
  thumbnail?: { url: string | null; publicId: string | null };
  isPublished: boolean;
  instructor: Pick<User, "_id" | "name" | "email"> | string;
  modules?: string[] | Module[];
  enrolledStudents?: string[];
  isEnrolled?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number;
  isFreePreview: boolean;
  isPublished: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Module {
  _id: string;
  title: string;
  description?: string;
  course: string;
  order: number;
  isPublished: boolean;
  lessons: Lesson[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Enrollment {
  _id: string;
  student: string;
  course: Course | string;
  progress: number;
  completedModules: string[];
  paymentStatus: "pending" | "completed" | "failed";
  enrollmentDate: string;
  completionDate?: string;
}

export type PaymentStatus = "pending" | "succeeded" | "failed" | "canceled" | "expired";

export interface Payment {
  _id: string;
  student: string | Pick<User, "_id" | "name" | "email">;
  course: Course | string;
  instructor?: string | Pick<User, "_id" | "name" | "email">;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  transactionId?: string;
  paidAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReceiptData {
  platform: { name: string };
  user: { name: string; email: string };
  course: { title: string };
  instructor: { name: string };
  transactionId: string;
  amount: number;
  currency: string;
  paidAt: string;
  status: PaymentStatus;
}

export interface InstructorStats {
  totalStudents: number;
  totalSales: number;
  totalRevenue: number;
  currency: string;
  monthlyBreakdown: Array<{ year: number; month: number; revenue: number; sales: number }>;
}

export interface PurchasedEnrollment {
  _id: string;
  course: Course;
  payment?: Pick<Payment, "amount" | "currency" | "paidAt" | "transactionId"> & { _id?: string };
  progress: number;
  paymentStatus: "pending" | "completed" | "failed";
  enrollmentDate: string;
}

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export interface Review {
  _id: string;
  user: Pick<User, "_id" | "name" | "profileImage"> | null;
  course: string | Pick<Course, "_id" | "title" | "thumbnail">;
  rating: ReviewRating;
  comment: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RatingSummary {
  avg: number;
  count: number;
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
}

export interface InstructorReviewAnalytics {
  totalReviews: number;
  avgRating: number;
  recentFeedback: Review[];
  mostReviewed: Array<{ _id: string; title: string; reviewCount: number; rating: number }>;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  message?: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiFailure {
  success: false;
  message: string;
  details?: Array<{ path: string; message: string }>;
  code?: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiFailure;
