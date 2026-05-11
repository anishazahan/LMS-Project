"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, PlayCircle, Clock, ChevronDown, ChevronRight, Lock, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetPublicCourseByIdQuery } from "@/lib/api/course.api";
import { BuyNowButton } from "@/components/payments/buy-now-button";
import { useAppSelector } from "@/store/hooks";
import { formatCurrency, getInitials, youtubeEmbedUrl } from "@/lib/utils";
import type { Lesson, Module, User } from "@/types";

export default function PublicCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useGetPublicCourseByIdQuery(id);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const currentUser = useAppSelector((s) => s.auth.user);

  if (isLoading) {
    return (
      <div className="container space-y-4 py-10">
        <Skeleton className="h-8 w-1/3 rounded-xs" />
        <Skeleton className="aspect-video w-full rounded-xs" />
        <Skeleton className="h-32 w-full rounded-xs" />
      </div>
    );
  }

  const course = data?.course;
  if (!course) {
    return (
      <div className="container py-10">
        <Card className="rounded-xs">
          <CardHeader>
            <CardTitle>Course not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-xs">
              <Link href="/courses">Back to courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const instructor = typeof course.instructor === "object" ? course.instructor : null;
  const instructorId =
    instructor?._id ?? (typeof course.instructor === "string" ? course.instructor : "");
  const currentUserId = currentUser?._id || currentUser?.id;
  const isEnrolled =
    !!currentUserId &&
    Array.isArray(course.enrolledStudents) &&
    course.enrolledStudents.some((s) => s === currentUserId);
  const modules = Array.isArray(course.modules)
    ? ((course.modules as Module[]).slice().sort((a, b) => a.order - b.order))
    : [];
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0);
  const totalMinutes = modules.reduce(
    (sum, m) => sum + (m.lessons?.reduce((s, l) => s + (l.duration ?? 0), 0) ?? 0),
    0,
  );

  const handleLessonClick = (lesson: Lesson) => {
    if (!lesson.isFreePreview) {
      toast.warning("Lesson locked", {
        description: "Enroll to unlock this lesson.",
      });
      return;
    }
    const embed = youtubeEmbedUrl(lesson.videoUrl);
    if (!embed) {
      toast.error("Invalid video URL", {
        description: "This lesson's video link couldn't be loaded.",
      });
      return;
    }
    setActiveLesson(lesson);
  };

  const activeEmbed = activeLesson ? youtubeEmbedUrl(activeLesson.videoUrl) : null;

  return (
    <div className="container space-y-8 py-10">
      <Button variant="ghost" size="sm" asChild className="rounded-xs">
        <Link href="/courses">
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-xs border bg-black">
            {activeLesson && activeEmbed ? (
              <>
                <iframe
                  key={activeLesson._id}
                  src={`${activeEmbed}&autoplay=1`}
                  title={activeLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
                <button
                  type="button"
                  onClick={() => setActiveLesson(null)}
                  className="absolute right-2 top-2 rounded-xs bg-background/90 p-1.5 text-foreground shadow hover:bg-background"
                  aria-label="Close player"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : course.thumbnail?.url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={course.thumbnail.url}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                No thumbnail
              </div>
            )}
          </div>

          {activeLesson ? (
            <div className="rounded-xs border bg-muted/30 p-3 text-sm">
              <p className="font-medium">Now playing: {activeLesson.title}</p>
              {activeLesson.description ? (
                <p className="mt-1 text-xs text-muted-foreground">{activeLesson.description}</p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-xs capitalize">
                {course.category.replace("-", " ")}
              </Badge>
              <Badge variant="outline" className="rounded-xs capitalize">
                {course.level}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <p className="text-base text-muted-foreground">{course.shortDescription}</p>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {modules.length} module{modules.length === 1 ? "" : "s"}
              </span>
              <span className="flex items-center gap-1">
                <PlayCircle className="h-4 w-4" />
                {totalLessons} lesson{totalLessons === 1 ? "" : "s"}
              </span>
              {totalMinutes > 0 ? (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {totalMinutes} min total
                </span>
              ) : null}
            </div>
          </div>

          <Card className="rounded-xs">
            <CardHeader>
              <CardTitle className="text-lg">About this course</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {course.fullDescription}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xs">
            <CardHeader>
              <CardTitle className="text-lg">Curriculum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {modules.length === 0 ? (
                <p className="text-sm text-muted-foreground">No modules published yet.</p>
              ) : (
                modules.map((m) => (
                  <ModuleAccordion
                    key={m._id}
                    module={m}
                    activeLessonId={activeLesson?._id ?? null}
                    onLessonClick={handleLessonClick}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="rounded-xs">
            <CardHeader>
              <CardTitle className="text-2xl">{formatCurrency(course.price)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isEnrolled ? (
                <>
                  <Button className="w-full rounded-xs" size="lg" asChild>
                    <Link href="/student">Continue learning</Link>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    You already own this course.
                  </p>
                </>
              ) : (
                <>
                  <BuyNowButton
                    courseId={course._id}
                    price={course.price}
                    instructorId={instructorId}
                    isEnrolled={isEnrolled}
                    size="lg"
                    fullWidth
                    label="Buy Now"
                  />
                  <Button className="w-full rounded-xs" variant="outline" size="lg" asChild>
                    <Link href={`/courses/${course._id}`}>View curriculum</Link>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Secure checkout powered by Stripe.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {instructor ? <InstructorAside instructor={instructor as User} /> : null}
        </aside>
      </div>
    </div>
  );
}

function InstructorAside({ instructor }: { instructor: User }) {
  const avatarUrl =
    typeof instructor.profileImage === "object" && instructor.profileImage
      ? instructor.profileImage.url ?? null
      : null;

  return (
    <Card className="rounded-xs">
      <CardHeader>
        <CardTitle className="text-base">Instructor</CardTitle>
      </CardHeader>
      <CardContent>
        <Link
          href={`/instructors/${instructor._id}`}
          className="flex items-start gap-3 hover:underline"
        >
          <Avatar className="h-12 w-12">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={instructor.name} /> : null}
            <AvatarFallback>{getInitials(instructor.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium">{instructor.name}</p>
            {instructor.bio ? (
              <p className="line-clamp-3 text-xs text-muted-foreground">{instructor.bio}</p>
            ) : null}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

interface ModuleAccordionProps {
  module: Module;
  activeLessonId: string | null;
  onLessonClick: (lesson: Lesson) => void;
}

function ModuleAccordion({ module: mod, activeLessonId, onLessonClick }: ModuleAccordionProps) {
  const [open, setOpen] = useState(false);
  const lessons = (mod.lessons ?? []).slice().sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-xs border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-2 p-3 text-left"
      >
        {open ? (
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{mod.title}</p>
          {mod.description ? (
            <p className="line-clamp-1 text-xs text-muted-foreground">{mod.description}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
          </p>
        </div>
      </button>
      {open ? (
        <ul className="space-y-1 border-t p-3">
          {lessons.length === 0 ? (
            <li className="text-xs text-muted-foreground">No lessons yet.</li>
          ) : (
            lessons.map((lesson) => {
              const isActive = lesson._id === activeLessonId;
              const playable = lesson.isFreePreview;
              return (
                <li key={lesson._id}>
                  <button
                    type="button"
                    onClick={() => onLessonClick(lesson)}
                    className={`flex w-full items-center justify-between gap-2 rounded-xs p-2 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-primary/10 text-foreground"
                        : "bg-muted/40 hover:bg-muted"
                    } ${playable ? "cursor-pointer" : "cursor-not-allowed opacity-80"}`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {playable ? (
                        <PlayCircle
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                      ) : (
                        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate">{lesson.title}</span>
                      {lesson.isFreePreview ? (
                        <Badge variant="outline" className="rounded-xs">
                          Free
                        </Badge>
                      ) : null}
                    </span>
                    {lesson.duration ? (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {lesson.duration} min
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
