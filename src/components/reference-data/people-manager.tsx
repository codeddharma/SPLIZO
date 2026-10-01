import { createPersonTagAction } from "@/lib/actions/reference-data-actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { PersonRowActions } from "@/components/reference-data/person-row-actions";

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
}: {
  people: PersonRow[];
  invites: PendingInvite[];
  origin: string;
}) {
  const inviteByPersonTagId = Object.fromEntries(invites.map((i) => [i.personTagId, i]));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight">People</h1>
        <p className="text-sm text-muted-foreground">
          You, your spouse, joint, even &apos;Mom&apos; or &apos;Dad&apos;. Invite someone to give
          them Splizo access — once they accept, they can be selected as &quot;Spent by&quot; on
          transactions.
        </p>
      </div>

      <form action={createPersonTagAction} className="flex shrink-0 gap-2">
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

      <div className="flex min-h-0 flex-1 flex-col divide-y divide-border overflow-y-auto rounded-xl border border-border bg-card">
        {people.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No people yet.</div>
        )}
        {people.map((person) => {
          const pendingInvite = inviteByPersonTagId[person.id] ?? null;
          return (
            <div key={person.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{person.name}</span>
                {person.user && (
                  <span className="text-xs text-muted-foreground">{person.user.email}</span>
                )}
                {!person.user && pendingInvite && (
                  <span className="mt-1 w-fit rounded-full bg-warning/10 px-2.5 py-1 text-[11px] font-semibold text-warning">
                    Invite pending
                  </span>
                )}
              </div>
              <PersonRowActions
                personId={person.id}
                personName={person.name}
                accessEmail={person.user?.email ?? null}
                pendingInvite={pendingInvite}
                origin={origin}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
