"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { createInviteAction, type InviteActionState } from "@/lib/actions/invite-actions";

export function InviteForm() {
  const [state, formAction] = useActionState<InviteActionState, FormData>(
    createInviteAction,
    null
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">Invite by email</label>
        <input
          name="email"
          type="email"
          placeholder="spouse@email.com"
          required
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
        Send invite
      </SubmitButton>
      {state?.error && <p className="text-xs text-expense sm:basis-full">{state.error}</p>}
    </form>
  );
}
