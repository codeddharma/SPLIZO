"use server";

import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { contactSchema, loanSchema, repaymentSchema } from "@/lib/validation/loan";

function revalidateLoans() {
  revalidatePath("/loans");
  revalidatePath("/dashboard");
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

export async function createLoanAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const parsed = loanSchema.parse({
    contactId: formData.get("contactId"),
    direction: formData.get("direction"),
    openingAmount: formData.get("openingAmount"),
    date: formData.get("date"),
    notes: formData.get("notes") ?? "",
  });
  await prisma.loan.create({
    data: {
      householdId,
      contactId: parsed.contactId,
      direction: parsed.direction,
      openingAmount: parsed.openingAmount,
      date: new Date(parsed.date),
      notes: parsed.notes || null,
    },
  });
  revalidateLoans();
}

export async function addRepaymentAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const parsed = repaymentSchema.parse({
    loanId: formData.get("loanId"),
    amount: formData.get("amount"),
    date: formData.get("date"),
  });

  const loan = await prisma.loan.findFirst({
    where: { id: parsed.loanId, householdId },
    include: { repayments: true },
  });
  if (!loan) return;

  await prisma.loanRepayment.create({
    data: { loanId: loan.id, amount: parsed.amount, date: new Date(parsed.date) },
  });

  const totalRepaid =
    loan.repayments.reduce((sum, r) => sum + Number(r.amount), 0) + parsed.amount;
  if (totalRepaid >= Number(loan.openingAmount)) {
    await prisma.loan.update({ where: { id: loan.id }, data: { status: "settled" } });
  }

  revalidateLoans();
}
