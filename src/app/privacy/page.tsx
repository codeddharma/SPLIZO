import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Privacy Policy · Splizo",
};

const EFFECTIVE_DATE = "16 September 2026";

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-6">
        <Logo size={32} />
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-16">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-1 text-sm text-muted-foreground">Effective {EFFECTIVE_DATE}</p>

          <p className="mt-6 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-muted-foreground">
            This is a working draft written for Splizo's early private beta. It hasn't been
            reviewed by a lawyer yet and should be before Splizo is used by anyone outside the
            builder's own household.
          </p>

          <div className="mt-6 flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="text-base font-semibold text-foreground">
                1. What we collect
              </h2>
              <p className="mt-2">
                Account details: your name, email, and password (stored as a salted hash, never
                in plain text). Household data: everything you or your household enters —
                transactions, categories, homes/places, category rules, and family lending
                records. Imported statement data: when you upload a bank or Google Pay
                statement (CSV or PDF), the transaction rows extracted from it are stored the
                same way manually entered transactions are. Waitlist emails: if you join the
                pre-launch waitlist before signing up, just the email address you provide.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                2. How we use it
              </h2>
              <p className="mt-2">
                Solely to run Splizo for you: authenticating you, showing your household's
                transactions and dashboards, running the rule-based auto-categorisation you
                configure, and — for the waitlist — emailing you when Splizo launches publicly.
                We do not sell data, use it for advertising, or share it with third parties for
                marketing.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                3. Where it's stored
              </h2>
              <p className="mt-2">
                Application data lives in a managed PostgreSQL database (Neon, hosted in the
                Singapore region). Uploaded statement files are parsed on the server at upload
                time to extract transactions; the original file itself is not retained after
                parsing — only the resulting transaction rows are stored.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                4. Cookies & local storage
              </h2>
              <p className="mt-2">
                Splizo uses your browser's local storage to remember your light/dark theme
                preference and your login session. It does not use third-party advertising or
                tracking cookies.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                5. Who can see your data
              </h2>
              <p className="mt-2">
                Everyone linked to your household can see the household's shared transactions,
                categories, and lending records — that's how a household tracker works. No one
                outside your household can see your data through the app itself.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                6. Retention & deletion
              </h2>
              <p className="mt-2">
                Data is kept for as long as your account exists. If a household member's access
                is removed, their login is disabled but the transaction history they were
                tagged on remains part of the household's records. To request deletion of your
                account or household's data entirely, contact the household admin who invited
                you, or the email address Splizo's communications come from.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">7. Your rights</h2>
              <p className="mt-2">
                You can access, correct, or request deletion of your personal data at any time
                by contacting us as above. This is consistent with the rights described under
                India's Digital Personal Data Protection Act, 2023.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                8. Changes to this policy
              </h2>
              <p className="mt-2">
                As Splizo evolves, this policy may change — material changes will be reflected
                here with an updated effective date.
              </p>
            </section>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          See also the{" "}
          <Link href="/terms" className="font-semibold text-foreground underline underline-offset-2">
            Terms &amp; Conditions
          </Link>
          .
        </p>
      </main>

      <footer className="mx-auto w-full max-w-3xl px-6 pb-10 text-center text-xs text-muted-foreground">
        Splizo · Built for one household first.
      </footer>
    </div>
  );
}
