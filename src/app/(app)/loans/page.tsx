import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { getLoansWithBalances, getLoanSummary } from "@/lib/queries/loans";
import {
  createContactAction,
  createLoanAction,
  addRepaymentAction,
} from "@/lib/actions/loan-actions";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function LoansPage() {
  const householdId = await getHouseholdId();
  const [contacts, loans, summary] = await Promise.all([
    prisma.contact.findMany({ where: { householdId }, orderBy: { name: "asc" } }),
    getLoansWithBalances(householdId),
    getLoanSummary(householdId),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Loans</h1>
        <p className="text-sm text-muted-foreground">
          Money lent to or borrowed from family/relatives — tracked separately from household
          spending.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Outstanding — lent</div>
          <div className="text-xl font-bold text-income">
            ₹{summary.totalLent.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Outstanding — borrowed</div>
          <div className="text-xl font-bold text-expense">
            ₹{summary.totalBorrowed.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      <form
        action={createContactAction}
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end"
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
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Add a contact above before logging a loan.
        </div>
      ) : (
        <form
          action={createLoanAction}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end sm:flex-wrap"
        >
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
              defaultValue="lent"
              required
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="lent">Lent to them</option>
              <option value="borrowed">Borrowed from them</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Amount (₹)</label>
            <input
              name="openingAmount"
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
          <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
            Add loan
          </SubmitButton>
        </form>
      )}

      <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {loans.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No loans logged yet.</div>
        )}
        {loans.map((loan) => (
          <div key={loan.id} className="flex flex-col gap-2 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                {loan.contact.name}
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    loan.direction === "lent"
                      ? "bg-income/10 text-income"
                      : "bg-expense/10 text-expense"
                  }`}
                >
                  {loan.direction === "lent" ? "Lent" : "Borrowed"}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
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
              <form action={addRepaymentAction} className="flex items-center gap-2">
                <input type="hidden" name="loanId" value={loan.id} />
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Repayment amount"
                  required
                  className="w-36 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                />
                <input
                  name="date"
                  type="date"
                  defaultValue={today}
                  required
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                />
                <SubmitButton
                  className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-muted disabled:opacity-60"
                  pendingText="Adding…"
                >
                  Add repayment
                </SubmitButton>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
