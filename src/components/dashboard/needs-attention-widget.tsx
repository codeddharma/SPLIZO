import Link from "next/link";
import { ClipboardCheck, CheckCircle2, ArrowUpRight } from "lucide-react";
import { applyRangeParams } from "@/lib/date-range";

function buildHref(status: string, range: string, from?: string, to?: string) {
  const params = new URLSearchParams({ status });
  applyRangeParams(params, range, from, to);
  return `/transactions?${params.toString()}`;
}

export function NeedsAttentionWidget({
  needsReview,
  unmapped,
  range,
  from,
  to,
}: {
  needsReview: number;
  unmapped: number;
  range: string;
  from?: string;
  to?: string;
}) {
  if (needsReview === 0 && unmapped === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-income" />
        All caught up — nothing needs review.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
          <ClipboardCheck className="h-4 w-4" />
        </span>
        <h2 className="text-base font-bold text-foreground">Review</h2>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Link href={buildHref("needs_review", range, from, to)} className="group">
          <div className="text-xs text-muted-foreground">Needs review</div>
          <div className="flex items-center gap-1 text-lg font-extrabold text-warning group-hover:underline">
            {needsReview}
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
          </div>
        </Link>
        <Link href={buildHref("unmapped", range, from, to)} className="group">
          <div className="text-xs text-muted-foreground">Unmapped</div>
          <div className="flex items-center gap-1 text-lg font-extrabold text-highlight group-hover:underline">
            {unmapped}
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
          </div>
        </Link>
      </div>
    </div>
  );
}
