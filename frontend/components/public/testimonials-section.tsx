"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/reviews/star-rating";
import { useGetTestimonialsQuery } from "@/lib/api/review.api";
import { formatDate, getInitials } from "@/lib/utils";
import type { Review } from "@/types";

const AUTO_ROTATE_MS = 6000;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function useResponsivePerView() {
  const [perView, setPerView] = useState(3);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setPerView(1);
      else if (window.innerWidth < 1024) setPerView(2);
      else setPerView(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return perView;
}

export function TestimonialsSection() {
  const { data, isLoading } = useGetTestimonialsQuery({ limit: 12 });
  const perView = useResponsivePerView();
  const slides = useMemo(() => chunk(data?.items ?? [], perView), [data?.items, perView]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const safeIndex = slides.length > 0 ? index % slides.length : 0;

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTO_ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  if (isLoading) {
    return (
      <section className="relative container py-20">
        <div className="text-center mb-12 space-y-3">
          <Skeleton className="mx-auto h-8 w-72 rounded-xs" />
          <Skeleton className="mx-auto h-4 w-96 rounded-xs" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xs" />
          ))}
        </div>
      </section>
    );
  }

  if (slides.length === 0) return null;

  const current = slides[safeIndex] ?? [];
  const showControls = slides.length > 1;

  return (
    <section
      className="relative container py-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="text-center mb-12 space-y-3">
        <h2 className="text-3xl font-bold tracking-tight">What learners are saying</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Honest feedback from students and instructors who&apos;ve studied on EDUCART.
        </p>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={safeIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`grid gap-4 ${
              perView === 1 ? "" : perView === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
            }`}
          >
            {current.map((review) => (
              <TestimonialCard key={review._id} review={review} />
            ))}
          </motion.div>
        </AnimatePresence>

        {showControls ? (
          <>
            <div className="mt-6 flex items-center justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 w-6 rounded-xs transition-colors ${
                    i === safeIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <div className="absolute -left-2 top-1/2 hidden -translate-y-1/2 md:block">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute -right-2 top-1/2 hidden -translate-y-1/2 md:block">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setIndex((i) => (i + 1) % slides.length)}
                aria-label="Next testimonials"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

function TestimonialCard({ review }: { review: Review }) {
  const user = review.user;
  const profileImage = user?.profileImage;
  const avatarUrl =
    typeof profileImage === "object" && profileImage !== null ? profileImage.url ?? null : null;
  const name = user?.name ?? "Anonymous learner";
  const courseTitle =
    typeof review.course === "object" && review.course !== null
      ? (review.course as { title?: string }).title ?? "an EDUCART course"
      : "an EDUCART course";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative h-full overflow-hidden rounded-xs border bg-background/60 p-6 backdrop-blur-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
      <Quote className="absolute right-4 top-4 h-8 w-8 text-primary/10" aria-hidden />

      <div className="relative z-10 flex h-full flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">on {courseTitle}</p>
          </div>
        </div>

        <StarRating value={review.rating} size="sm" />

        <p className="line-clamp-4 text-sm leading-relaxed text-foreground/90">
          {review.comment}
        </p>

        <p className="mt-auto pt-2 text-xs text-muted-foreground">
          {formatDate(review.createdAt)}
        </p>
      </div>
    </motion.div>
  );
}
