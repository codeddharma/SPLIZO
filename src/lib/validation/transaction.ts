import { z } from "zod";

export const transactionSchema = z.object({
  accountId: z.string().trim().min(1, "Account is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  direction: z.enum(["in", "out"]),
  date: z.string().trim().min(1, "Date is required"),
  description: z.string().trim().min(1, "Description is required").max(200),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  categoryId: z.string().trim().optional().or(z.literal("")),
  homeIds: z.array(z.string().trim().min(1)),
  personTagIds: z.array(z.string().trim().min(1)),
});
