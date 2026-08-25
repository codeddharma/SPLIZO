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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  link: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite link for {personName}</DialogTitle>
          <DialogDescription>
            Share this link with them — it lets them set their own password.
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
