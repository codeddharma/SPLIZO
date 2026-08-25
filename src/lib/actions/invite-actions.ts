"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createInviteSchema, acceptInviteSchema } from "@/lib/validation/invite";

const INVITE_EXPIRY_DAYS = 7;

export type InviteActionState = { error: string } | null;

export async function createInviteAction(
  _prev: InviteActionState,
  formData: FormData
): Promise<InviteActionState> {
  const householdId = await getHouseholdId();
  const personTagId = String(formData.get("personTagId") ?? "");

  const parsed = createInviteSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email" };
  }
  const { email } = parsed.data;

  const personTag = await prisma.personTag.findFirst({ where: { id: personTagId, householdId } });
  if (!personTag) {
    return { error: "Person not found." };
  }
  if (personTag.userId) {
    return { error: "This person already has access." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Someone with this email already has an account." };
  }

  const existingInvite = await prisma.invite.findFirst({
    where: { personTagId, status: "pending" },
  });
  if (existingInvite) {
    return { error: "An invite is already pending for this person." };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.invite.create({
    data: { householdId, personTagId, email, token, expiresAt },
  });

  revalidatePath("/household");
  return null;
}

export async function revokeInviteAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const id = String(formData.get("id"));
  await prisma.invite.deleteMany({ where: { id, householdId, status: "pending" } });
  revalidatePath("/household");
}

export async function removeAccessAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const personTagId = String(formData.get("personTagId") ?? "");

  const personTag = await prisma.personTag.findFirst({ where: { id: personTagId, householdId } });
  if (!personTag?.userId) return;

  await prisma.user.delete({ where: { id: personTag.userId } });

  revalidatePath("/household");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function acceptInviteAction(
  _prev: InviteActionState,
  formData: FormData
): Promise<InviteActionState> {
  const token = String(formData.get("token") ?? "");

  const parsed = acceptInviteSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { personTag: true },
  });
  if (!invite || invite.status !== "pending" || invite.expiresAt < new Date()) {
    return { error: "This invite link is invalid or has expired." };
  }
  if (invite.personTag.userId) {
    return { error: "This person already has access." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email: invite.email } });
  if (existingUser) {
    return { error: "An account already exists for this email." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        householdId: invite.householdId,
        name: invite.personTag.name,
        email: invite.email,
        passwordHash,
      },
    });
    await tx.personTag.update({ where: { id: invite.personTagId }, data: { userId: user.id } });
    await tx.invite.update({ where: { id: invite.id }, data: { status: "accepted" } });
  });

  redirect("/login?joined=1");
}
