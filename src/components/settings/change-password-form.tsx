"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { changePasswordAction, type SettingsActionState } from "@/lib/actions/settings-actions";

export function ChangePasswordForm() {
  const [state, formAction] = useActionState<SettingsActionState, FormData>(
    changePasswordAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div>
        <h2 className="font-heading text-base font-semibold">Password</h2>
        <p className="text-sm text-muted-foreground">Change the password you use to log in.</p>
      </div>
      {state && "error" in state && <p className="text-sm text-expense">{state.error}</p>}
      {state && "success" in state && <p className="text-sm text-income">{state.success}</p>}
      <div className="grid gap-3 sm:max-w-sm">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="currentPassword" className="text-sm font-semibold text-muted-foreground">
            Current password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="newPassword" className="text-sm font-semibold text-muted-foreground">
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={8}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmNewPassword" className="text-sm font-semibold text-muted-foreground">
            Confirm new password
          </label>
          <input
            id="confirmNewPassword"
            name="confirmNewPassword"
            type="password"
            required
            minLength={8}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>
      <SubmitButton
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        pendingText="Saving…"
      >
        Update password
      </SubmitButton>
    </form>
  );
}
