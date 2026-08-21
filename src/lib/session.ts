import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function getHouseholdId() {
  const session = await requireSession();
  return session.user.householdId;
}
