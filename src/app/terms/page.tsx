import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Terms & Conditions · Splizo",
};

const EFFECTIVE_DATE = "16 September 2026";

export default function TermsPage() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-6">
        <Logo size={32} />
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-16">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">Terms & Conditions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Effective {EFFECTIVE_DATE}</p>

          <p className="mt-6 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-muted-foreground">
            This is a working draft written for Splizo's early private beta. It hasn't been
            reviewed by a lawyer yet and should be before Splizo is used by anyone outside the
            builder's own household.
          </p>

          <div className="mt-6 flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="text-base font-semibold text-foreground">1. What Splizo is</h2>
              <p className="mt-2">
                Splizo is a household finance tracker: it lets you and the people in your
                household record transactions (manually, via CSV, or via bank/UPI statement
                PDF import), organise them by category, home/place, and who spent them, and
                track money lent to or borrowed from family members. Splizo is a record-keeping
                tool, not a bank, payment processor, or investment platform — it never moves
                money on your behalf.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">2. Your account</h2>
              <p className="mt-2">
                An account is created either by signing up directly or by accepting an invite
                from an existing household member. You're responsible for keeping your password
                confidential and for anything done under your account. One person creates a
                household; other members join it by invite only.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                3. Not financial advice
              </h2>
              <p className="mt-2">
                Splizo helps you see and organise your own financial data. Nothing it displays —
                categorisations, spending summaries, or breakdowns — is financial, tax, or
                investment advice. Splizo is not a licensed financial advisor, and no output from
                the app should be treated as professional guidance.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                4. Data you provide
              </h2>
              <p className="mt-2">
                You may upload bank or UPI statement files (CSV or PDF) so Splizo can extract
                transactions from them. You confirm you have the right to upload this data
                (e.g. it's your own account statement, or a household member's with their
                consent). Statement parsing happens on Splizo's server; the extracted
                transaction data is stored so it can be shown back to you — see the Privacy
                Policy for how it's used and retained.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                5. Household & shared data
              </h2>
              <p className="mt-2">
                Data you and other members of your household enter is visible to everyone in
                that household — that's the point of a shared tracker. Removing a member's
                account access unlinks their login but keeps the transaction history they were
                tagged on, so the household's records stay intact.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">6. Acceptable use</h2>
              <p className="mt-2">
                Don't use Splizo to upload data you don't have the right to, attempt to access
                another household's data, or use the service in a way that disrupts it for
                others.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                7. Availability & changes
              </h2>
              <p className="mt-2">
                Splizo is under active development and offered as-is, without uptime guarantees,
                during this private beta. Features, and these terms, may change as the product
                evolves — material changes will be reflected here with an updated effective
                date.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">8. Contact</h2>
              <p className="mt-2">
                Questions about these terms can be sent to the household admin who invited you,
                or to the email address Splizo's waitlist/signup communications come from.
              </p>
            </section>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          See also the{" "}
          <Link href="/privacy" className="font-semibold text-foreground underline underline-offset-2">
            Privacy Policy
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
