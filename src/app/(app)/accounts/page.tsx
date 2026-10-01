import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { createAccountAction, deactivateAccountAction } from "@/lib/actions/reference-data-actions";
import { AccountManager } from "@/components/reference-data/account-manager";

export default async function AccountsPage() {
  const householdId = await getHouseholdId();
  const [accounts, people] = await Promise.all([
    prisma.account.findMany({
      where: { householdId, isActive: true },
      orderBy: { name: "asc" },
      include: { owners: { include: { personTag: true } } },
    }),
    prisma.personTag.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <AccountManager
      accounts={accounts}
      people={people}
      createAction={createAccountAction}
      deactivateAction={deactivateAccountAction}
    />
  );
}
