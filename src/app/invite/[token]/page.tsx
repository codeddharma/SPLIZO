import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/logo";
import { AcceptInviteForm } from "@/components/household/accept-invite-form";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { personTag: true },
  });
  const invalid = !invite || invite.status !== "pending" || invite.expiresAt < new Date();

  if (invalid) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <Logo size={36} />
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          This invite link is invalid or has expired. Ask whoever invited you to send a new one.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <Logo size={36} />
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6">
        <h1 className="mb-1 text-xl font-bold">Join Splizo</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Setting up {invite.personTag.name}&apos;s account for {invite.email}.
        </p>
        <AcceptInviteForm token={token} />
      </div>
    </div>
  );
}
