"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ConfirmActionDialog } from "@/components/reference-data/confirm-action-dialog";
import { ChartBuilderDialog, type SavedChartDTO } from "./chart-builder-dialog";
import { CategoryDonut } from "./category-donut";
import { BarBreakdown } from "./bar-breakdown";
import { SingleSeriesLine } from "./single-series-line";
import { deleteChartAction } from "@/lib/actions/chart-actions";

export function CustomChartCard({
  chart,
  data,
}: {
  chart: SavedChartDTO;
  data: { name: string; value: number }[];
}) {
  const [modal, setModal] = useState<"edit" | "delete" | null>(null);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">{chart.title}</h2>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label={`Actions for ${chart.title}`}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              />
            }
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setModal("edit")}>Edit</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setModal("delete")}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {chart.chartType === "donut" && <CategoryDonut data={data} />}
      {chart.chartType === "bar" && <BarBreakdown data={data} />}
      {chart.chartType === "line" && <SingleSeriesLine data={data} />}

      {modal === "edit" && (
        <ChartBuilderDialog
          open
          onOpenChange={(o) => setModal(o ? "edit" : null)}
          mode="edit"
          defaults={chart}
          defaultRange={{ rangeKey: chart.rangeKey, from: chart.rangeFrom ?? undefined, to: chart.rangeTo ?? undefined }}
        />
      )}

      {modal === "delete" && (
        <ConfirmActionDialog
          open
          onOpenChange={(o) => setModal(o ? "delete" : null)}
          title="Delete chart?"
          description={`"${chart.title}" will be removed from your dashboard.`}
          confirmLabel="Delete"
          action={deleteChartAction}
          hiddenFields={{ id: chart.id }}
        />
      )}
    </div>
  );
}
