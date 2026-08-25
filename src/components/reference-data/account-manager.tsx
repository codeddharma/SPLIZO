import { Wallet, CreditCard, Landmark, Banknote } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";

type Account = {
  id: string;
  name: string;
  type: "bank" | "card" | "wallet" | "cash";
  institution: string | null;
  last4: string | null;
};

const TYPE_ICON = { bank: Landmark, card: CreditCard, wallet: Wallet, cash: Banknote };

export function AccountManager({
  accounts,
  createAction,
  deactivateAction,
}: {
  accounts: Account[];
  createAction: (formData: FormData) => Promise<void>;
  deactivateAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="flex h-full w-full flex-col gap-6 p-6">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
        <p className="text-sm text-muted-foreground">
          Every bank account, credit card, and wallet you use — tagged on every transaction.
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
            placeholder="e.g. Joint Savings"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Type</label>
          <select
            name="type"
            required
            defaultValue="bank"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="bank">Bank</option>
            <option value="card">Card</option>
            <option value="wallet">Wallet</option>
            <option value="cash">Cash</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Institution</label>
          <input
            name="institution"
            placeholder="e.g. HDFC Bank"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Last 4</label>
          <input
            name="last4"
            maxLength={4}
            placeholder="1234"
            className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
          Add
        </SubmitButton>
      </form>

      <div className="flex min-h-0 flex-1 flex-col divide-y divide-border overflow-y-auto rounded-xl border border-border bg-card">
        {accounts.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No accounts yet.</div>
        )}
        {accounts.map((account) => {
          const Icon = TYPE_ICON[account.type];
          return (
            <div key={account.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">{account.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {account.institution}
                    {account.last4 ? ` •••• ${account.last4}` : ""}
                  </div>
                </div>
              </div>
              <form action={deactivateAction}>
                <input type="hidden" name="id" value={account.id} />
                <SubmitButton
                  className="text-xs font-semibold text-muted-foreground transition-colors hover:text-expense"
                  pendingText="Removing…"
                >
                  Remove
                </SubmitButton>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
