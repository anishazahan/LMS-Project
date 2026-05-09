import * as yup from "yup";

export const loginSchema = yup
  .object({
    email: yup.string().trim().required("Email is required").email("Enter a valid email"),
    password: yup.string().required("Password is required"),
  })
  .required();

export type LoginValues = yup.InferType<typeof loginSchema>;

export const registerSchema = yup
  .object({
    name: yup.string().trim().required("Name is required").min(2, "Name is too short").max(80),
    email: yup.string().trim().required("Email is required").email("Enter a valid email"),
    password: yup
      .string()
      .required("Password is required")
      .min(6, "At least 6 characters")
      .max(128),
    confirmPassword: yup
      .string()
      .required("Confirm your password")
      .oneOf([yup.ref("password")], "Passwords do not match"),
    role: yup.mixed<"student" | "instructor">().oneOf(["student", "instructor"]).default("student"),
  })
  .required();

export type RegisterValues = yup.InferType<typeof registerSchema>;
