import type { User } from "@/types";

export const getProfileImageUrl = (user: Pick<User, "profileImage"> | null | undefined): string | null => {
  if (!user?.profileImage) return null;
  if (typeof user.profileImage === "string") return user.profileImage || null;
  return user.profileImage.url || null;
};

export const getUserInitials = (name: string | undefined | null): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "?";
};
