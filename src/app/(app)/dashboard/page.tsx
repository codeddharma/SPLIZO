import { getHouseholdId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  getHeadlineTotals,
  getCategoryBreakdown,
  getHomeBreakdown,
  getAccountBreakdown,
  getPersonSplit,
  getIncomeBreakdown,
  getTrend,
  getMonthOverMonthDelta,
  getNeedsAttentionCount,
} from "@/lib/queries/dashboard";
import { HeadlineCards } from "@/components/dashboard/headline-cards";
import { CategoryDonut } from "@/components/dashboard/category-donut";
import { BarBreakdown } from "@/components/dashboard/bar-breakdown";
import { TrendLine } from "@/components/dashboard/trend-line";
import { MomDeltaTable } from "@/components/dashboard/mom-delta-table";
import { NeedsAttentionWidget } from "@/components/dashboard/needs-attention-widget";
import { TransactionTable } from "@/components/transactions/transaction-table";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-2 text-sm font-bold text-muted-foreground">{title}</h2>
      {children}
    </div>
  );
}

export default async function DashboardPage() {
  const householdId = await getHouseholdId();

  const [
    totals,
    categoryBreakdown,
    homeBreakdown,
    accountBreakdown,
    personSplit,
    incomeBreakdown,
    trend,
    momDelta,
    needsAttention,
    recent,
  ] = await Promise.all([
    getHeadlineTotals(householdId),
    getCategoryBreakdown(householdId),
    getHomeBreakdown(householdId),
    getAccountBreakdown(householdId),
    getPersonSplit(householdId),
    getIncomeBreakdown(householdId),
    getTrend(householdId),
    getMonthOverMonthDelta(householdId),
    getNeedsAttentionCount(householdId),
    prisma.transaction.findMany({
      where: { householdId },
      include: { account: true, category: true, home: true, personTag: true },
      orderBy: { date: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">This month at a glance.</p>
      </div>

      <NeedsAttentionWidget count={needsAttention} />
      <HeadlineCards income={totals.income} expense={totals.expense} savings={totals.savings} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Spend by category">
          <CategoryDonut data={categoryBreakdown} />
        </Card>
        <Card title="Spend trend (6 months)">
          <TrendLine data={trend} />
        </Card>
        <Card title="Spend by home">
          <BarBreakdown data={homeBreakdown} />
        </Card>
        <Card title="Spend by account">
          <BarBreakdown data={accountBreakdown} />
        </Card>
        <Card title="Spend by person">
          <BarBreakdown data={personSplit} />
        </Card>
        <Card title="Income by source">
          <BarBreakdown data={incomeBreakdown} />
        </Card>
        <Card title="Month-over-month (expense categories)">
          <MomDeltaTable data={momDelta} />
        </Card>
        <Card title="Loans & borrowing">
          <div className="p-4 text-center text-sm text-muted-foreground">Coming in Phase 10.</div>
        </Card>
      </div>

      <Card title="Recent transactions">
        <TransactionTable transactions={recent} />
      </Card>
    </div>
  );
}
