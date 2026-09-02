import type { ParsedTransactionRow } from "./types";
import { findDecimalAmounts, findExternalRef, dateAtUtcMidnight } from "./parse-utils";

// Row start: a bare "DD.MM.YYYY" date, wherever it falls relative to the S.No
// prefix and whatever whitespace precedes/follows it — exact spacing here
// depends on how the PDF's text layout gets reconstructed, which has already
// varied across extraction approaches, so this only anchors on the date itself.
const ROW_START = /(\d{2})\.(\d{2})\.(\d{4})/g;

export function detectIciciStatement(rawText: string): boolean {
  return rawText.includes("ICICI Bank") && rawText.includes("Statement of Transactions");
}

function extractLabel(afterDate: string): string {
  const lines = afterDate.split("\n").map((l) => l.trim());
  return lines.find((l) => l.length > 0) ?? "";
}

export function parseIciciStatement(rawText: string): ParsedTransactionRow[] {
  const starts: { index: number; day: number; month: number; year: number; label: string }[] = [];
  for (const m of rawText.matchAll(ROW_START)) {
    const index = m.index ?? 0;
    starts.push({
      index,
      day: Number(m[1]),
      month: Number(m[2]),
      year: Number(m[3]),
      label: extractLabel(rawText.slice(index + m[0].length, index + m[0].length + 200)),
    });
  }

  const rows: ParsedTransactionRow[] = [];
  let previousBalance: number | null = null;

  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const blockEnd = i + 1 < starts.length ? starts[i + 1].index : rawText.length;
    const block = rawText.slice(start.index, blockEnd);

    const decimals = findDecimalAmounts(block);
    if (decimals.length < 2) continue; // malformed row, no amount+balance pair found

    const amountMagnitude = decimals[decimals.length - 2];
    const balance = decimals[decimals.length - 1];

    // Direction is inferred from the change in running balance vs. the previous
    // row — the flat text loses which column (withdrawal/deposit) the amount
    // came from. The very first row in a statement has no prior balance to
    // diff against, so it defaults to a debit (the common case) as a documented
    // best-effort — everything after it is exact.
    let signedAmount: number;
    if (previousBalance === null) {
      signedAmount = -amountMagnitude;
    } else {
      const delta = balance - previousBalance;
      signedAmount = delta >= 0 ? amountMagnitude : -amountMagnitude;
    }
    previousBalance = balance;

    rows.push({
      date: dateAtUtcMidnight(start.year, start.month, start.day),
      description: start.label,
      amount: signedAmount,
      externalRef: findExternalRef(block),
    });
  }

  return rows;
}
