"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { createInviteAction, type InviteActionState } from "@/lib/actions/invite-actions";

export function InviteDialog({
  open,
  onOpenChange,
  personTagId,
  personName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personTagId: string;
  personName: string;
}) {
  const [state, formAction, pending] = useActionState<InviteActionState, FormData>(
    createInviteAction,
    null
  );
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state) {
      onOpenChange(false);
    }
    wasPending.current = pending;
  }, [pending, state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite {personName}</DialogTitle>
          <DialogDescription>
            They&apos;ll get a link to set their own password. Once accepted, they can log in and
            be selected as &quot;Spent by&quot; on transactions.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="personTagId" value={personTagId} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Email</label>
            <input
              name="email"
              type="email"
              required
              autoFocus
              placeholder="email@example.com"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          {state?.error && <p className="text-xs text-expense">{state.error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <SubmitButton
              className="rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
              pendingText="Sending…"
            >
              Send invite
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
