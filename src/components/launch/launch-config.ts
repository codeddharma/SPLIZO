/** One place to edit the copy shown on the /comingsoon launch page. */

export const LAUNCH = {
  product: "Splizo",
  tagline: "Every rupee, tracked and understood.",
  headline: "Household finance,",
  headlineAccent: "finally settled.",
  subhead:
    "One shared ledger for the whole household. Import statements, split what's shared, watch the loans shrink — without a spreadsheet in sight.",
  eyebrow: "Private beta · India",
  footnote: "No card. No spam. One email when we open the doors.",
} as const;

/**
 * The three key features the launch page scrolls through, in order.
 *
 * `points` only restate claims already made by the blurb or shown in that
 * feature's graphic — they balance the text column against a tall card without
 * promising anything new.
 */
export const KEY_FEATURES = [
  {
    title: "Shared Household Tracking",
    blurb:
      "Sync every account, home, and family member — rented, owned, or parents' — all split and tracked in one place.",
    points: [
      "Rented, owned and parents' homes, side by side",
      "Every member's accounts in one view",
      "Shared costs split automatically, every month",
    ],
  },
  {
    title: "Smart Auto-Categorization",
    blurb:
      "Rule-based matching sorts your transactions instantly, and flags anything unsure for your review.",
    points: [
      "Vendors matched the moment a statement lands",
      "Anything unsure waits in a review queue",
      "Correct it once and the rule sticks",
    ],
  },
  {
    title: "Family Lending Ledger",
    blurb:
      "Keep a running tally of what's lent to or borrowed from relatives, tracked separately from household spending.",
    points: [
      "Who owes whom, at a glance",
      "Part-repayments tracked to the last rupee",
      "Never mixed into household spend",
    ],
  },
] as const;

/** Sample rows used by the preview mockups. Illustrative, not real data. */
export const SAMPLE_TRANSACTIONS = [
  { vendor: "BigBasket", category: "Groceries", amount: -3480, tone: "expense" },
  { vendor: "Salary — Sept", category: "Income", amount: 184000, tone: "income" },
  { vendor: "Tata Power", category: "Utilities", amount: -2210, tone: "expense" },
  { vendor: "HDFC Home Loan", category: "EMI", amount: -48500, tone: "expense" },
] as const;

/**
 * `color` follows the active theme and is what the DOM mockups use. `hex` is the
 * same swatch pinned to its dark-theme value, for WebGL, which cannot resolve a
 * CSS custom property.
 */
export const SPEND_MIX = [
  { label: "Housing", pct: 38, color: "var(--chart-1)", hex: "#FCD34D" },
  { label: "Food", pct: 22, color: "var(--chart-2)", hex: "#4ADE80" },
  { label: "Transport", pct: 16, color: "var(--chart-3)", hex: "#A78BFA" },
  { label: "Utilities", pct: 13, color: "var(--chart-4)", hex: "#94A3B8" },
  { label: "Other", pct: 11, color: "var(--chart-5)", hex: "#F87171" },
] as const;

export const rupees = (n: number) =>
  "₹" + Math.round(Math.abs(n)).toLocaleString("en-IN");
