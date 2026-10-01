import type { Metadata } from "next";

const PAGE_TITLE = "Household Finance, Actually Tracked";
const SOCIAL_TITLE = "Splizo · Household Finance, Actually Tracked";
const DESCRIPTION =
  "Splizo is launching soon — a household finance tracker for Indian families with bank & UPI statement import, shared account tracking, and a family lending ledger. Join the waitlist.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/comingsoon" },
  openGraph: {
    type: "website",
    siteName: "Splizo",
    locale: "en_IN",
    title: SOCIAL_TITLE,
    description: DESCRIPTION,
    url: "/comingsoon",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Splizo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function ComingSoonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
