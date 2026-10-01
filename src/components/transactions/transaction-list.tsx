import { getCategoryIcon } from "@/lib/category-icon";
import { getCategoryColor, getCategoryBadgeStyle } from "@/lib/category-color";

type Row = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  category: { name: string } | null;
};

export function TransactionList({ transactions }: { transactions: Row[] }) {
  if (transactions.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No transactions yet.</p>;
  }

  return (
    <div className="divide-y divide-border">
      {transactions.map((t) => {
        const Icon = getCategoryIcon(t.category?.name);
        const amount = t.amount;
        const categoryColor = t.category ? getCategoryColor(t.category.name) : undefined;
        return (
          <div key={t.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
              style={
                categoryColor
                  ? {
                      backgroundColor: `color-mix(in srgb, ${categoryColor} 16%, transparent)`,
                      color: categoryColor,
                    }
                  : undefined
              }
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-foreground">
                  {t.description}
                </span>
                {t.category && (
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={getCategoryBadgeStyle(t.category.name)}
                  >
                    {t.category.name}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(t.date).toLocaleDateString("en-IN", {
                  timeZone: "UTC",
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </div>
            <span
              className={`shrink-0 text-sm font-semibold whitespace-nowrap ${
                amount < 0 ? "text-expense" : "text-income"
              }`}
            >
              {amount < 0 ? "-" : "+"}₹{Math.abs(amount).toLocaleString("en-IN")}
            </span>
          </div>
        );
      })}
    </div>
  );
}
