"use client";

import { CourseSummaryCard } from "@/components/public/course-summary-card";
import { InstructorSummaryCard } from "@/components/public/instructor-summary-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useListPublicCoursesQuery } from "@/lib/api/course.api";
import { useListPublicInstructorsQuery } from "@/lib/api/instructor.api";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, UserCheck } from "lucide-react";
import Link from "next/link";

const FEATURED_LIMIT = 3;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export function FeaturedSections() {
  const { data: coursesData, isLoading: loadingCourses } =
    useListPublicCoursesQuery({
      page: 1,
      limit: FEATURED_LIMIT,
    });
  const { data: instructorsData, isLoading: loadingInstructors } =
    useListPublicInstructorsQuery({
      page: 1,
      limit: FEATURED_LIMIT,
    });

  const courses = coursesData?.data ?? [];
  const instructors = instructorsData?.data ?? [];

  return (
    <div className="space-y-24 py-10">
      {/* --- FEATURED COURSES SECTION --- */}
      <section className="container">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#7C3AED] font-bold text-sm tracking-widest uppercase">
              <Sparkles className="h-4 w-4" />
              Top Selection
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
              Featured{" "}
              <span className="italic text-muted-foreground/50 underline decoration-[#7C3AED]/30 underline-offset-8">
                Courses
              </span>
            </h2>
            <p className="max-w-md text-muted-foreground font-medium">
              A curated selection of AI-driven paths designed to transform your
              professional trajectory.
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            className="group rounded-full hover:bg-[#7C3AED]/10 hover:text-[#7C3AED] transition-all"
          >
            <Link href="/courses" className="flex items-center gap-2 font-bold">
              Explore All Courses
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        {loadingCourses ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: FEATURED_LIMIT }).map((_, i) => (
              <Skeleton key={i} className="h-96 w-full rounded-[2rem]" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-[2rem] border-2 border-dashed p-20 text-center">
            <p className="text-muted-foreground font-medium italic">
              No courses found. Our AI is crafting some right now.
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {courses.map((c) => (
              <motion.div key={c._id} variants={itemVariants}>
                <CourseSummaryCard course={c} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* --- INSTRUCTORS SECTION --- */}
      <section className="container">
        <div className="relative rounded-md bg-muted/30 p-8 md:p-16 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-purple-200 dark:bg-gray-900 blur-[100px] rounded-full" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-500 font-bold text-sm tracking-widest uppercase">
                <UserCheck className="h-4 w-4" />
                Industry Leaders
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                Meet the <span className="italic text-[#7C3AED]">Experts</span>
              </h2>
            </div>
            <Button
              asChild
              variant="outline"
              className="rounded-md border-2 font-bold px-8 h-12 hover:bg-background"
            >
              <Link href="/instructors">Meet All Instructors</Link>
            </Button>
          </motion.div>

          {loadingInstructors ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
              {Array.from({ length: FEATURED_LIMIT }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-[2rem]" />
              ))}
            </div>
          ) : instructors.length === 0 ? (
            <div className="text-center py-10 italic text-muted-foreground">
              Connecting with world-class practitioners...
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 relative z-10"
            >
              {instructors.map((i) => (
                <motion.div key={i._id} variants={itemVariants}>
                  <div className="hover:scale-[1.02] transition-transform duration-300">
                    <InstructorSummaryCard instructor={i} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
