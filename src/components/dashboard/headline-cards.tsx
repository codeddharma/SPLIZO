export function HeadlineCards({
  income,
  expense,
  savings,
}: {
  income: number;
  expense: number;
  savings: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-xs text-muted-foreground">Income this month</div>
        <div className="text-2xl font-bold text-income">
          +₹{income.toLocaleString("en-IN")}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-xs text-muted-foreground">Expense this month</div>
        <div className="text-2xl font-bold text-expense">
          -₹{expense.toLocaleString("en-IN")}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-xs text-muted-foreground">Savings this month</div>
        <div className={`text-2xl font-bold ${savings >= 0 ? "text-income" : "text-expense"}`}>
          {savings >= 0 ? "+" : "-"}₹{Math.abs(savings).toLocaleString("en-IN")}
        </div>
      </div>
    </div>
  );
}
