import { Wallet } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function AccountsPage() {
  return (
    <ComingSoon
      icon={Wallet}
      title="Accounts"
      description="Every bank account, credit card, and wallet you use — added once, tagged on every transaction."
      phase="Phase 4"
    />
  );
}
