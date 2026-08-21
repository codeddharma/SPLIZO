"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  AlertTriangle,
  Upload,
  Wallet,
  Tags,
  Sparkles,
  Home as HomeIcon,
  Users,
  HandCoins,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ListChecks },
  { href: "/transactions/review", label: "Review queue", icon: AlertTriangle },
  { href: "/import", label: "Import", icon: Upload },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/vendor-rules", label: "Vendor rules", icon: Sparkles },
  { href: "/homes", label: "Homes", icon: HomeIcon },
  { href: "/people", label: "People", icon: Users },
  { href: "/loans", label: "Loans", icon: HandCoins },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-4">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((entry) => {
          const active =
            entry.href === "/transactions"
              ? pathname === "/transactions"
              : pathname === entry.href || pathname.startsWith(entry.href + "/");
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <entry.icon className="h-4 w-4 shrink-0" />
              {entry.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <span className="text-xs font-semibold text-muted-foreground">Theme</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
