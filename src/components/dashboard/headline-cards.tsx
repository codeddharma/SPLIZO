import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Sparkline } from "./sparkline";

export type DeltaInfo = { pct: number; direction: "up" | "down"; tone: "good" | "bad" } | null;

export type CardSpec = {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClass: string;
  spark?: number[];
  sparkColor?: string;
  delta?: DeltaInfo;
};

function formatValue(value: number) {
  const sign = value < 0 ? "-" : "";
  return `${sign}₹${Math.abs(value).toLocaleString("en-IN")}`;
}

// Renders bare cards (no wrapping grid) so the page can place them in a
// shared grid row alongside other dashboard cards.
export function HeadlineCards({ cards }: { cards: CardSpec[] }) {
  return (
    <>
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}>
              <card.icon className="h-4 w-4" />
            </span>
            {card.spark && card.spark.some((v) => v !== 0) && (
              <Sparkline data={card.spark} color={card.sparkColor ?? "var(--chart-1)"} />
            )}
          </div>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-2xl font-extrabold tracking-tight text-foreground">
                {formatValue(card.value)}
              </div>
              <div className="text-xs font-medium text-muted-foreground">{card.label}</div>
            </div>
            {card.delta && (
              <div className="flex shrink-0 items-center gap-1.5">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    card.delta.tone === "good" ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
                  }`}
                >
                  {card.delta.direction === "up" ? (
                    <ArrowUp className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5" />
                  )}
                </span>
                <span
                  className={`text-[11px] leading-tight font-semibold ${
                    card.delta.tone === "good" ? "text-income" : "text-expense"
                  }`}
                >
                  {Math.abs(card.delta.pct).toFixed(1)}% from
                  <br />
                  last month
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
