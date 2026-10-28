"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LoanForm } from "./loan-form";
import { createLoanAction, type LoanActionState } from "@/lib/actions/loan-actions";

type Option = { id: string; name: string };
type Transaction = { id: string; date: Date | string; description: string; amount: number; accountName: string };

export function AddLoanButton({
  contacts,
  accounts,
  unlinkedTransactions,
  today,
}: {
  contacts: Option[];
  accounts: Option[];
  unlinkedTransactions: Transaction[];
  today: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<LoanActionState, FormData>(createLoanAction, null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state) {
      setOpen(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  if (contacts.length === 0) {
    return <p className="text-sm text-muted-foreground">Add a contact before logging a loan.</p>;
  }

  return (
    <>
      <Button variant="default" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add loan
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add loan</DialogTitle>
            <DialogDescription>Log money lent to or borrowed from a contact.</DialogDescription>
          </DialogHeader>
          <LoanForm
            contacts={contacts}
            accounts={accounts}
            unlinkedTransactions={unlinkedTransactions}
            today={today}
            formAction={formAction}
            serverError={state?.error}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
