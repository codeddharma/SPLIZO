import { z } from "zod";

export const nameOnlySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
});

export const accountSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  type: z.enum(["bank", "card", "wallet", "cash"]),
  institution: z.string().trim().max(80).optional().or(z.literal("")),
  last4: z.string().trim().max(4).optional().or(z.literal("")),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  kind: z.enum(["income", "expense"]),
});

export const vendorSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  matchText: z.string().trim().min(1, "Match text is required").max(120),
  matchType: z.enum(["exact", "contains"]),
  categoryId: z.string().trim().min(1, "Category is required"),
});
