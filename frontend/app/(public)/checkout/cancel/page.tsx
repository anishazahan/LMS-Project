"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-xl py-12">
          <Card className="rounded-xs">
            <CardHeader>
              <CardTitle>Checkout canceled</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  );
}

function CancelContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <div className="container max-w-xl py-12">
      <Card className="rounded-xs">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <XCircle className="h-9 w-9 text-amber-500" />
            <CardTitle className="text-2xl">Checkout canceled</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No charge was made. You can return to the courses page and try again whenever you&apos;re ready.
          </p>
          {sessionId ? (
            <p className="text-xs text-muted-foreground">
              Session reference: <span className="font-mono">{sessionId}</span>
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="rounded-xs">
              <Link href="/courses">Browse courses</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xs">
              <Link href="/student">My dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
