import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { AddTransactionDialogLoader } from "@/components/transactions/add-transaction-dialog-loader";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { StatusTabs } from "@/components/transactions/status-tabs";
import { DateRangeFilter } from "@/components/transactions/date-range-filter";
import { Pagination } from "@/components/transactions/pagination";
import { TableSkeleton } from "@/components/transactions/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import type { Prisma } from "@prisma/client";

const STATUS_FILTERS: Record<string, Prisma.TransactionWhereInput> = {
  mapped: { categoryStatus: { in: ["confirmed", "auto_mapped"] } },
  needs_review: { categoryStatus: "needs_review" },
  unmapped: { categoryStatus: "unmapped" },
};

const PAGE_SIZE = 30;

function utcMidnight(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day));
}

function getDateFilter(range: string, from?: string, to?: string): Prisma.TransactionWhereInput {
  const now = new Date();

  if (range === "last_month") {
    return {
      date: {
        gte: utcMidnight(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
        lt: utcMidnight(now.getUTCFullYear(), now.getUTCMonth(), 1),
      },
    };
  }

  if (range === "last_60" || range === "last_90") {
    const days = range === "last_60" ? 60 : 90;
    const end = utcMidnight(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    return { date: { gte: start, lt: end } };
  }

  if (range === "custom" && from && to) {
    // Guard against an inverted range (e.g. a hand-edited URL) — swap rather
    // than silently returning zero rows for an impossible date filter.
    const [start, end] = from <= to ? [from, to] : [to, from];
    const [fy, fm, fd] = start.split("-").map(Number);
    const [ty, tm, td] = end.split("-").map(Number);
    return {
      date: {
        gte: utcMidnight(fy, fm - 1, fd),
        lt: utcMidnight(ty, tm - 1, td + 1),
      },
    };
  }

  // Default: this_month
  return {
    date: {
      gte: utcMidnight(now.getUTCFullYear(), now.getUTCMonth(), 1),
      lt: utcMidnight(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    },
  };
}

async function TransactionsList({
  householdId,
  statusFilter,
  dateFilter,
  activeStatus,
  page,
  activeRange,
  from,
  to,
}: {
  householdId: string;
  statusFilter: Prisma.TransactionWhereInput;
  dateFilter: Prisma.TransactionWhereInput;
  activeStatus: string;
  page: number;
  activeRange: string;
  from?: string;
  to?: string;
}) {
  const where = { householdId, ...statusFilter, ...dateFilter };

  const [transactions, total, categories, homes, people, owners] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        account: { include: { owners: { include: { personTag: true } } } },
        category: true,
        categoryRule: true,
        homes: { include: { home: true } },
        people: { include: { personTag: true } },
        spentByPersonTag: true,
        loan: { select: { id: true } },
        loanRepayment: { select: { id: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.transaction.count({ where }),
    prisma.category.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.home.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.personTag.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.personTag.findMany({
      where: { householdId, isActive: true, userId: { not: null } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <TransactionTable
          transactions={transactions.map((t) => ({
            id: t.id,
            date: t.date,
            description: t.description,
            amount: Number(t.amount),
            categoryStatus: t.categoryStatus,
            categoryId: t.categoryId,
            account: {
              name: t.account.name,
              owners: t.account.owners.map((o) => ({ name: o.personTag.name })),
            },
            category: t.category ? { name: t.category.name } : null,
            categoryRule: t.categoryRule ? { name: t.categoryRule.name } : null,
            homes: t.homes.map((h) => ({ home: { id: h.home.id, name: h.home.name } })),
            people: t.people.map((p) => ({
              personTag: { id: p.personTag.id, name: p.personTag.name },
            })),
            spentByPersonTag: t.spentByPersonTag
              ? { id: t.spentByPersonTag.id, name: t.spentByPersonTag.name }
              : null,
            loan: t.loan,
            loanRepayment: t.loanRepayment,
            isInFamilyTransfer: t.isInFamilyTransfer,
          }))}
          categories={categories}
          homes={homes}
          people={people}
          owners={owners}
          showActions
        />
      </div>

      <Pagination
        status={activeStatus}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        range={activeRange}
        from={from}
        to={to}
      />
    </>
  );
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; range?: string; from?: string; to?: string }>;
}) {
  const { status, page: pageParam, range: rangeParam, from, to } = await searchParams;
  const householdId = await getHouseholdId();
  const statusFilter = status && STATUS_FILTERS[status] ? STATUS_FILTERS[status] : {};
  const activeStatus = status && STATUS_FILTERS[status] ? status : "all";
  const page = Math.max(1, Number(pageParam) || 1);
  const activeRange = rangeParam === "custom" && from && to ? "custom" : rangeParam || "this_month";
  const dateFilter = getDateFilter(activeRange, from, to);

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6">
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">Every transaction, filterable by status.</p>
        </div>
        <Suspense fallback={<Skeleton className="h-8 w-36" />}>
          <AddTransactionDialogLoader householdId={householdId} />
        </Suspense>
      </div>

      <div className="flex shrink-0 items-center justify-between">
        <StatusTabs active={activeStatus} range={activeRange} from={from} to={to} />
        <DateRangeFilter status={activeStatus} range={activeRange} from={from} to={to} />
      </div>

      <Suspense key={`${activeStatus}-${page}-${activeRange}-${from}-${to}`} fallback={<TableSkeleton />}>
        <TransactionsList
          householdId={householdId}
          statusFilter={statusFilter}
          dateFilter={dateFilter}
          activeStatus={activeStatus}
          page={page}
          activeRange={activeRange}
          from={from}
          to={to}
        />
      </Suspense>
    </div>
  );
}
