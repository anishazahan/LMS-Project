import Link from "next/link";
import { ArrowRight, GraduationCap, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <>
      <section className="container py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs">
            <Sparkles className="h-3 w-3" />
            New courses every week
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
            Learn anything. <span className="text-muted-foreground">From anyone.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            EDUCART is a modern learning platform connecting curious learners with expert instructors.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/courses">
                Browse courses <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register">Become an instructor</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <GraduationCap className="h-6 w-6" />
              <CardTitle>Self-paced learning</CardTitle>
              <CardDescription>Watch lessons on your schedule, on any device.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-6 w-6" />
              <CardTitle>Industry experts</CardTitle>
              <CardDescription>Instructors with real-world experience and proven results.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Sparkles className="h-6 w-6" />
              <CardTitle>Earn certificates</CardTitle>
              <CardDescription>Verify your progress with shareable course completions.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </>
  );
}
