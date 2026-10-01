"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

function buildHref(
  status: string,
  page: number,
  range: string,
  from?: string,
  to?: string
) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (page > 1) params.set("page", String(page));
  if (range !== "this_month") params.set("range", range);
  if (range === "custom") {
    if (from) params.set("from", from);
    if (to) params.set("to", to);
  }
  const query = params.toString();
  return query ? `/transactions?${query}` : "/transactions";
}

export function Pagination({
  status,
  page,
  pageSize,
  total,
  range = "this_month",
  from,
  to,
}: {
  status: string;
  page: number;
  pageSize: number;
  total: number;
  range?: string;
  from?: string;
  to?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  const from_ = (page - 1) * pageSize + 1;
  const to_ = Math.min(page * pageSize, total);

  function goTo(target: number) {
    setOpen(false);
    router.push(buildHref(status, target, range, from, to));
  }

  return (
    <div className="flex shrink-0 items-center justify-between text-sm text-muted-foreground">
      <span>
        {from_}–{to_} of {total}
      </span>
      <div ref={ref} className="relative flex items-center gap-1">
        <button
          type="button"
          onClick={() => page > 1 && goTo(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-7 items-center gap-1 rounded-lg border border-border px-2 text-xs font-semibold text-foreground hover:bg-muted"
        >
          {page}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <span className="text-xs">of {totalPages}</span>

        {open && (
          <div className="absolute bottom-full left-0 z-30 mb-1 max-h-56 w-20 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lg">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => goTo(p)}
                className={`flex w-full items-center rounded-md px-2 py-1.5 text-left text-xs ${
                  p === page
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => page < totalPages && goTo(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
