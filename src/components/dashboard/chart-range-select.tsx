"use client";

import { useActionState, useRef, useState } from "react";
import { updateChartRangeAction, type ChartActionState } from "@/lib/actions/chart-actions";

const RANGES = [
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "last_60", label: "Last 60 days" },
  { value: "last_90", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
] as const;

export function ChartRangeSelect({
  chartId,
  rangeKey,
  rangeFrom,
  rangeTo,
}: {
  chartId: string;
  rangeKey: string;
  rangeFrom: string | null;
  rangeTo: string | null;
}) {
  const [state, formAction] = useActionState<ChartActionState, FormData>(updateChartRangeAction, null);
  const [localRangeKey, setLocalRangeKey] = useState(rangeKey);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-1.5">
      <input type="hidden" name="id" value={chartId} />
      <select
        name="rangeKey"
        value={localRangeKey}
        onChange={(e) => {
          const next = e.target.value;
          setLocalRangeKey(next);
          if (next !== "custom") formRef.current?.requestSubmit();
        }}
        className="rounded-md border border-border bg-background px-2 py-1 text-xs"
      >
        {RANGES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      {localRangeKey === "custom" && (
        <div className="flex items-center gap-1">
          <input
            type="date"
            name="rangeFrom"
            defaultValue={rangeFrom ?? ""}
            className="w-28 rounded-md border border-border bg-background px-1.5 py-1 text-xs"
          />
          <input
            type="date"
            name="rangeTo"
            defaultValue={rangeTo ?? ""}
            className="w-28 rounded-md border border-border bg-background px-1.5 py-1 text-xs"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Apply
          </button>
        </div>
      )}
      {state?.error && <p className="text-[10px] font-medium text-expense">{state.error}</p>}
    </form>
  );
}
