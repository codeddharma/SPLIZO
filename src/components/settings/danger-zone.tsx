"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DangerActionDialog } from "./danger-action-dialog";
import { resetAccountAction, deleteAccountAction } from "@/lib/actions/settings-actions";

export function DangerZone({ isSoleUser }: { isSoleUser: boolean }) {
  const [modal, setModal] = useState<"reset" | "delete" | null>(null);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-card p-4">
      <div>
        <h2 className="font-heading text-base font-semibold text-expense">Danger zone</h2>
        <p className="text-sm text-muted-foreground">These actions cannot be undone.</p>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center">
        <div>
          <div className="text-sm font-semibold">Reset account</div>
          <p className="text-xs text-muted-foreground">
            Deletes every transaction, account, category, home, person, contact, and loan in this
            household, then rebuilds the starter defaults —{" "}
            {isSoleUser ? "your login stays active." : "everyone's login stays active."}
          </p>
        </div>
        <Button type="button" variant="destructive" onClick={() => setModal("reset")} className="shrink-0">
          Reset account
        </Button>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center">
        <div>
          <div className="text-sm font-semibold">Delete account</div>
          <p className="text-xs text-muted-foreground">
            {isSoleUser
              ? "Permanently deletes your login and every piece of household data. There is no undo."
              : "Permanently deletes your own login and signs you out. Your name stays attached to past transactions as a record; the rest of the household's data is untouched."}
          </p>
        </div>
        <Button type="button" variant="destructive" onClick={() => setModal("delete")} className="shrink-0">
          Delete account
        </Button>
      </div>

      <DangerActionDialog
        open={modal === "reset"}
        onOpenChange={(o) => setModal(o ? "reset" : null)}
        title="Reset account?"
        description="This permanently deletes all transactions, accounts, categories, homes, people, contacts, and loans in this household, then recreates the starter defaults. Logins are not affected."
        confirmLabel="Reset account"
        confirmPhrase="RESET"
        action={resetAccountAction}
      />

      <DangerActionDialog
        open={modal === "delete"}
        onOpenChange={(o) => setModal(o ? "delete" : null)}
        title="Delete account?"
        description={
          isSoleUser
            ? "This permanently deletes your account and all household data. You'll be signed out immediately."
            : "This permanently deletes your own login. You'll be signed out immediately; the rest of the household keeps its data."
        }
        confirmLabel="Delete account"
        confirmPhrase="DELETE"
        action={deleteAccountAction}
      />
    </div>
  );
}
