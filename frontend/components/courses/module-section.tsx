"use client";

import { ConfirmDialog } from "@/components/courses/confirm-dialog";
import {
  LessonForm,
  type LessonFormValues,
} from "@/components/courses/lesson-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateLessonMutation,
  useDeleteLessonMutation,
  usePublishLessonMutation,
  useUpdateLessonMutation,
} from "@/lib/api/lesson.api";
import {
  useDeleteModuleMutation,
  usePublishModuleMutation,
  useUpdateModuleMutation,
} from "@/lib/api/module.api";
import type { Lesson, Module } from "@/types";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ModuleSectionProps {
  module: Module;
  courseId: string;
}

export function ModuleSection({ module: mod, courseId }: ModuleSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [editingModule, setEditingModule] = useState(false);
  const [confirmDeleteModule, setConfirmDeleteModule] = useState(false);
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

  const [updateModule, updateModuleState] = useUpdateModuleMutation();
  const [deleteModule, deleteModuleState] = useDeleteModuleMutation();
  const [publishModule] = usePublishModuleMutation();

  const [createLesson, createLessonState] = useCreateLessonMutation();
  const [updateLesson, updateLessonState] = useUpdateLessonMutation();
  const [deleteLesson, deleteLessonState] = useDeleteLessonMutation();
  const [publishLesson] = usePublishLessonMutation();

  const sortedLessons = [...mod.lessons].sort((a, b) => a.order - b.order);

  const handleSaveModule = async (values: {
    title: string;
    description: string;
  }) => {
    try {
      await updateModule({ id: mod._id, courseId, body: values }).unwrap();
      toast.success("Module updated");
      setEditingModule(false);
    } catch {
      /* toast handled by middleware */
    }
  };

  const handleDeleteModule = async () => {
    try {
      await deleteModule({ id: mod._id, courseId }).unwrap();
      toast.success("Module deleted");
      setConfirmDeleteModule(false);
    } catch {
      /* */
    }
  };

  const handleTogglePublishModule = async (next: boolean) => {
    try {
      await publishModule({
        id: mod._id,
        courseId,
        isPublished: next,
      }).unwrap();
      toast.success(next ? "Module published" : "Module unpublished");
    } catch {
      /* */
    }
  };

  const handleCreateLesson = async (values: LessonFormValues) => {
    try {
      await createLesson({
        moduleId: mod._id,
        courseId,
        body: values,
      }).unwrap();
      toast.success("Lesson added");
      setCreatingLesson(false);
    } catch {
      /* */
    }
  };

  const handleUpdateLesson = async (values: LessonFormValues) => {
    if (!editingLesson) return;
    try {
      await updateLesson({
        moduleId: mod._id,
        lessonId: editingLesson._id,
        courseId,
        body: values,
      }).unwrap();
      toast.success("Lesson updated");
      setEditingLesson(null);
    } catch {
      /* */
    }
  };

  const handleDeleteLesson = async () => {
    if (!deletingLesson) return;
    try {
      await deleteLesson({
        moduleId: mod._id,
        lessonId: deletingLesson._id,
        courseId,
      }).unwrap();
      toast.success("Lesson deleted");
      setDeletingLesson(null);
    } catch {
      /* */
    }
  };

  const handleTogglePublishLesson = async (lesson: Lesson, next: boolean) => {
    try {
      await publishLesson({
        moduleId: mod._id,
        lessonId: lesson._id,
        courseId,
        isPublished: next,
      }).unwrap();
      toast.success(next ? "Lesson published" : "Lesson unpublished");
    } catch {
      /* */
    }
  };

  return (
    <div className="rounded-xs border bg-card">
      <div className="flex items-start justify-between gap-3 p-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-start gap-2 text-left"
        >
          {expanded ? (
            <ChevronDown className="mt-1 h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="mt-1 h-4 w-4 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                #{mod.order + 1}
              </span>
              <h3 className="truncate text-sm font-semibold">{mod.title}</h3>
              <Badge
                variant={mod.isPublished ? "default" : "secondary"}
                className="rounded-xs"
              >
                {mod.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
            {mod.description ? (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {mod.description}
              </p>
            ) : null}
            <p className="mt-1 text-xs text-muted-foreground">
              {sortedLessons.length} lesson
              {sortedLessons.length === 1 ? "" : "s"}
            </p>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={mod.isPublished}
              onCheckedChange={handleTogglePublishModule}
              aria-label="Toggle module publish"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setEditingModule(true)}
            className="rounded-xs"
            aria-label="Edit module"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setConfirmDeleteModule(true)}
            className="rounded-xs text-destructive hover:text-destructive"
            aria-label="Delete module"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="border-t p-4 space-y-2">
          {sortedLessons.length === 0 ? (
            <p className="text-xs text-muted-foreground">No lessons yet.</p>
          ) : (
            <ul className="space-y-2">
              {sortedLessons?.map((lesson) => (
                <li
                  key={lesson._id}
                  className="flex items-start justify-between gap-3 rounded-xs border bg-background p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        #{lesson.order + 1}
                      </span>
                      <span className="truncate text-sm font-medium">
                        {lesson.title}
                      </span>
                      <Badge
                        variant={lesson.isPublished ? "default" : "secondary"}
                        className="rounded-xs"
                      >
                        {lesson.isPublished ? "Published" : "Draft"}
                      </Badge>
                      {lesson.isFreePreview ? (
                        <Badge variant="outline" className="rounded-xs">
                          Free preview
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {lesson.videoUrl}
                    </p>
                    {lesson.duration ? (
                      <p className="text-xs text-muted-foreground">
                        Duration: {lesson.duration} min
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Switch
                      checked={lesson.isPublished}
                      onCheckedChange={(next) =>
                        handleTogglePublishLesson(lesson, next)
                      }
                      aria-label="Toggle lesson publish"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingLesson(lesson)}
                      className="rounded-xs"
                      aria-label="Edit lesson"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingLesson(lesson)}
                      className="rounded-xs text-destructive hover:text-destructive"
                      aria-label="Delete lesson"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCreatingLesson(true)}
            className="rounded-xs"
          >
            <Plus className="h-4 w-4" />
            Add lesson
          </Button>
        </div>
      ) : null}

      <Dialog open={editingModule} onOpenChange={setEditingModule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit module</DialogTitle>
            <DialogDescription>
              Update the module title and description.
            </DialogDescription>
          </DialogHeader>
          <ModuleEditForm
            initial={{ title: mod.title, description: mod.description ?? "" }}
            onSubmit={handleSaveModule}
            submitting={updateModuleState.isLoading}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={creatingLesson} onOpenChange={setCreatingLesson}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add lesson</DialogTitle>
            <DialogDescription>
              Add a YouTube-backed lesson to this module.
            </DialogDescription>
          </DialogHeader>
          <LessonForm
            onSubmit={handleCreateLesson}
            submitting={createLessonState.isLoading}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingLesson)}
        onOpenChange={(open) => (open ? null : setEditingLesson(null))}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit lesson</DialogTitle>
            <DialogDescription>Update lesson details.</DialogDescription>
          </DialogHeader>
          {editingLesson ? (
            <LessonForm
              initial={editingLesson}
              onSubmit={handleUpdateLesson}
              submitting={updateLessonState.isLoading}
              submitLabel="Save"
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDeleteModule}
        onOpenChange={setConfirmDeleteModule}
        title="Delete module?"
        description="This removes the module and all its lessons. This cannot be undone."
        destructive
        loading={deleteModuleState.isLoading}
        confirmLabel="Delete"
        onConfirm={handleDeleteModule}
      />

      <ConfirmDialog
        open={Boolean(deletingLesson)}
        onOpenChange={(open) => (open ? null : setDeletingLesson(null))}
        title="Delete lesson?"
        description="This permanently removes the lesson."
        destructive
        loading={deleteLessonState.isLoading}
        confirmLabel="Delete"
        onConfirm={handleDeleteLesson}
      />
    </div>
  );
}

function ModuleEditForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial: { title: string; description: string };
  onSubmit: (values: { title: string; description: string }) => void;
  submitting?: boolean;
}) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (title.trim().length < 3) {
          setError("Title must be at least 3 characters");
          return;
        }
        setError(null);
        onSubmit({ title: title.trim(), description: description.trim() });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="module-title">Title</Label>
        <Input
          id="module-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={160}
          className="rounded-xs"
        />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="module-description">Description</Label>
        <Textarea
          id="module-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="rounded-xs"
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={submitting} className="rounded-xs">
          {submitting ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}
