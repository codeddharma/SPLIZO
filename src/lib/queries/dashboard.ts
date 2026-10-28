import { prisma } from "@/lib/prisma";

// Loan/repayment transactions and transfers marked as in-family (e.g. one
// spouse's account to another's) aren't real spend or income, so every
// analytics aggregation excludes them. They still show up in the plain
// transaction list.
const NOT_LOAN_LINKED = { loan: null, loanRepayment: null, isInFamilyTransfer: false } as const;

export function monthRange(monthsAgo = 0) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo + 1, 1));
  return { start, end };
}

type Range = { start: Date; end: Date };
type Metric = "income" | "expense";

function amountFilter(metric: Metric) {
  return metric === "income" ? { gt: 0 } : { lt: 0 };
}

export async function getHeadlineTotals(householdId: string, range: Range = monthRange(0)) {
  const { start, end } = range;
  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: { householdId, date: { gte: start, lt: end }, amount: { gt: 0 }, ...NOT_LOAN_LINKED },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { householdId, date: { gte: start, lt: end }, amount: { lt: 0 }, ...NOT_LOAN_LINKED },
      _sum: { amount: true },
    }),
  ]);
  const income = Number(incomeAgg._sum.amount ?? 0);
  const expense = Math.abs(Number(expenseAgg._sum.amount ?? 0));
  return { income, expense, savings: income - expense };
}

export type ChartSeriesPoint = { name: string; value: number };
export type ChartComparePoint = { name: string; income: number; expense: number };
type ChartGroupBy = "category" | "bucket" | "account" | "person" | "month";

async function groupByDirectField(
  householdId: string,
  field: "categoryId" | "accountId",
  metric: Metric,
  range: Range
) {
  const { start, end } = range;
  const grouped = await prisma.transaction.groupBy({
    by: [field],
    where: { householdId, date: { gte: start, lt: end }, amount: amountFilter(metric), ...NOT_LOAN_LINKED },
    _sum: { amount: true },
  });
  return grouped.map((g) => ({ id: g[field] as string | null, value: Math.abs(Number(g._sum.amount ?? 0)) }));
}

async function categorySeries(householdId: string, metric: Metric, range: Range): Promise<ChartSeriesPoint[]> {
  const grouped = await groupByDirectField(householdId, "categoryId", metric, range);
  const ids = grouped.map((g) => g.id).filter((id): id is string => !!id);
  const categories = await prisma.category.findMany({ where: { id: { in: ids } } });
  const nameById = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  return grouped
    .map((g) => ({ name: g.id ? (nameById[g.id] ?? "Unknown") : "Uncategorized", value: g.value }))
    .sort((a, b) => b.value - a.value);
}

async function accountSeries(householdId: string, metric: Metric, range: Range): Promise<ChartSeriesPoint[]> {
  const grouped = await groupByDirectField(householdId, "accountId", metric, range);
  const ids = grouped.map((g) => g.id).filter((id): id is string => !!id);
  const accounts = await prisma.account.findMany({ where: { id: { in: ids } } });
  const nameById = Object.fromEntries(accounts.map((a) => [a.id, a.name]));
  return grouped
    .map((g) => ({ name: g.id ? (nameById[g.id] ?? "Unknown") : "Unknown", value: g.value }))
    .sort((a, b) => b.value - a.value);
}

// Bucket (Home) and person-split amounts live on join tables, not directly on
// Transaction, so they're grouped separately and filtered via the nested
// transaction relation. These don't carry loan/transfer fields themselves, so
// NOT_LOAN_LINKED can't be applied here — pre-existing, documented behavior.
async function bucketSeries(householdId: string, metric: Metric, range: Range): Promise<ChartSeriesPoint[]> {
  const { start, end } = range;
  const grouped = await prisma.transactionHome.groupBy({
    by: ["homeId"],
    where: { amount: amountFilter(metric), transaction: { householdId, date: { gte: start, lt: end } } },
    _sum: { amount: true },
  });
  const ids = grouped.map((g) => g.homeId);
  const homes = await prisma.home.findMany({ where: { id: { in: ids } } });
  const nameById = Object.fromEntries(homes.map((h) => [h.id, h.name]));
  return grouped
    .map((g) => ({ name: nameById[g.homeId] ?? "Unknown", value: Math.abs(Number(g._sum.amount ?? 0)) }))
    .sort((a, b) => b.value - a.value);
}

async function personSeries(householdId: string, metric: Metric, range: Range): Promise<ChartSeriesPoint[]> {
  const { start, end } = range;
  const grouped = await prisma.transactionPersonTag.groupBy({
    by: ["personTagId"],
    where: { amount: amountFilter(metric), transaction: { householdId, date: { gte: start, lt: end } } },
    _sum: { amount: true },
  });
  const ids = grouped.map((g) => g.personTagId);
  const people = await prisma.personTag.findMany({ where: { id: { in: ids } } });
  const nameById = Object.fromEntries(people.map((p) => [p.id, p.name]));
  return grouped
    .map((g) => ({ name: nameById[g.personTagId] ?? "Unknown", value: Math.abs(Number(g._sum.amount ?? 0)) }))
    .sort((a, b) => b.value - a.value);
}

