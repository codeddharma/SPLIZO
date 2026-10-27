function utcMidnight(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day));
}

export type DateRange = { start: Date; end: Date };

/** Resolves a preset/custom range param pair into actual UTC date boundaries. */
export function resolveDateRange(range: string, from?: string, to?: string): DateRange {
  const now = new Date();

  if (range === "last_month") {
    return {
      start: utcMidnight(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
      end: utcMidnight(now.getUTCFullYear(), now.getUTCMonth(), 1),
    };
  }

  if (range === "last_60" || range === "last_90") {
    const days = range === "last_60" ? 60 : 90;
    const end = utcMidnight(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    return { start, end };
  }

  if (range === "custom" && from && to) {
    // Guard against an inverted range (e.g. a hand-edited URL) — swap rather
    // than silently returning zero rows for an impossible date filter.
    const [start, end] = from <= to ? [from, to] : [to, from];
    const [fy, fm, fd] = start.split("-").map(Number);
    const [ty, tm, td] = end.split("-").map(Number);
    return {
      start: utcMidnight(fy, fm - 1, fd),
      end: utcMidnight(ty, tm - 1, td + 1),
    };
  }

  // Default: this_month
  return {
    start: utcMidnight(now.getUTCFullYear(), now.getUTCMonth(), 1),
    end: utcMidnight(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  };
}

export function activeRangeParam(rangeParam?: string, from?: string, to?: string) {
  return rangeParam === "custom" && from && to ? "custom" : rangeParam || "this_month";
}

/** Sets `range`/`from`/`to` on `params` to match the page's current date filter, omitting the default. */
export function applyRangeParams(params: URLSearchParams, range: string, from?: string, to?: string) {
  if (range !== "this_month") params.set("range", range);
  if (range === "custom") {
    if (from) params.set("from", from);
    if (to) params.set("to", to);
  }
}
