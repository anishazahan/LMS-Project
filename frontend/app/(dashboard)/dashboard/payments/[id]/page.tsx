"use client";

import { use, useEffect, useRef } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetReceiptDataQuery } from "@/lib/api/payment.api";
import { downloadReceipt } from "@/lib/receipt-pdf";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PaymentReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useGetReceiptDataQuery(id);
  const autoTriggered = useRef(false);

  useEffect(() => {
    if (autoTriggered.current || !data?.receipt) return;
    autoTriggered.current = true;
    try {
      downloadReceipt(data.receipt);
    } catch (err) {
      const e = err as Error;
      toast.error("Receipt failed", { description: e.message });
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-3">
        <Skeleton className="h-8 w-1/3 rounded-xs" />
        <Skeleton className="h-48 w-full rounded-xs" />
      </div>
    );
  }

  if (error || !data?.receipt) {
    const e = error as { status?: number; data?: { message?: string } } | undefined;
    const msg =
      e?.status === 425
        ? "Your payment is still processing. Try again in a moment."
        : e?.data?.message || "Receipt could not be loaded.";
    return (
      <div className="mx-auto max-w-xl">
        <Card className="rounded-xs">
          <CardHeader>
            <CardTitle>Receipt unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{msg}</p>
            <Button asChild variant="outline" className="rounded-xs">
              <Link href="/student">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const r = data.receipt;
  return (
    <div className="mx-auto max-w-xl">
      <Card className="rounded-xs">
        <CardHeader>
          <CardTitle>Receipt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <Row label="Course" value={r.course.title} />
            <Row label="Instructor" value={r.instructor.name} />
            <Row label="Name" value={r.user.name} />
            <Row label="Email" value={r.user.email} />
            <Row label="Transaction" value={r.transactionId} mono />
            <Row label="Amount" value={formatCurrency(r.amount, r.currency.toUpperCase())} />
            <Row label="Paid on" value={formatDate(r.paidAt)} />
            <Row label="Status" value={r.status.toUpperCase()} />
          </dl>

          <div className="flex gap-2 pt-2">
            <Button onClick={() => downloadReceipt(r)} className="rounded-xs">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button asChild variant="outline" className="rounded-xs">
              <Link href="/student">Back to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={`break-all text-sm ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

