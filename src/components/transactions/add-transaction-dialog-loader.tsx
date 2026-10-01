import { prisma } from "@/lib/prisma";
import { createTransactionAction } from "@/lib/actions/transaction-actions";
import { AddTransactionDialog } from "./add-transaction-dialog";

export async function AddTransactionDialogLoader({ householdId }: { householdId: string }) {
  const [accounts, categories, homes, people, owners] = await Promise.all([
    prisma.account.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.home.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.personTag.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.personTag.findMany({
      where: { householdId, isActive: true, userId: { not: null } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <AddTransactionDialog
      accounts={accounts}
      categories={categories}
      homes={homes}
      people={people}
      owners={owners}
      createAction={createTransactionAction}
    />
  );
}
