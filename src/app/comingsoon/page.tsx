"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Check, ChevronDown, ScanLine, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { WaitlistForm } from "@/components/launch/waitlist-form";
import { PaperBackdrop } from "@/components/launch/paper-backdrop";
import { ReceiptCard } from "@/components/launch/receipt-card";
import { DashboardPreview } from "@/components/launch/dashboard-preview";
import {
  HouseholdGraphic,
  LendingGraphic,
} from "@/components/launch/feature-graphics";
import { LAUNCH, KEY_FEATURES } from "@/components/launch/launch-config";

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

/** Floating chips that orbit the hero receipt, Neura-style. */
function HeroChip({
  label,
  value,
  trend,
  className,
  delay,
}: {
  label: string;
  value: string;
  trend?: "up" | "down";
  className: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1, y: [0, -9, 0] }}
      transition={{
        opacity: { delay },
        scale: { delay },
        y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={
        "absolute z-20 rounded-2xl border border-border bg-card/95 px-3.5 py-2 shadow-xl shadow-black/10 backdrop-blur " +
        className
      }
    >
      <p className="text-[10px] font-semibold text-muted-foreground">{label}</p>
      <p
        className={
          "flex items-center gap-1 text-sm font-bold " +
          (trend === "up" ? "text-income" : trend === "down" ? "text-expense" : "")
        }
      >
        {trend === "up" ? "▲" : trend === "down" ? "▼" : null} {value}
      </p>
    </motion.div>
  );
}

/** A coin cursor that trails the pointer, replacing the system arrow. */
function CoinCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { damping: 25, stiffness: 320, mass: 0.4 });
  const springY = useSpring(y, { damping: 25, stiffness: 320, mass: 0.4 });

  useEffect(() => {
    const move = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-50 hidden h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-200/70 bg-gradient-to-br from-amber-300 to-amber-600 text-xs font-bold text-amber-950 shadow-lg shadow-amber-900/30 sm:flex"
      style={{ x: springX, y: springY }}
    >
      ₹
    </motion.div>
  );
}

export default function ComingSoonPage() {
  return (
    <div className="relative flex flex-1 flex-col bg-background text-foreground sm:cursor-none">
      <PaperBackdrop className="fixed inset-0" />
      <CoinCursor />

      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Logo size={32} className="scale-125 origin-left" />
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-semibold text-muted-foreground sm:inline">
            {LAUNCH.tagline}
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* ---------------- hero ---------------- */}
      <section className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 px-6 pt-6 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pt-12">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.09 }}
          className="flex flex-col items-start gap-6"
        >
          <motion.span
            variants={rise}
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold tracking-[0.14em] text-primary uppercase"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Coming Soon
          </motion.span>

          <motion.h1
            variants={rise}
            className="text-4xl leading-[1.06] font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Every rupee,
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-income bg-clip-text text-transparent">
              tracked and understood.
            </span>
          </motion.h1>

          <motion.p
            variants={rise}
            className="max-w-lg text-base leading-relaxed text-muted-foreground"
          >
            {LAUNCH.subhead}
          </motion.p>

          <motion.div variants={rise} className="w-full max-w-md">
            <WaitlistForm cta="Notify me at launch" />
            <p className="mt-2.5 text-xs text-muted-foreground">{LAUNCH.footnote}</p>
          </motion.div>

          <motion.div
            variants={rise}
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Built for Indian households
            </span>
            <span className="flex items-center gap-1.5">
              <ScanLine className="h-3.5 w-3.5 text-primary" />
              Bank &amp; UPI statements, read for you
            </span>
          </motion.div>
        </motion.div>

        {/* Hero visual: the receipt, tilted in 3D with chips orbiting it. */}
        <div className="relative flex justify-center [perspective:1400px]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
            className="relative w-full max-w-sm [transform:rotateX(6deg)_rotateY(-11deg)]"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <ReceiptCard showWaitlist={false} tilt={-1.5} />
            </motion.div>

            <HeroChip
              label="Auto-categorised"
              value="BigBasket → Groceries"
              className="-top-4 -left-10 hidden sm:block"
              delay={1}
            />
            <HeroChip
              label="Monthly income"
              value="₹1,84,000"
              trend="up"
              className="right-[-2.5rem] bottom-16 hidden sm:block"
              delay={1.3}
            />
          </motion.div>
        </div>
      </section>

      {/* ---------------- scroll cue ---------------- */}
      <motion.button
        type="button"
        onClick={() =>
          document.getElementById("key-features")?.scrollIntoView({ behavior: "smooth" })
        }
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="relative z-10 mx-auto flex flex-col items-center gap-1 pb-16 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <span>What we&apos;re building</span>
        <motion.span
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.button>

      {/* ---------------- key features ---------------- */}
      <section
        id="key-features"
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-24 lg:gap-32"
      >
        {KEY_FEATURES.map((feature, index) => {
          const flipped = index % 2 === 1;
          return (
            <div
              key={feature.title}
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-90px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={flipped ? "lg:order-2" : undefined}
              >
                <span className="font-mono text-xs font-bold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {feature.title}
                </h2>
                <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
                  {feature.blurb}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-primary/12"
                      >
                        <Check className="h-3 w-3 text-primary" />
                      </span>
                      <span className="text-sm font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-90px" }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                className={
                  "[perspective:1400px] " + (flipped ? "lg:order-1" : undefined)
                }
              >
                <div
                  className={
                    "transition-transform duration-500 hover:[transform:rotateX(0deg)_rotateY(0deg)] " +
                    (flipped
                      ? "[transform:rotateX(5deg)_rotateY(9deg)]"
                      : "[transform:rotateX(5deg)_rotateY(-9deg)]")
                  }
                >
                  {index === 0 ? <HouseholdGraphic /> : null}
                  {index === 1 ? <DashboardPreview showSplitChip={false} /> : null}
                  {index === 2 ? <LendingGraphic /> : null}
                </div>
              </motion.div>
            </div>
          );
        })}
      </section>

      {/* ---------------- closing call ---------------- */}
      <section className="relative z-10 mx-auto w-full max-w-2xl px-6 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="rounded-3xl border border-border bg-card/80 p-8 shadow-xl shadow-black/5 backdrop-blur"
        >
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Be there on day one.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {LAUNCH.subhead}
          </p>
          <div className="mx-auto mt-5 max-w-md">
            <WaitlistForm cta="Notify me at launch" />
            <p className="mt-2.5 text-xs text-muted-foreground">{LAUNCH.footnote}</p>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-4 pb-24 text-center text-xs text-muted-foreground">
        {LAUNCH.product} &middot; Built for one household first.
      </footer>
    </div>
  );
}
