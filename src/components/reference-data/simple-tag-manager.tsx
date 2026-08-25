import { SubmitButton } from "@/components/ui/submit-button";

type Item = { id: string; name: string };

export function SimpleTagManager({
  items,
  createAction,
  deactivateAction,
  title,
  description,
  label,
  placeholder,
  tabs,
}: {
  items: Item[];
  createAction: (formData: FormData) => Promise<void>;
  deactivateAction: (formData: FormData) => Promise<void>;
  title: string;
  description: string;
  label: string;
  placeholder: string;
  tabs?: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col gap-6 p-6">
      {tabs}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <form action={createAction} className="flex shrink-0 gap-2">
        <input
          name="name"
          placeholder={placeholder}
          required
          className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm"
        />
        <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
          Add {label}
        </SubmitButton>
      </form>

      <div className="flex min-h-0 flex-1 flex-col divide-y divide-border overflow-y-auto rounded-xl border border-border bg-card">
        {items.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No {label.toLowerCase()}s yet.
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">{item.name}</span>
            <form action={deactivateAction}>
              <input type="hidden" name="id" value={item.id} />
              <SubmitButton
                className="text-xs font-semibold text-muted-foreground transition-colors hover:text-expense"
                pendingText="Removing…"
              >
                Remove
              </SubmitButton>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
