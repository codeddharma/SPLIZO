// Shared helpers reused across format-specific PDF parsers, so each parser only
// has to describe *where* its fields are, not how to turn raw text into numbers/dates.

// Matches "125.00", "1,234.50" etc — a decimal amount with exactly 2 fraction digits.
// Deliberately requires the decimal point so long reference/ID digit-runs never match.
const DECIMAL_AMOUNT = /\d[\d,]*\.\d{2}/g;

export function findDecimalAmounts(text: string): number[] {
  const matches = text.match(DECIMAL_AMOUNT) ?? [];
  return matches.map((m) => parseFloat(m.replace(/,/g, "")));
}

// A standalone 10-14 digit run (UPI/NEFT reference numbers), bounded so it never
// matches inside an adjacent alphanumeric hash like "ICIf1cd0c950a2b4052..."
const EXTERNAL_REF = /\b\d{10,14}\b/;

export function findExternalRef(text: string): string | undefined {
  return EXTERNAL_REF.exec(text)?.[0];
}

export function dateAtUtcMidnight(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}
