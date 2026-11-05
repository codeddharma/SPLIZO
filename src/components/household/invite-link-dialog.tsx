"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyInviteLink } from "@/components/household/copy-invite-link";

export function InviteLinkDialog({
  open,
  onOpenChange,
  personName,
  link,
  justSent = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  link: string;
  justSent?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {justSent ? `Invite ready for ${personName}` : `Invite link for ${personName}`}
          </DialogTitle>
          <DialogDescription>
            {justSent
              ? "We don't send the email yet — copy this link and send it to them yourself (WhatsApp, SMS, etc). It lets them set their own password."
              : "Share this link with them — it lets them set their own password."}
          </DialogDescription>
        </DialogHeader>
        <CopyInviteLink link={link} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
