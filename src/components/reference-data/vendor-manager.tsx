import { SubmitButton } from "@/components/ui/submit-button";

type Vendor = {
  id: string;
  name: string;
  matchText: string;
  matchType: "exact" | "contains";
  categoryRule: { source: "user_defined" | "learned"; category: { name: string } } | null;
};

type Category = { id: string; name: string };

export function VendorManager({
  vendors,
  categories,
  createAction,
  deactivateAction,
}: {
  vendors: Vendor[];
  categories: Category[];
  createAction: (formData: FormData) => Promise<void>;
  deactivateAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
        <p className="text-sm text-muted-foreground">
          Who you actually pay or receive from — e.g. Ramukaka, Swiggy, IND Money. Each vendor maps
          to one category, and is auto-detected from a transaction's description.
        </p>
      </div>

      <form
        action={createAction}
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end sm:flex-wrap"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Vendor name</label>
          <input
            name="name"
            placeholder="e.g. Ramukaka"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Match text</label>
          <input
            name="matchText"
            placeholder="e.g. RAMUKAKA"
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

      <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {vendors.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No vendors yet.</div>
        )}
        {vendors.map((vendor) => (
          <div key={vendor.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{vendor.name}</span>
              <span className="text-muted-foreground">
                ({vendor.matchText}, {vendor.matchType})
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="font-medium text-primary">
                {vendor.categoryRule?.category.name ?? "Uncategorized"}
              </span>
              {vendor.categoryRule?.source === "learned" && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  learned
                </span>
              )}
            </div>
            <form action={deactivateAction}>
              <input type="hidden" name="id" value={vendor.id} />
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
