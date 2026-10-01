import { prisma } from "@/lib/prisma";

export type CategoryRuleMatchResult =
  | { categoryRuleId: string; categoryId: string; status: "auto_mapped" }
  | { categoryRuleId: string; categoryId: null; status: "needs_review" }
  | { categoryRuleId: null; categoryId: null; status: "unmapped" };

// A "contains" rule's matchText may hold several comma-separated keywords
// (e.g. "SWIGGY, ZOMATO") that should each be checked independently.
function parseContainsKeywords(matchText: string): string[] {
  return matchText
    .split(",")
    .map((k) => k.trim().toUpperCase())
    .filter((k) => k.length > 0);
}

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

  const containsMatches = rules
    .filter((r) => r.matchType === "contains")
    .map((r) => ({
      rule: r,
      matchedKeywords: parseContainsKeywords(r.matchText).filter((k) => desc.includes(k)),
    }))
    .filter((m) => m.matchedKeywords.length > 0);

  if (containsMatches.length === 0) {
    return { categoryRuleId: null, categoryId: null, status: "unmapped" };
  }

  if (containsMatches.length === 1) {
    const r = containsMatches[0].rule;
    return r.categoryId
      ? { categoryRuleId: r.id, categoryId: r.categoryId, status: "auto_mapped" }
      : { categoryRuleId: r.id, categoryId: null, status: "needs_review" };
  }

  // Multiple distinct rules matched: best guess is the one whose matched keyword
  // is most specific (longest), but it's flagged for review since the ambiguity
  // itself is the useful signal.
  const bestGuess = [...containsMatches].sort(
    (a, b) =>
      Math.max(...b.matchedKeywords.map((k) => k.length)) -
      Math.max(...a.matchedKeywords.map((k) => k.length))
  )[0].rule;

  return {
    categoryRuleId: bestGuess.id,
    categoryId: null,
    status: "needs_review",
  };
}
