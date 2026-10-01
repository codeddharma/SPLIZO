"use client";

import { useState } from "react";
import { Wallet, CreditCard, Landmark, Banknote, Lock } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { MultiSelect } from "@/components/ui/multi-select";

const TYPE_COLOR = {
  bank: "var(--chart-3)",
  card: "var(--chart-4)",
  wallet: "var(--chart-2)",
  cash: "var(--chart-6)",
};

type Account = {
  id: string;
  name: string;
  type: "bank" | "card" | "wallet" | "cash";
  institution: string | null;
  last4: string | null;
  isSystem: boolean;
  owners: { personTag: { id: string; name: string } }[];
};

type Person = { id: string; name: string };

const TYPE_ICON = { bank: Landmark, card: CreditCard, wallet: Wallet, cash: Banknote };

function AccountRow({
  account,
  deactivateAction,
}: {
  account: Account;
  deactivateAction: (formData: FormData) => Promise<void>;
}) {
  const Icon = TYPE_ICON[account.type];
  const color = TYPE_COLOR[account.type];
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`,
            color,
          }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-sm font-medium">
            {account.name}
            {account.isSystem && <Lock className="h-3 w-3 text-muted-foreground" />}
          </div>
          <div className="text-xs text-muted-foreground">
            {account.institution}
            {account.last4 ? ` •••• ${account.last4}` : ""}
            {account.owners.length > 1 && (
              <span>
                {" "}
                · Joint: {account.owners.map((o) => o.personTag.name).join(" & ")}
              </span>
            )}
          </div>
        </div>
      </div>
      {!account.isSystem && (
        <form action={deactivateAction}>
          <input type="hidden" name="id" value={account.id} />
          <SubmitButton
            className="text-xs font-semibold text-muted-foreground transition-colors hover:text-expense"
            pendingText="Removing…"
          >
            Remove
          </SubmitButton>
        </form>
      )}
    </div>
  );
}

function AccountGroup({
  title,
  accounts,
  deactivateAction,
}: {
  title: string;
  accounts: Account[];
  deactivateAction: (formData: FormData) => Promise<void>;
}) {
  if (accounts.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {accounts.map((account) => (
          <AccountRow key={account.id} account={account} deactivateAction={deactivateAction} />
        ))}
      </div>
    </div>
  );
}

export function AccountManager({
  accounts,
  people,
  createAction,
  deactivateAction,
}: {
  accounts: Account[];
  people: Person[];
  createAction: (formData: FormData) => Promise<void>;
  deactivateAction: (formData: FormData) => Promise<void>;
}) {
  const [selectedOwners, setSelectedOwners] = useState<Set<string>>(new Set());

  const others = accounts.filter((a) => a.owners.length === 0);

  async function handleSubmit(formData: FormData) {
    await createAction(formData);
    setSelectedOwners(new Set());
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6">
      <div className="shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight">Accounts</h1>
        <p className="text-sm text-muted-foreground">
          Every bank account, credit card, and wallet you use — grouped by who it belongs to.
        </p>
      </div>

      <form
        action={handleSubmit}
        className="flex shrink-0 flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        {Array.from(selectedOwners).map((id) => (
          <input key={id} type="hidden" name="ownerPersonTagIds" value={id} />
        ))}
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Name</label>
          <input
            name="name"
            placeholder="e.g. Joint Savings"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Type</label>
          <select
            name="type"
            required
            defaultValue="bank"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="bank">Bank</option>
            <option value="card">Card</option>
            <option value="wallet">Wallet</option>
            <option value="cash">Cash</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Institution</label>
          <input
            name="institution"
            placeholder="e.g. HDFC Bank"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Last 4</label>
          <input
            name="last4"
            maxLength={4}
            placeholder="1234"
            className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex min-w-48 flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Owner(s) — leave blank if shared/joint with no set owner
          </label>
          <MultiSelect
            options={people}
            selected={selectedOwners}
            onChange={setSelectedOwners}
            placeholder="Pick 1, or 2+ for joint"
          />
        </div>
        <SubmitButton className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
          Add
        </SubmitButton>
      </form>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
        {accounts.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No accounts yet.
          </div>
        )}
        {people.map((person) => (
          <AccountGroup
            key={person.id}
            title={person.name}
            accounts={accounts.filter((a) => a.owners.some((o) => o.personTag.id === person.id))}
            deactivateAction={deactivateAction}
          />
        ))}
        <AccountGroup title="Others" accounts={others} deactivateAction={deactivateAction} />
      </div>
    </div>
  );
}
