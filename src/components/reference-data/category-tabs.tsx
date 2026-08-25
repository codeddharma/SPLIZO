import Link from "next/link";

export function CategoryTabs({ active }: { active: "categories" | "rules" }) {
  return (
    <div className="flex gap-1 border-b border-border">
      <Link
        href="/categories"
        className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
          active === "categories"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        }`}
      >
        Categories
      </Link>
      <Link
        href="/categories?tab=rules"
        className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
          active === "rules"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        }`}
      >
        Category Rules
      </Link>
    </div>
  );
}
