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

export function RepaymentForm({
  loanId,
  direction,
  accounts,
  unlinkedTransactions,
  today,
  addRepaymentAction,
}: {
  loanId: string;
  direction: "lent" | "borrowed";
  accounts: Option[];
  unlinkedTransactions: Transaction[];
  today: string;
  addRepaymentAction: (formData: FormData) => Promise<void>;
}) {
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [error, setError] = useState<string | null>(null);

  // A repayment received on money you lent comes in; a repayment you make on
  // money you borrowed goes out.
  const candidateTransactions = unlinkedTransactions.filter((t) =>
    direction === "lent" ? t.amount > 0 : t.amount < 0
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (mode === "existing" && !new FormData(e.currentTarget).get("transactionId")) {
      e.preventDefault();
      setError("Choose a transaction to link.");
    }
  }

  return (
    <form action={addRepaymentAction} onSubmit={handleSubmit} className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="loanId" value={loanId} />
        <input type="hidden" name="mode" value={mode} />

        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => {
              setMode("new");
              setError(null);
            }}
            className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              mode === "new" ? "bg-card shadow-sm" : "text-muted-foreground"
            }`}
          >
            New
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("existing");
              setError(null);
            }}
            className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              mode === "existing" ? "bg-card shadow-sm" : "text-muted-foreground"
            }`}
          >
            Link existing
          </button>
        </div>

        {mode === "new" ? (
          <>
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
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Repayment amount"
              required
              className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              name="date"
              type="date"
              defaultValue={today}
              required
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </>
        ) : (
          <TransactionPicker
            name="transactionId"
            transactions={candidateTransactions}
            onSelect={() => setError(null)}
          />
        )}

        <SubmitButton
          className="rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-muted disabled:opacity-60"
          pendingText="Adding…"
        >
          Add repayment
        </SubmitButton>
      </div>
      {error && <p className="text-xs font-medium text-expense">{error}</p>}
    </form>
  );
}
