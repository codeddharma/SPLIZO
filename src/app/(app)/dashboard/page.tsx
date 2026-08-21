import { LayoutDashboard } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function DashboardPage() {
  return (
    <ComingSoon
      icon={LayoutDashboard}
      title="Dashboard"
      description="Headline income/expense cards, category breakdown, home & account split, trends — built once real transaction data exists."
      phase="Phase 9"
    />
  );
}
