"use client";

import { useState, type FormEvent } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { Course, CourseCategory, CourseLevel } from "@/types";

const CATEGORY_OPTIONS: { value: CourseCategory; label: string }[] = [
  { value: "programming", label: "Programming" },
  { value: "design", label: "Design" },
  { value: "business", label: "Business" },
  { value: "personal-development", label: "Personal Development" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
];

const LEVEL_OPTIONS: { value: CourseLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export interface CourseFormValues {
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  category: CourseCategory;
  level: CourseLevel;
}

interface CourseFormProps {
  initial?: Partial<Course>;
  thumbnailUrl?: string | null;
  thumbnailFile?: File | null;
  onThumbnailFileChange?: (file: File | null) => void;
  onSubmit: (values: CourseFormValues) => Promise<void> | void;
  submitLabel?: string;
  submitting?: boolean;
}

export function CourseForm({
  initial,
  thumbnailUrl,
  thumbnailFile,
  onThumbnailFileChange,
  onSubmit,
  submitLabel = "Save",
  submitting,
}: CourseFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [fullDescription, setFullDescription] = useState(initial?.fullDescription ?? "");
  const [price, setPrice] = useState<string>(
    initial?.price !== undefined ? String(initial.price) : "0",
  );
  const [category, setCategory] = useState<CourseCategory>(initial?.category ?? "other");
  const [level, setLevel] = useState<CourseLevel>(initial?.level ?? "beginner");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (title.trim().length < 3) next.title = "At least 3 characters";
    if (shortDescription.trim().length < 10) next.shortDescription = "At least 10 characters";
    if (shortDescription.length > 280) next.shortDescription = "Max 280 characters";
    if (fullDescription.trim().length < 20) next.fullDescription = "At least 20 characters";
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) next.price = "Must be 0 or greater";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      price: Number(price),
      category,
      level,
    });
  };

  const previewSrc = thumbnailFile ? URL.createObjectURL(thumbnailFile) : thumbnailUrl ?? null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Course title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={160}
          className="rounded-xs"
        />
        {errors.title ? <p className="text-xs text-destructive">{errors.title}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDescription">Short description</Label>
        <Textarea
          id="shortDescription"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          maxLength={280}
          rows={2}
          className="rounded-xs"
        />
        <p className="text-xs text-muted-foreground">{shortDescription.length}/280</p>
        {errors.shortDescription ? (
          <p className="text-xs text-destructive">{errors.shortDescription}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullDescription">Full description</Label>
        <Textarea
          id="fullDescription"
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          rows={8}
          className="rounded-xs"
        />
        {errors.fullDescription ? (
          <p className="text-xs text-destructive">{errors.fullDescription}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-xs"
          />
          {errors.price ? <p className="text-xs text-destructive">{errors.price}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as CourseCategory)}
            options={CATEGORY_OPTIONS}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value as CourseLevel)}
            options={LEVEL_OPTIONS}
          />
        </div>
      </div>

      {onThumbnailFileChange ? (
        <div className="space-y-2">
          <Label htmlFor="thumbnail">Thumbnail</Label>
          <div className="flex items-start gap-4">
            <div className="relative h-32 w-48 overflow-hidden rounded-xs border bg-muted">
              {previewSrc ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={previewSrc} alt="Thumbnail preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Input
                id="thumbnail"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => onThumbnailFileChange(e.target.files?.[0] ?? null)}
                className="rounded-xs"
              />
              <p className="text-xs text-muted-foreground">JPEG/PNG/WebP/GIF, max 5 MB.</p>
              {thumbnailFile ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onThumbnailFileChange(null)}
                  className="rounded-xs"
                >
                  Clear selection
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <Button type="submit" disabled={submitting} className="rounded-xs">
        <Upload className="h-4 w-4" />
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
