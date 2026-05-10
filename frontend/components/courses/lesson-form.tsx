"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";
import type { Lesson } from "@/types";

const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{6,}/;

export interface LessonFormValues {
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  isFreePreview: boolean;
  isPublished: boolean;
}

interface LessonFormProps {
  initial?: Partial<Lesson>;
  onSubmit: (values: LessonFormValues) => void | Promise<void>;
  submitLabel?: string;
  submitting?: boolean;
}

export function LessonForm({ initial, onSubmit, submitLabel = "Add lesson", submitting }: LessonFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [duration, setDuration] = useState<string>(
    initial?.duration !== undefined ? String(initial.duration) : "0",
  );
  const [isFreePreview, setIsFreePreview] = useState<boolean>(initial?.isFreePreview ?? false);
  const [isPublished, setIsPublished] = useState<boolean>(initial?.isPublished ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const next: Record<string, string> = {};
        if (title.trim().length < 3) next.title = "At least 3 characters";
        if (!YOUTUBE_REGEX.test(videoUrl.trim())) next.videoUrl = "Must be a YouTube URL";
        const dur = Number(duration);
        if (Number.isNaN(dur) || dur < 0) next.duration = "Must be 0 or greater";
        setErrors(next);
        if (Object.keys(next).length) return;

        onSubmit({
          title: title.trim(),
          description: description.trim(),
          videoUrl: videoUrl.trim(),
          duration: dur,
          isFreePreview,
          isPublished,
        });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="lesson-title">Lesson title</Label>
        <Input
          id="lesson-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={160}
          className="rounded-xs"
        />
        {errors.title ? <p className="text-xs text-destructive">{errors.title}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lesson-video">YouTube link</Label>
        <Input
          id="lesson-video"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="rounded-xs"
        />
        {errors.videoUrl ? <p className="text-xs text-destructive">{errors.videoUrl}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lesson-description">Description</Label>
        <Textarea
          id="lesson-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-xs"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="lesson-duration">Duration (minutes)</Label>
          <Input
            id="lesson-duration"
            type="number"
            min={0}
            step={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="rounded-xs"
          />
          {errors.duration ? <p className="text-xs text-destructive">{errors.duration}</p> : null}
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch
            id="lesson-free"
            checked={isFreePreview}
            onCheckedChange={setIsFreePreview}
            aria-label="Free preview"
          />
          <Label htmlFor="lesson-free" className="cursor-pointer">
            Free preview
          </Label>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch
            id="lesson-published"
            checked={isPublished}
            onCheckedChange={setIsPublished}
            aria-label="Published"
          />
          <Label htmlFor="lesson-published" className="cursor-pointer">
            Published
          </Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={submitting} className="rounded-xs">
          {submitting ? "Saving..." : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
