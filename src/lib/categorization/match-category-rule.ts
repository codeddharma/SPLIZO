import { prisma } from "@/lib/prisma";

export type CategoryRuleMatchResult =
  | { categoryRuleId: string; categoryId: string; status: "auto_mapped" }
  | { categoryRuleId: string; categoryId: null; status: "needs_review" }
  | { categoryRuleId: null; categoryId: null; status: "unmapped" };

export async function matchCategoryRule(
  householdId: string,
  description: string
): Promise<CategoryRuleMatchResult> {
  const rules = await prisma.categoryRule.findMany({
    where: { householdId, isActive: true },
  });
  const desc = description.toUpperCase();

  const exact = rules.find(
    (r) => r.matchType === "exact" && r.matchText.toUpperCase() === desc
  );
  if (exact) {
    return exact.categoryId
      ? { categoryRuleId: exact.id, categoryId: exact.categoryId, status: "auto_mapped" }
      : { categoryRuleId: exact.id, categoryId: null, status: "needs_review" };
  }

  const containsMatches = rules.filter(
    (r) => r.matchType === "contains" && desc.includes(r.matchText.toUpperCase())
  );

  if (containsMatches.length === 0) {
    return { categoryRuleId: null, categoryId: null, status: "unmapped" };
  }

  if (containsMatches.length === 1) {
    const r = containsMatches[0];
    return r.categoryId
      ? { categoryRuleId: r.id, categoryId: r.categoryId, status: "auto_mapped" }
      : { categoryRuleId: r.id, categoryId: null, status: "needs_review" };
  }

  // Multiple candidate rules: best guess is the most specific (longest) match text,
  // but flagged for review since the ambiguity itself is the useful signal.
  const bestGuess = [...containsMatches].sort(
    (a, b) => b.matchText.length - a.matchText.length
  )[0];
  return {
    categoryRuleId: bestGuess.id,
    categoryId: null,
    status: "needs_review",
  };
}
