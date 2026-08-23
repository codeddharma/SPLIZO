import { matchVendor } from "./match-vendor";
import type { $Enums } from "@prisma/client";

export async function categorize(
  householdId: string,
  description: string,
  manualCategoryId?: string | null
): Promise<{
  categoryId: string | null;
  categoryStatus: $Enums.CategoryStatus;
  vendorId: string | null;
}> {
  const vendorMatch = await matchVendor(householdId, description);

  if (manualCategoryId) {
    return { categoryId: manualCategoryId, categoryStatus: "confirmed", vendorId: vendorMatch.vendorId };
  }

  return {
    categoryId: vendorMatch.categoryId,
    categoryStatus: vendorMatch.status,
    vendorId: vendorMatch.vendorId,
  };
}
