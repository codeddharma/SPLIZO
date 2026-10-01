"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ChevronDown } from "lucide-react";

const PRESETS = [
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "last_60", label: "Last 60 days" },
  { value: "last_90", label: "Last 90 days" },
] as const;

function buildHref(status: string, range: string, from?: string, to?: string) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (range !== "this_month") params.set("range", range);
  if (range === "custom") {
    if (from) params.set("from", from);
    if (to) params.set("to", to);
  }
  const query = params.toString();
  return query ? `/transactions?${query}` : "/transactions";
}

export function DateRangeFilter({
  status,
  range,
  from,
  to,
}: {
  status: string;
  range: string;
  from?: string;
  to?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(from ?? "");
  const [customTo, setCustomTo] = useState(to ?? "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goTo(nextRange: string, nextFrom?: string, nextTo?: string) {
    setOpen(false);
    router.push(buildHref(status, nextRange, nextFrom, nextTo));
  }

  const activeLabel =
    range === "custom"
      ? from && to
        ? `${from} – ${to}`
        : "Custom range"
      : (PRESETS.find((p) => p.value === range) ?? PRESETS[0]).label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
      >
        <Calendar className="h-4 w-4 text-muted-foreground" />
        {activeLabel}
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-20 bg-black/30 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-30 mt-1 w-64 rounded-lg border border-border bg-card p-1 shadow-lg">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => goTo(preset.value)}
                className={`flex w-full items-center rounded-md px-2.5 py-2 text-left text-sm ${
                  range === preset.value
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "font-medium hover:bg-muted"
                }`}
              >
                {preset.label}
              </button>
            ))}
            <div className="mt-1 border-t border-border pt-2">
              <p className="px-2 pb-1.5 text-[11px] font-semibold text-muted-foreground">
                Custom range
              </p>
              <div className="flex flex-col gap-1.5 px-2">
                <label className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-muted-foreground">From</span>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="w-full min-w-0 rounded-md border border-border bg-background px-1.5 py-1 text-xs"
                  />
                </label>
                <label className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-muted-foreground">To</span>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="w-full min-w-0 rounded-md border border-border bg-background px-1.5 py-1 text-xs"
                  />
                </label>
              </div>
              {customFrom && customTo && customFrom > customTo && (
                <p className="mt-1.5 text-[11px] text-expense">
                  &ldquo;From&rdquo; must be before &ldquo;To&rdquo;.
                </p>
              )}
              <button
                type="button"
                disabled={!customFrom || !customTo || customFrom > customTo}
                onClick={() => goTo("custom", customFrom, customTo)}
                className="mt-2 w-full rounded-md bg-primary px-2 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
