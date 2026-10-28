"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { EmptyChart } from "./empty-chart";
import { CHART_TOOLTIP_STYLE } from "./chart-colors";

export function CompareLine({ data }: { data: { name: string; income: number; expense: number }[] }) {
  if (data.length === 0) return <EmptyChart label="No data for this range" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
        <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} width={50} />
        <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} {...CHART_TOOLTIP_STYLE} />
        <Legend
          iconType="circle"
          formatter={(value) => <span style={{ color: "var(--muted-foreground)" }}>{value}</span>}
        />
        <Line type="monotone" dataKey="income" name="Income" stroke="var(--income)" strokeWidth={2} />
        <Line type="monotone" dataKey="expense" name="Expense" stroke="var(--expense)" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
