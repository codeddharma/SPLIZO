"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
import { createChartAction, updateChartAction, type ChartActionState } from "@/lib/actions/chart-actions";

const METRICS = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
] as const;

const GROUP_BYS = [
  { value: "category", label: "Category" },
  { value: "bucket", label: "Bucket" },
  { value: "account", label: "Account" },
  { value: "person", label: "Person" },
  { value: "month", label: "Over time" },
] as const;

const CHART_TYPES = [
  { value: "bar", label: "Bar" },
  { value: "donut", label: "Donut" },
  { value: "line", label: "Line" },
] as const;

const RANGES = [
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "last_60", label: "Last 60 days" },
  { value: "last_90", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
] as const;

export type SavedChartDTO = {
  id: string;
  title: string;
  metric: "income" | "expense";
  groupBy: "category" | "bucket" | "account" | "person" | "month";
  chartType: "bar" | "donut" | "line";
  rangeKey: string;
  rangeFrom: string | null;
  rangeTo: string | null;
};

const selectClass = "rounded-lg border border-border bg-background px-3 py-2 text-sm";

export function ChartBuilderDialog({
  open,
  onOpenChange,
  mode,
  defaults,
  defaultRange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  defaults: SavedChartDTO | null;
  defaultRange: { rangeKey: string; from?: string; to?: string };
}) {
  const action = mode === "edit" ? updateChartAction : createChartAction;
  const [state, formAction, pending] = useActionState<ChartActionState, FormData>(action, null);
  const wasPending = useRef(false);

  const [groupBy, setGroupBy] = useState(defaults?.groupBy ?? "category");
  const [chartType, setChartType] = useState(defaults?.chartType ?? "bar");
  const [rangeKey, setRangeKey] = useState(defaults?.rangeKey ?? defaultRange.rangeKey);
  const isMonth = groupBy === "month";
  // "Over time" only makes sense as a line chart — derive it rather than
  // syncing chartType via an effect (fewer moving parts, no extra render).
  const effectiveChartType = isMonth ? "line" : chartType;

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
          <DialogTitle>{mode === "edit" ? "Edit chart" : "Add chart"}</DialogTitle>
          <DialogDescription>Pick what to track and how you want to see it.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3">
          {mode === "edit" && defaults && <input type="hidden" name="id" value={defaults.id} />}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Title</label>
            <input
              name="title"
              required
              autoFocus
              defaultValue={defaults?.title}
              placeholder="e.g. Spend by account"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Metric</label>
              <select name="metric" defaultValue={defaults?.metric ?? "expense"} className={selectClass}>
                {METRICS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Group by</label>
              <select
                name="groupBy"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
                className={selectClass}
              >
                {GROUP_BYS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Chart type</label>
            {isMonth ? (
              <>
                <input type="hidden" name="chartType" value={effectiveChartType} />
                <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Line (fixed for &quot;Over time&quot;)
                </div>
              </>
            ) : (
              <select
                name="chartType"
                value={chartType}
                onChange={(e) => setChartType(e.target.value as typeof chartType)}
                className={selectClass}
              >
                {CHART_TYPES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Date range</label>
            <select
              name="rangeKey"
              value={rangeKey}
              onChange={(e) => setRangeKey(e.target.value)}
              className={selectClass}
            >
              {RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {rangeKey === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">From</span>
                <input
                  type="date"
                  name="rangeFrom"
                  defaultValue={defaults?.rangeFrom ?? defaultRange.from}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">To</span>
                <input
                  type="date"
                  name="rangeTo"
                  defaultValue={defaults?.rangeTo ?? defaultRange.to}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
            </div>
          )}

          {state?.error && <p className="text-xs text-expense">{state.error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <SubmitButton
              className="rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
              pendingText="Saving…"
            >
              Save chart
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
