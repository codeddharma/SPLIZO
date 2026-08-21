import { Sparkles } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function VendorRulesPage() {
  return (
    <ComingSoon
      icon={Sparkles}
      title="Vendor rules"
      description="Rules that map a vendor's description text to a category — defined manually or learned automatically from corrections."
      phase="Phase 4 / 8"
    />
  );
}
