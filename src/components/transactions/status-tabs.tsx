import Link from "next/link";

const TABS = [
  { value: "all", label: "All" },
  { value: "mapped", label: "Mapped" },
  { value: "needs_review", label: "Needs Review" },
  { value: "unmapped", label: "Unmapped" },
] as const;

export function StatusTabs({ active }: { active: string }) {
  return (
    <div className="flex gap-1 border-b border-border">
      {TABS.map((tab) => {
        const isActive = active === tab.value;
        return (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/transactions" : `/transactions?status=${tab.value}`}
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
