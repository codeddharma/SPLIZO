"use server";

import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { parseBankCsv, type ParsedRow } from "@/lib/csv/parse-bank-csv";
import { categorize } from "@/lib/categorization/apply-categorization";
import { importPdfAction } from "@/lib/actions/pdf-import-actions";

export type ImportStartResult = { started: true; fileName: string } | { error: string };

export type ImportBatchSummary = {
  id: string;
  fileName: string;
  importedAt: Date;
  status: string;
  total: number;
  inserted: number;
  duplicates: number;
  needsReview: number;
  unmapped: number;
  accountsCreated: number;
  errorMessage: string | null;
};

export async function getImportBatchesAction(): Promise<ImportBatchSummary[]> {
  const householdId = await getHouseholdId();
  return prisma.importBatch.findMany({
    where: { householdId },
    orderBy: { importedAt: "desc" },
    take: 10,
    select: {
      id: true,
      fileName: true,
      importedAt: true,
      status: true,
      total: true,
      inserted: true,
      duplicates: true,
      needsReview: true,
      unmapped: true,
      accountsCreated: true,
      errorMessage: true,
    },
  });
}

/** Detects CSV vs PDF from the file extension and routes to the matching parser. */
export async function importAction(
  _prev: ImportStartResult | null,
  formData: FormData
): Promise<ImportStartResult> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Select a CSV or PDF statement file." };
  }

  const extension = file.name.toLowerCase().split(".").pop();

  if (extension === "csv") {
    return importCsvAction(null, formData);
  }

  if (extension === "pdf") {
    return importPdfAction(null, formData);
  }

  return { error: "Unsupported file type — upload a .csv or .pdf statement." };
}

export async function importCsvAction(
  _prev: ImportStartResult | null,
  formData: FormData
): Promise<ImportStartResult> {
  const householdId = await getHouseholdId();
  const accountId = String(formData.get("accountId") ?? "");
  const spentByPersonTagId = String(formData.get("spentByPersonTagId") ?? "") || null;
  const file = formData.get("file") as File | null;

  if (!accountId || !file || file.size === 0) {
    return { error: "Select an account and a CSV file." };
  }

  const text = await file.text();
  const result = parseBankCsv(text);
  if (!result.ok) return { error: result.error };

  const importBatch = await prisma.importBatch.create({
    data: { householdId, fileName: file.name, source: "csv", total: result.rows.length },
  });

  // Deliberately not awaited: this is a long-lived pm2-managed process (not
  // serverless), so the row loop keeps running after the request returns.
  // The Import page polls ImportBatch.status instead of blocking on this.
  processCsvRows(householdId, accountId, spentByPersonTagId, importBatch.id, result.rows).catch(
    async (err) => {
      console.error("CSV import background processing failed:", err);
      await prisma.importBatch
        .update({
          where: { id: importBatch.id },
          data: { status: "failed", errorMessage: err instanceof Error ? err.message : "Unknown error" },
        })
        .catch(() => {});
    }
  );

  return { started: true, fileName: file.name };
}

async function processCsvRows(
  householdId: string,
  accountId: string,
  spentByPersonTagId: string | null,
  importBatchId: string,
  rows: ParsedRow[]
) {
  let inserted = 0;
  let duplicates = 0;
  let autoMapped = 0;
  let needsReview = 0;
  let unmapped = 0;

  for (const row of rows) {
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
        importBatchId,
        rawPayload: row.raw,
      },
    });
    inserted++;
  }

  await prisma.importBatch.update({
    where: { id: importBatchId },
    data: { status: "completed", inserted, duplicates, autoMapped, needsReview, unmapped },
  });
}
