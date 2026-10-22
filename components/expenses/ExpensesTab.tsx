"use client";

import { useEffect, useMemo, useState } from "react";
import { Trip, Expense, ExpenseCategory } from "@/lib/trips/types";
import { CURRENCIES } from "@/lib/mock-data/currency";
import {
  listExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  totalsByCategory,
  totalSpent,
  exportExpensesCSV,
} from "@/lib/trips/expense";
import { expenseInputSchema } from "@/lib/validation/schemas";
import { BudgetBar } from "@/components/itinerary/BudgetBar";
import { EmptyState } from "@/components/ui/EmptyState";

const CATEGORIES: ExpenseCategory[] = ["Hotel", "Food", "Transport", "Activities", "Shopping", "Other"];

export function ExpensesTab({ trip }: { trip: Trip }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(trip.currency);
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  function refresh() {
    setExpenses(listExpenses(trip.id));
  }

  useEffect(() => {
    refresh();
  }, [trip.id]);

  const total = useMemo(() => totalSpent(trip.id), [expenses]);
  const byCategory = useMemo(() => totalsByCategory(trip.id), [expenses]);
  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) map.set(e.date, (map.get(e.date) ?? 0) + e.amountInTripCurrency);
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [expenses]);
  const maxCategoryTotal = Math.max(1, ...Object.values(byCategory));
  const maxDayTotal = Math.max(1, ...byDay.map(([, v]) => v));

  function resetForm() {
    setAmount("");
    setCurrency(trip.currency);
    setCategory("Food");
    setDate(new Date().toISOString().slice(0, 10));
    setNote("");
    setEditingId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = expenseInputSchema.safeParse({
      amount: Number(amount),
      currency,
      category,
      date,
      note,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid expense");
      return;
    }
    if (editingId) {
      updateExpense(editingId, parsed.data, trip.currency);
    } else {
      addExpense(trip.id, parsed.data, trip.currency);
    }
    refresh();
    resetForm();
  }

  function handleEdit(exp: Expense) {
    setEditingId(exp.id);
    setAmount(String(exp.amount));
    setCurrency(exp.currency);
    setCategory(exp.category);
    setDate(exp.date.slice(0, 10));
    setNote(exp.note);
  }

  function handleDelete(id: string) {
    deleteExpense(id);
    refresh();
  }

  function handleExportCSV() {
    const csv = exportExpensesCSV(trip.id);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${trip.title.replace(/\s+/g, "-").toLowerCase()}-expenses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <BudgetBar spent={total} budget={trip.budget} />

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-slate-900">{editingId ? "Edit expense" : "Add expense"}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <Field label="Amount" id="exp-amount">
            <input
              id="exp-amount"
              type="number"
              min={0.01}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </Field>
          <Field label="Currency" id="exp-currency">
            <select
              id="exp-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as typeof currency)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Category" id="exp-category">
            <select
              id="exp-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Date" id="exp-date">
            <input
              id="exp-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </Field>
          <Field label="Note (optional)" id="exp-note">
            <input
              id="exp-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </Field>
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            {editingId ? "Save changes" : "Add expense"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-900">By category</h3>
          <div className="mt-3 space-y-2">
            {CATEGORIES.map((c) => (
              <div key={c}>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{c}</span>
                  <span>₹{byCategory[c].toLocaleString("en-IN")}</span>
                </div>
                <div className="mt-0.5 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(byCategory[c] / maxCategoryTotal) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-900">By day</h3>
          {byDay.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No expenses yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {byDay.map(([d, v]) => (
                <div key={d}>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{d}</span>
                    <span>₹{v.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="mt-0.5 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(v / maxDayTotal) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">All expenses</h3>
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={expenses.length === 0}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-brand-400 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Export CSV
          </button>
        </div>
        {expenses.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="No expenses yet" body="Add your first expense above." />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {expenses.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <div>
                  <p className="font-medium text-slate-900">
                    {e.category} — {e.amount} {e.currency}{" "}
                    <span className="text-slate-500">(₹{e.amountInTripCurrency.toLocaleString("en-IN")})</span>
                  </p>
                  <p className="text-xs text-slate-500">{e.date}{e.note ? ` · ${e.note}` : ""}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => handleEdit(e)} className="rounded px-2 py-1 font-medium text-brand-700 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(e.id)} className="rounded px-2 py-1 font-medium text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
