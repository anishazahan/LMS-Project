"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PaymentHistoryTable } from "@/components/payments/payment-history-table";
import { useListMyPaymentsQuery } from "@/lib/api/payment.api";

export default function StudentPaymentsPage() {
  const { data, isLoading } = useListMyPaymentsQuery();
  const payments = data?.payments ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payment History</h1>
        <p className="text-sm text-muted-foreground">
          Every purchase, receipt, and transaction. Re-download receipts anytime.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-xs" />
      ) : (
        <PaymentHistoryTable
          payments={payments}
          emptyText="No payments yet. Purchase a course to see receipts here."
        />
      )}
    </div>
  );
}
