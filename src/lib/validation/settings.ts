import { z } from "zod";

export const updateNameSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ["confirmNewPassword"],
  });

export const dangerZoneConfirmSchema = z.object({
  password: z.string().min(1, "Password is required"),
});
