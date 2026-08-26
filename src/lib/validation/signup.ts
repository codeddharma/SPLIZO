import { z } from "zod";

export const signupSchema = z
  .object({
    householdName: z.string().trim().min(1, "Household name is required").max(80),
    name: z.string().trim().min(1, "Your name is required").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
