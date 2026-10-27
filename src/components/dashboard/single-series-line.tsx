"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { EmptyChart } from "./empty-chart";

export function SingleSeriesLine({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) return <EmptyChart label="No data for this range" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} width={50} />
        <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} />
        <Line type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
