"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { createContactAction, type ContactActionState } from "@/lib/actions/loan-actions";

export function AddContactButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ContactActionState, FormData>(
    createContactAction,
    null
  );
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state) {
      setOpen(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <>
      <Button variant="default" size="sm" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" />
        Add contact
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add contact</DialogTitle>
            <DialogDescription>People you lend to or borrow from.</DialogDescription>
          </DialogHeader>
          <form action={formAction} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Contact name</label>
              <input
                name="name"
                placeholder="e.g. Uncle Raj"
                required
                autoFocus
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Phone (optional)</label>
              <input
                name="phone"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            {state?.error && <p className="text-xs font-medium text-expense">{state.error}</p>}
            <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
              Add contact
            </SubmitButton>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
