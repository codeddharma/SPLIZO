import { AppSidebar } from "@/components/app-sidebar";
import { requireSession } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="flex h-dvh min-w-0 flex-col overflow-x-hidden">
      <AppSidebar user={{ name: session.user.name ?? "", email: session.user.email ?? "" }} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto sm:ml-64">
        {children}
      </div>
    </div>
  );
}
