import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { createTransactionAction } from "@/lib/actions/transaction-actions";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { StatusTabs } from "@/components/transactions/status-tabs";
import type { Prisma } from "@prisma/client";

const STATUS_FILTERS: Record<string, Prisma.TransactionWhereInput> = {
  mapped: { categoryStatus: { in: ["confirmed", "auto_mapped"] } },
  needs_review: { categoryStatus: "needs_review" },
  unmapped: { categoryStatus: "unmapped" },
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const householdId = await getHouseholdId();
  const statusFilter = status && STATUS_FILTERS[status] ? STATUS_FILTERS[status] : {};

  const [accounts, categories, homes, people, owners, transactions] = await Promise.all([
    prisma.account.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.home.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.personTag.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.personTag.findMany({
      where: { householdId, isActive: true, userId: { not: null } },
      orderBy: { name: "asc" },
    }),
    prisma.transaction.findMany({
      where: { householdId, ...statusFilter },
      include: {
        account: true,
        category: true,
        categoryRule: true,
        homes: { include: { home: true } },
        people: { include: { personTag: true } },
        spentByPersonTag: true,
      },
      orderBy: { date: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6">
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">Every transaction, filterable by status.</p>
        </div>
        <AddTransactionDialog
          accounts={accounts}
          categories={categories}
          homes={homes}
          people={people}
          owners={owners}
          createAction={createTransactionAction}
        />
      </div>

      <div className="shrink-0">
        <StatusTabs active={status && STATUS_FILTERS[status] ? status : "all"} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <TransactionTable transactions={transactions} categories={categories} showActions />
      </div>
    </div>
  );
}
