"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { Github, Globe, Linkedin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateProfileMutation } from "@/lib/api/user.api";
import type { User } from "@/types";

const optionalUrl = yup
  .string()
  .trim()
  .max(500, "URL is too long")
  .test("is-url", "Must be a valid URL", (value) => {
    if (!value) return true;
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  })
  .default("");

const socialSchema = yup
  .object({
    linkedin: optionalUrl,
    github: optionalUrl,
    website: optionalUrl,
  })
  .required();

type SocialValues = yup.InferType<typeof socialSchema>;

interface Props {
  user: User & { socialLinks?: { linkedin?: string; github?: string; website?: string } };
}

export function SocialLinksForm({ user }: Props) {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const defaults: SocialValues = {
    linkedin: user.socialLinks?.linkedin || "",
    github: user.socialLinks?.github || "",
    website: user.socialLinks?.website || "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SocialValues>({
    resolver: yupResolver(socialSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.socialLinks?.linkedin, user.socialLinks?.github, user.socialLinks?.website]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile({ socialLinks: values }).unwrap();
      toast.success("Social links updated");
    } catch {
      // central error toast
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="linkedin" className="flex items-center gap-2">
          <Linkedin className="h-4 w-4" /> LinkedIn
        </Label>
        <Input id="linkedin" type="url" placeholder="https://linkedin.com/in/your-handle" {...register("linkedin")} />
        {errors.linkedin && <p className="text-xs text-destructive">{errors.linkedin.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="github" className="flex items-center gap-2">
          <Github className="h-4 w-4" /> GitHub
        </Label>
        <Input id="github" type="url" placeholder="https://github.com/your-handle" {...register("github")} />
        {errors.github && <p className="text-xs text-destructive">{errors.github.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="website" className="flex items-center gap-2">
          <Globe className="h-4 w-4" /> Website
        </Label>
        <Input id="website" type="url" placeholder="https://yourdomain.com" {...register("website")} />
        {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || !isDirty} className="gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Save links
        </Button>
      </div>
    </form>
  );
}
