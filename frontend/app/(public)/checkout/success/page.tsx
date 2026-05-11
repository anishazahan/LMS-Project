"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetPaymentBySessionQuery,
  useLazyGetReceiptDataQuery,
} from "@/lib/api/payment.api";
import { useLazyGetMeQuery } from "@/lib/api/user.api";
import { downloadReceipt } from "@/lib/receipt-pdf";
import { formatCurrency } from "@/lib/utils";
import type { Course } from "@/types";

const POLL_INTERVALS = [250, 1000, 2000];

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessSkeleton />}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessSkeleton() {
  return (
    <div className="container max-w-xl space-y-4 py-12">
      <Skeleton className="h-12 w-1/2 rounded-xs" />
      <Skeleton className="h-48 w-full rounded-xs" />
    </div>
  );
}

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id") ?? "";
  const [pollIndex, setPollIndex] = useState(0);

  const { data, isLoading, refetch, error } = useGetPaymentBySessionQuery(sessionId, {
    skip: !sessionId,
  });

  const payment = data?.payment;
  const isFinalized = payment?.status === "succeeded";

  const [refreshMe] = useLazyGetMeQuery();

  useEffect(() => {
    if (!sessionId || isFinalized || pollIndex >= POLL_INTERVALS.length) return;
    const t = setTimeout(() => {
      refetch();
      setPollIndex((i) => i + 1);
    }, POLL_INTERVALS[pollIndex]);
    return () => clearTimeout(t);
  }, [sessionId, isFinalized, pollIndex, refetch]);

  // Once activation lands, refresh /me so user.enrolledCourses includes the new course,
  // and Continue Learning shows immediately wherever the card is rendered.
  useEffect(() => {
    if (isFinalized) refreshMe();
  }, [isFinalized, refreshMe]);

  const course = useMemo(() => {
    if (!payment?.course || typeof payment.course === "string") return null;
    return payment.course as Course;
  }, [payment]);

  const [triggerReceipt, { isFetching: receiptLoading }] = useLazyGetReceiptDataQuery();

  const handleDownload = async () => {
    if (!payment?._id) return;
    try {
      const res = await triggerReceipt(payment._id).unwrap();
      downloadReceipt(res.receipt);
    } catch (err) {
      const e = err as { status?: number; data?: { message?: string } };
      const msg = e?.data?.message || "Receipt not ready yet";
      toast.error("Could not download receipt", { description: msg });
    }
  };

  if (!sessionId) {
    return (
      <div className="container max-w-xl py-12">
        <Card className="rounded-xs">
          <CardHeader>
            <CardTitle>Missing session</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No session id was provided. Return to courses and try again.
            </p>
            <Button asChild className="mt-4 rounded-xs">
              <Link href="/courses">Back to courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) return <SuccessSkeleton />;

  if (error) {
    return (
      <div className="container max-w-xl py-12">
        <Card className="rounded-xs">
          <CardHeader>
            <CardTitle>Payment not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t locate this payment. If you completed checkout, it may take a few seconds — try
              refreshing.
            </p>
            <Button onClick={() => refetch()} className="mt-4 rounded-xs">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-xl py-12">
      <Card className="rounded-xs">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            {isFinalized ? (
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            ) : (
              <Loader2 className="h-9 w-9 animate-spin text-amber-500" />
            )}
            <CardTitle className="text-2xl">
              {isFinalized ? "Payment confirmed" : "Finalizing your payment…"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isFinalized ? (
            <p className="text-sm text-muted-foreground">
              Stripe is still processing your payment. This page will update automatically.
            </p>
          ) : (
            <>
              <div className="rounded-xs border bg-muted/30 p-4 text-sm">
                <p className="font-medium">{course?.title ?? "Course purchased"}</p>
                {payment?.amount !== undefined ? (
                  <p className="mt-1 text-muted-foreground">
                    {formatCurrency(payment.amount, payment.currency?.toUpperCase() ?? "USD")} paid
                  </p>
                ) : null}
                {payment?.transactionId ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Transaction: <span className="font-mono">{payment.transactionId}</span>
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={handleDownload} disabled={receiptLoading} className="rounded-xs">
                  {receiptLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download Receipt
                </Button>
                <Button asChild variant="outline" className="rounded-xs">
                  <Link href="/student">
                    Continue learning <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
