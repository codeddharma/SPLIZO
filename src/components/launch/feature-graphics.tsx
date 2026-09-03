"use client";

import { motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, Building2, Home, Users } from "lucide-react";
import { rupees } from "@/components/launch/launch-config";
import { cn } from "@/lib/utils";

/**
 * Illustrations for the Launch template's key features. Both are DOM, not
 * images: they inherit the theme, stay crisp at any density, and cost nothing
 * to ship. Figures are illustrative, not real household data.
 *
 * Both are laid out as labelled blocks rather than diagrams — a reader should
 * not have to work out what they are looking at.
 */

const reveal = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function CardShell({
  title,
  chip,
  children,
  className,
}: {
  title: string;
  chip: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ staggerChildren: 0.08 }}
      className={cn(
        "rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-black/10",
        className,
      )}
    >
      <motion.div variants={reveal} className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-bold">{title}</p>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
          {chip}
        </span>
      </motion.div>
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
      {children}
    </p>
  );
}

/** 01 — Shared Household Tracking: the people, then the homes, then one ledger. */
export function HouseholdGraphic({ className }: { className?: string }) {
  const people = [
    { name: "Hardi", initials: "H", accounts: "2 accounts" },
    { name: "Neel", initials: "N", accounts: "3 accounts" },
    { name: "Aai", initials: "A", accounts: "2 accounts" },
  ];

  const homes = [
    { icon: Home, name: "Rented flat", place: "Mumbai", tag: "Rented" },
    { icon: Building2, name: "Own house", place: "Surat", tag: "Owned" },
    { icon: Users, name: "Parents' home", place: "Baroda", tag: "Parents'" },
  ];

  return (
    <CardShell title="Your household" chip="3 people · 3 homes" className={className}>
      <motion.div variants={reveal}>
        <SectionLabel>People</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {people.map((person) => (
            <div
              key={person.name}
              className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-background/60 p-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {person.initials}
              </span>
              <span className="text-[13px] font-semibold">{person.name}</span>
              <span className="text-[10px] text-muted-foreground">{person.accounts}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={reveal} className="mt-4">
        <SectionLabel>Homes</SectionLabel>
        <div className="space-y-2">
          {homes.map((home) => (
            <div
              key={home.name}
              className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-3 py-2.5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <home.icon className="h-4 w-4 text-primary" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold">{home.name}</span>
                <span className="block text-[11px] text-muted-foreground">{home.place}</span>
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {home.tag}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.p
        variants={reveal}
        className="mt-4 rounded-xl bg-primary/10 px-3 py-2.5 text-center text-[11px] font-semibold text-primary"
      >
        All of it lands in one shared ledger, split every month
      </motion.p>
    </CardShell>
  );
}

/** 03 — Family Lending Ledger: who owes whom, and what is still outstanding. */
export function LendingGraphic({ className }: { className?: string }) {
  // Counterparties are relatives outside the household — the people in
  // HouseholdGraphic must never appear here, or the "not household spend"
  // promise on this card contradicts itself.
  const owedToYou = [
    { name: "Kaka", relation: "Uncle", lent: 25000, outstanding: 15000 },
    { name: "Mama", relation: "Maternal uncle", lent: 12000, outstanding: 10200 },
  ];
  const youOwe = [{ name: "Meera", relation: "Cousin", lent: 8000, outstanding: 2000 }];

  const net =
    owedToYou.reduce((sum, row) => sum + row.outstanding, 0) -
    youOwe.reduce((sum, row) => sum + row.outstanding, 0);

  const Loan = ({
    row,
    incoming,
  }: {
    row: { name: string; relation: string; lent: number; outstanding: number };
    incoming: boolean;
  }) => {
    const settled = 1 - row.outstanding / row.lent;
    return (
      <div className="rounded-2xl border border-border bg-background/60 px-3 py-2.5">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              incoming ? "bg-income/15 text-income" : "bg-expense/15 text-expense",
            )}
          >
            {incoming ? (
              <ArrowDownLeft className="h-4 w-4" />
            ) : (
              <ArrowUpRight className="h-4 w-4" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-[13px] font-semibold">
                {row.name}{" "}
                <span className="text-[11px] font-medium text-muted-foreground">
                  {row.relation}
                </span>
              </span>
              <span
                className={cn(
                  "text-[13px] font-bold tabular-nums",
                  incoming ? "text-income" : "text-expense",
                )}
              >
                {rupees(row.outstanding)}
              </span>
            </span>
            <span className="mt-1 block text-[11px] text-muted-foreground">
              still {incoming ? "to come back" : "to repay"} &middot; of{" "}
              {rupees(row.lent)}
            </span>
          </span>
        </div>
        <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.span
            className={cn(
              "block h-full rounded-full",
              incoming ? "bg-income" : "bg-expense",
            )}
            initial={{ width: 0 }}
            whileInView={{ width: settled * 100 + "%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </span>
      </div>
    );
  };

  return (
    <CardShell
      title="Family lending"
      chip="Never counted as household spend"
      className={className}
    >
      <motion.div variants={reveal}>
        <SectionLabel>They owe you</SectionLabel>
        <div className="space-y-2">
          {owedToYou.map((row) => (
            <Loan key={row.name} row={row} incoming />
          ))}
        </div>
      </motion.div>

      <motion.div variants={reveal} className="mt-4">
        <SectionLabel>You owe them</SectionLabel>
        <div className="space-y-2">
          {youOwe.map((row) => (
            <Loan key={row.name} row={row} incoming={false} />
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={reveal}
        className="mt-4 flex items-baseline justify-between rounded-xl bg-income/10 px-3 py-2.5"
      >
        <span className="text-xs font-semibold text-muted-foreground">
          Net, across the family
        </span>
        <span className="text-sm font-bold text-income tabular-nums">
          You&apos;re owed {rupees(net)}
        </span>
      </motion.div>
    </CardShell>
  );
}
