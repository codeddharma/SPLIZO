import { prisma } from "@/lib/prisma";

export type VendorMatchResult =
  | { vendorId: string; categoryId: string; status: "auto_mapped" }
  | { vendorId: string; categoryId: null; status: "needs_review" }
  | { vendorId: null; categoryId: null; status: "unmapped" };

export async function matchVendor(
  householdId: string,
  description: string
): Promise<VendorMatchResult> {
  const vendors = await prisma.vendor.findMany({
    where: { householdId, isActive: true },
    include: { categoryRule: true },
  });
  const desc = description.toUpperCase();

  const exact = vendors.find(
    (v) => v.matchType === "exact" && v.matchText.toUpperCase() === desc
  );
  if (exact) {
    return exact.categoryRule
      ? { vendorId: exact.id, categoryId: exact.categoryRule.categoryId, status: "auto_mapped" }
      : { vendorId: exact.id, categoryId: null, status: "needs_review" };
  }

  const containsMatches = vendors.filter(
    (v) => v.matchType === "contains" && desc.includes(v.matchText.toUpperCase())
  );

  if (containsMatches.length === 0) return { vendorId: null, categoryId: null, status: "unmapped" };

  if (containsMatches.length === 1) {
    const v = containsMatches[0];
    return v.categoryRule
      ? { vendorId: v.id, categoryId: v.categoryRule.categoryId, status: "auto_mapped" }
      : { vendorId: v.id, categoryId: null, status: "needs_review" };
  }

  // Multiple candidate vendors: best guess is the most specific (longest) match text,
  // but flagged for review since the ambiguity itself is the useful signal.
  const bestGuess = [...containsMatches].sort(
    (a, b) => b.matchText.length - a.matchText.length
  )[0];
  return {
    vendorId: bestGuess.id,
    categoryId: null,
    status: "needs_review",
  };
}
