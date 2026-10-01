"use client";

import { useEffect, useRef, useState } from "react";
import { Search, ChevronDown } from "lucide-react";

type Transaction = {
  id: string;
  date: Date | string;
  description: string;
  amount: number;
  accountName: string;
};

export function TransactionPicker({
  name,
  transactions,
  placeholder = "Choose a transaction…",
  onSelect,
}: {
  name: string;
  transactions: Transaction[];
  placeholder?: string;
  onSelect?: (transaction: Transaction) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Transaction | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = transactions.filter((t) =>
    `${t.description} ${t.accountName} ${t.amount}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={ref} className="relative flex flex-col gap-1.5">
      <input type="hidden" name={name} value={selected?.id ?? ""} />
      <label className="text-xs font-semibold text-muted-foreground">Transaction</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-w-56 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm"
      >
        {selected ? (
          <span className="truncate">
            {selected.description} · ₹{Math.abs(selected.amount).toLocaleString("en-IN")}
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute top-full z-30 mt-1 w-80 rounded-lg border border-border bg-card p-1 shadow-lg">
          <div className="flex items-center gap-1.5 border-b border-border px-1.5 py-1">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions…"
              className="w-full bg-transparent py-0.5 text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-2 py-2 text-xs text-muted-foreground">
                No unlinked transactions found.
              </div>
            )}
            {filtered.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelected(t);
                  onSelect?.(t);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full flex-col rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-foreground">{t.description}</span>
                  <span className={t.amount < 0 ? "text-expense" : "text-income"}>
                    {t.amount < 0 ? "-" : "+"}₹{Math.abs(t.amount).toLocaleString("en-IN")}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  {new Date(t.date).toLocaleDateString("en-IN", { timeZone: "UTC" })} ·{" "}
                  {t.accountName}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
