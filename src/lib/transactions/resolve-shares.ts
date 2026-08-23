// Splits a transaction's total amount across selected tags (homes or people).
// Any tag with an explicit override amount keeps it; the remainder is split
// evenly across the tags left unspecified. `total` and the returned amounts
// are signed (negative for expenses), matching the transaction's own sign.
export function resolveShares(
  ids: string[],
  overrides: Record<string, number | undefined>,
  total: number
): { id: string; amount: number }[] {
  if (ids.length === 0) return [];

  const specifiedIds = ids.filter(
    (id) => overrides[id] != null && !Number.isNaN(overrides[id])
  );
  const unspecifiedIds = ids.filter((id) => !specifiedIds.includes(id));

  const sign = total < 0 ? -1 : 1;
  const specifiedSum = specifiedIds.reduce((sum, id) => sum + sign * Math.abs(overrides[id]!), 0);
  const remaining = total - specifiedSum;
  const perUnspecified = unspecifiedIds.length > 0 ? remaining / unspecifiedIds.length : 0;

  return ids.map((id) => ({
    id,
    amount: specifiedIds.includes(id) ? sign * Math.abs(overrides[id]!) : perUnspecified,
  }));
}
