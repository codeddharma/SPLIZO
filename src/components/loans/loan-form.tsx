"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { TransactionPicker } from "./transaction-picker";

type Option = { id: string; name: string };
type Transaction = {
  id: string;
  date: Date | string;
  description: string;
  amount: number;
  accountName: string;
};

const MODE_BUTTON =
  "rounded-lg px-3 py-2 text-sm font-semibold transition-colors";

function ModeToggle({ mode, onChange }: { mode: "new" | "existing"; onChange: (m: "new" | "existing") => void }) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      <button
        type="button"
        onClick={() => onChange("new")}
        className={`${MODE_BUTTON} ${mode === "new" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
      >
        New transaction
      </button>
      <button
        type="button"
        onClick={() => onChange("existing")}
        className={`${MODE_BUTTON} ${mode === "existing" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
      >
        Link existing
      </button>
    </div>
  );
}

export function LoanForm({
  contacts,
  accounts,
  unlinkedTransactions,
  today,
  createLoanAction,
}: {
  contacts: Option[];
  accounts: Option[];
  unlinkedTransactions: Transaction[];
  today: string;
  createLoanAction: (formData: FormData) => Promise<void>;
}) {
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [direction, setDirection] = useState<"lent" | "borrowed">("lent");
  const [error, setError] = useState<string | null>(null);

  const candidateTransactions = unlinkedTransactions.filter((t) =>
    direction === "lent" ? t.amount < 0 : t.amount > 0
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (mode === "existing" && !new FormData(e.currentTarget).get("transactionId")) {
      e.preventDefault();
      setError("Choose a transaction to link.");
    }
  }

  return (
    <form
      action={createLoanAction}
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
    >
      <input type="hidden" name="mode" value={mode} />
      <ModeToggle
        mode={mode}
        onChange={(m) => {
          setMode(m);
          setError(null);
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Contact</label>
          <select
            name="contactId"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Direction</label>
          <select
            name="direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value as "lent" | "borrowed")}
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="lent">Lent to them</option>
            <option value="borrowed">Borrowed from them</option>
          </select>
        </div>

        {mode === "new" ? (
          <>
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
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Amount (₹)</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm"
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
          </>
        ) : (
          <TransactionPicker
            name="transactionId"
            transactions={candidateTransactions}
            placeholder={direction === "lent" ? "Choose an outgoing transaction…" : "Choose an incoming transaction…"}
            onSelect={() => setError(null)}
          />
        )}

        <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
          Add loan
        </SubmitButton>
      </div>
      {error && <p className="text-xs font-medium text-expense">{error}</p>}
    </form>
  );
}
