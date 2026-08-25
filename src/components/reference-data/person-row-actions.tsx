"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { InviteDialog } from "@/components/household/invite-dialog";
import { InviteLinkDialog } from "@/components/household/invite-link-dialog";
import { ConfirmActionDialog } from "@/components/reference-data/confirm-action-dialog";
import { revokeInviteAction, removeAccessAction } from "@/lib/actions/invite-actions";
import { deactivatePersonTagAction } from "@/lib/actions/reference-data-actions";

type Modal = "invite" | "invite-link" | "cancel-invite" | "remove-access" | "delete" | null;

export function PersonRowActions({
  personId,
  personName,
  accessEmail,
  pendingInvite,
  origin,
}: {
  personId: string;
  personName: string;
  accessEmail: string | null;
  pendingInvite: { id: string; token: string } | null;
  origin: string;
}) {
  const [modal, setModal] = useState<Modal>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label={`Actions for ${personName}`}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            />
          }
        >
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {accessEmail ? (
            <DropdownMenuItem onClick={() => setModal("remove-access")}>
              Remove access
            </DropdownMenuItem>
          ) : pendingInvite ? (
            <>
              <DropdownMenuItem onClick={() => setModal("invite-link")}>
                View invite link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setModal("cancel-invite")}>
                Cancel invite
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => setModal("invite")}>Invite</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setModal("delete")}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {modal === "invite" && (
        <InviteDialog
          open
          onOpenChange={(o) => setModal(o ? "invite" : null)}
          personTagId={personId}
          personName={personName}
        />
      )}

      {modal === "invite-link" && pendingInvite && (
        <InviteLinkDialog
          open
          onOpenChange={(o) => setModal(o ? "invite-link" : null)}
          personName={personName}
          link={`${origin}/invite/${pendingInvite.token}`}
        />
      )}

      {modal === "cancel-invite" && pendingInvite && (
        <ConfirmActionDialog
          open
          onOpenChange={(o) => setModal(o ? "cancel-invite" : null)}
          title="Cancel invite?"
          description={`${personName}'s pending invite link will stop working.`}
          confirmLabel="Cancel invite"
          action={revokeInviteAction}
          hiddenFields={{ id: pendingInvite.id }}
        />
      )}

      {modal === "remove-access" && (
        <ConfirmActionDialog
          open
          onOpenChange={(o) => setModal(o ? "remove-access" : null)}
          title="Remove access?"
          description={`${personName} will no longer be able to log in or be selected as "Spent by". Their name and transaction history stay unchanged.`}
          confirmLabel="Remove access"
          action={removeAccessAction}
          hiddenFields={{ personTagId: personId }}
        />
      )}

      {modal === "delete" && (
        <ConfirmActionDialog
          open
          onOpenChange={(o) => setModal(o ? "delete" : null)}
          title="Delete person?"
          description={`"${personName}" will be hidden from People & Places and no longer selectable on new transactions.`}
          confirmLabel="Delete"
          action={deactivatePersonTagAction}
          hiddenFields={{ id: personId }}
        />
      )}
    </>
  );
}
