import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function NeedsAttentionWidget({ count }: { count: number }) {
  if (count === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-income" />
        All caught up — nothing needs review.
      </div>
    );
  }

  return (
    <Link
      href="/transactions?status=needs_review"
      className="flex items-center justify-between rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm font-semibold text-warning transition-colors hover:bg-warning/20"
    >
      <span className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        {count} transaction{count === 1 ? "" : "s"} need review
      </span>
      <span>Review →</span>
    </Link>
  );
}
