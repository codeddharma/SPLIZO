import { AlertTriangle } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function ReviewQueuePage() {
  return (
    <ComingSoon
      icon={AlertTriangle}
      title="Review queue"
      description="Transactions the categorization engine couldn't confidently place — needs_review and unmapped — with inline recategorize."
      phase="Phase 7"
    />
  );
}
