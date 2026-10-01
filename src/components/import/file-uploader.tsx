"use client";

import { useActionState, useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { importAction, type UnifiedImportSummary } from "@/lib/actions/import-actions";
import { getFileTypeColor } from "@/lib/file-type-color";

type Account = { id: string; name: string };

export function FileUploader({ accounts }: { accounts: Account[] }) {
  const [state, formAction, pending] = useActionState<UnifiedImportSummary | null, FormData>(
    importAction,
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  function setFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (inputRef.current) inputRef.current.files = files;
    setFileName(files[0].name);
    setFileError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    if (!fileName) {
      e.preventDefault();
      setFileError("Choose a statement file before importing.");
    }
  }

  const extColor = fileName ? getFileTypeColor(fileName) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Account (only needed for a bank CSV/PDF — GPay resolves it per transaction)
          </label>
          <select
            name="accountId"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Auto (e.g. GPay)</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Statement file (CSV or PDF)
          </label>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              setFiles(e.dataTransfer.files);
            }}
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : fileError
                  ? "border-expense/50 bg-expense/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/40"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              name="file"
              accept=".csv,.pdf"
              className="hidden"
              onChange={(e) => setFiles(e.target.files)}
            />
            {fileName ? (
              <div
                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold"
                style={{
                  backgroundColor: `color-mix(in srgb, ${extColor} 16%, transparent)`,
                  color: extColor,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="h-4 w-4" />
                {fileName}
                <button
                  type="button"
                  aria-label="Remove file"
                  onClick={() => {
                    setFileName(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  className="rounded-full hover:opacity-70"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UploadCloud className="h-5 w-5" />
                </span>
                <p className="text-sm font-semibold text-foreground">
                  Drag & drop your statement, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">CSV or PDF</p>
              </>
            )}
          </div>
          {fileError && <p className="text-xs font-medium text-expense">{fileError}</p>}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
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
            Detected format:{" "}
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              {state.format}
            </span>
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
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
      <div className={`text-2xl font-extrabold tracking-tight ${accent ?? ""}`}>{value}</div>
    </div>
  );
}
