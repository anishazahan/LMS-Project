"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  useUploadProfileImageMutation,
  useDeleteProfileImageMutation,
} from "@/lib/api/user.api";
import { validateProfileImage } from "@/lib/validation/profile.schema";
import { getProfileImageUrl, getUserInitials } from "@/lib/user";
import type { User } from "@/types";

interface Props {
  user: User;
}

export function ProfilePhotoUploader({ user }: Props) {
  const [uploadImage, { isLoading: uploading }] = useUploadProfileImageMutation();
  const [deleteImage, { isLoading: removing }] = useDeleteProfileImageMutation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const liveUrl = previewUrl || getProfileImageUrl(user);

  const onPickFile = () => inputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const validationError = validateProfileImage(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    try {
      await uploadImage(file).unwrap();
      toast.success("Profile photo updated");
    } catch {
      // central error toast handles it
    } finally {
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
    }
  };

  const onRemove = async () => {
    try {
      await deleteImage().unwrap();
      toast.success("Profile photo removed");
    } catch {
      // central error toast handles it
    }
  };

  const hasImage = Boolean(getProfileImageUrl(user));
  const busy = uploading || removing;

  return (
    <div className="flex items-center gap-5">
      <Avatar className="h-24 w-24">
        {liveUrl ? <AvatarImage src={liveUrl} alt={user.name} /> : null}
        <AvatarFallback className="text-xl">{getUserInitials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={onFileChange}
        />
        <Button type="button" onClick={onPickFile} disabled={busy} className="gap-2">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          {hasImage ? "Change photo" : "Upload photo"}
        </Button>
        {hasImage ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onRemove}
            disabled={busy}
            className="gap-2 text-destructive hover:text-destructive"
          >
            {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Remove
          </Button>
        ) : null}
        <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, or GIF. Max 5 MB.</p>
      </div>
    </div>
  );
}
