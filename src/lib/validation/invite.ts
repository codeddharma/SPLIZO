import { z } from "zod";

export const createInviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

export const acceptInviteSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    agreedToTerms: z.boolean().refine((v) => v === true, {
      message: "You must agree to the Terms & Conditions and Privacy Policy to continue.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
