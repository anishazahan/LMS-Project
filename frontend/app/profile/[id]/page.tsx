import type { Metadata } from "next";
import { PublicProfileView } from "@/components/profile/public-profile-view";

export const metadata: Metadata = { title: "Profile" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params;
  return <PublicProfileView userId={id} />;
}
