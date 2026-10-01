"use server";

import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { parseBankCsv } from "@/lib/csv/parse-bank-csv";
import { categorize } from "@/lib/categorization/apply-categorization";
import { importPdfAction } from "@/lib/actions/pdf-import-actions";

export type UnifiedImportSummary =
  | {
      format: string;
      total: number;
      inserted: number;
      duplicates: number;
      autoMapped: number;
      needsReview: number;
      unmapped: number;
      accountsCreated: number;
    }
  | { error: string };

/** Detects CSV vs PDF from the file extension and routes to the matching parser. */
export async function importAction(
  _prev: UnifiedImportSummary | null,
  formData: FormData
): Promise<UnifiedImportSummary> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Select a CSV or PDF statement file." };
  }

  const extension = file.name.toLowerCase().split(".").pop();

  if (extension === "csv") {
    const result = await importCsvAction(null, formData);
    if ("error" in result) return result;
    return { format: "CSV", accountsCreated: 0, ...result };
  }

  if (extension === "pdf") {
    return importPdfAction(null, formData);
  }

  return { error: "Unsupported file type — upload a .csv or .pdf statement." };
}

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

  const account = await prisma.account.findFirst({
    where: { id: accountId, householdId },
    select: { owners: { select: { personTagId: true } } },
  });
  const spentByPersonTagId =
    account?.owners.length === 1 ? account.owners[0].personTagId : null;

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

    const { categoryId, categoryStatus, categoryRuleId } = await categorize(householdId, row.description);
    if (categoryStatus === "auto_mapped") autoMapped++;
    else if (categoryStatus === "needs_review") needsReview++;
    else unmapped++;

    await prisma.transaction.create({
      data: {
        householdId,
        accountId,
        categoryId,
        categoryStatus,
        categoryRuleId,
        spentByPersonTagId,
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
