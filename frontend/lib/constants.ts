export const ROLES = {
  STUDENT: "student",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const TOKEN_STORAGE_KEY = "educart.token";
export const USER_STORAGE_KEY = "educart.user";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  STUDENT_DASHBOARD: "/student",
  INSTRUCTOR_DASHBOARD: "/instructor",
  ADMIN_DASHBOARD: "/admin",
} as const;

export const dashboardRouteFor = (role: Role) => {
  switch (role) {
    case ROLES.INSTRUCTOR:
      return ROUTES.INSTRUCTOR_DASHBOARD;
    case ROLES.ADMIN:
      return ROUTES.ADMIN_DASHBOARD;
    default:
      return ROUTES.STUDENT_DASHBOARD;
  }
};
