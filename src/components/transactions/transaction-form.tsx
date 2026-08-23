"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";

type Option = { id: string; name: string };

function toggleId(set: Set<string>, id: string) {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

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
  const [direction, setDirection] = useState<"out" | "in">("out");
  const [selectedHomes, setSelectedHomes] = useState<Set<string>>(new Set());
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set());
  const [validationError, setValidationError] = useState<string | null>(null);

  if (accounts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Add an account first before logging transactions — see the Accounts page.
      </div>
    );
  }

  const required = direction === "out";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (required && (selectedHomes.size === 0 || selectedPeople.size === 0)) {
      e.preventDefault();
      setValidationError("Expense transactions need at least one home and one person selected.");
      return;
    }
    setValidationError(null);
  }

  return (
    <form
      action={createAction}
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Direction</label>
          <select
            name="direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value as "out" | "in")}
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Home{required ? " (required)" : " (optional)"}
          </label>
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-background p-2">
            {homes.length === 0 && (
              <span className="text-xs text-muted-foreground">No homes added yet.</span>
            )}
            {homes.map((h) => (
              <div key={h.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="homeIds"
                  value={h.id}
                  checked={selectedHomes.has(h.id)}
                  onChange={() => setSelectedHomes((s) => toggleId(s, h.id))}
                  className="h-3.5 w-3.5"
                />
                <span className="flex-1 text-sm">{h.name}</span>
                {selectedHomes.has(h.id) && selectedHomes.size > 1 && (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name={`homeAmount_${h.id}`}
                    placeholder="auto"
                    className="w-20 rounded border border-border bg-card px-1.5 py-0.5 text-xs"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Person{required ? " (required)" : " (optional)"}
          </label>
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-background p-2">
            {people.length === 0 && (
              <span className="text-xs text-muted-foreground">No people added yet.</span>
            )}
            {people.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="personTagIds"
                  value={p.id}
                  checked={selectedPeople.has(p.id)}
                  onChange={() => setSelectedPeople((s) => toggleId(s, p.id))}
                  className="h-3.5 w-3.5"
                />
                <span className="flex-1 text-sm">{p.name}</span>
                {selectedPeople.has(p.id) && selectedPeople.size > 1 && (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name={`personAmount_${p.id}`}
                    placeholder="auto"
                    className="w-20 rounded border border-border bg-card px-1.5 py-0.5 text-xs"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {validationError && <p className="text-xs text-expense">{validationError}</p>}

      <SubmitButton className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
        Add transaction
      </SubmitButton>
    </form>
  );
}
