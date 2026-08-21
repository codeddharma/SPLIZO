import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export const loanSchema = z.object({
  contactId: z.string().trim().min(1, "Contact is required"),
  direction: z.enum(["lent", "borrowed"]),
  openingAmount: z.coerce.number().positive("Amount must be greater than zero"),
  date: z.string().trim().min(1, "Date is required"),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export const repaymentSchema = z.object({
  loanId: z.string().trim().min(1),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  date: z.string().trim().min(1, "Date is required"),
});
