"use client";

import { useActionState } from "react";
import Link from "next/link";
import { SubmitButton } from "@/components/ui/submit-button";
import { acceptInviteAction, type InviteActionState } from "@/lib/actions/invite-actions";

export function AcceptInviteForm({ token }: { token: string }) {
  const [state, formAction] = useActionState<InviteActionState, FormData>(
    acceptInviteAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      {state?.error && <p className="text-sm text-expense">{state.error}</p>}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-muted-foreground">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-semibold text-muted-foreground">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          name="agreedToTerms"
          required
          className="mt-0.5 h-4 w-4 rounded border-border"
        />
        <span>
          I agree to the{" "}
          <Link
            href="/terms"
            target="_blank"
            className="font-semibold text-foreground underline underline-offset-2"
          >
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            target="_blank"
            className="font-semibold text-foreground underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      <SubmitButton
        className="rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        pendingText="Creating account…"
      >
        Join household
      </SubmitButton>
    </form>
  );
}
