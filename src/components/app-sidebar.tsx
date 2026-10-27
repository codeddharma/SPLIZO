"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Upload,
  Wallet,
  Tags,
  Users,
  HandCoins,
  Settings,
  X,
  LogOut,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { logoutAction } from "@/lib/actions/auth-actions";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ListChecks },
  { href: "/import", label: "Import", icon: Upload },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/household", label: "Household", icon: Users },
  { href: "/loans", label: "Loans", icon: HandCoins },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({
  user,
  collapsed,
  mobileOpen,
  onCloseMobile,
}: {
  user: { name: string; email: string };
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 top-14 z-40 bg-black/50 sm:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar-width fixed inset-y-0 top-14 left-0 z-50 flex shrink-0 flex-col border-r border-border bg-card transition-transform duration-200 sm:static sm:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-end border-b border-border px-3 py-2 sm:hidden">
          <button
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Main navigation
            </div>
          )}
          {NAV.map((entry) => {
            const active =
              pathname === entry.href || pathname.startsWith(entry.href + "/");
            const link = (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2 text-sm font-semibold transition-colors ${
                  collapsed ? "justify-center" : ""
                } ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <entry.icon className="h-4 w-4 shrink-0" />
                {!collapsed && entry.label}
              </Link>
            );
            if (!collapsed) return link;
            return (
              <Tooltip key={entry.href}>
                <TooltipTrigger render={link} />
                <TooltipContent side="right">{entry.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary" />
                }
              >
                {initials(user.name)}
              </TooltipTrigger>
              <TooltipContent side="right">{user.name}</TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {initials(user.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{user.name}</div>
                <div className="truncate text-xs text-muted-foreground">{user.email}</div>
              </div>
              <button
                type="button"
                onClick={() => logoutAction()}
                aria-label="Log out"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
