import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="text-lg font-semibold">Splizo</span>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Household finance, actually tracked.
          </h1>
          <p className="max-w-md text-muted-foreground">
            Scaffold is up. Palette check below.
          </p>
        </div>
        <div className="grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">Income</div>
            <div className="text-xl font-semibold text-income">+₹42,000</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">Expense</div>
            <div className="text-xl font-semibold text-expense">-₹18,500</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">Needs review</div>
            <div className="text-xl font-semibold text-warning">3</div>
          </div>
          <div className="rounded-lg border border-border bg-primary p-4 text-primary-foreground">
            <div className="text-xs opacity-80">Accent</div>
            <div className="text-xl font-semibold">Primary</div>
          </div>
        </div>
      </main>
    </div>
  );
}
