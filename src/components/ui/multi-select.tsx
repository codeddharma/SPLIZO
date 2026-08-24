"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

type Option = { id: string; name: string };

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
}: {
  options: Option[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }

  const selectedOptions = options.filter((o) => selected.has(o.id));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm"
      >
        <span className={selectedOptions.length ? "" : "text-muted-foreground"}>
          {selectedOptions.length > 0
            ? `${selectedOptions.length} selected`
            : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 max-h-56 w-full min-w-[12rem] overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lg">
          {options.length === 0 && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">Nothing added yet.</div>
          )}
          {options.map((o) => (
            <label
              key={o.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <input
                type="checkbox"
                checked={selected.has(o.id)}
                onChange={() => toggle(o.id)}
                className="h-3.5 w-3.5"
              />
              {o.name}
            </label>
          ))}
        </div>
      )}

      {selectedOptions.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {selectedOptions.map((o) => (
            <span
              key={o.id}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            >
              {o.name}
              <button
                type="button"
                onClick={() => toggle(o.id)}
                aria-label={`Remove ${o.name}`}
                className="hover:text-expense"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
