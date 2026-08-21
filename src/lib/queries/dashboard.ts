import { prisma } from "@/lib/prisma";

function monthRange(monthsAgo = 0) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo + 1, 1));
  return { start, end };
}

export async function getHeadlineTotals(householdId: string, monthsAgo = 0) {
  const { start, end } = monthRange(monthsAgo);
  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: { householdId, date: { gte: start, lt: end }, amount: { gt: 0 } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { householdId, date: { gte: start, lt: end }, amount: { lt: 0 } },
      _sum: { amount: true },
    }),
  ]);
  const income = Number(incomeAgg._sum.amount ?? 0);
  const expense = Math.abs(Number(expenseAgg._sum.amount ?? 0));
  return { income, expense, savings: income - expense };
}

async function groupExpenseByField(
  householdId: string,
  field: "categoryId" | "homeId" | "accountId" | "personTagId",
  monthsAgo = 0
) {
  const { start, end } = monthRange(monthsAgo);
  const grouped = await prisma.transaction.groupBy({
    by: [field],
    where: { householdId, date: { gte: start, lt: end }, amount: { lt: 0 } },
    _sum: { amount: true },
  });
  return grouped.map((g) => ({
    id: g[field] as string | null,
    value: Math.abs(Number(g._sum.amount ?? 0)),
  }));
}

export async function getCategoryBreakdown(householdId: string, monthsAgo = 0) {
  const grouped = await groupExpenseByField(householdId, "categoryId", monthsAgo);
  const ids = grouped.map((g) => g.id).filter((id): id is string => !!id);
  const categories = await prisma.category.findMany({ where: { id: { in: ids } } });
  const nameById = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  return grouped
    .map((g) => ({ name: g.id ? (nameById[g.id] ?? "Unknown") : "Uncategorized", value: g.value }))
    .sort((a, b) => b.value - a.value);
}

export async function getHomeBreakdown(householdId: string) {
  const grouped = await groupExpenseByField(householdId, "homeId");
  const ids = grouped.map((g) => g.id).filter((id): id is string => !!id);
  const homes = await prisma.home.findMany({ where: { id: { in: ids } } });
  const nameById = Object.fromEntries(homes.map((h) => [h.id, h.name]));
  return grouped
    .map((g) => ({ name: g.id ? (nameById[g.id] ?? "Unknown") : "Unassigned", value: g.value }))
    .sort((a, b) => b.value - a.value);
}

export async function getAccountBreakdown(householdId: string) {
  const grouped = await groupExpenseByField(householdId, "accountId");
  const ids = grouped.map((g) => g.id).filter((id): id is string => !!id);
  const accounts = await prisma.account.findMany({ where: { id: { in: ids } } });
  const nameById = Object.fromEntries(accounts.map((a) => [a.id, a.name]));
  return grouped
    .map((g) => ({ name: g.id ? (nameById[g.id] ?? "Unknown") : "Unknown", value: g.value }))
    .sort((a, b) => b.value - a.value);
}

export async function getPersonSplit(householdId: string) {
  const grouped = await groupExpenseByField(householdId, "personTagId");
  const ids = grouped.map((g) => g.id).filter((id): id is string => !!id);
  const people = await prisma.personTag.findMany({ where: { id: { in: ids } } });
  const nameById = Object.fromEntries(people.map((p) => [p.id, p.name]));
  return grouped
    .map((g) => ({ name: g.id ? (nameById[g.id] ?? "Unknown") : "Unassigned", value: g.value }))
    .sort((a, b) => b.value - a.value);
}

export async function getIncomeBreakdown(householdId: string) {
  const { start, end } = monthRange(0);
  const grouped = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { householdId, date: { gte: start, lt: end }, amount: { gt: 0 } },
    _sum: { amount: true },
  });
  const ids = grouped.map((g) => g.categoryId).filter((id): id is string => !!id);
  const categories = await prisma.category.findMany({ where: { id: { in: ids } } });
  const nameById = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  return grouped
    .map((g) => ({
      name: g.categoryId ? (nameById[g.categoryId] ?? "Unknown") : "Uncategorized",
      value: Number(g._sum.amount ?? 0),
    }))
    .sort((a, b) => b.value - a.value);
}

export async function getTrend(householdId: string, months = 6) {
  const results: { month: string; income: number; expense: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const totals = await getHeadlineTotals(householdId, i);
    const { start } = monthRange(i);
    results.push({
      month: start.toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }),
      income: totals.income,
      expense: totals.expense,
    });
  }
  return results;
}

export async function getMonthOverMonthDelta(householdId: string) {
  const [current, previous] = await Promise.all([
    getCategoryBreakdown(householdId, 0),
    getCategoryBreakdown(householdId, 1),
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

export async function getNeedsAttentionCount(householdId: string) {
  return prisma.transaction.count({
    where: { householdId, categoryStatus: { in: ["needs_review", "unmapped"] } },
  });
}
