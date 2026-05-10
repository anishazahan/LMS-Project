"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CourseSummaryCard } from "@/components/public/course-summary-card";
import { useGetPublicInstructorQuery } from "@/lib/api/instructor.api";
import { getInitials } from "@/lib/utils";

export default function PublicInstructorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useGetPublicInstructorQuery(id);

  if (isLoading) {
    return (
      <div className="container space-y-4 py-10">
        <Skeleton className="h-8 w-1/3 rounded-xs" />
        <Skeleton className="h-32 w-full rounded-xs" />
      </div>
    );
  }

  const instructor = data?.instructor;
  const courses = data?.courses ?? [];

  if (!instructor) {
    return (
      <div className="container py-10">
        <Card className="rounded-xs">
          <CardHeader>
            <CardTitle>Instructor not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-xs">
              <Link href="/instructors">Back to instructors</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avatarUrl =
    typeof instructor.profileImage === "object" ? instructor.profileImage?.url : null;
  const links = instructor.socialLinks ?? {};

  return (
    <div className="container space-y-8 py-10">
      <Button variant="ghost" size="sm" asChild className="rounded-xs">
        <Link href="/instructors">
          <ArrowLeft className="h-4 w-4" />
          Back to instructors
        </Link>
      </Button>

      <Card className="rounded-xs">
        <CardContent className="flex flex-wrap items-start gap-6 p-6">
          <Avatar className="h-24 w-24">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={instructor.name} /> : null}
            <AvatarFallback className="text-2xl">{getInitials(instructor.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{instructor.name}</h1>
              <p className="text-sm text-muted-foreground">Instructor</p>
            </div>
            {instructor.bio ? (
              <p className="text-sm leading-relaxed text-foreground">{instructor.bio}</p>
            ) : (
              <p className="text-sm italic text-muted-foreground">No bio provided.</p>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {links.linkedin ? (
                <Button asChild variant="outline" size="sm" className="rounded-xs">
                  <a href={links.linkedin} target="_blank" rel="noreferrer">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                </Button>
              ) : null}
              {links.github ? (
                <Button asChild variant="outline" size="sm" className="rounded-xs">
                  <a href={links.github} target="_blank" rel="noreferrer">
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                </Button>
              ) : null}
              {links.website ? (
                <Button asChild variant="outline" size="sm" className="rounded-xs">
                  <a href={links.website} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Website
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Courses by {instructor.name}</h2>
        {courses.length === 0 ? (
          <div className="rounded-xs border border-dashed p-10 text-center text-sm text-muted-foreground">
            No published courses yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseSummaryCard key={c._id} course={c} hideInstructor />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
