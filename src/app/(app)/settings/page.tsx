import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { UpdateNameForm } from "@/components/settings/update-name-form";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { DangerZone } from "@/components/settings/danger-zone";

export default async function SettingsPage() {
  const session = await requireSession();

  const [user, otherUsersCount] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { name: true },
    }),
    prisma.user.count({
      where: { householdId: session.user.householdId, id: { not: session.user.id } },
    }),
  ]);

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account.</p>
      </div>

      <div className="flex flex-col gap-4 sm:max-w-2xl">
        <UpdateNameForm name={user.name} />
        <ChangePasswordForm />
        <DangerZone isSoleUser={otherUsersCount === 0} />
      </div>
    </div>
  );
}
