"use client";

import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { Expense } from "@/lib/types";
import { COMMON_CURRENCIES, convertToINR } from "@/lib/currency";
import { BudgetBar } from "@/components/BudgetBar";

const CATEGORIES = [
  "Food",
  "Transport",
  "Lodging",
  "Activities",
  "Shopping",
  "Other",
];

export function ExpensesTab({
  expenses,
  budgetINR,
  onChange,
}: {
  expenses: Expense[];
  budgetINR: number;
  onChange: (expenses: Expense[]) => void;
}) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalINR = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amountINR, 0),
    [expenses]
  );

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amountINR);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }

    setSubmitting(true);
    try {
      const amountINR = await convertToINR(parsedAmount, currency);
      const expense: Expense = {
        id: nanoid(8),
        amount: parsedAmount,
        currency,
        category,
        note: note.trim() || undefined,
        date: new Date().toISOString(),
        amountINR,
      };
      onChange([...expenses, expense]);
      setAmount("");
      setNote("");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(id: string) {
    onChange(expenses.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-6">
      <BudgetBar spentINR={totalINR} budgetINR={budgetINR} />

      <form onSubmit={handleAdd} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-slate-900">Add expense</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div>
            <label htmlFor="expense-amount" className="block text-sm font-medium text-slate-700">
              Amount
            </label>
            <input
              id="expense-amount"
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              aria-invalid={!!error}
              aria-describedby={error ? "expense-error" : undefined}
            />
          </div>
          <div>
            <label htmlFor="expense-currency" className="block text-sm font-medium text-slate-700">
              Currency
            </label>
            <select
              id="expense-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {COMMON_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="expense-category" className="block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              id="expense-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="expense-note" className="block text-sm font-medium text-slate-700">
              Note (optional)
            </label>
            <input
              id="expense-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
        {error && (
          <p id="expense-error" role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60"
        >
          {submitting ? "Adding..." : "Add expense"}
        </button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-slate-900">Totals by category</h3>
        {byCategory.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No expenses yet.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {byCategory.map(([cat, total]) => (
              <li key={cat} className="flex justify-between text-sm">
                <span>{cat}</span>
                <span className="font-medium">₹{total.toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-slate-900">All expenses</h3>
        {expenses.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No expenses recorded yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-100">
            {expenses.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div>
                  <p className="font-medium text-slate-900">
                    {e.category} — {e.amount} {e.currency}{" "}
                    <span className="text-slate-500">(₹{e.amountINR.toLocaleString("en-IN")})</span>
                  </p>
                  {e.note && <p className="text-slate-500">{e.note}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(e.id)}
                  className="rounded px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  aria-label={`Delete expense ${e.category} ${e.amount} ${e.currency}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
