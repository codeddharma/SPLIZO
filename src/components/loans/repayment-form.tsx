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
  formAction,
  serverError,
}: {
  loanId: string;
  direction: "lent" | "borrowed";
  accounts: Option[];
  unlinkedTransactions: Transaction[];
  today: string;
  formAction: (formData: FormData) => void;
  serverError?: string | null;
}) {
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [clientError, setClientError] = useState<string | null>(null);

  // A repayment received on money you lent comes in; a repayment you make on
  // money you borrowed goes out.
  const candidateTransactions = unlinkedTransactions.filter((t) =>
    direction === "lent" ? t.amount > 0 : t.amount < 0
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (mode === "existing" && !new FormData(e.currentTarget).get("transactionId")) {
      e.preventDefault();
      setClientError("Choose a transaction to link.");
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="loanId" value={loanId} />
      <input type="hidden" name="mode" value={mode} />

      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => {
            setMode("new");
            setClientError(null);
          }}
          className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            mode === "new" ? "bg-card shadow-sm" : "text-muted-foreground"
          }`}
        >
          New transaction
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("existing");
            setClientError(null);
          }}
          className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            mode === "existing" ? "bg-card shadow-sm" : "text-muted-foreground"
          }`}
        >
          Link existing
        </button>
      </div>

      {mode === "new" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1.5">
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
        </div>
      ) : (
        <TransactionPicker
          name="transactionId"
          transactions={candidateTransactions}
          onSelect={() => setClientError(null)}
        />
      )}

      {(clientError || serverError) && (
        <p className="text-xs font-medium text-expense">{clientError ?? serverError}</p>
      )}

      <SubmitButton
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        pendingText="Adding…"
      >
        Add repayment
      </SubmitButton>
    </form>
  );
}
