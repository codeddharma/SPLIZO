import { TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { Sparkline } from "./sparkline";

type TrendPoint = { month: string; income: number; expense: number };

export function HeadlineCards({
  income,
  expense,
  savings,
  trend,
}: {
  income: number;
  expense: number;
  savings: number;
  trend: TrendPoint[];
}) {
  const cards = [
    {
      label: "Income this month",
      value: income,
      sign: "+",
      valueClass: "text-income",
      icon: TrendingUp,
      iconClass: "bg-income/10 text-income",
      spark: trend.map((t) => t.income),
      sparkColor: "var(--income)",
    },
    {
      label: "Expense this month",
      value: expense,
      sign: "-",
      valueClass: "text-expense",
      icon: TrendingDown,
      iconClass: "bg-expense/10 text-expense",
      spark: trend.map((t) => t.expense),
      sparkColor: "var(--expense)",
    },
    {
      label: "Savings this month",
      value: Math.abs(savings),
      sign: savings >= 0 ? "+" : "-",
      valueClass: savings >= 0 ? "text-income" : "text-expense",
      icon: PiggyBank,
      iconClass: "bg-primary/10 text-primary",
      spark: trend.map((t) => t.income - t.expense),
      sparkColor: "var(--primary)",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
        >
          <div className="min-w-0">
            <span className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${card.iconClass}`}>
              <card.icon className="h-4 w-4" />
            </span>
            <div className="text-xs font-medium text-muted-foreground">{card.label}</div>
            <div className={`text-3xl font-extrabold tracking-tight ${card.valueClass}`}>
              {card.sign}₹{card.value.toLocaleString("en-IN")}
            </div>
          </div>
          {card.spark.some((v) => v !== 0) && (
            <Sparkline data={card.spark} color={card.sparkColor} />
          )}
        </div>
      ))}
    </div>
  );
}
