"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { EmptyChart } from "./empty-chart";
import { CHART_COLORS, CHART_TOOLTIP_STYLE, CHART_CURSOR_FILL } from "./chart-colors";

export function BarBreakdown({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) return <EmptyChart label="No data yet this month" />;

  return (
    // Fixed height matches the donut/line charts so cards in the same grid
    // row stay the same size; recharts spaces bars evenly within it.
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 12 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
        />
        <Tooltip
          cursor={CHART_CURSOR_FILL}
          formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
          {...CHART_TOOLTIP_STYLE}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
