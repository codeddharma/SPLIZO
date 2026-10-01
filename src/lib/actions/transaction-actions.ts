"use server";

import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { transactionSchema } from "@/lib/validation/transaction";
import { categorize } from "@/lib/categorization/apply-categorization";
import { resolveShares } from "@/lib/transactions/resolve-shares";

function revalidateAll() {
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

function parseAmountOverrides(formData: FormData, prefix: string, ids: string[]) {
  const overrides: Record<string, number | undefined> = {};
  for (const id of ids) {
    const raw = formData.get(`${prefix}${id}`);
    const n = raw ? Number(raw) : NaN;
    overrides[id] = Number.isFinite(n) && n > 0 ? n : undefined;
  }
  return overrides;
}

export async function createTransactionAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const parsed = transactionSchema.parse({
    accountId: formData.get("accountId"),
    amount: formData.get("amount"),
    direction: formData.get("direction"),
    date: formData.get("date"),
    description: formData.get("description"),
    notes: formData.get("notes") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    homeIds: formData.getAll("homeIds").map(String),
    personTagIds: formData.getAll("personTagIds").map(String),
  });

  const spentByPersonTagId = String(formData.get("spentByPersonTagId") ?? "") || null;

  if (parsed.direction === "out" && (parsed.homeIds.length === 0 || parsed.personTagIds.length === 0)) {
    throw new Error("At least one place and one person are required for expense transactions.");
  }

  const signedAmount =
    parsed.direction === "out" ? -Math.abs(parsed.amount) : Math.abs(parsed.amount);

  const { categoryId, categoryStatus, categoryRuleId } = await categorize(
    householdId,
    parsed.description,
    parsed.categoryId || null
  );

  const homeOverrides = parseAmountOverrides(formData, "homeAmount_", parsed.homeIds);
  const personOverrides = parseAmountOverrides(formData, "personAmount_", parsed.personTagIds);
  const homeShares = resolveShares(parsed.homeIds, homeOverrides, signedAmount);
  const personShares = resolveShares(parsed.personTagIds, personOverrides, signedAmount);

  await prisma.transaction.create({
    data: {
      householdId,
      accountId: parsed.accountId,
      categoryId,
      categoryStatus,
      categoryRuleId,
      spentByPersonTagId,
      amount: signedAmount,
      date: new Date(parsed.date),
      description: parsed.description,
      notes: parsed.notes || null,
      source: "manual",
      homes: { create: homeShares.map((s) => ({ homeId: s.id, amount: s.amount })) },
      people: { create: personShares.map((s) => ({ personTagId: s.id, amount: s.amount })) },
    },
  });

  revalidateAll();
}

export async function updateTransactionAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const transaction = await prisma.transaction.findFirst({ where: { id, householdId } });
  if (!transaction) return;

  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const spentByPersonTagId = String(formData.get("spentByPersonTagId") ?? "") || null;
  const isInFamilyTransfer = formData.get("isInFamilyTransfer") === "on";
  const homeIds = formData.getAll("homeIds").map(String);
  const personTagIds = formData.getAll("personTagIds").map(String);

  const totalAmount = Number(transaction.amount);
  const homeOverrides = parseAmountOverrides(formData, "homeAmount_", homeIds);
  const personOverrides = parseAmountOverrides(formData, "personAmount_", personTagIds);
  const homeShares = resolveShares(homeIds, homeOverrides, totalAmount);
  const personShares = resolveShares(personTagIds, personOverrides, totalAmount);

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id },
      data: {
        categoryId,
        categoryStatus: categoryId ? "confirmed" : transaction.categoryStatus,
        spentByPersonTagId,
        isInFamilyTransfer,
      },
    });

    await tx.transactionHome.deleteMany({ where: { transactionId: id } });
    await tx.transactionHome.createMany({
      data: homeShares.map((s) => ({ transactionId: id, homeId: s.id, amount: s.amount })),
    });

    await tx.transactionPersonTag.deleteMany({ where: { transactionId: id } });
    await tx.transactionPersonTag.createMany({
      data: personShares.map((s) => ({ transactionId: id, personTagId: s.id, amount: s.amount })),
    });
  });

  revalidateAll();
}

export async function bulkRecategorizeTransactionsAction(ids: string[], categoryId: string) {
  const householdId = await getHouseholdId();
  if (ids.length === 0 || !categoryId) return;

  await prisma.transaction.updateMany({
    where: { id: { in: ids }, householdId },
    data: { categoryId, categoryStatus: "confirmed" },
  });

  revalidateAll();
}

export async function recategorizeTransactionAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const id = String(formData.get("id"));
  const categoryId = String(formData.get("categoryId"));
  if (!categoryId) return;

  const transaction = await prisma.transaction.findFirst({ where: { id, householdId } });
  if (!transaction) return;

  await prisma.transaction.updateMany({
    where: { id, householdId },
    data: { categoryId, categoryStatus: "confirmed" },
  });

  const saveRule = formData.get("saveRule");
  const matchText = String(formData.get("matchText") ?? "").trim();
  if (saveRule && matchText) {
    if (transaction.categoryRuleId) {
      // A rule already matched this transaction — just (re)map it to this category.
      await prisma.categoryRule.update({
        where: { id: transaction.categoryRuleId },
        data: { categoryId, source: "learned" },
      });
    } else {
      const rule = await prisma.categoryRule.create({
        data: {
          householdId,
          name: matchText,
          matchText,
          matchType: "contains",
          categoryId,
          source: "learned",
        },
      });
      await prisma.transaction.updateMany({
        where: { id, householdId },
        data: { categoryRuleId: rule.id },
      });
    }
    revalidatePath("/categories");
  }

  revalidateAll();
}
