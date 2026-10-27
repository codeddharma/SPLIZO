"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { UploadCloud, FileText, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  importAction,
  getImportBatchesAction,
  type ImportStartResult,
  type ImportBatchSummary,
} from "@/lib/actions/import-actions";
import { getFileTypeColor } from "@/lib/file-type-color";

type Account = { id: string; name: string };
type Person = { id: string; name: string };

const POLL_INTERVAL_MS = 2500;
const STALE_PROCESSING_MS = 15 * 60 * 1000;

function isActivelyProcessing(batch: ImportBatchSummary) {
  return batch.status === "processing" && Date.now() - new Date(batch.importedAt).getTime() <= STALE_PROCESSING_MS;
}

export function ImportWorkspace({
  accounts,
  people,
  defaultSpentByPersonTagId,
  initialBatches,
}: {
  accounts: Account[];
  people: Person[];
  defaultSpentByPersonTagId: string;
  initialBatches: ImportBatchSummary[];
}) {
  const [state, formAction, pending] = useActionState<ImportStartResult | null, FormData>(
    importAction,
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [batches, setBatches] = useState(initialBatches);
  const [justStarted, setJustStarted] = useState<string | null>(null);

  const hasProcessing = batches.some(isActivelyProcessing);

  useEffect(() => {
    if (!hasProcessing) return;
    const id = setInterval(async () => {
      const fresh = await getImportBatchesAction();
      setBatches(fresh);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [hasProcessing]);

  useEffect(() => {
    if (state && "started" in state) {
      setJustStarted(state.fileName);
      setFileName(null);
      if (inputRef.current) inputRef.current.value = "";
      getImportBatchesAction().then(setBatches);
    }
  }, [state]);

  function setFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (inputRef.current) inputRef.current.files = files;
    setFileName(files[0].name);
    setFileError(null);
    setJustStarted(null);
  }

  function handleSubmit(e: React.FormEvent) {
    if (!fileName) {
      e.preventDefault();
      setFileError("Choose a statement file before importing.");
    }
  }

  const extColor = fileName ? getFileTypeColor(fileName) : undefined;

  return (
    <div className="flex flex-col gap-6">
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
          <label className="text-xs font-semibold text-muted-foreground">Spent by</label>
          {people.length > 1 ? (
            <select
              name="spentByPersonTagId"
              defaultValue={defaultSpentByPersonTagId}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              <option value="">Unassigned</option>
            </select>
          ) : (
            <>
              <input type="hidden" name="spentByPersonTagId" value={defaultSpentByPersonTagId} />
              <select
                disabled
                defaultValue={defaultSpentByPersonTagId}
                className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </>
          )}
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
          {pending ? "Starting…" : "Import"}
        </button>
      </form>

      {state && "error" in state && (
        <div className="rounded-xl border border-expense/30 bg-expense/10 p-4 text-sm text-expense">
          {state.error}
        </div>
      )}

      {justStarted && (
        <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          Importing &ldquo;{justStarted}&rdquo; in the background — feel free to navigate away.
          Progress shows up below.
        </div>
      )}

      {batches.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-bold text-foreground">Past imports</h2>
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
            {batches.map((b) => (
              <ImportBatchRow key={b.id} batch={b} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ImportBatchRow({ batch }: { batch: ImportBatchSummary }) {
  const color = getFileTypeColor(batch.fileName);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 text-sm">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
      >
        <FileText className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{batch.fileName}</div>
        <div className="text-xs text-muted-foreground">
          {new Date(batch.importedAt).toLocaleString("en-IN")}
        </div>
      </div>
      <BatchStatus batch={batch} />
    </div>
  );
}

function BatchStatus({ batch }: { batch: ImportBatchSummary }) {
  if (batch.status === "processing") {
    if (!isActivelyProcessing(batch)) {
      return (
        <span
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-expense/10 px-2.5 py-1 text-[11px] font-semibold text-expense"
          title="This stopped making progress — the server may have restarted mid-import. Any rows already inserted are still saved."
        >
          <AlertCircle className="h-3 w-3" />
          Stalled
        </span>
      );
    }
    return (
      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
        <Loader2 className="h-3 w-3 animate-spin" />
        Processing {batch.inserted + batch.duplicates}/{batch.total}
      </span>
    );
  }

  if (batch.status === "failed") {
    return (
      <span
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-expense/10 px-2.5 py-1 text-[11px] font-semibold text-expense"
        title={batch.errorMessage ?? undefined}
      >
        <AlertCircle className="h-3 w-3" />
        Failed
      </span>
    );
  }

  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-income/10 px-2.5 py-1 text-[11px] font-semibold text-income">
      <CheckCircle2 className="h-3 w-3" />
      {batch.inserted} inserted
      {batch.needsReview > 0 && `, ${batch.needsReview} to review`}
      {batch.duplicates > 0 && `, ${batch.duplicates} dupes`}
    </span>
  );
}
