import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { getLoansWithBalances, getLoanSummary, getUnlinkedTransactions } from "@/lib/queries/loans";
import {
  createContactAction,
  createLoanAction,
  addRepaymentAction,
} from "@/lib/actions/loan-actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { LoanForm } from "@/components/loans/loan-form";
import { RepaymentForm } from "@/components/loans/repayment-form";

export default async function LoansPage() {
  const householdId = await getHouseholdId();
  const [contacts, loans, summary, accounts, unlinkedTransactions] = await Promise.all([
    prisma.contact.findMany({ where: { householdId }, orderBy: { name: "asc" } }),
    getLoansWithBalances(householdId),
    getLoanSummary(householdId),
    prisma.account.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    getUnlinkedTransactions(householdId),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-6 p-6">
      <div className="shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight">Loans</h1>
        <p className="text-sm text-muted-foreground">
          Money lent to or borrowed from family/relatives — tracked separately from household
          spending.
        </p>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Outstanding — lent</div>
          <div className="text-2xl font-extrabold tracking-tight text-income">
            ₹{summary.totalLent.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Outstanding — borrowed</div>
          <div className="text-2xl font-extrabold tracking-tight text-expense">
            ₹{summary.totalBorrowed.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      <form
        action={createContactAction}
        className="flex shrink-0 flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Contact name</label>
          <input
            name="name"
            placeholder="e.g. Uncle Raj"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Phone (optional)</label>
          <input
            name="phone"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
          Add contact
        </SubmitButton>
      </form>

      {contacts.length === 0 ? (
        <div className="shrink-0 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Add a contact above before logging a loan.
        </div>
      ) : (
        <LoanForm
          contacts={contacts}
          accounts={accounts}
          unlinkedTransactions={unlinkedTransactions}
          today={today}
          createLoanAction={createLoanAction}
        />
      )}

      <div className="flex min-h-0 flex-1 flex-col divide-y divide-border overflow-y-auto rounded-xl border border-border bg-card">
        {loans.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No loans logged yet.</div>
        )}
        {loans.map((loan) => (
          <div key={loan.id} className="flex flex-col gap-2 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                {loan.contact.name}
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    loan.direction === "lent"
                      ? "bg-income/10 text-income"
                      : "bg-expense/10 text-expense"
                  }`}
                >
                  {loan.direction === "lent" ? "Lent" : "Borrowed"}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    loan.status === "settled"
                      ? "bg-muted text-muted-foreground"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {loan.status === "settled" ? "Settled" : "Open"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Opening ₹{Number(loan.openingAmount).toLocaleString("en-IN")} · Repaid ₹
                {loan.repaid.toLocaleString("en-IN")} · Outstanding{" "}
                <span className="font-semibold text-foreground">
                  ₹{loan.outstanding.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            {loan.status === "open" && (
              <RepaymentForm
                loanId={loan.id}
                direction={loan.direction}
                accounts={accounts}
                unlinkedTransactions={unlinkedTransactions}
                today={today}
                addRepaymentAction={addRepaymentAction}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
