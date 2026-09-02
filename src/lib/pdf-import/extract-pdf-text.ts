import path from "path";
import { pathToFileURL } from "url";

// Talking to pdfjs-dist directly rather than through a wrapper (pdf-parse v1/v2
// both hit dead ends here): pdf.js needs to resolve its worker script's *real*
// location to parse anything, worker or not. Turbopack relocates compiled code
// into .next chunks without copying that sibling file, so the library's own
// relative lookup breaks either way — this sets it explicitly, from the actual
// project root, as a proper file:// URL (a bare Windows path isn't valid here).
async function configureWorker() {
  const { GlobalWorkerOptions } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (!GlobalWorkerOptions.workerSrc) {
    GlobalWorkerOptions.workerSrc = pathToFileURL(
      path.join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs")
    ).href;
  }
}

// Text items carry no explicit spaces/newlines — reconstruct them from each
// item's position: a vertical jump means a new line, otherwise join with a
// space. Slightly generous with spacing (occasional doubled-up spaces) but
// every parser here matches whitespace tolerantly, so that's harmless.
export async function extractPdfText(buffer: Buffer): Promise<string> {
  await configureWorker();
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const doc = await getDocument({ data: new Uint8Array(buffer) }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let lastY: number | null = null;
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const y = item.transform[5];
      if (lastY !== null) {
        text += Math.abs(y - lastY) > 1 ? "\n" : " ";
      }
      text += item.str;
      lastY = y;
    }
    text += "\n";
  }
  return text;
}
