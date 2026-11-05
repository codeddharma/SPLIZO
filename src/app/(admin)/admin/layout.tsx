import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware already redirects non-admins away from /admin; this re-checks
  // server-side in case a page here is ever reached a different way.
  await requireAdmin();

  return <AdminShell>{children}</AdminShell>;
}
