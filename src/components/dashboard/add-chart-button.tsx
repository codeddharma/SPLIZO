"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartBuilderDialog } from "./chart-builder-dialog";

export function AddChartButton({ defaultRange }: { defaultRange: { rangeKey: string; from?: string; to?: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add chart
      </Button>
      {open && (
        <ChartBuilderDialog
          open={open}
          onOpenChange={setOpen}
          mode="create"
          defaults={null}
          defaultRange={defaultRange}
        />
      )}
    </>
  );
}
