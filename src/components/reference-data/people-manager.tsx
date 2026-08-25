import { createPersonTagAction, deactivatePersonTagAction } from "@/lib/actions/reference-data-actions";
import { removeAccessAction, revokeInviteAction } from "@/lib/actions/invite-actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { InviteButton } from "@/components/household/invite-button";
import { CopyInviteLink } from "@/components/household/copy-invite-link";

type PersonRow = {
  id: string;
  name: string;
  user: { email: string } | null;
};

type PendingInvite = {
  id: string;
  personTagId: string;
  token: string;
};

export function PeopleManager({
  people,
  invites,
  origin,
  tabs,
}: {
  people: PersonRow[];
  invites: PendingInvite[];
  origin: string;
  tabs: React.ReactNode;
}) {
  const inviteByPersonTagId = Object.fromEntries(invites.map((i) => [i.personTagId, i]));

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      {tabs}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">People</h1>
        <p className="text-sm text-muted-foreground">
          You, your spouse, joint, even &apos;Mom&apos; or &apos;Dad&apos;. Invite someone to give
          them Splizo access — once they accept, they can be selected as &quot;Spent by&quot; on
          transactions.
        </p>
      </div>

      <form action={createPersonTagAction} className="flex gap-2">
        <input
          name="name"
          placeholder="e.g. Mom"
          required
          className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm"
        />
        <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
          Add Person
        </SubmitButton>
      </form>

      <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {people.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No people yet.</div>
        )}
        {people.map((person) => {
          const pendingInvite = inviteByPersonTagId[person.id];
          return (
            <div
              key={person.id}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-medium">{person.name}</span>
              <div className="flex items-center gap-3">
                {person.user ? (
                  <>
                    <span className="text-xs text-muted-foreground">{person.user.email}</span>
                    <form action={removeAccessAction}>
                      <input type="hidden" name="personTagId" value={person.id} />
                      <SubmitButton
                        className="text-xs font-semibold text-muted-foreground transition-colors hover:text-expense"
                        pendingText="Removing…"
                      >
                        Remove access
                      </SubmitButton>
                    </form>
                  </>
                ) : pendingInvite ? (
                  <>
                    <CopyInviteLink link={`${origin}/invite/${pendingInvite.token}`} />
                    <form action={revokeInviteAction}>
                      <input type="hidden" name="id" value={pendingInvite.id} />
                      <SubmitButton
                        className="text-xs font-semibold text-muted-foreground transition-colors hover:text-expense"
                        pendingText="Cancelling…"
                      >
                        Cancel invite
                      </SubmitButton>
                    </form>
                  </>
                ) : (
                  <InviteButton personTagId={person.id} />
                )}
                <form action={deactivatePersonTagAction}>
                  <input type="hidden" name="id" value={person.id} />
                  <SubmitButton
                    className="text-xs font-semibold text-muted-foreground transition-colors hover:text-expense"
                    pendingText="Removing…"
                  >
                    Remove
                  </SubmitButton>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
