"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { createInviteAction, type InviteActionState } from "@/lib/actions/invite-actions";

export function InviteButton({ personTagId }: { personTagId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<InviteActionState, FormData>(
    createInviteAction,
    null
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-primary hover:underline"
      >
        Invite
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="personTagId" value={personTagId} />
      <div className="flex items-center gap-1.5">
        <input
          name="email"
          type="email"
          placeholder="email@example.com"
          required
          autoFocus
          className="w-40 rounded-lg border border-border bg-background px-2 py-1 text-xs"
        />
        <SubmitButton className="rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
          Send
        </SubmitButton>
      </div>
      {state?.error && <p className="text-[11px] text-expense">{state.error}</p>}
    </form>
  );
}
