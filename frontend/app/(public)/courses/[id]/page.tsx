"use client";

import { CourseCta } from "@/components/payments/course-cta";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPublicCourseByIdQuery } from "@/lib/api/course.api";
import { useIsEnrolled } from "@/lib/use-is-enrolled";
import { cn, formatCurrency, getInitials, youtubeEmbedUrl } from "@/lib/utils";
import type { Lesson, Module, User } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Lock,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { toast } from "sonner";

export default function PublicCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useGetPublicCourseByIdQuery(id);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const isEnrolled = useIsEnrolled(data?.course);

  if (isLoading) {
    return (
      <div className="container grid lg:grid-cols-[350px,1fr] gap-8 py-10">
        <Skeleton className="h-[600px] rounded-md" />
        <div className="space-y-4">
          <Skeleton className="aspect-video w-full rounded-md" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>
      </div>
    );
  }

  const course = data?.course;
  if (!course) return null;

  const instructor =
    typeof course.instructor === "object" ? course.instructor : null;
  const modules = Array.isArray(course.modules)
    ? (course.modules as Module[]).slice().sort((a, b) => a.order - b.order)
    : [];

  const handleLessonClick = (lesson: Lesson) => {
    if (!isEnrolled) {
      toast.warning("Content Locked", {
        description: "Please enroll to watch this lesson.",
      });
      return;
    }
    setActiveLesson(lesson);
  };

  const activeEmbed =
    activeLesson && isEnrolled ? youtubeEmbedUrl(activeLesson.videoUrl) : null;

  return (
    <div className="container py-6 lg:py-10">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="rounded-md hover:bg-purple-500/10"
        >
          <Link href="/courses" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to courses
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px,1fr] gap-8 items-start">
        {/* LEFT SIDE: MODULE OUTLINE (Sticky Sidebar) */}
        <aside className="lg:sticky lg:top-24 space-y-6">
          <div className="rounded-md border bg-card/50 backdrop-blur-md overflow-hidden shadow-xl shadow-purple-500/5">
            <div className="p-6 border-b bg-muted/30">
              <div className="flex items-center gap-2 text-[#7C3AED] text-[10px] font-black uppercase tracking-widest mb-2">
                <Sparkles className="h-3 w-3" />
                Course Curriculum
              </div>
              <h2 className="text-xl font-black tracking-tight leading-tight">
                Modules & Lessons
              </h2>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {modules.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground italic">
                  No modules yet.
                </p>
              ) : (
                modules.map((m) => (
                  <ModuleAccordion
                    key={m._id}
                    module={m}
                    activeLessonId={activeLesson?._id ?? null}
                    onLessonClick={handleLessonClick}
                    locked={!isEnrolled}
                  />
                ))
              )}
            </div>
          </div>

          {/* Price & CTA (Mobile-first floating or Sidebar) */}
          <Card className="rounded-md border-none bg-[#7C3AED] text-white shadow-lg shadow-purple-500/20">
            <CardHeader className="pb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                Lifetime Access
              </p>
              <CardTitle className="text-3xl font-black italic">
                {formatCurrency(course.price)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CourseCta
                course={course}
                size="lg"
                fullWidth
                className="bg-white text-[#7C3AED] hover:bg-white/90 rounded-md font-bold"
              />
            </CardContent>
          </Card>
        </aside>

        {/* RIGHT SIDE: VIDEO & DETAILS */}
        <div className="space-y-8">
          {/* Player Section */}
          <section className="space-y-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-md border-[8px] border-background bg-black shadow-2xl">
              {activeLesson && activeEmbed ? (
                <iframe
                  key={activeLesson._id}
                  src={`${activeEmbed}&autoplay=1`}
                  title={activeLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : course.thumbnail?.url ? (
                <div className="relative h-full w-full group">
                  <img
                    src={course.thumbnail.url}
                    alt={course.title}
                    className="h-full w-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                      <PlayCircle className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground italic">
                  Select a lesson to start learning
                </div>
              )}
            </div>

            {/* Now Playing Info */}
            <AnimatePresence mode="wait">
              {activeLesson && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-md bg-[#7C3AED]/5 border border-[#7C3AED]/10"
                >
                  <h3 className="font-bold text-[#7C3AED] flex items-center gap-2">
                    <PlayCircle className="h-4 w-4" /> Now Playing:{" "}
                    {activeLesson.title}
                  </h3>
                  {activeLesson.description && (
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {activeLesson.description}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Course Info Sections */}
          <section className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-md bg-purple-500/10 text-purple-600 border-none px-4">
                  {course.category.replace("-", " ")}
                </Badge>
                <Badge className="rounded-md bg-blue-500/10 text-blue-600 border-none px-4">
                  {course.level}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                {course.title}
              </h1>
              <p className="text-xl text-muted-foreground font-medium">
                {course.shortDescription}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="rounded-md border-muted/20 bg-muted/5">
                <CardHeader>
                  <CardTitle className="text-lg font-black tracking-tight">
                    About Course
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {course.fullDescription}
                  </p>
                </CardContent>
              </Card>
              {instructor && <InstructorCard instructor={instructor as User} />}
            </div>

            <ReviewsSection courseId={course._id} isEnrolled={isEnrolled} />
          </section>
        </div>
      </div>
    </div>
  );
}

function InstructorCard({ instructor }: { instructor: User }) {
  const avatarUrl =
    typeof instructor.profileImage === "object"
      ? instructor.profileImage?.url
      : null;
  return (
    <Card className="rounded-md border-muted/20 bg-muted/5">
      <CardHeader>
        <CardTitle className="text-lg font-black tracking-tight">
          Instructor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-white shadow-xl">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={instructor.name} />
            ) : null}
            <AvatarFallback className="bg-[#7C3AED] text-white font-black">
              {getInitials(instructor.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <p className="font-bold text-xl tracking-tight">
              {instructor.name}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-3 italic leading-relaxed">
              {instructor.bio}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ModuleAccordion({
  module: mod,
  activeLessonId,
  onLessonClick,
  locked,
}: ModuleAccordionProps) {
  const [open, setOpen] = useState(false);
  const lessons = (mod.lessons ?? []).slice().sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-md border bg-background/50 overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="h-8 w-8 rounded-md bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED]">
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{mod.title}</p>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            {lessons.length} lessons
          </p>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-muted/20 border-t"
          >
            <div className="p-2 space-y-1">
              {lessons?.map((lesson) => {
                const isActive = lesson._id === activeLessonId;
                return (
                  <li key={lesson._id}>
                    <button
                      type="button"
                      onClick={() => onLessonClick(lesson)}
                      disabled={locked}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-md p-3 text-left text-xs transition-all",
                        isActive
                          ? "bg-[#7C3AED] text-white shadow-lg shadow-purple-500/20"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground",
                        locked && "opacity-60 cursor-not-allowed",
                      )}
                    >
                      <span className="flex items-center gap-3 truncate font-bold">
                        {locked ? (
                          <Lock className="h-3 w-3" />
                        ) : (
                          <PlayCircle
                            className={cn(
                              "h-4 w-4",
                              isActive ? "text-white" : "text-[#7C3AED]",
                            )}
                          />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </span>
                      {lesson.duration && (
                        <span className="text-[10px] opacity-70 font-black">
                          {lesson.duration}m
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ModuleAccordionProps {
  module: Module;
  activeLessonId: string | null;
  onLessonClick: (lesson: Lesson) => void;
  locked: boolean;
}
