import { Tags } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function CategoriesPage() {
  return (
    <ComingSoon
      icon={Tags}
      title="Categories"
      description="Default categories are locked (income/expense), plus any custom ones you add — editable and deletable."
      phase="Phase 4"
    />
  );
}
