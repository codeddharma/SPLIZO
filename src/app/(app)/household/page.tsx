import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import {
  createPersonTagAction,
  deactivatePersonTagAction,
  togglePersonTagOwnerAction,
  createHomeAction,
  deactivateHomeAction,
} from "@/lib/actions/reference-data-actions";
import { revokeInviteAction } from "@/lib/actions/invite-actions";
import { SimpleTagManager } from "@/components/reference-data/simple-tag-manager";
import { EntityTabs } from "@/components/reference-data/entity-tabs";
import { InviteForm } from "@/components/household/invite-form";
import { CopyInviteLink } from "@/components/household/copy-invite-link";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function HouseholdPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "place" ? "place" : tab === "members" ? "members" : "people";
  const householdId = await getHouseholdId();

  if (activeTab === "place") {
    const homes = await prisma.home.findMany({
      where: { householdId, isActive: true },
      orderBy: { name: "asc" },
    });

    return (
      <SimpleTagManager
        items={homes}
        createAction={createHomeAction}
        deactivateAction={deactivateHomeAction}
        title="Place"
        description="Rented, owned, parents', or General for anything not tied to a specific home."
        label="Place"
        placeholder="e.g. Rented Home"
        tabs={<EntityTabs active="place" />}
      />
    );
  }

  if (activeTab === "members") {
    const headerList = await headers();
    const origin = `${headerList.get("x-forwarded-proto") ?? "http"}://${headerList.get("host")}`;

    const [members, invites] = await Promise.all([
      prisma.user.findMany({ where: { householdId }, orderBy: { name: "asc" } }),
      prisma.invite.findMany({
        where: { householdId, status: "pending" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <EntityTabs active="members" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground">
            Who can log into this Splizo household, and pending invites.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-muted-foreground">Logins</h2>
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">{member.name}</span>
                <span className="text-sm text-muted-foreground">{member.email}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-muted-foreground">Invite someone</h2>
          <InviteForm />
        </div>

        {invites.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-muted-foreground">Pending invites</h2>
            <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-sm font-medium">{invite.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Expires {invite.expiresAt.toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CopyInviteLink link={`${origin}/invite/${invite.token}`} />
                    <form action={revokeInviteAction}>
                      <input type="hidden" name="id" value={invite.id} />
                      <SubmitButton
                        className="text-xs font-semibold text-muted-foreground transition-colors hover:text-expense"
                        pendingText="Revoking…"
                      >
                        Revoke
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const people = await prisma.personTag.findMany({
    where: { householdId, isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <SimpleTagManager
      items={people}
      createAction={createPersonTagAction}
      deactivateAction={deactivatePersonTagAction}
      title="People"
      description="You, your spouse, joint, even 'Mom' or 'Dad' — decoupled from login accounts."
      label="Person"
      placeholder="e.g. Mom"
      tabs={<EntityTabs active="people" />}
      showOwnerToggle
      toggleOwnerAction={togglePersonTagOwnerAction}
    />
  );
}
