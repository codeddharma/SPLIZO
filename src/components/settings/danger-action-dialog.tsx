"use client";

import { useActionState, useState } from "react";
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
import type { SettingsActionState } from "@/lib/actions/settings-actions";

export function DangerActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmPhrase,
  action,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  confirmPhrase: string;
  action: (prevState: SettingsActionState, formData: FormData) => Promise<SettingsActionState>;
}) {
  const [state, formAction] = useActionState<SettingsActionState, FormData>(action, null);
  const [typedPhrase, setTypedPhrase] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setTypedPhrase("");
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3">
          {state && "error" in state && <p className="text-sm text-expense">{state.error}</p>}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${confirmPhrase}-password`} className="text-sm font-semibold text-muted-foreground">
              Confirm your password
            </label>
            <input
              id={`${confirmPhrase}-password`}
              name="password"
              type="password"
              required
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${confirmPhrase}-phrase`}
              className="text-sm font-semibold text-muted-foreground"
            >
              Type {confirmPhrase} to confirm
            </label>
            <input
              id={`${confirmPhrase}-phrase`}
              name="confirmPhrase"
              required
              value={typedPhrase}
              onChange={(e) => setTypedPhrase(e.target.value)}
              autoComplete="off"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <SubmitButton
              className="rounded-lg bg-destructive/10 px-3.5 py-2 text-sm font-semibold text-expense transition-colors hover:bg-destructive/20 disabled:opacity-60 disabled:cursor-not-allowed"
              pendingText="Working…"
            >
              {confirmLabel}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
