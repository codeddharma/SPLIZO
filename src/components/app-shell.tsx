"use client";

import { useState, type ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";

export function AppShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: ReactNode;
}) {
  const { collapsed, toggle } = useSidebarCollapsed();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh min-w-0 flex-col overflow-x-hidden">
      <Topbar
        name={user.name}
        collapsed={collapsed}
        onToggleCollapse={toggle}
        onOpenMobileMenu={() => setMobileOpen(true)}
      />
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <AppSidebar
          user={user}
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
