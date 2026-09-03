"use client";

import { motion } from "motion/react";
import { AnimatedNumber } from "@/components/animated-number";
import {
  SAMPLE_TRANSACTIONS,
  SPEND_MIX,
  rupees,
} from "@/components/launch/launch-config";
import { cn } from "@/lib/utils";

/**
 * The product preview card: month balance, spend mix, and auto-categorised rows.
 * Used as the Ledger template's hero visual and as the Launch template's
 * auto-categorisation illustration.
 *
 * Figures are illustrative, not real household data.
 */
export function DashboardPreview({
  showSplitChip = true,
  className,
}: {
  showSplitChip?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="rounded-3xl border border-border bg-card p-5 shadow-2xl shadow-black/10">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              Household &middot; September
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums">
              <AnimatedNumber value={129810} format={(n) => rupees(n)} />
            </p>
          </div>
          <span className="rounded-full bg-income/10 px-2.5 py-1 text-xs font-semibold text-income">
            &#9650; 12% saved
          </span>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Where it went</p>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
            {SPEND_MIX.map((slice, index) => (
              <motion.span
                key={slice.label}
                initial={{ width: 0 }}
                whileInView={{ width: slice.pct + "%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1, ease: "easeOut" }}
                style={{ background: slice.color }}
              />
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
            {SPEND_MIX.map((slice) => (
              <span
                key={slice.label}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground"
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full"
                  style={{ background: slice.color }}
                />
                {slice.label} {slice.pct}%
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-1">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            Latest, auto-categorised
          </p>
          {SAMPLE_TRANSACTIONS.map((row, index) => (
            <motion.div
              key={row.vendor}
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 + index * 0.12 }}
              className="flex items-center justify-between rounded-xl px-2.5 py-2 transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-[11px] font-bold">
                  {row.vendor.slice(0, 2).toUpperCase()}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{row.vendor}</p>
                  <p className="text-[11px] text-muted-foreground">{row.category}</p>
                </div>
              </div>
              <span
                className={
                  "text-sm font-bold tabular-nums " +
                  (row.tone === "income" ? "text-income" : "text-foreground")
                }
              >
                {row.amount > 0 ? "+" : "−"}
                {rupees(row.amount)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {showSplitChip ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { delay: 1.1 },
            scale: { delay: 1.1 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-border bg-card px-4 py-2.5 shadow-xl shadow-black/10 sm:block"
        >
          <p className="text-[11px] font-semibold text-muted-foreground">Split 3 ways</p>
          <p className="text-sm font-bold">Groceries &middot; {rupees(1160)} each</p>
        </motion.div>
      ) : null}
    </div>
  );
}
