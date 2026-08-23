import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { createVendorAction, deactivateVendorAction } from "@/lib/actions/reference-data-actions";
import { VendorManager } from "@/components/reference-data/vendor-manager";

export default async function VendorsPage() {
  const householdId = await getHouseholdId();
  const [vendors, categories] = await Promise.all([
    prisma.vendor.findMany({
      where: { householdId, isActive: true },
      include: { categoryRule: { include: { category: { select: { name: true } } } } },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      where: { householdId, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <VendorManager
      vendors={vendors}
      categories={categories}
      createAction={createVendorAction}
      deactivateAction={deactivateVendorAction}
    />
  );
}
