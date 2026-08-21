import { Users } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function PeoplePage() {
  return (
    <ComingSoon
      icon={Users}
      title="People"
      description="Person tags — you, your spouse, joint, even 'Mom' or 'Dad' — decoupled from login accounts."
      phase="Phase 4"
    />
  );
}
