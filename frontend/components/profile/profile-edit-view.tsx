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
import { motion } from "framer-motion";
import { Share2, ShieldCheck, User } from "lucide-react";
import { ChangePasswordForm } from "./change-password-form";
import { ProfileInfoForm } from "./profile-info-form";
import { ProfilePhotoUploader } from "./profile-photo-uploader";
import { SocialLinksForm } from "./social-links-form";

export function ProfileEditView() {
  const { data, isLoading, isError } = useGetMeQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Skeleton className="lg:col-span-4 h-96 rounded-md" />
        <div className="lg:col-span-8 space-y-6">
          <Skeleton className="h-64 rounded-md" />
          <Skeleton className="h-64 rounded-md" />
        </div>
      </div>
    );
  }

  if (isError || !data?.user) {
    return (
      <Card className="border-destructive/50 bg-destructive/5 rounded-md">
        <CardHeader>
          <CardTitle className="text-destructive font-black tracking-tighter">
            Profile Error
          </CardTitle>
          <CardDescription>
            We couldn&apos;t fetch your data. Please try again.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const user = data.user;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 border-b pb-6"
      >
        <h1 className="text-4xl font-black tracking-tighter">
          Account Settings
        </h1>
        <p className="text-muted-foreground font-medium italic">
          Update your presence and secure your learning journey.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Sidebar: Photo & Identity Summary */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <Card className="overflow-hidden rounded-md border-muted-foreground/10 shadow-xl shadow-purple-500/5">
            <div className="h-24 bg-gradient-to-br from-[#7C3AED] to-fuchsia-500" />
            <CardContent className="relative pt-0 flex flex-col items-center text-center">
              <div className="-mt-12 mb-4">
                <ProfilePhotoUploader user={user} />
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                {user.name}
              </h2>
              <div className="mt-6 w-full pt-6 border-t space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 italic">
                  {user.bio || "No bio set yet."}
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Right Content: Forms */}
        <div className="lg:col-span-8 space-y-10 pb-20">
          <SectionWrapper
            title="Personal Information"
            description="How you appear to others on E-Study."
            icon={User}
          >
            <ProfileInfoForm user={user} />
          </SectionWrapper>

          <SectionWrapper
            title="Social Connections"
            description="Link your professional networks."
            icon={Share2}
          >
            <SocialLinksForm user={user} />
          </SectionWrapper>

          <SectionWrapper
            title="Security"
            description="Manage your authentication."
            icon={ShieldCheck}
          >
            <ChangePasswordForm />
          </SectionWrapper>
        </div>
      </div>
    </div>
  );
}

function SectionWrapper({ title, description, icon: Icon, children }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <Card className="rounded-md border-muted-foreground/10 bg-card/50 backdrop-blur-sm overflow-hidden transition-all hover:border-[#7C3AED]/20 shadow-sm">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-8 pb-4">
          <div className="h-10 w-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-black tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="font-medium mt-1">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4">{children}</CardContent>
      </Card>
    </motion.div>
  );
}
