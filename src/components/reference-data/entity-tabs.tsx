import Link from "next/link";

export function EntityTabs({ active }: { active: "people" | "place" }) {
  return (
    <div className="flex gap-1 border-b border-border">
      <Link
        href="/people"
        className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
          active === "people"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        }`}
      >
        People
      </Link>
      <Link
        href="/people?tab=place"
        className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
          active === "place"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        }`}
      >
        Place
      </Link>
    </div>
  );
}
