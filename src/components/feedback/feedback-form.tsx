"use client";

import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { createFeedbackAction, type FeedbackActionState } from "@/lib/actions/feedback-actions";

export function FeedbackForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState<FeedbackActionState, FormData>(
    createFeedbackAction,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && state?.success) {
      formRef.current?.reset();
      if (onSuccess) {
        const timeout = setTimeout(onSuccess, 1200);
        return () => clearTimeout(timeout);
      }
    }
    wasPending.current = pending;
  }, [pending, state, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="feedback-type" className="text-xs font-semibold text-muted-foreground">
          Type
        </label>
        <select
          id="feedback-type"
          name="type"
          defaultValue="feedback"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="feedback">Feedback</option>
          <option value="question">Question</option>
          <option value="review">Review</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="feedback-message" className="text-xs font-semibold text-muted-foreground">
          Message
        </label>
        <textarea
          id="feedback-message"
          name="message"
          required
          rows={4}
          autoFocus
          placeholder="What's on your mind?"
          className="resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      {state?.error && <p className="text-xs text-expense">{state.error}</p>}
      {state?.success && (
        <p className="text-xs text-income">Sent — you can track its status below.</p>
      )}
      <SubmitButton
        className="self-start rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        pendingText="Sending…"
      >
        Send
      </SubmitButton>
    </form>
  );
}
