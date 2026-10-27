import { z } from "zod";

export const chartSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(80),
    metric: z.enum(["income", "expense"]),
    groupBy: z.enum(["category", "bucket", "account", "person", "month"]),
    chartType: z.enum(["bar", "donut", "line"]),
    rangeKey: z.enum(["this_month", "last_month", "last_60", "last_90", "custom"]),
    rangeFrom: z.string().trim().optional().or(z.literal("")),
    rangeTo: z.string().trim().optional().or(z.literal("")),
  })
  .refine((data) => data.groupBy !== "month" || data.chartType === "line", {
    message: "Charts grouped by month must be a line chart.",
    path: ["chartType"],
  })
  .refine((data) => data.rangeKey !== "custom" || (data.rangeFrom && data.rangeTo), {
    message: "Custom range requires both a start and end date.",
    path: ["rangeFrom"],
  });
