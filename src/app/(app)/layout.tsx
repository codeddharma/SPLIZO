import { AppSidebar } from "@/components/app-sidebar";
import { requireSession } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="flex flex-1">
      <AppSidebar user={{ name: session.user.name ?? "", email: session.user.email ?? "" }} />
      <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
    </div>
  );
}
