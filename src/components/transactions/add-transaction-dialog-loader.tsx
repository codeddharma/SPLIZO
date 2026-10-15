import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { createTransactionAction } from "@/lib/actions/transaction-actions";
import { AddTransactionDialog } from "./add-transaction-dialog";

export async function AddTransactionDialogLoader({ householdId }: { householdId: string }) {
  const session = await requireSession();
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

  const currentOwner = owners.find((o) => o.userId === session.user.id);

  return (
    <AddTransactionDialog
      accounts={accounts}
      categories={categories}
      homes={homes}
      people={people}
      owners={owners}
      defaultSpentByPersonTagId={currentOwner?.id ?? ""}
      createAction={createTransactionAction}
    />
  );
}
