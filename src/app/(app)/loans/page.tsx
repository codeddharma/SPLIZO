import { HandCoins } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function LoansPage() {
  return (
    <ComingSoon
      icon={HandCoins}
      title="Loans"
      description="Money lent to or borrowed from family/relatives — tracked separately from shared household spending."
      phase="Phase 10"
    />
  );
}
