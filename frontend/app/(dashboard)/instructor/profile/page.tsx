import type { Metadata } from "next";
import { ProfileEditView } from "@/components/profile/profile-edit-view";

export const metadata: Metadata = { title: "Profile" };

export default function InstructorProfilePage() {
  return <ProfileEditView />;
}
