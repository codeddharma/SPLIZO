"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";

type Category = { id: string; name: string };

export function CategoryPicker({
  categories,
  onSelect,
  trigger,
  align = "left",
}: {
  categories: Category[];
  onSelect: (category: Category) => void;
  trigger: React.ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
      >
        {trigger}
      </button>

      {open && (
        <div
          className={`absolute z-30 mt-1 w-56 rounded-lg border border-border bg-card p-1 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="flex items-center gap-1.5 border-b border-border px-1.5 py-1">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories…"
              className="w-full bg-transparent py-0.5 text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-2 py-2 text-xs text-muted-foreground">No categories found.</div>
            )}
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onSelect(c);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AssignTrigger() {
  return (
    <>
      <Plus className="h-3.5 w-3.5" />
      Assign
    </>
  );
}
