import { Lock } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";

type Category = {
  id: string;
  name: string;
  kind: "income" | "expense";
  isSystem: boolean;
};

function CategoryGroup({
  title,
  categories,
  deactivateAction,
}: {
  title: string;
  categories: Category[];
  deactivateAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-bold text-muted-foreground">{title}</h2>
      <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {categories.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">None yet.</div>
        )}
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between px-4 py-2.5">
            <span className="flex items-center gap-2 text-sm font-medium">
              {category.name}
              {category.isSystem && <Lock className="h-3 w-3 text-muted-foreground" />}
            </span>
            {!category.isSystem && (
              <form action={deactivateAction}>
                <input type="hidden" name="id" value={category.id} />
                <SubmitButton
                  className="text-xs font-semibold text-muted-foreground transition-colors hover:text-expense"
                  pendingText="Removing…"
                >
                  Remove
                </SubmitButton>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoryManager({
  expenseCategories,
  incomeCategories,
  createAction,
  deactivateAction,
  tabs,
}: {
  expenseCategories: Category[];
  incomeCategories: Category[];
  createAction: (formData: FormData) => Promise<void>;
  deactivateAction: (formData: FormData) => Promise<void>;
  tabs?: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col gap-6 p-6">
      {tabs}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Default categories (
          <Lock className="inline h-3 w-3 align-baseline" />) are locked. Add your own anytime.
        </p>
      </div>

      <form
        action={createAction}
        className="flex shrink-0 flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Name</label>
          <input
            name="name"
            placeholder="e.g. Kids' School Fees"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Kind</label>
          <select
            name="kind"
            required
            defaultValue="expense"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
          Add
        </SubmitButton>
      </form>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
        <CategoryGroup
          title="Expense categories"
          categories={expenseCategories}
          deactivateAction={deactivateAction}
        />
        <CategoryGroup
          title="Income categories"
          categories={incomeCategories}
          deactivateAction={deactivateAction}
        />
      </div>
    </div>
  );
}
