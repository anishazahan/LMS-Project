"use client";

import { useAppSelector } from "@/store/hooks";
import type { Course } from "@/types";

/**
 * True if the current logged-in user has purchased this course.
 * Checks both the user's own enrolledCourses list (authoritative, populated on
 * login and on purchase success) and the course's enrolledStudents array
 * (fresh from the course endpoint), so the answer holds even if one side is stale.
 */
export function useIsEnrolled(
  course: Pick<Course, "_id" | "enrolledStudents" | "isEnrolled"> | null | undefined
) {
  const user = useAppSelector((s) => s.auth.user);
  if (!course || !user) return false;
  // Server-computed flag is authoritative when present (set by optionalAuth-aware endpoints).
  if (course.isEnrolled === true) return true;
  const userId = user._id || user.id;
  if (!userId) return false;
  if (user.enrolledCourses?.some((cid) => cid === course._id)) return true;
  if (Array.isArray(course.enrolledStudents) && course.enrolledStudents.some((s) => s === userId)) {
    return true;
  }
  return false;
}
