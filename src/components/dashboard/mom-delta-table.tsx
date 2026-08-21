import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type Row = { name: string; current: number; previous: number; delta: number };

export function MomDeltaTable({ data }: { data: Row[] }) {
  const rows = data.filter((d) => d.current !== 0 || d.previous !== 0).slice(0, 8);

  if (rows.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Not enough history yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {rows.map((d) => (
        <div key={d.name} className="flex items-center justify-between px-1 py-2 text-sm">
          <span>{d.name}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">₹{d.current.toLocaleString("en-IN")}</span>
            {d.delta > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-expense">
                <TrendingUp className="h-3 w-3" />+₹{d.delta.toLocaleString("en-IN")}
              </span>
            )}
            {d.delta < 0 && (
              <span className="flex items-center gap-0.5 text-xs text-income">
                <TrendingDown className="h-3 w-3" />-₹{Math.abs(d.delta).toLocaleString("en-IN")}
              </span>
            )}
            {d.delta === 0 && <Minus className="h-3 w-3 text-muted-foreground" />}
          </div>
        </div>
      ))}
    </div>
  );
}
