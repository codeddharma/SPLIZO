import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export const loanFromAccountSchema = z.object({
  contactId: z.string().trim().min(1, "Contact is required"),
  direction: z.enum(["lent", "borrowed"]),
  accountId: z.string().trim().min(1, "Account is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  date: z.string().trim().min(1, "Date is required"),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export const loanFromTransactionSchema = z.object({
  contactId: z.string().trim().min(1, "Contact is required"),
  direction: z.enum(["lent", "borrowed"]),
  transactionId: z.string().trim().min(1, "Transaction is required"),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export const repaymentFromAccountSchema = z.object({
  loanId: z.string().trim().min(1),
  accountId: z.string().trim().min(1, "Account is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  date: z.string().trim().min(1, "Date is required"),
});

export const repaymentFromTransactionSchema = z.object({
  loanId: z.string().trim().min(1),
  transactionId: z.string().trim().min(1, "Transaction is required"),
});
