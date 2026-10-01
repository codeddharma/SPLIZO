import { Skeleton } from "@/components/ui/skeleton";

export function ListPanelSkeleton({
  groups = 1,
  rows = 4,
  formFields = 3,
}: {
  groups?: number;
  rows?: number;
  formFields?: number;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end">
        {Array.from({ length: formFields }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
        <Skeleton className="h-9 w-20 shrink-0" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
        {Array.from({ length: groups }).map((_, g) => (
          <div key={g} className="flex flex-col gap-2">
            {groups > 1 && <Skeleton className="h-5 w-32" />}
            <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
              {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="flex items-center justify-between px-4 py-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
