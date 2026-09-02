"use client";

import { motion } from "motion/react";
import { TrendingUp, Wallet } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

function DashboardScreen() {
  return (
    <div className="flex h-full w-full flex-col gap-2.5 bg-[#12141c] p-3 text-white">
      <div className="flex items-center justify-between">
        <div className="h-2 w-16 rounded-full bg-white/20" />
        <div className="h-5 w-5 rounded-full bg-primary/40" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-income/15 p-2">
          <TrendingUp className="mb-1 h-3 w-3 text-income" />
          <div className="h-1.5 w-8 rounded-full bg-income/40" />
          <div className="mt-1 h-2.5 w-10 rounded-full bg-income/70" />
        </div>
        <div className="rounded-lg bg-expense/15 p-2">
          <Wallet className="mb-1 h-3 w-3 text-expense" />
          <div className="h-1.5 w-8 rounded-full bg-expense/40" />
          <div className="mt-1 h-2.5 w-10 rounded-full bg-expense/70" />
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-white/5 p-2">
        <div
          className="h-10 w-10 shrink-0 rounded-full"
          style={{
            background:
              "conic-gradient(var(--color-primary) 0deg 140deg, var(--color-income) 140deg 230deg, var(--color-warning) 230deg 300deg, rgba(255,255,255,0.15) 300deg 360deg)",
          }}
        />
        <div className="flex-1 space-y-1">
          <div className="h-1.5 w-full rounded-full bg-white/15" />
          <div className="h-1.5 w-2/3 rounded-full bg-white/15" />
        </div>
      </div>
      <div className="flex flex-1 items-end gap-1.5 rounded-lg bg-white/5 p-2 pb-3">
        {[40, 65, 35, 80, 55, 90, 50].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-primary to-income"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="space-y-1.5">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center justify-between rounded-md bg-white/5 px-2 py-1.5">
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded bg-primary/30" />
              <div className="h-1.5 w-10 rounded-full bg-white/20" />
            </div>
            <div className="h-1.5 w-6 rounded-full bg-white/20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Phone({
  className,
  rotate = 0,
  scale = 1,
}: {
  className?: string;
  rotate?: number;
  scale?: number;
}) {
  return (
    <div
      className={`absolute rounded-[2.2rem] border-[6px] border-neutral-900 bg-neutral-900 shadow-2xl ${className}`}
      style={{ transform: `translateX(-50%) rotate(${rotate}deg) scale(${scale})` }}
    >
      <div className="absolute top-0 left-1/2 z-10 h-4 w-20 -translate-x-1/2 rounded-b-xl bg-neutral-900" />
      <div className="h-[380px] w-[190px] overflow-hidden rounded-[1.8rem]">
        <DashboardScreen />
      </div>
    </div>
  );
}

export default function ComingSoonPage() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <div className="flex items-center justify-between px-6 py-4">
        <Logo />
        <ThemeToggle />
      </div>

      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl leading-[1.15] font-bold tracking-tight sm:text-5xl">
            Household Finance
            <br />
            <span className="bg-gradient-to-r from-primary to-income bg-clip-text text-transparent">
              Coming Soon
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mt-8 h-[320px] w-full max-w-lg shrink"
        >
          <Phone className="top-6 left-[28%]" rotate={-12} scale={0.62} />
          <Phone className="top-6 left-[72%]" rotate={12} scale={0.62} />
          <Phone className="top-0 left-1/2 z-10" rotate={0} scale={0.74} />
        </motion.div>
      </main>
    </div>
  );
}
