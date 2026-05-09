import * as yup from "yup";

const optionalUrl = yup
  .string()
  .trim()
  .max(500, "URL is too long")
  .test("is-url", "Must be a valid URL", (value) => {
    if (!value) return true;
    try {
      // Accept http(s)://… only.
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  });

export const updateProfileSchema = yup
  .object({
    name: yup.string().trim().required("Name is required").min(2, "Name is too short").max(80),
    bio: yup.string().trim().max(1000, "Bio is too long").default(""),
    socialLinks: yup
      .object({
        linkedin: optionalUrl.default(""),
        github: optionalUrl.default(""),
        website: optionalUrl.default(""),
      })
      .default({ linkedin: "", github: "", website: "" }),
  })
  .required();

export type UpdateProfileValues = yup.InferType<typeof updateProfileSchema>;

export const changePasswordSchema = yup
  .object({
    currentPassword: yup.string().required("Current password is required"),
    newPassword: yup
      .string()
      .required("New password is required")
      .min(6, "At least 6 characters")
      .max(128),
    confirmPassword: yup
      .string()
      .required("Confirm your new password")
      .oneOf([yup.ref("newPassword")], "Passwords do not match"),
  })
  .required();

export type ChangePasswordValues = yup.InferType<typeof changePasswordSchema>;

export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export const validateProfileImage = (file: File): string | null => {
  if (!PROFILE_IMAGE_TYPES.includes(file.type as (typeof PROFILE_IMAGE_TYPES)[number])) {
    return "Only JPEG, PNG, WebP, or GIF images are allowed.";
  }
  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
};
