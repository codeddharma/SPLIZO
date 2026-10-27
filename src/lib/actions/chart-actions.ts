"use server";

import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { chartSchema } from "@/lib/validation/chart-schema";

export type ChartActionState = { error: string } | null;

function parseRangeDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function readChartForm(formData: FormData) {
  return chartSchema.safeParse({
    title: formData.get("title"),
    metric: formData.get("metric"),
    groupBy: formData.get("groupBy"),
    chartType: formData.get("chartType"),
    rangeKey: formData.get("rangeKey"),
    rangeFrom: formData.get("rangeFrom") ?? "",
    rangeTo: formData.get("rangeTo") ?? "",
  });
}

export async function createChartAction(
  _prev: ChartActionState,
  formData: FormData
): Promise<ChartActionState> {
  const householdId = await getHouseholdId();
  const parsed = readChartForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const { title, metric, groupBy, chartType, rangeKey, rangeFrom, rangeTo } = parsed.data;

  const sortOrder = await prisma.savedChart.count({ where: { householdId } });
  await prisma.savedChart.create({
    data: {
      householdId,
      title,
      metric,
      groupBy,
      chartType,
      rangeKey,
      rangeFrom: rangeKey === "custom" ? parseRangeDate(rangeFrom!) : null,
      rangeTo: rangeKey === "custom" ? parseRangeDate(rangeTo!) : null,
      sortOrder,
    },
  });
  revalidatePath("/dashboard");
  return null;
}

export async function updateChartAction(
  _prev: ChartActionState,
  formData: FormData
): Promise<ChartActionState> {
  const householdId = await getHouseholdId();
  const id = String(formData.get("id") ?? "");
  const parsed = readChartForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const { title, metric, groupBy, chartType, rangeKey, rangeFrom, rangeTo } = parsed.data;

  const result = await prisma.savedChart.updateMany({
    where: { id, householdId },
    data: {
      title,
      metric,
      groupBy,
      chartType,
      rangeKey,
      rangeFrom: rangeKey === "custom" ? parseRangeDate(rangeFrom!) : null,
      rangeTo: rangeKey === "custom" ? parseRangeDate(rangeTo!) : null,
    },
  });
  if (result.count === 0) {
    return { error: "Chart not found." };
  }
  revalidatePath("/dashboard");
  return null;
}

export async function deleteChartAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const id = String(formData.get("id") ?? "");
  await prisma.savedChart.deleteMany({ where: { id, householdId } });
  revalidatePath("/dashboard");
}
