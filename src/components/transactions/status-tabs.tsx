import Link from "next/link";

const TABS = [
  { value: "all", label: "All" },
  { value: "mapped", label: "Mapped" },
  { value: "needs_review", label: "Needs Review" },
  { value: "unmapped", label: "Unmapped" },
] as const;

function buildHref(status: string, range: string, from?: string, to?: string) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (range !== "this_month") params.set("range", range);
  if (range === "custom") {
    if (from) params.set("from", from);
    if (to) params.set("to", to);
  }
  const query = params.toString();
  return query ? `/transactions?${query}` : "/transactions";
}

export function StatusTabs({
  active,
  range = "this_month",
  from,
  to,
}: {
  active: string;
  range?: string;
  from?: string;
  to?: string;
}) {
  return (
    <div className="flex gap-1 border-b border-border">
      {TABS.map((tab) => {
        const isActive = active === tab.value;
        return (
          <Link
            key={tab.value}
            href={buildHref(tab.value, range, from, to)}
            className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
