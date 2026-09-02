import type { ParsedTransactionRow } from "./types";
import { dateAtUtcMidnight } from "./parse-utils";

const MONTHS: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

// Block start: "01 May, 2026" on its own line (whitespace-tolerant since exact
// spacing depends on how the PDF's text layout gets reconstructed)
const ROW_START = /^\s*(\d{2})\s+(\w{3}),\s*(\d{4})\s*$/gm;

const ACTION = /(Paid to|Received from|Self transfer to)\s+([\s\S]*?)\s*\n\s*UPI Transaction ID/;
const EXTERNAL_REF = /UPI Transaction ID:\s*(\d+)/;
const ACCOUNT_HINT = /UPI Transaction ID:\s*\d+\s*\n\s*(?:Paid by|Paid to)\s+([\s\S]*?)\s*\n\s*₹/;
const AMOUNT = /₹\s*([\d,]+\.?\d*)/;

export function detectGpayStatement(rawText: string): boolean {
  return rawText.includes("Google Pay") && rawText.includes("Transaction statement") && rawText.includes("UPI Transaction ID");
}

export function parseGpayStatement(rawText: string): ParsedTransactionRow[] {
  const starts: { index: number; day: number; month: number; year: number }[] = [];
  for (const m of rawText.matchAll(ROW_START)) {
    const month = MONTHS[m[2]];
    if (!month) continue;
    starts.push({ index: m.index ?? 0, day: Number(m[1]), month, year: Number(m[3]) });
  }

  const rows: ParsedTransactionRow[] = [];

  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const blockEnd = i + 1 < starts.length ? starts[i + 1].index : rawText.length;
    const block = rawText.slice(start.index, blockEnd);

    const actionMatch = ACTION.exec(block);
    const amountMatch = AMOUNT.exec(block);
    if (!actionMatch || !amountMatch) continue; // page header/footer noise, not a transaction block

    const direction = actionMatch[1]; // "Paid to" | "Received from" | "Self transfer to"
    const description =
      direction === "Received from"
        ? `Received from ${actionMatch[2].trim()}`
        : `${direction} ${actionMatch[2].trim()}`;
    const amountMagnitude = parseFloat(amountMatch[1].replace(/,/g, ""));
    const signedAmount = direction === "Received from" ? amountMagnitude : -amountMagnitude;

    const refMatch = EXTERNAL_REF.exec(block);
    const hintMatch = ACCOUNT_HINT.exec(block);

    rows.push({
      date: dateAtUtcMidnight(start.year, start.month, start.day),
      description,
      amount: signedAmount,
      externalRef: refMatch?.[1],
      accountHint: hintMatch?.[1]?.trim(),
    });
  }

  return rows;
}
