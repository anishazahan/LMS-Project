"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMeQuery } from "@/lib/api/user.api";
import { ProfilePhotoUploader } from "./profile-photo-uploader";
import { ProfileInfoForm } from "./profile-info-form";
import { SocialLinksForm } from "./social-links-form";
import { ChangePasswordForm } from "./change-password-form";

export function ProfileEditView() {
  const { data, isLoading, isError } = useGetMeQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !data?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Could not load profile</CardTitle>
          <CardDescription>Please refresh the page or log in again.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const user = data.user;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information and account.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile photo</CardTitle>
          <CardDescription>Upload a clear photo of yourself.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfilePhotoUploader user={user} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Update your name and bio.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileInfoForm user={user} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social links</CardTitle>
          <CardDescription>Optional. Visible on your public profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <SocialLinksForm user={user} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Use a strong password you don&apos;t reuse elsewhere.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
