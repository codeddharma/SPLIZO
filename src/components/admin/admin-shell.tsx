"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MessageSquare, LogOut, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/lib/actions/auth-actions";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-dvh min-w-0 flex-col overflow-x-hidden">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo size={24} />
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary uppercase">
            <ShieldCheck className="h-3 w-3" />
            Admin
          </span>
        </Link>
        <div className="flex-1" />
        <ThemeToggle />
        <button
          type="button"
          onClick={() => logoutAction()}
          aria-label="Log out"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card p-3 sm:flex">
          <nav className="space-y-1">
            {NAV.map((entry) => {
              // "/admin" would otherwise prefix-match every sub-route (e.g.
              // "/admin/users"), so Overview needs an exact match instead.
              const active =
                entry.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === entry.href || pathname.startsWith(entry.href + "/");
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className={`flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <entry.icon className="h-4 w-4 shrink-0" />
                  {entry.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
