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

export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  thumbnail?: { url: string | null; publicId: string | null };
  isPublished: boolean;
  instructor: Pick<User, "_id" | "name" | "email"> | string;
  modules?: string[] | Module[];
  enrolledStudents?: string[];
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Module {
  _id: string;
  title: string;
  description: string;
  course: string;
  video: { url: string; publicId?: string | null; type: "youtube" | "cloudinary" | "external" };
  duration: number;
  content?: string;
  resources?: Array<{ title: string; url: string; publicId?: string | null; type: string }>;
  isPublished: boolean;
  order: number;
}

export interface Enrollment {
  _id: string;
  student: string;
  course: Course | string;
  progress: number;
  completedModules: string[] | Module[];
  paymentStatus: "pending" | "completed" | "failed";
  enrollmentDate: string;
  completionDate?: string;
}

export interface Payment {
  _id: string;
  student: string;
  course: Course | string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "canceled";
  stripePaymentIntentId?: string;
  receiptUrl?: string;
  createdAt: string;
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
