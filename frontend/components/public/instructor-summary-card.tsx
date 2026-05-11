"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import type { PublicInstructor } from "@/types";
import { motion } from "framer-motion";
import { BookOpen, ExternalLink, Star } from "lucide-react";
import Link from "next/link";

interface Props {
  instructor: PublicInstructor;
}

export function InstructorSummaryCard({ instructor }: Props) {
  const avatarUrl =
    typeof instructor.profileImage === "object"
      ? instructor.profileImage?.url
      : null;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link
        href={`/instructors/${instructor._id}`}
        className="group block h-full"
      >
        <Card className="relative h-full overflow-hidden rounded-md border-muted-foreground/10 bg-card/50 backdrop-blur-sm transition-all duration-300 group-hover:border-[#7C3AED]/30 group-hover:shadow-2xl group-hover:shadow-[#7C3AED]/10 min-h-[240px]">
          {/* Subtle Background Glow on Hover */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#7C3AED]/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <CardHeader className="flex flex-row items-center gap-4 p-6">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                {avatarUrl ? (
                  <AvatarImage
                    src={avatarUrl}
                    alt={instructor.name}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-muted font-bold text-[#7C3AED]">
                  {getInitials(instructor.name)}
                </AvatarFallback>
              </Avatar>
              {/* Active Badge / Indicator */}
              <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background bg-emerald-500" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <CardTitle className="truncate text-lg font-black tracking-tight group-hover:text-[#7C3AED] transition-colors">
                {instructor.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#7C3AED]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7C3AED]">
                  Expert
                </span>
                <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                  <Star className="h-3 w-3 fill-current" />
                  4.9
                </div>
              </div>
            </div>

            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:text-[#7C3AED]" />
          </CardHeader>

          <CardContent className="space-y-4 p-6 pt-0">
            {instructor.bio ? (
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground font-medium">
                {instructor.bio}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground/60 font-medium">
                Expert practitioner in their field, dedicated to student
                success.
              </p>
            )}

            <div className="flex items-center justify-between border-t border-muted/50 pt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground/70">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted">
                  <BookOpen className="h-3.5 w-3.5 text-[#7C3AED]" />
                </div>
                <span>
                  {instructor.publishedCourseCount ?? 0}{" "}
                  {instructor.publishedCourseCount === 1 ? "Course" : "Courses"}
                </span>
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-[#7C3AED]">
                View Profile
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
