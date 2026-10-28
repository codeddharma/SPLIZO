"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { EmptyChart } from "./empty-chart";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "./chart-colors";

export function SingleSeriesLine({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) return <EmptyChart label="No data for this range" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
        <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} width={50} />
        <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} {...CHART_TOOLTIP_STYLE} />
        <Line type="monotone" dataKey="value" stroke={CHART_COLORS[0]} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
