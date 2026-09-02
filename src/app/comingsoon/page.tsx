"use client";

import { motion } from "motion/react";
import { Wallet, Sparkles, LayoutDashboard, HandCoins } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const steps = [
  {
    title: "Add every account & card",
    description: "Bank, credit card, wallet — one home for all of it, tagged by who and where.",
    icon: Wallet,
  },
  {
    title: "Auto-categorized by rule",
    description: "Rule-based matching sorts transactions instantly, flags anything unsure for review.",
    icon: Sparkles,
  },
  {
    title: "One dashboard, every home",
    description: "Rented, owned, parents' — see spend split by home, by person, by account.",
    icon: LayoutDashboard,
  },
];

export default function ComingSoonPage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-income/10 blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <header className="relative z-10 flex items-center justify-between border-b border-border/60 px-6 py-4 backdrop-blur-sm">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center px-6 py-24">
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="flex flex-col items-center gap-5 text-center"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Launching soon
          </motion.span>

          <motion.h1
            variants={item}
            className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            Household finance,{" "}
            <span className="bg-gradient-to-r from-primary to-income bg-clip-text text-transparent">
              actually tracked.
            </span>
          </motion.h1>

          <motion.p variants={item} className="max-w-lg text-lg text-muted-foreground">
            Splizo is almost ready. Every account, every card, every home — one place that
            knows where the money went.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={container}
          className="mt-20 grid w-full max-w-4xl gap-6 sm:grid-cols-3"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              variants={item}
              whileHover={{ scale: 1.03 }}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {i + 1}
                </div>
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-20 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
        >
          <HandCoins className="h-4 w-4 text-primary" />
          Plus a running ledger for what family owes — or is owed.
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-border/60 px-6 py-6 text-center text-xs text-muted-foreground">
        Splizo · Built for one household first.
      </footer>
    </div>
  );
}
