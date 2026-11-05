import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function getHouseholdId() {
  const session = await requireSession();
  return session.user.householdId;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "admin") redirect("/dashboard");
  return session;
}

// The "owner" of a household is whoever created it — i.e. whichever login is
// oldest. Not stored anywhere; inferred so ownership transfers automatically
// if that account is ever removed, instead of leaving a dangling pointer.
export async function getHouseholdOwnerId(householdId: string) {
  const owner = await prisma.user.findFirst({
    where: { householdId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return owner?.id ?? null;
}

export async function isHouseholdOwner(userId: string, householdId: string) {
  return (await getHouseholdOwnerId(householdId)) === userId;
}
