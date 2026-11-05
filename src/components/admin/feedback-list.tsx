"use client";

import { useMemo, useState } from "react";
import { FeedbackRowActions } from "@/components/admin/feedback-row-actions";
import {
  type FeedbackType,
  type FeedbackStatus,
  FEEDBACK_TYPE_LABEL,
  FEEDBACK_TYPE_STYLE,
  FEEDBACK_STATUS_STYLE,
  feedbackDateFormatter,
} from "@/lib/feedback-ui";

type FeedbackItem = {
  id: string;
  type: FeedbackType;
  status: FeedbackStatus;
  message: string;
  createdAt: Date;
  user: { name: string; email: string };
  household: { id: string; name: string };
};

export function FeedbackList({ items }: { items: FeedbackItem[] }) {
  const [typeFilter, setTypeFilter] = useState<"all" | FeedbackType>("all");
  const [householdFilter, setHouseholdFilter] = useState<"all" | string>("all");

  const households = useMemo(() => {
    const byId = new Map<string, string>();
    for (const item of items) byId.set(item.household.id, item.household.name);
    return Array.from(byId, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const filtered = items.filter(
    (item) =>
      (typeFilter === "all" || item.type === typeFilter) &&
      (householdFilter === "all" || item.household.id === householdFilter)
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "all" | FeedbackType)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
        >
          <option value="all">All types</option>
          <option value="feedback">Feedback</option>
          <option value="question">Question</option>
          <option value="review">Review</option>
        </select>
        <select
          value={householdFilter}
          onChange={(e) => setHouseholdFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
        >
          <option value="all">All households</option>
          {households.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No feedback matches these filters.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${FEEDBACK_TYPE_STYLE[item.type]}`}>
                    {FEEDBACK_TYPE_LABEL[item.type]}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${FEEDBACK_STATUS_STYLE[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{feedbackDateFormatter.format(item.createdAt)}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{item.message}</p>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {item.user.name} ({item.user.email}) — {item.household.name}
                </span>
                <FeedbackRowActions feedbackId={item.id} status={item.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
