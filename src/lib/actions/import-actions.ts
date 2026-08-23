"use server";

import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { parseBankCsv } from "@/lib/csv/parse-bank-csv";
import { categorize } from "@/lib/categorization/apply-categorization";

export type ImportSummary =
  | {
      total: number;
      inserted: number;
      duplicates: number;
      autoMapped: number;
      needsReview: number;
      unmapped: number;
    }
  | { error: string };

export async function importCsvAction(
  _prev: ImportSummary | null,
  formData: FormData
): Promise<ImportSummary> {
  const householdId = await getHouseholdId();
  const accountId = String(formData.get("accountId") ?? "");
  const file = formData.get("file") as File | null;

  if (!accountId || !file || file.size === 0) {
    return { error: "Select an account and a CSV file." };
  }

  const text = await file.text();
  const result = parseBankCsv(text);
  if (!result.ok) return { error: result.error };

  const importBatch = await prisma.importBatch.create({
    data: { householdId, fileName: file.name, source: "csv" },
  });

  let inserted = 0;
  let duplicates = 0;
  let autoMapped = 0;
  let needsReview = 0;
  let unmapped = 0;

  for (const row of result.rows) {
    const existing = await prisma.transaction.findFirst({
      where: {
        householdId,
        accountId,
        date: row.date,
        description: row.description,
        amount: row.amount,
      },
      select: { id: true },
    });

    if (existing) {
      duplicates++;
      continue;
    }

    const { categoryId, categoryStatus, vendorId } = await categorize(householdId, row.description);
    if (categoryStatus === "auto_mapped") autoMapped++;
    else if (categoryStatus === "needs_review") needsReview++;
    else unmapped++;

    await prisma.transaction.create({
      data: {
        householdId,
        accountId,
        categoryId,
        categoryStatus,
        vendorId,
        amount: row.amount,
        date: row.date,
        description: row.description,
        source: "csv",
        importBatchId: importBatch.id,
        rawPayload: row.raw,
      },
    });
    inserted++;
  }

  revalidatePath("/import");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return { total: result.rows.length, inserted, duplicates, autoMapped, needsReview, unmapped };
}
