import { matchCategoryRule } from "./match-category-rule";
import type { $Enums } from "@prisma/client";

export async function categorize(
  householdId: string,
  description: string,
  manualCategoryId?: string | null
): Promise<{
  categoryId: string | null;
  categoryStatus: $Enums.CategoryStatus;
  categoryRuleId: string | null;
}> {
  const match = await matchCategoryRule(householdId, description);

  if (manualCategoryId) {
    return {
      categoryId: manualCategoryId,
      categoryStatus: "confirmed",
      categoryRuleId: match.categoryRuleId,
    };
  }

  return {
    categoryId: match.categoryId,
    categoryStatus: match.status,
    categoryRuleId: match.categoryRuleId,
  };
}
