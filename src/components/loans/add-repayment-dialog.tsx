"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RepaymentForm } from "./repayment-form";
import { addRepaymentAction, type RepaymentActionState } from "@/lib/actions/loan-actions";

type Option = { id: string; name: string };
type Transaction = { id: string; date: Date | string; description: string; amount: number; accountName: string };

export function AddRepaymentDialog({
  open,
  onOpenChange,
  loanId,
  direction,
  accounts,
  unlinkedTransactions,
  today,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanId: string;
  direction: "lent" | "borrowed";
  accounts: Option[];
  unlinkedTransactions: Transaction[];
  today: string;
}) {
  const [state, formAction, pending] = useActionState<RepaymentActionState, FormData>(
    addRepaymentAction,
    null
  );
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state) {
      onOpenChange(false);
    }
    wasPending.current = pending;
  }, [pending, state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add repayment</DialogTitle>
          <DialogDescription>Record a repayment against this loan.</DialogDescription>
        </DialogHeader>
        <RepaymentForm
          loanId={loanId}
          direction={direction}
          accounts={accounts}
          unlinkedTransactions={unlinkedTransactions}
          today={today}
          formAction={formAction}
          serverError={state?.error}
        />
      </DialogContent>
    </Dialog>
  );
}
