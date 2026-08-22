import { SubmitButton } from "@/components/ui/submit-button";

type Option = { id: string; name: string };

export function TransactionForm({
  accounts,
  categories,
  homes,
  people,
  createAction,
}: {
  accounts: Option[];
  categories: Option[];
  homes: Option[];
  people: Option[];
  createAction: (formData: FormData) => Promise<void>;
}) {
  const today = new Date().toISOString().slice(0, 10);

  if (accounts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Add an account first before logging transactions — see the Accounts page.
      </div>
    );
  }

  return (
    <form
      action={createAction}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Direction</label>
          <select
            name="direction"
            defaultValue="out"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="out">Expense</option>
            <option value="in">Income</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Amount (₹)</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Date</label>
          <input
            name="date"
            type="date"
            defaultValue={today}
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Account</label>
          <select
            name="accountId"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">Description</label>
        <input
          name="description"
          placeholder="e.g. Swiggy order"
          required
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Category (blank = auto-detect)
          </label>
          <select
            name="categoryId"
            defaultValue=""
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Auto-detect</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Home (optional)</label>
          <select
            name="homeId"
            defaultValue=""
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {homes.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Person (optional)</label>
          <select
            name="personTagId"
            defaultValue=""
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <SubmitButton className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
        Add transaction
      </SubmitButton>
    </form>
  );
}
