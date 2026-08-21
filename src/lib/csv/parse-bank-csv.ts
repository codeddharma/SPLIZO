import Papa from "papaparse";

const DATE_ALIASES = ["date", "value date", "txn date", "transaction date"];
const DESCRIPTION_ALIASES = ["narration", "description", "particulars", "details"];
const DEBIT_ALIASES = ["withdrawal amt.", "withdrawal amt", "debit", "debit amount", "withdrawal"];
const CREDIT_ALIASES = ["deposit amt.", "deposit amt", "credit", "credit amount", "deposit"];

function findColumn(headers: string[], aliases: string[]): string | null {
  const normalized = headers.map((h) => h.trim().toLowerCase());
  for (const alias of aliases) {
    const idx = normalized.indexOf(alias);
    if (idx !== -1) return headers[idx];
  }
  return null;
}

function parseIndianDate(value: string): Date | null {
  // Constructed as explicit UTC midnight so the calendar date is stable
  // regardless of the server process's local timezone (dev machine vs.
  // a UTC-default deployment runtime).
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) return new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])));

  const dmy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/.exec(value);
  if (dmy) return new Date(Date.UTC(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1])));

  return null;
}

export type ParsedRow = {
  date: Date;
  description: string;
  amount: number; // signed: negative = debit/out, positive = credit/in
  raw: Record<string, string>;
};

export type ParseResult = { ok: true; rows: ParsedRow[] } | { ok: false; error: string };

export function parseBankCsv(csvText: string): ParseResult {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    return { ok: false, error: parsed.errors[0].message };
  }

  const headers = parsed.meta.fields ?? [];
  const dateCol = findColumn(headers, DATE_ALIASES);
  const descCol = findColumn(headers, DESCRIPTION_ALIASES);
  const debitCol = findColumn(headers, DEBIT_ALIASES);
  const creditCol = findColumn(headers, CREDIT_ALIASES);

  if (!dateCol || !descCol || (!debitCol && !creditCol)) {
    return {
      ok: false,
      error:
        "Couldn't recognize this CSV's columns. Expected a Date, Description/Narration, and Debit/Credit (or Withdrawal/Deposit) column. Share your actual export so the parser can be adjusted.",
    };
  }

  const rows: ParsedRow[] = [];
  for (const row of parsed.data) {
    const dateRaw = row[dateCol]?.trim();
    const description = row[descCol]?.trim();
    if (!dateRaw || !description) continue;

    const date = parseIndianDate(dateRaw);
    if (!date) continue;

    const debitRaw = debitCol ? row[debitCol]?.trim() : "";
    const creditRaw = creditCol ? row[creditCol]?.trim() : "";
    const debit = parseFloat((debitRaw || "0").replace(/,/g, "")) || 0;
    const credit = parseFloat((creditRaw || "0").replace(/,/g, "")) || 0;

    if (debit === 0 && credit === 0) continue;

    const amount = credit > 0 ? credit : -debit;
    rows.push({ date, description, amount, raw: row });
  }

  return { ok: true, rows };
}
