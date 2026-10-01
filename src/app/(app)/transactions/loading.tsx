import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/transactions/table-skeleton";

export default function TransactionsLoading() {
  return (
    <div className="flex h-full w-full flex-col gap-6 p-6">
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-8 w-36" />
      </div>

      <div className="flex shrink-0 gap-4 border-b border-border pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-20" />
        ))}
      </div>

      <TableSkeleton />
    </div>
  );
}
