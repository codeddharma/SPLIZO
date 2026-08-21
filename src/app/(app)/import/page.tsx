import { Upload } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function ImportPage() {
  return (
    <ComingSoon
      icon={Upload}
      title="Import"
      description="Upload a bank/card CSV export, preview parsed rows with a live categorization preview, and commit the batch."
      phase="Phase 6"
    />
  );
}
