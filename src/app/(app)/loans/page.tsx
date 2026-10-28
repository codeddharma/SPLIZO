import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { getLoansWithBalances, getLoanSummary, getUnlinkedTransactions } from "@/lib/queries/loans";
import { AddContactButton } from "@/components/loans/add-contact-button";
import { AddLoanButton } from "@/components/loans/add-loan-button";
import { LoanCard } from "@/components/loans/loan-card";

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
    <div className="flex w-full flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Loans</h1>
          <p className="text-sm text-muted-foreground">
            Money lent to or borrowed from family/relatives — tracked separately from household
            spending.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddContactButton />
          <AddLoanButton
            contacts={contacts}
            accounts={accounts}
            unlinkedTransactions={unlinkedTransactions}
            today={today}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      {loans.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          No loans logged yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {loans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={{
                id: loan.id,
                direction: loan.direction,
                status: loan.status,
                date: loan.date,
                openingAmount: Number(loan.openingAmount),
                repaid: loan.repaid,
                outstanding: loan.outstanding,
                contact: { id: loan.contact.id, name: loan.contact.name },
                repayments: loan.repayments.map((r) => ({
                  id: r.id,
                  amount: Number(r.amount),
                  date: r.date,
                  notes: r.notes,
                })),
              }}
              accounts={accounts}
              unlinkedTransactions={unlinkedTransactions}
              today={today}
            />
          ))}
        </div>
      )}
    </div>
  );
}
