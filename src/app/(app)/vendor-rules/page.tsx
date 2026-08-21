import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { createVendorRuleAction, deleteVendorRuleAction } from "@/lib/actions/reference-data-actions";
import { VendorRuleManager } from "@/components/reference-data/vendor-rule-manager";

export default async function VendorRulesPage() {
  const householdId = await getHouseholdId();
  const [vendorRules, categories] = await Promise.all([
    prisma.vendorRule.findMany({
      where: { householdId },
      include: { category: { select: { name: true } } },
      orderBy: { matchText: "asc" },
    }),
    prisma.category.findMany({
      where: { householdId, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <VendorRuleManager
      vendorRules={vendorRules}
      categories={categories}
      createAction={createVendorRuleAction}
      deleteAction={deleteVendorRuleAction}
    />
  );
}
