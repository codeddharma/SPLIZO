import type { CSSProperties } from "react";

const CHART_TOKENS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getCategoryColor(categoryName: string): string {
  return CHART_TOKENS[hashString(categoryName) % CHART_TOKENS.length];
}

export function getCategoryBadgeStyle(categoryName: string): CSSProperties {
  const color = getCategoryColor(categoryName);
  return {
    backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`,
    color,
  };
}