// One metric, walked month by month across the range — a line-over-time
// series rather than a grouped/sorted breakdown.
async function monthSeries(householdId: string, metric: Metric, range: Range): Promise<ChartSeriesPoint[]> {
  const points: ChartSeriesPoint[] = [];
  let cursor = new Date(Date.UTC(range.start.getUTCFullYear(), range.start.getUTCMonth(), 1));
  while (cursor < range.end) {
    const start = cursor;
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    const agg = await prisma.transaction.aggregate({
      where: {
        householdId,
        date: { gte: start, lt: end < range.end ? end : range.end },
        amount: amountFilter(metric),
        ...NOT_LOAN_LINKED,
      },
      _sum: { amount: true },
    });
    points.push({
      name: start.toLocaleDateString("en-IN", { month: "short", year: "2-digit", timeZone: "UTC" }),
      value: Math.abs(Number(agg._sum.amount ?? 0)),
    });
    cursor = end;
  }
  return points;
}

// Income and expense walked month by month and zipped together — the "Over
// time" comparison line. Reuses monthSeries so the per-month aggregation
// logic lives in exactly one place.
async function monthCompareSeries(householdId: string, range: Range): Promise<ChartComparePoint[]> {
  const [income, expense] = await Promise.all([
    monthSeries(householdId, "income", range),
    monthSeries(householdId, "expense", range),
  ]);
  return income.map((point, i) => ({ name: point.name, income: point.value, expense: expense[i].value }));
}

// Single generic engine behind every breakdown on the dashboard, default or
// user-built: pick a metric, a dimension to group by, and a range. "compare"
// is only valid with groupBy "month" (enforced in the Zod schema) and
// returns a two-series shape instead of the usual {name, value}[]. Overloads
// let a fixed "income"/"expense" call site keep the plain ChartSeriesPoint[]
// type instead of always widening to the union.
export async function getChartSeries(
  householdId: string,
  config: { metric: Metric; groupBy: ChartGroupBy; range: Range }
): Promise<ChartSeriesPoint[]>;
export async function getChartSeries(
  householdId: string,
  config: { metric: "compare"; groupBy: ChartGroupBy; range: Range }
): Promise<ChartComparePoint[]>;
export async function getChartSeries(
  householdId: string,
  config: { metric: Metric | "compare"; groupBy: ChartGroupBy; range: Range }
): Promise<ChartSeriesPoint[] | ChartComparePoint[]>;
export async function getChartSeries(
  householdId: string,
  config: { metric: Metric | "compare"; groupBy: ChartGroupBy; range: Range }
): Promise<ChartSeriesPoint[] | ChartComparePoint[]> {
  const { metric, groupBy, range } = config;
  if (metric === "compare") {
    return monthCompareSeries(householdId, range);
  }
  switch (groupBy) {
    case "category":
      return categorySeries(householdId, metric, range);
    case "account":
      return accountSeries(householdId, metric, range);
    case "bucket":
      return bucketSeries(householdId, metric, range);
    case "person":
      return personSeries(householdId, metric, range);
    case "month":
      return monthSeries(householdId, metric, range);
  }
}

export async function getCategoryBreakdown(householdId: string, range: Range = monthRange(0)) {
  return categorySeries(householdId, "expense", range);
}

export async function getHomeBreakdown(householdId: string, range: Range = monthRange(0)) {
  return bucketSeries(householdId, "expense", range);
}

export async function getMonthOverMonthDelta(householdId: string) {
  const [current, previous] = await Promise.all([
    getCategoryBreakdown(householdId, monthRange(0)),
    getCategoryBreakdown(householdId, monthRange(1)),
  ]);
  const curByName = Object.fromEntries(current.map((c) => [c.name, c.value]));
  const prevByName = Object.fromEntries(previous.map((p) => [p.name, p.value]));
  const names = new Set([...Object.keys(curByName), ...Object.keys(prevByName)]);

  return Array.from(names)
    .map((name) => ({
      name,
      current: curByName[name] ?? 0,
      previous: prevByName[name] ?? 0,
      delta: (curByName[name] ?? 0) - (prevByName[name] ?? 0),
    }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

export async function getReviewCounts(householdId: string, range: Range = monthRange(0)) {
  const [needsReview, unmapped] = await Promise.all([
    prisma.transaction.count({
      where: { householdId, categoryStatus: "needs_review", date: { gte: range.start, lt: range.end }, ...NOT_LOAN_LINKED },
    }),
    prisma.transaction.count({
      where: { householdId, categoryStatus: "unmapped", date: { gte: range.start, lt: range.end }, ...NOT_LOAN_LINKED },
    }),
  ]);
  return { needsReview, unmapped };
}
