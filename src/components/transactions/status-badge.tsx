const STYLES: Record<string, string> = {
  confirmed: "bg-muted text-muted-foreground",
  auto_mapped: "bg-primary/10 text-primary",
  needs_review: "bg-warning/10 text-warning",
  unmapped: "bg-expense/10 text-expense",
};

const LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  auto_mapped: "Auto",
  needs_review: "Needs review",
  unmapped: "Unmapped",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STYLES[status] ?? ""}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
