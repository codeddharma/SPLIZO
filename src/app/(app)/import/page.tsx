import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { FileUploader } from "@/components/import/file-uploader";
import { getFileTypeColor } from "@/lib/file-type-color";

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
        <FileUploader accounts={accounts} />
      )}

      {batches.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-bold text-foreground">Past imports</h2>
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
            {batches.map((b) => {
              const color = getFileTypeColor(b.fileName);
              return (
                <div key={b.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`,
                      color,
                    }}
                  >
                    <FileText className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{b.fileName}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {new Date(b.importedAt).toLocaleString("en-IN")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
