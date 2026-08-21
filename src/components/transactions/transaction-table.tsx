import { StatusBadge } from "./status-badge";

type Row = {
  id: string;
  date: Date;
  description: string;
  amount: unknown;
  categoryStatus: string;
  account: { name: string };
  category: { name: string } | null;
  home: { name: string } | null;
  personTag: { name: string } | null;
};

export function TransactionTable({ transactions }: { transactions: Row[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-4 py-2 font-semibold">Date</th>
            <th className="px-4 py-2 font-semibold">Description</th>
            <th className="px-4 py-2 font-semibold">Account</th>
            <th className="px-4 py-2 font-semibold">Category</th>
            <th className="px-4 py-2 font-semibold">Home</th>
            <th className="px-4 py-2 font-semibold">Person</th>
            <th className="px-4 py-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {transactions.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                No transactions yet.
              </td>
            </tr>
          )}
          {transactions.map((t) => {
            const amount = Number(t.amount);
            return (
              <tr key={t.id}>
                <td className="px-4 py-2 whitespace-nowrap">
                  {new Date(t.date).toLocaleDateString("en-IN", { timeZone: "UTC" })}
                </td>
                <td className="px-4 py-2">{t.description}</td>
                <td className="px-4 py-2 text-muted-foreground">{t.account.name}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1.5">
                    <span>{t.category?.name ?? "—"}</span>
                    <StatusBadge status={t.categoryStatus} />
                  </div>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{t.home?.name ?? "—"}</td>
                <td className="px-4 py-2 text-muted-foreground">{t.personTag?.name ?? "—"}</td>
                <td
                  className={`px-4 py-2 text-right font-semibold ${
                    amount < 0 ? "text-expense" : "text-income"
                  }`}
                >
                  {amount < 0 ? "-" : "+"}₹{Math.abs(amount).toLocaleString("en-IN")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
