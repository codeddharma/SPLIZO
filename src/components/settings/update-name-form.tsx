"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateNameAction, type SettingsActionState } from "@/lib/actions/settings-actions";

export function UpdateNameForm({ name }: { name: string }) {
  const [state, formAction] = useActionState<SettingsActionState, FormData>(updateNameAction, null);
  const router = useRouter();
  const lastState = useRef(state);

  useEffect(() => {
    // revalidatePath only marks the (app) layout's cache stale — it doesn't
    // push the change to the sidebar/topbar already mounted on this page, so
    // without this they'd keep showing the old name until the next
    // navigation. router.refresh() re-fetches them immediately.
    if (state !== lastState.current && state && "success" in state) {
      router.refresh();
    }
    lastState.current = state;
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div>
        <h2 className="font-heading text-base font-semibold">Your name</h2>
        <p className="text-sm text-muted-foreground">Shown across the app and to anyone you invite.</p>
      </div>
      {state && "error" in state && <p className="text-sm text-expense">{state.error}</p>}
      {state && "success" in state && <p className="text-sm text-income">{state.success}</p>}
      <div className="flex flex-col gap-1.5 sm:max-w-sm">
        <label htmlFor="name" className="text-sm font-semibold text-muted-foreground">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={name}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <SubmitButton
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        pendingText="Saving…"
      >
        Save name
      </SubmitButton>
    </form>
  );
}
