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
  getCategoryRuleBreakdown,
  getSpentByBreakdown,
} from "@/lib/queries/dashboard";
import { getLoanSummary } from "@/lib/queries/loans";
import { HeadlineCards } from "@/components/dashboard/headline-cards";
import { CategoryDonut } from "@/components/dashboard/category-donut";
import { BarBreakdown } from "@/components/dashboard/bar-breakdown";
import { TrendLine } from "@/components/dashboard/trend-line";
import { MomDeltaTable } from "@/components/dashboard/mom-delta-table";
import { NeedsAttentionWidget } from "@/components/dashboard/needs-attention-widget";
import { TransactionList } from "@/components/transactions/transaction-list";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-base font-bold text-foreground">{title}</h2>
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
    loanSummary,
    categoryRuleBreakdown,
    spentByBreakdown,
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
    getLoanSummary(householdId),
    getCategoryRuleBreakdown(householdId),
    getSpentByBreakdown(householdId),
    prisma.transaction.findMany({
      where: { householdId },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">This month at a glance.</p>
      </div>

      <NeedsAttentionWidget count={needsAttention} />
      <HeadlineCards
        income={totals.income}
        expense={totals.expense}
        savings={totals.savings}
        trend={trend}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card title="Spend by category">
          <CategoryDonut data={categoryBreakdown} />
        </Card>
        <Card title="Spend trend (6 months)">
          <TrendLine data={trend} />
        </Card>
        <Card title="Spend by place">
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
        <Card title="Spend by rule">
          <BarBreakdown data={categoryRuleBreakdown} />
        </Card>
        <Card title="Spend by (who spent)">
          <BarBreakdown data={spentByBreakdown} />
        </Card>
        <Card title="Month-over-month (expense categories)">
          <MomDeltaTable data={momDelta} />
        </Card>
        <Card title="Loans & borrowing">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Outstanding — lent</div>
              <div className="text-xl font-extrabold text-income">
                ₹{loanSummary.totalLent.toLocaleString("en-IN")}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Outstanding — borrowed</div>
              <div className="text-xl font-extrabold text-expense">
                ₹{loanSummary.totalBorrowed.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </Card>
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
