import { TrendingUp, TrendingDown, HandCoins } from "lucide-react";
import { getHouseholdId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  getHeadlineTotals,
  getCategoryBreakdown,
  getHomeBreakdown,
  getChartSeries,
  getMonthOverMonthDelta,
  getReviewCounts,
  monthRange,
} from "@/lib/queries/dashboard";
import { getLoanSummary } from "@/lib/queries/loans";
import { resolveDateRange, activeRangeParam } from "@/lib/date-range";
import { HeadlineCards, type CardSpec, type DeltaInfo } from "@/components/dashboard/headline-cards";
import { CategoryDonut } from "@/components/dashboard/category-donut";
import { BarBreakdown } from "@/components/dashboard/bar-breakdown";
import { MomDeltaTable } from "@/components/dashboard/mom-delta-table";
import { NeedsAttentionWidget } from "@/components/dashboard/needs-attention-widget";
import { AddChartButton } from "@/components/dashboard/add-chart-button";
import { CustomChartCard } from "@/components/dashboard/custom-chart-card";
import { TransactionList } from "@/components/transactions/transaction-list";
import { DateRangeFilter } from "@/components/transactions/date-range-filter";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-base font-bold text-foreground">{title}</h2>
      {children}
    </div>
  );
}

function isoDate(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : undefined;
}

// Relative % change vs last month. `invert` swaps the good/bad tone — used
// for Expense, where an increase is bad.
function relativeDelta(current: number, previous: number, invert = false): DeltaInfo {
  if (previous === 0) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const rose = pct >= 0;
  return { pct, direction: rose ? "up" : "down", tone: rose !== invert ? "good" : "bad" };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { range: rangeParam, from, to } = await searchParams;
  const householdId = await getHouseholdId();
  const activeRange = activeRangeParam(rangeParam, from, to);
  const range = resolveDateRange(activeRange, from, to);

  const savedCharts = await prisma.savedChart.findMany({
    where: { householdId },
    orderBy: { sortOrder: "asc" },
  });

  const sixMonths = { start: monthRange(5).start, end: monthRange(0).end };

  const [
    totals,
    lastMonthTotals,
    incomeTrend,
    expenseTrend,
    categoryBreakdown,
    homeBreakdown,
    momDelta,
    reviewCounts,
    loanSummary,
    recent,
    savedChartSeries,
  ] = await Promise.all([
    getHeadlineTotals(householdId, range),
    getHeadlineTotals(householdId, monthRange(1)),
    getChartSeries(householdId, { metric: "income", groupBy: "month", range: sixMonths }),
    getChartSeries(householdId, { metric: "expense", groupBy: "month", range: sixMonths }),
    getCategoryBreakdown(householdId, range),
    getHomeBreakdown(householdId, range),
    getMonthOverMonthDelta(householdId),
    getReviewCounts(householdId, range),
    getLoanSummary(householdId),
    prisma.transaction.findMany({
      where: { householdId, date: { gte: range.start, lt: range.end } },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 8,
    }),
    Promise.all(
      savedCharts.map((chart) =>
        getChartSeries(householdId, {
          metric: chart.metric,
          groupBy: chart.groupBy,
          range: resolveDateRange(chart.rangeKey, isoDate(chart.rangeFrom), isoDate(chart.rangeTo)),
        })
      )
    ),
  ]);

  // "vs last month" only makes sense for a literal calendar month — for
  // Last 60/90 days or a custom span there's no clean "period before".
  const showDelta = activeRange === "this_month";

  const cards: CardSpec[] = [
    {
      label: "Income",
      value: totals.income,
      icon: TrendingUp,
      iconClass: "bg-income/10 text-income",
      spark: incomeTrend.map((p) => p.value),
      sparkColor: "var(--income)",
      delta: showDelta ? relativeDelta(totals.income, lastMonthTotals.income) : null,
    },
    {
      label: "Expense",
      value: totals.expense,
      icon: TrendingDown,
      iconClass: "bg-expense/10 text-expense",
      spark: expenseTrend.map((p) => p.value),
      sparkColor: "var(--expense)",
      delta: showDelta ? relativeDelta(totals.expense, lastMonthTotals.expense, true) : null,
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Spending breakdown for the selected period.</p>
        </div>
      </div>

      {/* Everything in here shares the one date-range filter below — grouped
          in a single bordered card so that's visually obvious. */}
      <div className="flex flex-col gap-6 rounded-xl border border-border p-4 md:p-6">
        <div className="flex justify-end">
          <DateRangeFilter basePath="/dashboard" range={activeRange} from={from} to={to} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <HeadlineCards cards={cards} />
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <HandCoins className="h-4 w-4" />
              </span>
              <h2 className="text-base font-bold text-foreground">Loans</h2>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs text-muted-foreground">Lent</div>
                <div className="text-lg font-extrabold text-income">
                  ₹{loanSummary.totalLent.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Borrowed</div>
                <div className="text-lg font-extrabold text-expense">
                  ₹{loanSummary.totalBorrowed.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>
          <NeedsAttentionWidget
            needsReview={reviewCounts.needsReview}
            unmapped={reviewCounts.unmapped}
            range={activeRange}
            from={from}
            to={to}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <Card title="Spend by category">
            <CategoryDonut data={categoryBreakdown} />
          </Card>
          <Card title="Spend by bucket">
            <BarBreakdown data={homeBreakdown} />
          </Card>
          <Card title="Month-over-month (expense categories)">
            <MomDeltaTable data={momDelta} />
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Your charts</h2>
        <AddChartButton defaultRange={{ rangeKey: activeRange, from, to }} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {savedCharts.map((chart, i) => (
          <CustomChartCard
            key={chart.id}
            chart={{
              id: chart.id,
              title: chart.title,
              metric: chart.metric,
              groupBy: chart.groupBy,
              chartType: chart.chartType,
              rangeKey: chart.rangeKey,
              rangeFrom: isoDate(chart.rangeFrom) ?? null,
              rangeTo: isoDate(chart.rangeTo) ?? null,
            }}
            data={savedChartSeries[i]}
          />
        ))}
        {savedCharts.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No custom charts yet — click &quot;Add chart&quot; to build one.
          </p>
        )}
      </div>

      <Card title="Recent transactions">
        <TransactionList
          transactions={recent.map((t) => ({
            id: t.id,
            date: t.date,
            description: t.description,
            amount: Number(t.amount),
            category: t.category ? { name: t.category.name } : null,
          }))}
        />
      </Card>
    </div>
  );
}
