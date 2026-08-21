"use server";

import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { transactionSchema } from "@/lib/validation/transaction";
import { categorize } from "@/lib/categorization/apply-categorization";

function revalidateAll() {
  revalidatePath("/transactions");
  revalidatePath("/transactions/review");
  revalidatePath("/dashboard");
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
    homeId: formData.get("homeId") ?? "",
    personTagId: formData.get("personTagId") ?? "",
  });

  const signedAmount =
    parsed.direction === "out" ? -Math.abs(parsed.amount) : Math.abs(parsed.amount);

  const { categoryId, categoryStatus } = await categorize(
    householdId,
    parsed.description,
    parsed.categoryId || null
  );

  await prisma.transaction.create({
    data: {
      householdId,
      accountId: parsed.accountId,
      categoryId,
      categoryStatus,
      personTagId: parsed.personTagId || null,
      homeId: parsed.homeId || null,
      amount: signedAmount,
      date: new Date(parsed.date),
      description: parsed.description,
      notes: parsed.notes || null,
      source: "manual",
    },
  });

  revalidateAll();
}

export async function recategorizeTransactionAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const id = String(formData.get("id"));
  const categoryId = String(formData.get("categoryId"));
  if (!categoryId) return;

  await prisma.transaction.updateMany({
    where: { id, householdId },
    data: { categoryId, categoryStatus: "confirmed" },
  });

  revalidateAll();
}
