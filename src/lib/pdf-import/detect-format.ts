import type { PdfFormatDefinition } from "./types";
import { detectIciciStatement, parseIciciStatement } from "./parse-icici-statement";
import { detectGpayStatement, parseGpayStatement } from "./parse-gpay-statement";

const FORMATS: PdfFormatDefinition[] = [
  {
    name: "icici",
    detect: detectIciciStatement,
    parse: parseIciciStatement,
    requiresAccountPerRow: false,
  },
  {
    name: "gpay",
    detect: detectGpayStatement,
    parse: parseGpayStatement,
    requiresAccountPerRow: true,
  },
];

export function detectPdfFormat(rawText: string): PdfFormatDefinition | null {
  return FORMATS.find((f) => f.detect(rawText)) ?? null;
}
