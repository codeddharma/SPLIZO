"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";

export function Sparkline({ data, color }: { data: number[]; color: string }) {
  const points = data.map((value, i) => ({ i, value }));
  const gradientId = `sparkline-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <ResponsiveContainer width={80} height={36}>
      <AreaChart data={points} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          isAnimationActive={true}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
