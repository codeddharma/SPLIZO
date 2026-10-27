"use client";

import Link from "next/link";
import { Bell, Menu, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileMenu } from "@/components/profile-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function Topbar({
  name,
  collapsed,
  onToggleCollapse,
  onOpenMobileMenu,
}: {
  name: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobileMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-4">
      <Link href="/" className="group mr-1 min-w-0">
        <Logo size={24} />
      </Link>

      <button
        onClick={onOpenMobileMenu}
        aria-label="Open menu"
        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      <Tooltip>
        <TooltipTrigger
          render={
            <button
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand menu" : "Collapse menu"}
              className="hidden rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:block"
            />
          }
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </TooltipTrigger>
        <TooltipContent side="bottom">{collapsed ? "Expand menu" : "Collapse menu"}</TooltipContent>
      </Tooltip>

      <div className="flex-1" />

      <ThemeToggle />
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href="/settings"
              aria-label="Settings"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            />
          }
        >
          <Settings className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent side="bottom">Settings</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label="Notifications (coming soon)"
              className="flex h-8 w-8 cursor-default items-center justify-center rounded-lg text-muted-foreground/60"
            />
          }
        >
          <Bell className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent side="bottom">Notifications (coming soon)</TooltipContent>
      </Tooltip>
      <ProfileMenu name={name} />
    </header>
  );
}
