"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  useDeleteProfileImageMutation,
  useUploadProfileImageMutation,
} from "@/lib/api/user.api";
import { getProfileImageUrl, getUserInitials } from "@/lib/user";
import { validateProfileImage } from "@/lib/validation/profile.schema";
import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function ProfilePhotoUploader({ user }: Props) {
  const [uploadImage, { isLoading: uploading }] =
    useUploadProfileImageMutation();
  const [deleteImage, { isLoading: removing }] =
    useDeleteProfileImageMutation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const liveUrl = previewUrl || getProfileImageUrl(user);
  const busy = uploading || removing;
  const hasImage = Boolean(getProfileImageUrl(user));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="group relative">
        <Avatar className="h-32 w-32 border-4 border-background shadow-2xl ring-2 ring-[#7C3AED]/10">
          {liveUrl ? (
            <AvatarImage
              src={liveUrl}
              alt={user.name}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="text-3xl font-black bg-muted text-[#7C3AED]">
            {getUserInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-[#7C3AED] text-white flex items-center justify-center border-4 border-background hover:scale-110 transition-transform disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const err = validateProfileImage(file);
          if (err) return toast.error(err);
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
          uploadImage(file)
            .unwrap()
            .then(() => toast.success("Photo updated"))
            .finally(() => {
              URL.revokeObjectURL(url);
              setPreviewUrl(null);
            });
        }}
      />

      {hasImage && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteImage().unwrap()}
          disabled={busy}
          className="text-destructive font-bold text-[10px] uppercase tracking-widest hover:bg-destructive/5"
        >
          {removing ? "Removing..." : "Remove Photo"}
        </Button>
      )}
    </div>
  );
}
