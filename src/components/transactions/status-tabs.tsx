import Link from "next/link";
import { applyRangeParams } from "@/lib/date-range";

const TABS = [
  { value: "all", label: "All" },
  { value: "mapped", label: "Mapped" },
  { value: "needs_review", label: "Needs Review" },
  { value: "unmapped", label: "Unmapped" },
] as const;

function buildHref(status: string, range: string, from?: string, to?: string) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  applyRangeParams(params, range, from, to);
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
    <div className="flex gap-2 overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = active === tab.value;
        return (
          <Link
            key={tab.value}
            href={buildHref(tab.value, range, from, to)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
