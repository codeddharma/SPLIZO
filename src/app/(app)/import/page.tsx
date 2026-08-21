import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { CsvUploader } from "@/components/import/csv-uploader";

export default async function ImportPage() {
  const householdId = await getHouseholdId();
  const [accounts, batches] = await Promise.all([
    prisma.account.findMany({ where: { householdId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.importBatch.findMany({
      where: { householdId },
      orderBy: { importedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import</h1>
        <p className="text-sm text-muted-foreground">
          Upload a bank/card CSV export. Expected columns: Date, Narration/Description, and
          Debit/Credit (or Withdrawal/Deposit) amounts — share your actual export if the column
          names differ and the parser can be adjusted.
        </p>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Add an account first — see the Accounts page.
        </div>
      ) : (
        <CsvUploader accounts={accounts} />
      )}

      {batches.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-muted-foreground">Past imports</h2>
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
            {batches.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span>{b.fileName}</span>
                <span className="text-muted-foreground">
                  {new Date(b.importedAt).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
