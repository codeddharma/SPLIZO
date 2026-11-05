"use server";

import { prisma } from "@/lib/prisma";
import { requireSession, requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { feedbackSchema } from "@/lib/validation/feedback";

export type FeedbackActionState = { error: string; success?: boolean } | null;

export async function createFeedbackAction(
  _prev: FeedbackActionState,
  formData: FormData
): Promise<FeedbackActionState> {
  const session = await requireSession();
  const parsed = feedbackSchema.safeParse({
    type: formData.get("type"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  await prisma.feedback.create({
    data: {
      householdId: session.user.householdId,
      userId: session.user.id,
      type: parsed.data.type,
      message: parsed.data.message,
    },
  });

  revalidatePath("/admin/feedback");
  revalidatePath("/feedback");
  return { error: "", success: true };
}

export async function updateFeedbackStatusAction(feedbackId: string, status: "open" | "seen" | "resolved") {
  await requireAdmin();
  await prisma.feedback.update({ where: { id: feedbackId }, data: { status } });
  revalidatePath("/admin/feedback");
}
