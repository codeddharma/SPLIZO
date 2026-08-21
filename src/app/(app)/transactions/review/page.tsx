import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { recategorizeTransactionAction } from "@/lib/actions/transaction-actions";
import { StatusBadge } from "@/components/transactions/status-badge";
import { suggestVendorMatchText } from "@/lib/categorization/suggest-match-text";

export default async function ReviewQueuePage() {
  const householdId = await getHouseholdId();
  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { householdId, categoryStatus: { in: ["needs_review", "unmapped"] } },
      include: { account: true, category: true },
      orderBy: { date: "desc" },
    }),
    prisma.category.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Review queue</h1>
        <p className="text-sm text-muted-foreground">
          {transactions.length} transaction{transactions.length === 1 ? "" : "s"} need a category.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {transactions.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            All caught up — nothing needs review.
          </div>
        )}
        {transactions.map((t) => {
          const amount = Number(t.amount);
          return (
            <div
              key={t.id}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {t.description}
                  <StatusBadge status={t.categoryStatus} />
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(t.date).toLocaleDateString("en-IN", { timeZone: "UTC" })} ·{" "}
                  {t.account.name} ·{" "}
                  <span className={amount < 0 ? "text-expense" : "text-income"}>
                    {amount < 0 ? "-" : "+"}₹{Math.abs(amount).toLocaleString("en-IN")}
                  </span>
                  {t.category && <> · current guess: {t.category.name}</>}
                </div>
              </div>
              <form
                action={recategorizeTransactionAction}
                className="flex flex-col gap-2 sm:items-end"
              >
                <input type="hidden" name="id" value={t.id} />
                <div className="flex items-center gap-2">
                  <select
                    name="categoryId"
                    defaultValue={t.categoryId ?? ""}
                    required
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                  >
                    <option value="" disabled>
                      Choose category
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                  >
                    Confirm
                  </button>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input type="checkbox" name="saveRule" value="1" defaultChecked className="h-3.5 w-3.5" />
                  Always categorize
                  <input
                    type="text"
                    name="matchText"
                    defaultValue={suggestVendorMatchText(t.description)}
                    className="w-40 rounded-md border border-border bg-background px-2 py-0.5 text-xs"
                  />
                  this way
                </label>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
