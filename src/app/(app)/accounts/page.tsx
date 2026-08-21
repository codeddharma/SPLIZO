import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { createAccountAction, deactivateAccountAction } from "@/lib/actions/reference-data-actions";
import { AccountManager } from "@/components/reference-data/account-manager";

export default async function AccountsPage() {
  const householdId = await getHouseholdId();
  const accounts = await prisma.account.findMany({
    where: { householdId, isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <AccountManager
      accounts={accounts}
      createAction={createAccountAction}
      deactivateAction={deactivateAccountAction}
    />
  );
}
