"use client";

import { useTransition } from "react";
import { updateFeedbackStatusAction } from "@/lib/actions/feedback-actions";
import { Button } from "@/components/ui/button";

export function FeedbackRowActions({
  feedbackId,
  status,
}: {
  feedbackId: string;
  status: "open" | "seen" | "resolved";
}) {
  const [pending, startTransition] = useTransition();

  function setStatus(next: "open" | "seen" | "resolved") {
    startTransition(() => updateFeedbackStatusAction(feedbackId, next));
  }

  return (
    <div className="flex gap-1.5">
      {status !== "seen" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => setStatus("seen")}>
          Mark seen
        </Button>
      )}
      {status !== "resolved" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => setStatus("resolved")}>
          Resolve
        </Button>
      )}
      {status === "resolved" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => setStatus("open")}>
          Reopen
        </Button>
      )}
    </div>
  );
}
