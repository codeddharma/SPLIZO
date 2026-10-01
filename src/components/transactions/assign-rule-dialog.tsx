"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SubmitButton } from "@/components/ui/submit-button";
import { recategorizeTransactionAction } from "@/lib/actions/transaction-actions";
import { suggestMatchText } from "@/lib/categorization/suggest-match-text";

export function AssignRuleDialog({
  open,
  onOpenChange,
  transactionId,
  description,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  description: string;
  category: { id: string; name: string } | null;
}) {
  const [saveRule, setSaveRule] = useState(true);

  async function handleSubmit(formData: FormData) {
    await recategorizeTransactionAction(formData);
    onOpenChange(false);
  }

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Categorize as {category.name}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={transactionId} />
          <input type="hidden" name="categoryId" value={category.id} />
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <input
              type="checkbox"
              name="saveRule"
              value="1"
              checked={saveRule}
              onChange={(e) => setSaveRule(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            Always categorize transactions matching
          </label>
          <input
            type="text"
            name="matchText"
            defaultValue={suggestMatchText(description)}
            disabled={!saveRule}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground">
            this way, so future transactions like this get categorized automatically.
          </p>
          <DialogFooter>
            <SubmitButton className="rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
              Confirm
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
