import { SubmitButton } from "@/components/ui/submit-button";
import { getCategoryBadgeStyle } from "@/lib/category-color";

type CategoryRule = {
  id: string;
  name: string;
  matchText: string;
  matchType: "exact" | "contains";
  category: { name: string } | null;
  source: "user_defined" | "learned" | null;
};

type Category = { id: string; name: string };

export function CategoryRuleManager({
  rules,
  categories,
  createAction,
  deactivateAction,
}: {
  rules: CategoryRule[];
  categories: Category[];
  createAction: (formData: FormData) => Promise<void>;
  deactivateAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight">Category Rules</h1>
        <p className="text-sm text-muted-foreground">
          If a transaction&apos;s description contains this text, auto-assign it to this category
          — e.g. &quot;contains SWIGGY&quot; → Dining Out. Separate multiple keywords with commas
          (e.g. &quot;SWIGGY, ZOMATO&quot;) to match any of them. If a description matches
          keywords from more than one rule, it goes to Needs Review instead of auto-assigning.
          For payees that never appear in the description (like rent to a landlord), just pick
          the category manually instead.
        </p>
      </div>

      <form
        action={createAction}
        className="flex shrink-0 flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end sm:flex-wrap"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Rule name</label>
          <input
            name="name"
            placeholder="e.g. Swiggy"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Match text</label>
          <input
            name="matchText"
            placeholder="e.g. SWIGGY, ZOMATO"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Match type</label>
          <select
            name="matchType"
            required
            defaultValue="contains"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="contains">Contains</option>
            <option value="exact">Exact</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Category</label>
          <select
            name="categoryId"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
          Add
        </SubmitButton>
      </form>

      <div className="flex min-h-0 flex-1 flex-col divide-y divide-border overflow-y-auto rounded-xl border border-border bg-card">
        {rules.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No rules yet.</div>
        )}
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{rule.name}</span>
              <span className="text-muted-foreground">
                ({rule.matchText}, {rule.matchType})
              </span>
              <span className="text-muted-foreground">→</span>
              {rule.category ? (
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={getCategoryBadgeStyle(rule.category.name)}
                >
                  {rule.category.name}
                </span>
              ) : (
                <span className="font-medium text-muted-foreground">Uncategorized</span>
              )}
              {rule.source === "learned" && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  learned
                </span>
              )}
            </div>
            <form action={deactivateAction}>
              <input type="hidden" name="id" value={rule.id} />
              <SubmitButton
                className="text-xs font-semibold text-muted-foreground transition-colors hover:text-expense"
                pendingText="Removing…"
              >
                Remove
              </SubmitButton>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
