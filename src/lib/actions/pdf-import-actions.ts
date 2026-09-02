"use server";

import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { categorize } from "@/lib/categorization/apply-categorization";
import { detectPdfFormat } from "@/lib/pdf-import/detect-format";
import { resolveAccountHint } from "@/lib/pdf-import/resolve-account";
import { extractPdfText } from "@/lib/pdf-import/extract-pdf-text";

export type PdfImportSummary =
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

export async function importPdfAction(
  _prev: PdfImportSummary | null,
  formData: FormData
): Promise<PdfImportSummary> {
  const householdId = await getHouseholdId();
  const file = formData.get("file") as File | null;
  const selectedAccountId = String(formData.get("accountId") ?? "") || null;

  if (!file || file.size === 0) {
    return { error: "Select a PDF file." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let rawText: string;
  try {
    rawText = await extractPdfText(buffer);
  } catch (err) {
    console.error("PDF text extraction failed:", err);
    return { error: "Couldn't read this PDF — it may be corrupted or password-protected." };
  }

  const format = detectPdfFormat(rawText);
  if (!format) {
    return {
      error:
        "Unrecognized statement format — currently supports ICICI Bank and Google Pay statements.",
    };
  }

  if (!format.requiresAccountPerRow && !selectedAccountId) {
    return { error: "Select an account for this statement." };
  }

  const rows = format.parse(rawText);
  if (rows.length === 0) {
    return { error: "No transactions found in this PDF." };
  }

  const importBatch = await prisma.importBatch.create({
    data: { householdId, fileName: file.name, source: "pdf" },
  });

  const existingAccounts = await prisma.account.findMany({
    where: { householdId },
    select: { id: true, institution: true, last4: true },
  });
  const accountIdByHint = new Map<string, string>();
  let accountsCreated = 0;

  let inserted = 0;
  let duplicates = 0;
  let autoMapped = 0;
  let needsReview = 0;
  let unmapped = 0;

  for (const row of rows) {
    let accountId = selectedAccountId;

    if (format.requiresAccountPerRow) {
      const hint = row.accountHint ?? "Unknown";
      const cached = accountIdByHint.get(hint);
      if (cached) {
        accountId = cached;
      } else {
        const resolution = resolveAccountHint(hint, existingAccounts);
        if ("accountId" in resolution) {
          accountId = resolution.accountId;
        } else {
          const created = await prisma.account.create({
            data: { householdId, ...resolution.createData },
          });
          existingAccounts.push({
            id: created.id,
            institution: created.institution,
            last4: created.last4,
          });
          accountId = created.id;
          accountsCreated++;
        }
        accountIdByHint.set(hint, accountId);
      }
    }

    if (!accountId) continue;

    // Cross-source duplicate: same UPI/NEFT reference already imported (from
    // this or any other file), regardless of how the description text differs.
    if (row.externalRef) {
      const existing = await prisma.transaction.findFirst({
        where: { householdId, externalRef: row.externalRef },
        select: { id: true },
      });
      if (existing) {
        duplicates++;
        continue;
      }
    } else {
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
    }

    const { categoryId, categoryStatus, categoryRuleId } = await categorize(
      householdId,
      row.description
    );
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
        amount: row.amount,
        date: row.date,
        description: row.description,
        source: "pdf",
        externalRef: row.externalRef,
        importBatchId: importBatch.id,
      },
    });
    inserted++;
  }

  revalidatePath("/import");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");

  return {
    format: format.name,
    total: rows.length,
    inserted,
    duplicates,
    autoMapped,
    needsReview,
    unmapped,
    accountsCreated,
  };
}
