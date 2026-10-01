"use server";

import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import {
  contactSchema,
  loanFromAccountSchema,
  loanFromTransactionSchema,
  repaymentFromAccountSchema,
  repaymentFromTransactionSchema,
} from "@/lib/validation/loan";

function revalidateLoans() {
  revalidatePath("/loans");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function createContactAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const parsed = contactSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
    notes: formData.get("notes") ?? "",
  });
  await prisma.contact.create({
    data: {
      householdId,
      name: parsed.name,
      phone: parsed.phone || null,
      notes: parsed.notes || null,
    },
  });
  revalidateLoans();
}

// A loan transaction is a transfer (cash/receivable), not spend or income, so
// it skips normal categorization and is excluded from dashboard analytics via
// its `loan`/`loanRepayment` relation (see src/lib/queries/dashboard.ts).
async function claimUnlinkedTransaction(householdId: string, transactionId: string) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, householdId, loan: null, loanRepayment: null },
  });
  if (!transaction) throw new Error("That transaction is not available to link.");
  return transaction;
}

export async function createLoanAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const mode = String(formData.get("mode") ?? "new");

  if (mode === "existing") {
    const parsed = loanFromTransactionSchema.parse({
      contactId: formData.get("contactId"),
      direction: formData.get("direction"),
      transactionId: formData.get("transactionId"),
      notes: formData.get("notes") ?? "",
    });
    const transaction = await claimUnlinkedTransaction(householdId, parsed.transactionId);

    await prisma.loan.create({
      data: {
        householdId,
        contactId: parsed.contactId,
        direction: parsed.direction,
        openingAmount: Math.abs(Number(transaction.amount)),
        date: transaction.date,
        notes: parsed.notes || null,
        linkedTransactionId: transaction.id,
      },
    });
  } else {
    const parsed = loanFromAccountSchema.parse({
      contactId: formData.get("contactId"),
      direction: formData.get("direction"),
      accountId: formData.get("accountId"),
      amount: formData.get("amount"),
      date: formData.get("date"),
      notes: formData.get("notes") ?? "",
    });

    // Lending money moves it out of your account; borrowing brings it in.
    const signedAmount = parsed.direction === "lent" ? -parsed.amount : parsed.amount;

    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          householdId,
          accountId: parsed.accountId,
          amount: signedAmount,
          date: new Date(parsed.date),
          description: `Loan ${parsed.direction === "lent" ? "to" : "from"} contact`,
          source: "manual",
          categoryStatus: "confirmed",
        },
      });

      await tx.loan.create({
        data: {
          householdId,
          contactId: parsed.contactId,
          direction: parsed.direction,
          openingAmount: parsed.amount,
          date: new Date(parsed.date),
          notes: parsed.notes || null,
          linkedTransactionId: transaction.id,
        },
      });
    });
  }

  revalidateLoans();
}

export async function addRepaymentAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const mode = String(formData.get("mode") ?? "new");
  const loanId = String(formData.get("loanId") ?? "");

  const loan = await prisma.loan.findFirst({
    where: { id: loanId, householdId },
    include: { repayments: true },
  });
  if (!loan) return;

  // A repayment received on a loan you gave out comes in; a repayment you
  // make on money you borrowed goes out.
  const repaymentSign = loan.direction === "lent" ? 1 : -1;

  let repaymentAmount: number;

  if (mode === "existing") {
    const parsed = repaymentFromTransactionSchema.parse({
      loanId,
      transactionId: formData.get("transactionId"),
    });
    const transaction = await claimUnlinkedTransaction(householdId, parsed.transactionId);
    repaymentAmount = Math.abs(Number(transaction.amount));

    await prisma.loanRepayment.create({
      data: {
        loanId: loan.id,
        amount: repaymentAmount,
        date: transaction.date,
        linkedTransactionId: transaction.id,
      },
    });
  } else {
    const parsed = repaymentFromAccountSchema.parse({
      loanId,
      accountId: formData.get("accountId"),
      amount: formData.get("amount"),
      date: formData.get("date"),
    });
    repaymentAmount = parsed.amount;

    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          householdId,
          accountId: parsed.accountId,
          amount: repaymentSign * parsed.amount,
          date: new Date(parsed.date),
          description: `Loan repayment (${loan.direction === "lent" ? "received" : "made"})`,
          source: "manual",
          categoryStatus: "confirmed",
        },
      });

      await tx.loanRepayment.create({
        data: {
          loanId: loan.id,
          amount: parsed.amount,
          date: new Date(parsed.date),
          linkedTransactionId: transaction.id,
        },
      });
    });
  }

  const totalRepaid = loan.repayments.reduce((sum, r) => sum + Number(r.amount), 0) + repaymentAmount;
  if (totalRepaid >= Number(loan.openingAmount)) {
    await prisma.loan.update({ where: { id: loan.id }, data: { status: "settled" } });
  }

  revalidateLoans();
}
