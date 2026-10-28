"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddRepaymentDialog } from "./add-repayment-dialog";

type Option = { id: string; name: string };
type Transaction = { id: string; date: Date | string; description: string; amount: number; accountName: string };
type Repayment = { id: string; amount: number; date: Date | string; notes: string | null };

export type LoanCardData = {
  id: string;
  direction: "lent" | "borrowed";
  status: "open" | "settled";
  date: Date | string;
  openingAmount: number;
  repaid: number;
  outstanding: number;
  contact: { id: string; name: string };
  repayments: Repayment[];
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function LoanCard({
  loan,
  accounts,
  unlinkedTransactions,
  today,
}: {
  loan: LoanCardData;
  accounts: Option[];
  unlinkedTransactions: Transaction[];
  today: string;
}) {
  const [repayOpen, setRepayOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-foreground">{loan.contact.name}</span>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                loan.direction === "lent" ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
              }`}
            >
              {loan.direction === "lent" ? "Lent" : "Borrowed"}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                loan.status === "settled" ? "bg-muted text-muted-foreground" : "bg-warning/10 text-warning"
              }`}
            >
              {loan.status === "settled" ? "Settled" : "Open"}
            </span>
          </div>
          {/* Opening date gives each loan its own identity — two loans for
              the same contact otherwise look identical. */}
          <div className="mt-1 text-xs text-muted-foreground">Opened {formatDate(loan.date)}</div>
        </div>
        {loan.status === "open" && (
          <Button variant="outline" size="sm" className="shrink-0" onClick={() => setRepayOpen(true)}>
            Add repayment
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">Opening</div>
          <div className="text-sm font-bold text-foreground">₹{loan.openingAmount.toLocaleString("en-IN")}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Repaid</div>
          <div className="text-sm font-bold text-foreground">₹{loan.repaid.toLocaleString("en-IN")}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Outstanding</div>
          <div className={`text-sm font-bold ${loan.direction === "lent" ? "text-income" : "text-expense"}`}>
            ₹{loan.outstanding.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {loan.repayments.length > 0 ? (
        <div>
          <button
            type="button"
            onClick={() => setHistoryOpen((o) => !o)}
            className="flex w-full items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Repayment history ({loan.repayments.length})
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${historyOpen ? "rotate-180" : ""}`} />
          </button>
          {historyOpen && (
            <ul className="mt-2 flex flex-col gap-1.5 border-t border-border pt-2">
              {loan.repayments.map((r) => (
                <li key={r.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {formatDate(r.date)}
                    {r.notes ? ` · ${r.notes}` : ""}
                  </span>
                  <span className="font-semibold text-foreground">₹{r.amount.toLocaleString("en-IN")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No repayments yet.</p>
      )}

      {repayOpen && (
        <AddRepaymentDialog
          open={repayOpen}
          onOpenChange={setRepayOpen}
          loanId={loan.id}
          direction={loan.direction}
          accounts={accounts}
          unlinkedTransactions={unlinkedTransactions}
          today={today}
        />
      )}
    </div>
  );
}
