import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default async function ProfilePage() {
  const session = await requireSession();

  const [user, household] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { name: true, email: true, createdAt: true },
    }),
    prisma.household.findUniqueOrThrow({
      where: { id: session.user.householdId },
      select: { name: true },
    }),
  ]);

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Your account at a glance.</p>
      </div>

      <div className="flex flex-col gap-4 sm:max-w-2xl">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {initials(user.name)}
          </span>
          <div className="min-w-0">
            <div className="truncate text-lg font-bold text-foreground">{user.name}</div>
            <div className="truncate text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-muted-foreground">Household</span>
            <span className="font-medium text-foreground">{household.name}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium text-foreground">
              {user.createdAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Need to change your name or password?{" "}
          <Link href="/settings" className="font-semibold text-primary hover:underline">
            Go to Settings
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
