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

export type ContactActionState = { error: string } | null;
export type LoanActionState = { error: string } | null;
export type RepaymentActionState = { error: string } | null;

export async function createContactAction(
  _prev: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const householdId = await getHouseholdId();
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  await prisma.contact.create({
    data: {
      householdId,
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      notes: parsed.data.notes || null,
    },
  });
  revalidateLoans();
  return null;
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

export async function createLoanAction(
  _prev: LoanActionState,
  formData: FormData
): Promise<LoanActionState> {
  const householdId = await getHouseholdId();
  const mode = String(formData.get("mode") ?? "new");

  try {
    if (mode === "existing") {
      const parsed = loanFromTransactionSchema.safeParse({
        contactId: formData.get("contactId"),
        direction: formData.get("direction"),
        transactionId: formData.get("transactionId"),
        notes: formData.get("notes") ?? "",
      });
      if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
      }
      const transaction = await claimUnlinkedTransaction(householdId, parsed.data.transactionId);

      await prisma.loan.create({
        data: {
          householdId,
          contactId: parsed.data.contactId,
          direction: parsed.data.direction,
          openingAmount: Math.abs(Number(transaction.amount)),
          date: transaction.date,
          notes: parsed.data.notes || null,
          linkedTransactionId: transaction.id,
        },
      });
    } else {
      const parsed = loanFromAccountSchema.safeParse({
        contactId: formData.get("contactId"),
        direction: formData.get("direction"),
        accountId: formData.get("accountId"),
        amount: formData.get("amount"),
        date: formData.get("date"),
        notes: formData.get("notes") ?? "",
      });
      if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
      }

      // Lending money moves it out of your account; borrowing brings it in.
      const signedAmount = parsed.data.direction === "lent" ? -parsed.data.amount : parsed.data.amount;

      await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            householdId,
            accountId: parsed.data.accountId,
            amount: signedAmount,
            date: new Date(parsed.data.date),
            description: `Loan ${parsed.data.direction === "lent" ? "to" : "from"} contact`,
            source: "manual",
            categoryStatus: "confirmed",
          },
        });

        await tx.loan.create({
          data: {
            householdId,
            contactId: parsed.data.contactId,
            direction: parsed.data.direction,
            openingAmount: parsed.data.amount,
            date: new Date(parsed.data.date),
            notes: parsed.data.notes || null,
            linkedTransactionId: transaction.id,
          },
        });
      });
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not add loan." };
  }

  revalidateLoans();
  return null;
}

export async function addRepaymentAction(
  _prev: RepaymentActionState,
  formData: FormData
): Promise<RepaymentActionState> {
  const householdId = await getHouseholdId();
  const mode = String(formData.get("mode") ?? "new");
  const loanId = String(formData.get("loanId") ?? "");

  const loan = await prisma.loan.findFirst({
    where: { id: loanId, householdId },
    include: { repayments: true },
  });
  if (!loan) return { error: "Loan not found." };

  // A repayment received on a loan you gave out comes in; a repayment you
  // make on money you borrowed goes out.
  const repaymentSign = loan.direction === "lent" ? 1 : -1;

  try {
    let repaymentAmount: number;

    if (mode === "existing") {
      const parsed = repaymentFromTransactionSchema.safeParse({
        loanId,
        transactionId: formData.get("transactionId"),
      });
      if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
      }
      const transaction = await claimUnlinkedTransaction(householdId, parsed.data.transactionId);
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
      const parsed = repaymentFromAccountSchema.safeParse({
        loanId,
        accountId: formData.get("accountId"),
        amount: formData.get("amount"),
        date: formData.get("date"),
      });
      if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
      }
      repaymentAmount = parsed.data.amount;

      await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            householdId,
            accountId: parsed.data.accountId,
            amount: repaymentSign * parsed.data.amount,
            date: new Date(parsed.data.date),
            description: `Loan repayment (${loan.direction === "lent" ? "received" : "made"})`,
            source: "manual",
            categoryStatus: "confirmed",
          },
        });

        await tx.loanRepayment.create({
          data: {
            loanId: loan.id,
            amount: parsed.data.amount,
            date: new Date(parsed.data.date),
            linkedTransactionId: transaction.id,
          },
        });
      });
    }

    const totalRepaid = loan.repayments.reduce((sum, r) => sum + Number(r.amount), 0) + repaymentAmount;
    if (totalRepaid >= Number(loan.openingAmount)) {
      await prisma.loan.update({ where: { id: loan.id }, data: { status: "settled" } });
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not add repayment." };
  }

  revalidateLoans();
  return null;
}
