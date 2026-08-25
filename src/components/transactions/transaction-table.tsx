import { StatusBadge } from "./status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { recategorizeTransactionAction } from "@/lib/actions/transaction-actions";
import { suggestMatchText } from "@/lib/categorization/suggest-match-text";

type Row = {
  id: string;
  date: Date;
  description: string;
  amount: unknown;
  categoryStatus: string;
  categoryId: string | null;
  account: { name: string };
  category: { name: string } | null;
  categoryRule: { name: string } | null;
  homes: { home: { name: string } }[];
  people: { personTag: { name: string } }[];
  spentByPersonTag: { name: string } | null;
};

type Category = { id: string; name: string };

const NEEDS_ACTION = new Set(["needs_review", "unmapped"]);

export function TransactionTable({
  transactions,
  categories,
  showActions = false,
}: {
  transactions: Row[];
  categories?: Category[];
  showActions?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Description</th>
            <th className="px-4 py-3 font-semibold">Account</th>
            <th className="px-4 py-3 font-semibold">Rule</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Place</th>
            <th className="px-4 py-3 font-semibold">Person</th>
            <th className="px-4 py-3 font-semibold">Spent by</th>
            <th className="px-4 py-3 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {transactions.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-6 text-center text-muted-foreground">
                No transactions yet.
              </td>
            </tr>
          )}
          {transactions.map((t) => {
            const amount = Number(t.amount);
            const needsAction = showActions && categories && NEEDS_ACTION.has(t.categoryStatus);
            return (
              <tr key={t.id}>
                <td className="px-4 py-3 whitespace-nowrap align-top">
                  {new Date(t.date).toLocaleDateString("en-IN", { timeZone: "UTC" })}
                </td>
                <td className="px-4 py-3 font-medium align-top">{t.description}</td>
                <td className="px-4 py-3 text-muted-foreground align-top">{t.account.name}</td>
                <td className="px-4 py-3 text-muted-foreground align-top">{t.categoryRule?.name ?? "—"}</td>
                <td className="px-4 py-3 align-top">
                  {needsAction ? (
                    <form
                      action={recategorizeTransactionAction}
                      className="flex flex-col gap-1.5"
                    >
                      <input type="hidden" name="id" value={t.id} />
                      <div className="flex items-center gap-1.5">
                        <select
                          name="categoryId"
                          defaultValue={t.categoryId ?? ""}
                          required
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                        >
                          <option value="" disabled>
                            Choose category
                          </option>
                          {categories!.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <SubmitButton className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
                          Confirm
                        </SubmitButton>
                        <StatusBadge status={t.categoryStatus} />
                      </div>
                      <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <input
                          type="checkbox"
                          name="saveRule"
                          value="1"
                          defaultChecked
                          className="h-3 w-3"
                        />
                        Always categorize
                        <input
                          type="text"
                          name="matchText"
                          defaultValue={suggestMatchText(t.description)}
                          className="w-28 rounded border border-border bg-background px-1.5 py-0.5 text-[11px]"
                        />
                        this way
                      </label>
                    </form>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span>{t.category?.name ?? "—"}</span>
                      <StatusBadge status={t.categoryStatus} />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground align-top">
                  {t.homes.length > 0 ? t.homes.map((h) => h.home.name).join(", ") : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground align-top">
                  {t.people.length > 0 ? t.people.map((p) => p.personTag.name).join(", ") : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground align-top">
                  {t.spentByPersonTag?.name ?? "—"}
                </td>
                <td
                  className={`px-4 py-3 text-right font-semibold align-top ${
                    amount < 0 ? "text-expense" : "text-income"
                  }`}
                >
                  {amount < 0 ? "-" : "+"}₹{Math.abs(amount).toLocaleString("en-IN")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
