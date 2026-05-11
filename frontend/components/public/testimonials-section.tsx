"use client";

import { StarRating } from "@/components/reviews/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTestimonialsQuery } from "@/lib/api/review.api";
import { formatDate, getInitials } from "@/lib/utils";
import type { Review } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquareQuote,
  Quote,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  const slides = useMemo(
    () => chunk(data?.items ?? [], perView),
    [data?.items, perView],
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const safeIndex = slides.length > 0 ? index % slides.length : 0;

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      AUTO_ROTATE_MS,
    );
    return () => clearInterval(t);
  }, [paused, slides.length]);

  if (isLoading) {
    return (
      <section className="relative container py-24">
        <div className="text-center mb-16 space-y-4">
          <Skeleton className="mx-auto h-12 w-80 rounded-full" />
          <Skeleton className="mx-auto h-6 w-[32rem] rounded-full" />
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-[2.5rem]" />
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
      className="relative container pb-24 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[30rem] bg-[#7C3AED]/5 blur-[120px] rounded-full -z-10" />

      <div className="text-center mb-16 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-black uppercase tracking-widest"
        >
          <MessageSquareQuote className="h-4 w-4" />
          Wall of Love
        </motion.div>
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
          What learners are{" "}
          <span className="italic text-[#7C3AED]">saying</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-medium leading-relaxed">
          Real feedback from a global community of students and world-class
          instructors.
        </p>
      </div>

      <div className="relative px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={safeIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`grid gap-8 ${
              perView === 1
                ? "grid-cols-1"
                : perView === 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-3"
            }`}
          >
            {current.map((review, i) => (
              <TestimonialCard key={review._id} review={review} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {showControls ? (
          <div className="mt-12 flex flex-col items-center gap-8">
            {/* Dots with Progress Bar Effect */}
            <div className="flex items-center gap-3">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className="relative h-2 w-12 overflow-hidden rounded-full bg-muted transition-all"
                >
                  <motion.div
                    initial={false}
                    animate={{
                      width: i === safeIndex ? "100%" : "0%",
                    }}
                    className="h-full bg-[#7C3AED]"
                  />
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full border-2 hover:bg-background hover:text-[#7C3AED] hover:border-[#7C3AED] transition-all"
                onClick={() =>
                  setIndex((i) => (i - 1 + slides.length) % slides.length)
                }
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full border-2 hover:bg-background hover:text-[#7C3AED] hover:border-[#7C3AED] transition-all"
                onClick={() => setIndex((i) => (i + 1) % slides.length)}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function TestimonialCard({ review, index }: { review: Review; index: number }) {
  const user = review.user;
  const profileImage = user?.profileImage;
  const avatarUrl =
    typeof profileImage === "object" && profileImage !== null
      ? (profileImage.url ?? null)
      : null;
  const name = user?.name ?? "Anonymous learner";
  const courseTitle =
    typeof review.course === "object" && review.course !== null
      ? ((review.course as { title?: string }).title ?? "an E-Study course")
      : "an E-Study course";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group relative flex h-full flex-col gap-6 overflow-hidden rounded-md border border-muted-foreground/10 bg-card/50 p-8 backdrop-blur-xl shadow-lg transition-all hover:border-[#7C3AED]/30 hover:shadow-2xl hover:shadow-[#7C3AED]/5"
    >
      <div className="absolute top-6 right-8 opacity-[0.05] group-hover:opacity-10 transition-opacity">
        <Quote className="h-12 w-12 text-[#7C3AED]" />
      </div>

      <StarRating value={review.rating} size="sm" />

      <p className="flex-1 text-base font-medium leading-relaxed italic text-foreground/80">
        &ldquo;{review.comment}&rdquo;
      </p>

      <div className="flex items-center gap-4 pt-4 border-t border-muted/50">
        <Avatar className="h-14 w-14 border-2 border-background ring-2 ring-[#7C3AED]/20">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-muted text-[#7C3AED] font-black">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-black tracking-tight text-foreground">
            {name}
          </p>
          <p className="truncate text-[10px] font-bold uppercase tracking-widest text-[#7C3AED]">
            <span className="text-gray-600"> Student on </span> {courseTitle}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {formatDate(review.createdAt)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
