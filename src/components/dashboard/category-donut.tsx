"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { EmptyChart } from "./empty-chart";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "./chart-colors";

export function CategoryDonut({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) return <EmptyChart label="No expenses yet this month" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} {...CHART_TOOLTIP_STYLE} />
        <Legend
          iconType="circle"
          formatter={(value) => <span style={{ color: "var(--muted-foreground)" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
