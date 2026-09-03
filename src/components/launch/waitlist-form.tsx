"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { joinWaitlistAction } from "@/lib/actions/waitlist-actions";

type Status = "idle" | "sending" | "done" | "error";

export function WaitlistForm({
  tone = "light",
  accent = "amber",
  layout = "inline",
  cta = "Join the waitlist",
  className,
}: {
  tone?: "light" | "dark";
  /** Dark-tone accent only; the light tone always uses the brand primary. */
  accent?: "amber" | "emerald";
  layout?: "inline" | "stacked";
  cta?: string;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending" || status === "done") return;
    setStatus("sending");
    setError(null);
    const result = await joinWaitlistAction(null, new FormData(event.currentTarget));
    if (result && "error" in result) {
      setError(result.error);
      setStatus("error");
      return;
    }
    setStatus("done");
  }

  const dark = tone === "dark";
  const emerald = accent === "emerald";

  return (
    <div className={cn("w-full", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {status === "done" ? (
          <motion.p
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold",
              dark
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-income/30 bg-income/10 text-income",
            )}
          >
            <span aria-hidden="true">✓</span>
            You&apos;re on the list. We&apos;ll email {email || "you"} at launch.
          </motion.p>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "flex w-full gap-2",
              layout === "stacked" ? "flex-col" : "flex-col sm:flex-row",
            )}
          >
            <label className="sr-only" htmlFor={`waitlist-${tone}-${layout}`}>
              Email address
            </label>
            <input
              id={`waitlist-${tone}-${layout}`}
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@household.in"
              className={cn(
                "h-11 flex-1 rounded-xl border px-4 text-sm outline-none transition-colors",
                "focus-visible:ring-3",
                dark
                  ? emerald
                    ? "border-white/15 bg-white/5 text-slate-100 placeholder:text-slate-500 focus-visible:border-emerald-300/60 focus-visible:ring-emerald-300/20"
                    : "border-white/15 bg-white/5 text-slate-100 placeholder:text-slate-500 focus-visible:border-amber-300/60 focus-visible:ring-amber-300/20"
                  : "border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20",
              )}
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className={cn(
                "h-11 shrink-0 rounded-xl px-5 text-sm font-semibold transition-all",
                "active:translate-y-px disabled:opacity-60",
                dark
                  ? emerald
                    ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                    : "bg-amber-300 text-slate-950 hover:bg-amber-200"
                  : "bg-primary text-primary-foreground hover:bg-primary-hover",
              )}
            >
              {status === "sending" ? "Adding…" : cta}
            </button>
            {status === "error" && error && (
              <p
                className={cn(
                  "text-xs font-medium",
                  layout === "stacked" ? "" : "sm:basis-full",
                  dark ? "text-red-300" : "text-expense",
                )}
              >
                {error}
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
