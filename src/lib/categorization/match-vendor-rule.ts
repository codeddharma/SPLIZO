import { prisma } from "@/lib/prisma";

export type CategorizationResult =
  | { categoryId: string; status: "auto_mapped" }
  | { categoryId: string; status: "needs_review" }
  | { categoryId: null; status: "unmapped" };

export async function matchVendorRule(
  householdId: string,
  description: string
): Promise<CategorizationResult> {
  const rules = await prisma.vendorRule.findMany({ where: { householdId } });
  const desc = description.toUpperCase();

  const exact = rules.find(
    (r) => r.matchType === "exact" && r.matchText.toUpperCase() === desc
  );
  if (exact) return { categoryId: exact.categoryId, status: "auto_mapped" };

  const containsMatches = rules.filter(
    (r) => r.matchType === "contains" && desc.includes(r.matchText.toUpperCase())
  );

  if (containsMatches.length === 0) return { categoryId: null, status: "unmapped" };
  if (containsMatches.length === 1) {
    return { categoryId: containsMatches[0].categoryId, status: "auto_mapped" };
  }

  // Multiple candidates: best guess is the most specific (longest) match text,
  // but flagged for review since the ambiguity itself is the useful signal.
  const bestGuess = [...containsMatches].sort(
    (a, b) => b.matchText.length - a.matchText.length
  )[0];
  return { categoryId: bestGuess.categoryId, status: "needs_review" };
}
