"use client";

import { useState, useTransition } from "react";

export function OwnerToggle({
  id,
  defaultChecked,
  action,
}: {
  id: string;
  defaultChecked: boolean;
  action: (formData: FormData) => Promise<void>;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const [pending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.checked;
    setChecked(next);
    const formData = new FormData();
    formData.set("id", id);
    formData.set("isOwner", next ? "1" : "0");
    startTransition(() => {
      action(formData);
    });
  }

  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={pending}
        className="h-3.5 w-3.5"
      />
      Owner
    </label>
  );
}
