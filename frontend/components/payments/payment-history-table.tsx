"use client";

import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLazyGetReceiptDataQuery } from "@/lib/api/payment.api";
import { downloadReceipt } from "@/lib/receipt-pdf";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Course, Payment, PaymentStatus, User } from "@/types";

interface Props {
  payments: Payment[];
  emptyText?: string;
  showStudentColumn?: boolean;
}

const statusVariant: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  succeeded: "default",
  pending: "secondary",
  failed: "destructive",
  canceled: "outline",
  expired: "outline",
};

const statusClass: Partial<Record<PaymentStatus, string>> = {
  succeeded: "bg-emerald-600 hover:bg-emerald-600",
};

export function PaymentHistoryTable({
  payments,
  emptyText = "No payments yet.",
  showStudentColumn = false,
}: Props) {
  const [triggerReceipt, { isFetching, originalArgs }] = useLazyGetReceiptDataQuery();

  const handleDownload = async (paymentId: string) => {
    try {
      const res = await triggerReceipt(paymentId).unwrap();
      downloadReceipt(res.receipt);
    } catch (err) {
      const e = err as { status?: number; data?: { message?: string } };
      const msg = e?.data?.message || "Receipt not available";
      toast.error("Download failed", { description: msg });
    }
  };

  if (payments.length === 0) {
    return (
      <div className="rounded-xs border border-dashed p-8 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xs border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Course</th>
            {showStudentColumn ? <th className="px-4 py-3 font-medium">Student</th> : null}
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Transaction ID</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 text-right font-medium">Receipt</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => {
            const course = typeof p.course === "object" ? (p.course as Course) : null;
            const student = typeof p.student === "object" ? (p.student as Pick<User, "name" | "email">) : null;
            const downloading = isFetching && originalArgs === p._id;
            const canDownload = p.status === "succeeded";

            return (
              <tr key={p._id} className="border-t">
                <td className="px-4 py-3">
                  <p className="font-medium">{course?.title ?? "—"}</p>
                </td>
                {showStudentColumn ? (
                  <td className="px-4 py-3">
                    {student ? (
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                ) : null}
                <td className="px-4 py-3 font-medium">
                  {formatCurrency(p.amount, (p.currency || "usd").toUpperCase())}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs">{p.transactionId || p.stripeSessionId || "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={statusVariant[p.status] ?? "outline"}
                    className={`rounded-xs capitalize ${statusClass[p.status] ?? ""}`}
                  >
                    {p.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(p.paidAt ?? p.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xs"
                    disabled={!canDownload || downloading}
                    onClick={() => handleDownload(p._id)}
                    title={canDownload ? "Download receipt" : "Available only after payment is confirmed"}
                  >
                    {downloading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    PDF
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
