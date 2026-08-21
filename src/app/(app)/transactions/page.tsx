import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { createTransactionAction } from "@/lib/actions/transaction-actions";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionTable } from "@/components/transactions/transaction-table";

export default async function TransactionsPage() {
  const householdId = await getHouseholdId();

  const [accounts, categories, homes, people, transactions] = await Promise.all([
    prisma.account.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.home.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.personTag.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.transaction.findMany({
      where: { householdId },
      include: { account: true, category: true, home: true, personTag: true },
      orderBy: { date: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Add a transaction manually — category auto-detects from vendor rules if left blank.
        </p>
      </div>
      <TransactionForm
        accounts={accounts}
        categories={categories}
        homes={homes}
        people={people}
        createAction={createTransactionAction}
      />
      <TransactionTable transactions={transactions} />
    </div>
  );
}
