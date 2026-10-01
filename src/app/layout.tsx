import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://splizo.codedharma.com";
const TAGLINE = "Every rupee, tracked and understood.";
const DESCRIPTION =
  "Splizo is a household finance tracker built for Indian families — one shared ledger for every account, both homes, and every member, with bank & UPI statement import and a running family lending ledger.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Splizo · Household Finance, Actually Tracked",
    template: "%s · Splizo",
  },
  description: DESCRIPTION,
  keywords: [
    "household finance tracker",
    "family budget app India",
    "shared expense tracker",
    "bank statement import",
    "UPI statement import",
    "family lending tracker",
    "split expenses household",
  ],
  applicationName: "Splizo",
  authors: [{ name: "Splizo" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Splizo",
    title: "Splizo · Household Finance, Actually Tracked",
    description: DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: TAGLINE }],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Splizo · Household Finance, Actually Tracked",
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/apple-icon.png",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Splizo",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description: DESCRIPTION,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Splizo",
  url: SITE_URL,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
