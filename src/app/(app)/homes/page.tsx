import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { createHomeAction, deactivateHomeAction } from "@/lib/actions/reference-data-actions";
import { SimpleTagManager } from "@/components/reference-data/simple-tag-manager";

export default async function HomesPage() {
  const householdId = await getHouseholdId();
  const homes = await prisma.home.findMany({
    where: { householdId, isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <SimpleTagManager
      items={homes}
      createAction={createHomeAction}
      deactivateAction={deactivateHomeAction}
      title="Homes"
      description="Rented, owned, parents' — tag any transaction against one of these."
      label="Home"
      placeholder="e.g. Rented Home"
    />
  );
}
