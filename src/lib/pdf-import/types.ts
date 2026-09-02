export type ParsedTransactionRow = {
  date: Date;
  description: string;
  amount: number; // signed: negative = debit/out, positive = credit/in
  externalRef?: string;
  accountHint?: string; // only present for multi-account sources (e.g. GPay)
};

export type PdfParseResult =
  | { ok: true; rows: ParsedTransactionRow[]; requiresAccountPerRow: boolean }
  | { ok: false; error: string };

export type PdfFormatDefinition = {
  name: string;
  detect: (rawText: string) => boolean;
  parse: (rawText: string) => ParsedTransactionRow[];
  requiresAccountPerRow: boolean;
};
