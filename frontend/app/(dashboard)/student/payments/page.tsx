"use client";

import { PaymentHistoryTable } from "@/components/payments/payment-history-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useListMyPaymentsQuery } from "@/lib/api/payment.api";

export default function StudentPaymentsPage() {
  const { data, isLoading } = useListMyPaymentsQuery();
  const payments = data?.payments ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl  font-black tracking-tighter text-foreground">
          Payment{" "}
          <span className="italic bg-gradient-to-r from-emerald-500 via-[#7C3AED] to-fuchsia-500 bg-clip-text text-transparent">
            History
          </span>
        </h1>

        <p className="max-w-md text-sm md:text-base font-medium text-muted-foreground leading-relaxed">
          Every purchase, receipt, and transaction. Re-download your receipts
          anytime
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
