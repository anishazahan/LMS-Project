"use client";

import Link from "next/link";
import { Github, Globe, Linkedin, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useGetUserByIdQuery } from "@/lib/api/user.api";
import { useAppSelector } from "@/store/hooks";
import { dashboardRouteFor, ROLES } from "@/lib/constants";
import { getProfileImageUrl, getUserInitials } from "@/lib/user";

interface Props {
  userId: string;
}

export function PublicProfileView({ userId }: Props) {
  const { data, isLoading, isError } = useGetUserByIdQuery(userId);
  const me = useAppSelector((s) => s.auth.user);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !data?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile not found</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const user = data.user as typeof data.user & {
    socialLinks?: { linkedin?: string; github?: string; website?: string };
  };
  const isOwn = (me?.id || me?._id) === userId;
  const ownEditHref =
    me?.role === ROLES.INSTRUCTOR
      ? `${dashboardRouteFor(ROLES.INSTRUCTOR)}/profile`
      : `${dashboardRouteFor(ROLES.STUDENT)}/profile`;

  const liveUrl = getProfileImageUrl(user);

  const links = [
    user.socialLinks?.linkedin
      ? { icon: Linkedin, label: "LinkedIn", href: user.socialLinks.linkedin }
      : null,
    user.socialLinks?.github
      ? { icon: Github, label: "GitHub", href: user.socialLinks.github }
      : null,
    user.socialLinks?.website
      ? { icon: Globe, label: "Website", href: user.socialLinks.website }
      : null,
  ].filter(Boolean) as { icon: typeof Linkedin; label: string; href: string }[];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-5 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20">
              {liveUrl ? <AvatarImage src={liveUrl} alt={user.name} /> : null}
              <AvatarFallback className="text-lg">{getUserInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold">{user.name}</h1>
              <Badge variant="secondary" className="mt-1 capitalize">
                {user.role}
              </Badge>
            </div>
          </div>
          {isOwn ? (
            <Button asChild variant="outline" className="gap-2">
              <Link href={ownEditHref}>
                <Pencil className="h-4 w-4" />
                Edit profile
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {user.bio ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">{user.bio}</p>
          </CardContent>
        </Card>
      ) : null}

      {links.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Links</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {links.map((l, i) => (
                <li key={l.href}>
                  {i > 0 ? <Separator className="my-2" /> : null}
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <l.icon className="h-4 w-4" />
                    {l.label}
                    <span className="ml-auto text-xs text-muted-foreground">{l.href}</span>
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
