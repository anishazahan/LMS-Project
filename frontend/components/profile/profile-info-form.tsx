"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProfileMutation } from "@/lib/api/user.api";
import type { User } from "@/types";
import { yupResolver } from "@hookform/resolvers/yup";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";

const infoSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .required("Name is required")
      .min(2, "Name is too short")
      .max(80),
    bio: yup.string().trim().max(1000, "Bio is too long").default(""),
  })
  .required();

type InfoValues = yup.InferType<typeof infoSchema>;

interface Props {
  user: User;
}

export function ProfileInfoForm({ user }: Props) {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<InfoValues>({
    resolver: yupResolver(infoSchema),
    defaultValues: { name: user.name, bio: user.bio || "" },
  });

  useEffect(() => {
    reset({ name: user.name, bio: user.bio || "" });
  }, [user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile(values).unwrap();
      toast.success("Profile updated");
    } catch {
      // central error toast
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" autoComplete="name" {...register("name")} />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          rows={5}
          placeholder="Tell others a bit about yourself"
          {...register("bio")}
        />
        {errors.bio && (
          <p className="text-xs text-destructive">{errors.bio.message}</p>
        )}
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading || !isDirty}
          className="gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}
