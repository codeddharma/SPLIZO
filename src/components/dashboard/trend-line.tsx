"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function TrendLine({
  data,
}: {
  data: { month: string; income: number; expense: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} width={50} />
        <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
        <Legend />
        <Line type="monotone" dataKey="income" stroke="var(--income)" strokeWidth={2} name="Income" />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="var(--expense)"
          strokeWidth={2}
          name="Expense"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
