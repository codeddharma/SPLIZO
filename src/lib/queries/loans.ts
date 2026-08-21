import { prisma } from "@/lib/prisma";

export async function getLoansWithBalances(householdId: string) {
  const loans = await prisma.loan.findMany({
    where: { householdId },
    include: { contact: true, repayments: { orderBy: { date: "desc" } } },
    orderBy: { date: "desc" },
  });

  return loans.map((loan) => {
    const repaid = loan.repayments.reduce((sum, r) => sum + Number(r.amount), 0);
    const outstanding = Math.max(Number(loan.openingAmount) - repaid, 0);
    return { ...loan, repaid, outstanding };
  });
}

export async function getLoanSummary(householdId: string) {
  const loans = await getLoansWithBalances(householdId);
  const totalLent = loans
    .filter((l) => l.direction === "lent" && l.status === "open")
    .reduce((sum, l) => sum + l.outstanding, 0);
  const totalBorrowed = loans
    .filter((l) => l.direction === "borrowed" && l.status === "open")
    .reduce((sum, l) => sum + l.outstanding, 0);
  return { totalLent, totalBorrowed };
}
