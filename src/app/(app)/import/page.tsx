import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { ImportWorkspace } from "@/components/import/import-workspace";

export default async function ImportPage() {
  const session = await requireSession();
  const householdId = session.user.householdId;
  const [accounts, people, batches] = await Promise.all([
    prisma.account.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.personTag.findMany({
      where: { householdId, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, userId: true },
    }),
    prisma.importBatch.findMany({
      where: { householdId },
      orderBy: { importedAt: "desc" },
      take: 10,
      select: {
        id: true,
        fileName: true,
        importedAt: true,
        status: true,
        total: true,
        inserted: true,
        duplicates: true,
        needsReview: true,
        unmapped: true,
        accountsCreated: true,
        errorMessage: true,
      },
    }),
  ]);
  const currentPersonTagId = people.find((p) => p.userId === session.user.id)?.id ?? "";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Import</h1>
        <p className="text-sm text-muted-foreground">
          Upload a bank/card statement — CSV or PDF, we detect which. Supports a generic bank CSV
          export (Date, Narration/Description, Debit/Credit) and ICICI Bank or Google Pay PDF
          statements. GPay statements resolve each transaction&apos;s account automatically
          (creating a new one if it doesn&apos;t match anything yet).
        </p>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Add an account first — see the Accounts page.
        </div>
      ) : (
        <ImportWorkspace
          accounts={accounts}
          people={people}
          defaultSpentByPersonTagId={currentPersonTagId}
          initialBatches={batches}
        />
      )}
    </div>
  );
}
