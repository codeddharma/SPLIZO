// Strips trailing tokens that look like order/reference numbers (contain a digit)
// so a correction like "ZOMATO ORDER 4529" suggests "ZOMATO ORDER" as a reusable
// vendor match text, rather than a one-off string tied to this transaction.
export function suggestVendorMatchText(description: string): string {
  const words = description.trim().split(/\s+/);
  while (words.length > 1 && /\d/.test(words[words.length - 1])) {
    words.pop();
  }
  return words.join(" ").toUpperCase();
}
