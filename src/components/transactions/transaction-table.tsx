"use client";

import { useState } from "react";
import { Pencil, Landmark, ArrowLeftRight } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { getCategoryBadgeStyle } from "@/lib/category-color";
import { CategoryPicker, AssignTrigger } from "./category-picker";
import { AssignRuleDialog } from "./assign-rule-dialog";
import { EditTransactionDialog, type EditTarget } from "./edit-transaction-dialog";
import { bulkRecategorizeTransactionsAction } from "@/lib/actions/transaction-actions";

type Row = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  categoryStatus: string;
  categoryId: string | null;
  account: { name: string; owners: { name: string }[] };
  category: { name: string } | null;
  categoryRule: { name: string } | null;
  homes: { home: { id: string; name: string } }[];
  people: { personTag: { id: string; name: string } }[];
  spentByPersonTag: { id: string; name: string } | null;
  loan?: { id: string } | null;
  loanRepayment?: { id: string } | null;
  isInFamilyTransfer: boolean;
};

type Category = { id: string; name: string };
type Option = { id: string; name: string };

const NEEDS_ACTION = new Set(["needs_review", "unmapped"]);

export function TransactionTable({
  transactions,
  categories,
  homes,
  people,
  owners,
  showActions = false,
}: {
  transactions: Row[];
  categories?: Category[];
  homes?: Option[];
  people?: Option[];
  owners?: Option[];
  showActions?: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assignTarget, setAssignTarget] = useState<{
    id: string;
    description: string;
    category: Category;
  } | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [bulkPending, setBulkPending] = useState(false);

  const enableSelection = showActions && !!categories;
  const enableEdit = showActions && !!categories && !!homes && !!people && !!owners;
  const allSelected = transactions.length > 0 && selected.size === transactions.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(transactions.map((t) => t.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkAssign(category: Category) {
    setBulkPending(true);
    await bulkRecategorizeTransactionsAction([...selected], category.id);
    setBulkPending(false);
    setSelected(new Set());
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      {enableSelection && selected.size > 0 && (
        <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-2">
          <span className="text-xs font-semibold text-foreground">{selected.size} selected</span>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
          {categories && (
            <CategoryPicker
              categories={categories}
              onSelect={handleBulkAssign}
              trigger={
                <span className="flex items-center gap-1">
                  {bulkPending ? "Assigning…" : "Assign category"}
                </span>
              }
            />
          )}
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            {enableSelection && (
              <th className="w-8 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all"
                  className="h-3.5 w-3.5"
                />
              </th>
            )}
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 text-right font-semibold">Amount</th>
            <th className="px-4 py-3 font-semibold">Description</th>
            <th className="px-4 py-3 font-semibold">Account</th>
            <th className="px-4 py-3 font-semibold">Rule</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Place</th>
            <th className="px-4 py-3 font-semibold">Person</th>
            <th className="px-4 py-3 font-semibold">Spent by</th>
            {enableEdit && <th className="w-8 px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {transactions.length === 0 && (
            <tr>
              <td
                colSpan={(enableSelection ? 10 : 9) + (enableEdit ? 1 : 0)}
                className="px-4 py-6 text-center text-muted-foreground"
              >
                No transactions yet.
              </td>
            </tr>
          )}
          {transactions.map((t) => {
            const amount = t.amount;
            const needsAction = showActions && categories && NEEDS_ACTION.has(t.categoryStatus);
            return (
              <tr key={t.id}>
                {enableSelection && (
                  <td className="px-4 py-3 align-top">
                    <input
                      type="checkbox"
                      checked={selected.has(t.id)}
                      onChange={() => toggleOne(t.id)}
                      aria-label={`Select ${t.description}`}
                      className="h-3.5 w-3.5"
                    />
                  </td>
                )}
                <td className="px-4 py-3 whitespace-nowrap align-top">
                  {new Date(t.date).toLocaleDateString("en-IN", { timeZone: "UTC" })}
                </td>
                <td
                  className={`px-4 py-3 text-right font-semibold align-top whitespace-nowrap ${
                    amount < 0 ? "text-expense" : "text-income"
                  }`}
                >
                  {amount < 0 ? "-" : "+"}₹{Math.abs(amount).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 font-medium align-top">
                  <span className="flex items-center gap-1.5">
                    {t.description}
                    {(t.loan || t.loanRepayment) && (
                      <span title="Loan transaction — excluded from dashboard totals">
                        <Landmark
                          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                          aria-label="Loan transaction — excluded from dashboard totals"
                        />
                      </span>
                    )}
                    {t.isInFamilyTransfer && (
                      <span title="In-family transfer — excluded from dashboard totals">
                        <ArrowLeftRight
                          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                          aria-label="In-family transfer — excluded from dashboard totals"
                        />
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground align-top">{t.account.name}</td>
                <td className="px-4 py-3 text-muted-foreground align-top">{t.categoryRule?.name ?? "—"}</td>
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center gap-1.5">
                    {t.category ? (
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={getCategoryBadgeStyle(t.category.name)}
                      >
                        {t.category.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                    {!needsAction && <StatusBadge status={t.categoryStatus} />}
                    {needsAction && (
                      <CategoryPicker
                        categories={categories!}
                        onSelect={(category) =>
                          setAssignTarget({ id: t.id, description: t.description, category })
                        }
                        trigger={<AssignTrigger />}
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground align-top">
                  {t.homes.length > 0 ? t.homes.map((h) => h.home.name).join(", ") : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground align-top">
                  {t.people.length > 0 ? t.people.map((p) => p.personTag.name).join(", ") : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground align-top">
                  {t.spentByPersonTag?.name ??
                    (t.account.owners.length > 1 ? (
                      <span className="italic" title="Joint account — spender not confirmed">
                        {t.account.owners.map((o) => o.name).join(" & ")}
                      </span>
                    ) : (
                      "—"
                    ))}
                </td>
                {enableEdit && (
                  <td className="px-4 py-3 align-top">
                    <button
                      type="button"
                      onClick={() =>
                        setEditTarget({
                          id: t.id,
                          description: t.description,
                          categoryId: t.categoryId,
                          homeIds: t.homes.map((h) => h.home.id),
                          personTagIds: t.people.map((p) => p.personTag.id),
                          spentByPersonTagId: t.spentByPersonTag?.id ?? null,
                          isInFamilyTransfer: t.isInFamilyTransfer,
                        })
                      }
                      aria-label={`Edit ${t.description}`}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      <AssignRuleDialog
        open={assignTarget !== null}
        onOpenChange={(open) => {
          if (!open) setAssignTarget(null);
        }}
        transactionId={assignTarget?.id ?? ""}
        description={assignTarget?.description ?? ""}
        category={assignTarget?.category ?? null}
      />

      {enableEdit && (
        <EditTransactionDialog
          target={editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          categories={categories!}
          homes={homes!}
          people={people!}
          owners={owners!}
        />
      )}
    </div>
  );
}
