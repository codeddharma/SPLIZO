import { ListChecks } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function TransactionsPage() {
  return (
    <ComingSoon
      icon={ListChecks}
      title="Transactions"
      description="Manual entry, filtering by account/category/home/person, and the rule-based auto-categorization engine."
      phase="Phase 5"
    />
  );
}
