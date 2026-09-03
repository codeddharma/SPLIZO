"use client";

import { motion } from "motion/react";
import { WaitlistForm } from "@/components/launch/waitlist-form";
import { LAUNCH } from "@/components/launch/launch-config";
import { cn } from "@/lib/utils";

/**
 * The paper receipt visual. Used whole in the Receipt template, and without its
 * waitlist as the hero visual in the Launch template.
 *
 * Always paper-on-ink regardless of theme — a receipt is a receipt.
 */

export const PAPER = "#FDFBF6";
export const INK = "#1C1917";

/** Line items read as a roadmap priced in progress, not rupees. */
const ITEMS = [
  { label: "Shared household ledger", value: "READY" },
  { label: "Bank & UPI statement import", value: "READY" },
  { label: "Loan & EMI tracker", value: "READY" },
  { label: "Self-learning categories", value: "BETA" },
] as const;

/** Fixed widths — a random barcode would break hydration. */
const BARCODE = [
  3, 1, 2, 1, 1, 4, 1, 2, 3, 1, 1, 2, 4, 1, 3, 1, 2, 1, 1, 3, 2, 1, 4, 1, 2, 3, 1, 1, 2, 1,
];

function zigzag(teeth = 40, width = 200, height = 6) {
  const step = width / teeth;
  let d = `M0 ${height}`;
  for (let i = 0; i < teeth; i += 1) {
    d += ` L${(i + 0.5) * step} 0 L${(i + 1) * step} ${height}`;
  }
  return d + " Z";
}

function TornEdge({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 6"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={"block h-2 w-full " + (flip ? "rotate-180" : "")}
    >
      <path d={zigzag()} fill={PAPER} />
    </svg>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 text-[13px]">
      <span className="whitespace-nowrap uppercase">{label}</span>
      <span
        aria-hidden="true"
        className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-current opacity-40"
      />
      <span className="whitespace-nowrap font-bold">{value}</span>
    </div>
  );
}

export function ReceiptCard({
  showWaitlist = true,
  tilt = -1.5,
  className,
}: {
  showWaitlist?: boolean;
  tilt?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: tilt }}
      animate={{ opacity: 1, y: 0, rotate: tilt }}
      whileHover={{ rotate: 0, y: -4 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      style={{ color: INK }}
      className={cn(
        "w-full max-w-md drop-shadow-[0_18px_35px_rgba(60,40,15,0.22)]",
        className,
      )}
    >
      <TornEdge />
      <div className="px-7 py-6 font-mono" style={{ background: PAPER }}>
        <div className="text-center">
          <p className="text-xl font-extrabold tracking-[0.3em]">SPLIZO</p>
          <p className="mt-1 text-[11px] tracking-[0.18em] uppercase opacity-60">
            Household Finance Co.
          </p>
          <p className="mt-0.5 text-[11px] opacity-60">{LAUNCH.tagline}</p>
        </div>

        <div className="my-4 border-t border-dashed border-current opacity-30" />

        <div className="space-y-1 text-[11px] uppercase opacity-70">
          <div className="flex justify-between">
            <span>Order</span>
            <span>#000001</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span>Preparing</span>
          </div>
          <div className="flex justify-between">
            <span>Served by</span>
            <span>The household</span>
          </div>
        </div>

        <div className="my-4 border-t border-dashed border-current opacity-30" />

        <div className="space-y-2">
          {ITEMS.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + index * 0.09 }}
            >
              <Row label={item.label} value={item.value} />
            </motion.div>
          ))}
        </div>

        <div className="my-4 border-t border-dashed border-current opacity-30" />

        <div className="space-y-1.5">
          <Row label="Spreadsheets required" value="0" />
          <Row label="Accounts merged" value="0" />
          <div className="flex items-baseline justify-between pt-2 text-sm font-extrabold uppercase">
            <span>Total</span>
            <span>One calm household</span>
          </div>
        </div>

        <div className="my-4 border-t border-dashed border-current opacity-30" />

        {showWaitlist ? (
          <>
            <p className="mb-2 text-center text-[11px] tracking-[0.18em] uppercase opacity-70">
              Reserve your copy
            </p>
            <WaitlistForm layout="stacked" cta="Add me to the queue" />
            <p className="mt-2 text-center text-[10px] uppercase opacity-50">
              {LAUNCH.footnote}
            </p>
          </>
        ) : null}

        <div className="mt-6 flex h-12 items-end justify-center gap-[2px]">
          {BARCODE.map((width, index) => (
            <span
              key={index}
              className="h-full"
              style={{ width: width + "px", background: INK, opacity: index % 3 ? 0.9 : 0.65 }}
            />
          ))}
        </div>
        <p className="mt-2 text-center text-[10px] tracking-[0.3em] uppercase opacity-60">
          Launching Nov 2026
        </p>
      </div>
      <TornEdge flip />
    </motion.div>
  );
}
