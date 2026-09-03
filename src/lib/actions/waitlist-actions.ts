"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email");

export type WaitlistActionState = { error: string } | { ok: true } | null;

export async function joinWaitlistAction(
  _prev: WaitlistActionState,
  formData: FormData
): Promise<WaitlistActionState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email" };
  }

  await prisma.waitlistSignup.upsert({
    where: { email: parsed.data },
    create: { email: parsed.data },
    update: {},
  });

  return { ok: true };
}
