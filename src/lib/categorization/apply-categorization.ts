import { matchVendorRule } from "./match-vendor-rule";
import type { $Enums } from "@prisma/client";

export async function categorize(
  householdId: string,
  description: string,
  manualCategoryId?: string | null
): Promise<{ categoryId: string | null; categoryStatus: $Enums.CategoryStatus }> {
  if (manualCategoryId) {
    return { categoryId: manualCategoryId, categoryStatus: "confirmed" };
  }

  const result = await matchVendorRule(householdId, description);
  return { categoryId: result.categoryId, categoryStatus: result.status };
}
