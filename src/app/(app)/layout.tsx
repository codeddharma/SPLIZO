import { AppShell } from "@/components/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { requireSession } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <TooltipProvider>
      <AppShell user={{ name: session.user.name ?? "", email: session.user.email ?? "" }}>
        {children}
      </AppShell>
    </TooltipProvider>
  );
}
