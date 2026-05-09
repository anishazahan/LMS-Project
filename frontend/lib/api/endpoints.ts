import { api } from "./axios";
import type {
  ApiSuccess,
  Course,
  Enrollment,
  Module,
  Payment,
  User,
} from "@/types";

const unwrap = <T>(promise: Promise<{ data: ApiSuccess<T> }>) =>
  promise.then((r) => r.data.data);

// ─── Auth ──────────────────────────────────────────────
export const authApi = {
  login: (body: { email: string; password: string }) =>
    unwrap<{ token: string; user: User }>(api.post("/auth/login", body)),
  register: (body: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role?: "student" | "instructor";
  }) => unwrap<{ token: string; user: User }>(api.post("/auth/register", body)),
  me: () => unwrap<{ user: User }>(api.get("/auth/me")),
};

// ─── Users ─────────────────────────────────────────────
export const userApi = {
  getProfile: () => unwrap<{ user: User }>(api.get("/users/me")),
  updateProfile: (body: { name?: string; bio?: string }) =>
    unwrap<{ user: User }>(api.patch("/users/me", body)),
  changePassword: (body: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api.patch("/users/me/password", body),
  uploadProfileImage: (file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    return unwrap<{ profileImage: { url: string; publicId: string } }>(
      api.post("/users/me/profile-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },
  deleteProfileImage: () => api.delete("/users/me/profile-image"),
};

// ─── Courses ───────────────────────────────────────────
export interface CourseListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: string;
  instructor?: string;
}

export const courseApi = {
  list: (params: CourseListParams = {}) =>
    api
      .get<ApiSuccess<{ data: Course[]; meta: ApiSuccess["meta"] }>>("/courses", { params })
      .then((r) => r.data.data),
  get: (id: string) => unwrap<{ course: Course }>(api.get(`/courses/${id}`)),
  create: (body: Partial<Course>) =>
    unwrap<{ course: Course }>(api.post("/courses", body)),
  update: (id: string, body: Partial<Course>) =>
    unwrap<{ course: Course }>(api.patch(`/courses/${id}`, body)),
  remove: (id: string) => api.delete(`/courses/${id}`),
  togglePublish: (id: string, isPublished: boolean) =>
    unwrap<{ course: Course }>(api.patch(`/courses/${id}/publish`, { isPublished })),
  uploadThumbnail: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    return unwrap<{ thumbnail: { url: string; publicId: string } }>(
      api.post(`/courses/${id}/thumbnail`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },
};

// ─── Modules ───────────────────────────────────────────
export const moduleApi = {
  listByCourse: (courseId: string) =>
    unwrap<{ modules: Module[] }>(api.get(`/modules/course/${courseId}`)),
  create: (body: Record<string, unknown>) =>
    unwrap<{ module: Module }>(api.post("/modules", body)),
  update: (id: string, body: Record<string, unknown>) =>
    unwrap<{ module: Module }>(api.patch(`/modules/${id}`, body)),
  remove: (id: string) => api.delete(`/modules/${id}`),
  togglePublish: (id: string, isPublished: boolean) =>
    unwrap<{ module: Module }>(api.patch(`/modules/${id}/publish`, { isPublished })),
  uploadVideo: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("video", file);
    return unwrap<{ video: Module["video"]; duration: number }>(
      api.post(`/modules/${id}/video`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },
  uploadResource: (id: string, file: File, title?: string) => {
    const fd = new FormData();
    fd.append("file", file);
    if (title) fd.append("title", title);
    return unwrap<{ resource: NonNullable<Module["resources"]>[number] }>(
      api.post(`/modules/${id}/resources`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },
};

// ─── Enrollments ───────────────────────────────────────
export const enrollmentApi = {
  mine: () => unwrap<{ enrollments: Enrollment[] }>(api.get("/enrollments/me")),
  get: (id: string) => unwrap<{ enrollment: Enrollment }>(api.get(`/enrollments/${id}`)),
  completeModule: (id: string, moduleId: string) =>
    unwrap<{ enrollment: Enrollment }>(
      api.post(`/enrollments/${id}/complete-module`, { moduleId })
    ),
};

// ─── Payments ──────────────────────────────────────────
export const paymentApi = {
  createIntent: (courseId: string) =>
    unwrap<{ clientSecret: string; paymentId: string; paymentIntentId: string }>(
      api.post("/payments/create-intent", { courseId })
    ),
  history: () => unwrap<{ payments: Payment[] }>(api.get("/payments/me")),
};
