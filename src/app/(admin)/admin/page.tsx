import { prisma } from "@/lib/prisma";
import { Users, Home, MessageSquare } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Overview",
  robots: { index: false, follow: false },
};

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const [households, users, openFeedback] = await Promise.all([
    prisma.household.count(),
    prisma.user.count(),
    prisma.feedback.count({ where: { status: "open" } }),
  ]);

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6">
      <h1 className="text-xl font-bold">Overview</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Households" value={households} icon={Home} />
        <StatCard label="Users" value={users} icon={Users} />
        <StatCard label="Open feedback" value={openFeedback} icon={MessageSquare} />
      </div>
    </div>
  );
}
