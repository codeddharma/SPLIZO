"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "./transaction-form";

type Option = { id: string; name: string };

export function AddTransactionDialog({
  accounts,
  categories,
  homes,
  people,
  createAction,
}: {
  accounts: Option[];
  categories: Option[];
  homes: Option[];
  people: Option[];
  createAction: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    await createAction(formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add transaction
      </Button>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add transaction</DialogTitle>
          <DialogDescription>
            Category auto-detects from vendor rules if left blank.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          accounts={accounts}
          categories={categories}
          homes={homes}
          people={people}
          createAction={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
