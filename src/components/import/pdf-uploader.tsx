"use client";

import { useActionState } from "react";
import { importPdfAction, type PdfImportSummary } from "@/lib/actions/pdf-import-actions";

type Account = { id: string; name: string };

export function PdfUploader({ accounts }: { accounts: Account[] }) {
  const [state, formAction, pending] = useActionState<PdfImportSummary | null, FormData>(
    importPdfAction,
    null
  );

  return (
    <div className="flex flex-col gap-4">
      <form
        action={formAction}
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Account (only used for bank-shaped statements, e.g. ICICI)
          </label>
          <select
            name="accountId"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Auto (per-transaction, e.g. GPay)</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Statement PDF</label>
          <input
            type="file"
            name="file"
            accept=".pdf"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-semibold file:text-primary-foreground"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Importing…" : "Import"}
        </button>
      </form>

      {state && "error" in state && (
        <div className="rounded-xl border border-expense/30 bg-expense/10 p-4 text-sm text-expense">
          {state.error}
        </div>
      )}

      {state && "inserted" in state && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            Detected format: <span className="font-semibold">{state.format}</span>
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryCard label="Parsed" value={state.total} />
            <SummaryCard label="Inserted" value={state.inserted} />
            <SummaryCard label="Duplicates skipped" value={state.duplicates} />
            <SummaryCard label="Needs review" value={state.needsReview} accent="text-warning" />
            <SummaryCard label="Unmapped" value={state.unmapped} accent="text-expense" />
            {state.accountsCreated > 0 && (
              <SummaryCard
                label="Accounts created"
                value={state.accountsCreated}
                accent="text-primary"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold ${accent ?? ""}`}>{value}</div>
    </div>
  );
}
