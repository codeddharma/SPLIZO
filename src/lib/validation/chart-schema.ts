import { z } from "zod";

const rangeShape = {
  rangeKey: z.enum(["this_month", "last_month", "last_60", "last_90", "custom"]),
  rangeFrom: z.string().trim().optional().or(z.literal("")),
  rangeTo: z.string().trim().optional().or(z.literal("")),
};

function requiresCustomDates<T extends { rangeKey: string; rangeFrom?: string; rangeTo?: string }>(data: T) {
  return data.rangeKey !== "custom" || (data.rangeFrom && data.rangeTo);
}

export const chartSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(80),
    metric: z.enum(["income", "expense", "compare"]),
    groupBy: z.enum(["category", "bucket", "account", "person", "month"]),
    chartType: z.enum(["bar", "donut", "line"]),
    ...rangeShape,
  })
  .refine((data) => data.groupBy !== "month" || data.chartType === "line", {
    message: "Charts grouped by month must be a line chart.",
    path: ["chartType"],
  })
  .refine((data) => data.metric !== "compare" || data.groupBy === "month", {
    message: "Comparing income and expense only works for charts grouped by month.",
    path: ["metric"],
  })
  .refine(requiresCustomDates, {
    message: "Custom range requires both a start and end date.",
    path: ["rangeFrom"],
  });

// Used by the quick range selector on each chart card, which only patches
// the range without touching the chart's other fields.
export const chartRangeSchema = z.object(rangeShape).refine(requiresCustomDates, {
  message: "Custom range requires both a start and end date.",
  path: ["rangeFrom"],
});
