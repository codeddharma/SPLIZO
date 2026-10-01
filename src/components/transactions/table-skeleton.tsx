import { Skeleton } from "@/components/ui/skeleton";

const COLUMN_WIDTHS = ["w-4", "w-20", "w-16", "w-40", "w-20", "w-16", "w-20", "w-16", "w-16", "w-16"];

export function TableSkeleton() {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex gap-4 border-b border-border px-4 py-3">
          {COLUMN_WIDTHS.map((w, i) => (
            <Skeleton key={i} className={`h-3.5 ${w}`} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, row) => (
          <div key={row} className="flex items-center gap-4 border-b border-border px-4 py-3.5 last:border-b-0">
            {COLUMN_WIDTHS.map((w, i) => (
              <Skeleton key={i} className={`h-4 ${w}`} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex shrink-0 items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-28" />
      </div>
    </>
  );
}
