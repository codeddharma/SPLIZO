"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function SubmitButton({
  children,
  pendingText,
  className = "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={`${className} inline-flex items-center gap-1.5`}>
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {pending ? (pendingText ?? "Saving…") : children}
    </button>
  );
}
