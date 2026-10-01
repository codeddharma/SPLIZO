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
import { MultiSelect } from "@/components/ui/multi-select";
import { updateTransactionAction } from "@/lib/actions/transaction-actions";

type Option = { id: string; name: string };

export type EditTarget = {
  id: string;
  description: string;
  categoryId: string | null;
  homeIds: string[];
  personTagIds: string[];
  spentByPersonTagId: string | null;
  isInFamilyTransfer: boolean;
};

function EditTransactionForm({
  target,
  categories,
  homes,
  people,
  owners,
  onDone,
}: {
  target: EditTarget;
  categories: Option[];
  homes: Option[];
  people: Option[];
  owners: Option[];
  onDone: () => void;
}) {
  const [selectedHomes, setSelectedHomes] = useState<Set<string>>(new Set(target.homeIds));
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set(target.personTagIds));

  async function handleSubmit(formData: FormData) {
    await updateTransactionAction(formData);
    onDone();
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={target.id} />
      {Array.from(selectedHomes).map((id) => (
        <input key={id} type="hidden" name="homeIds" value={id} />
      ))}
      {Array.from(selectedPeople).map((id) => (
        <input key={id} type="hidden" name="personTagIds" value={id} />
      ))}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">Category</label>
        <select
          name="categoryId"
          defaultValue={target.categoryId ?? ""}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">Spent by</label>
        <select
          name="spentByPersonTagId"
          defaultValue={target.spentByPersonTagId ?? ""}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">Unassigned</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">Place</label>
        <MultiSelect
          options={homes}
          selected={selectedHomes}
          onChange={setSelectedHomes}
          placeholder="Select place(s)"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">Person</label>
        <MultiSelect
          options={people}
          selected={selectedPeople}
          onChange={setSelectedPeople}
          placeholder="Select person(s)"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isInFamilyTransfer"
          defaultChecked={target.isInFamilyTransfer}
          className="h-3.5 w-3.5"
        />
        In-family transfer (excluded from income/expense totals)
      </label>

      <DialogFooter>
        <SubmitButton className="rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
          Save changes
        </SubmitButton>
      </DialogFooter>
    </form>
  );
}

export function EditTransactionDialog({
  target,
  onOpenChange,
  categories,
  homes,
  people,
  owners,
}: {
  target: EditTarget | null;
  onOpenChange: (open: boolean) => void;
  categories: Option[];
  homes: Option[];
  people: Option[];
  owners: Option[];
}) {
  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit transaction</DialogTitle>
          <DialogDescription>{target?.description}</DialogDescription>
        </DialogHeader>
        {target && (
          <EditTransactionForm
            key={target.id}
            target={target}
            categories={categories}
            homes={homes}
            people={people}
            owners={owners}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
