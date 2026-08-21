import { Home as HomeIcon } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function HomesPage() {
  return (
    <ComingSoon
      icon={HomeIcon}
      title="Homes"
      description="Rented, owned, parents' — a fully custom list of homes you can tag any transaction against."
      phase="Phase 4"
    />
  );
}
