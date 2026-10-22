import { nanoid } from "nanoid";
import { CurrencyCode, Expense, ExpenseCategory } from "@/lib/trips/types";
import { readData, updateData } from "@/lib/data/localDb";
import { convertCurrency } from "@/lib/mock-data/currency";

export function listExpenses(tripId: string): Expense[] {
  return readData()
    .expenses.filter((e) => e.tripId === tripId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function addExpense(
  tripId: string,
  input: { amount: number; currency: CurrencyCode; category: ExpenseCategory; date: string; note: string },
  tripCurrency: CurrencyCode
): Expense {
  const { converted, rateUsed } = convertCurrency(input.amount, input.currency, tripCurrency);
  const expense: Expense = {
    id: nanoid(8),
    tripId,
    amount: input.amount,
    currency: input.currency,
    amountInTripCurrency: converted,
    rateUsed,
    category: input.category,
    date: input.date,
    note: input.note,
  };
  updateData((data) => ({ ...data, expenses: [...data.expenses, expense] }));
  return expense;
}

export function updateExpense(
  id: string,
  input: { amount: number; currency: CurrencyCode; category: ExpenseCategory; date: string; note: string },
  tripCurrency: CurrencyCode
): void {
  const { converted, rateUsed } = convertCurrency(input.amount, input.currency, tripCurrency);
  updateData((data) => ({
    ...data,
    expenses: data.expenses.map((e) =>
      e.id === id
        ? {
            ...e,
            amount: input.amount,
            currency: input.currency,
            amountInTripCurrency: converted,
            rateUsed,
            category: input.category,
            date: input.date,
            note: input.note,
          }
        : e
    ),
  }));
}

export function deleteExpense(id: string): void {
  updateData((data) => ({ ...data, expenses: data.expenses.filter((e) => e.id !== id) }));
}

export function totalSpent(tripId: string): number {
  return listExpenses(tripId).reduce((sum, e) => sum + e.amountInTripCurrency, 0);
}

export function totalsByCategory(tripId: string): Record<ExpenseCategory, number> {
  const totals: Record<ExpenseCategory, number> = {
    Hotel: 0,
    Food: 0,
    Transport: 0,
    Activities: 0,
    Shopping: 0,
    Other: 0,
  };
  for (const e of listExpenses(tripId)) {
    totals[e.category] += e.amountInTripCurrency;
  }
  return totals;
}

export function exportExpensesCSV(tripId: string): string {
  const header = "Date,Category,Amount,Currency,Amount in trip currency,Note";
  const rows = listExpenses(tripId).map((e) =>
    [e.date, e.category, e.amount, e.currency, e.amountInTripCurrency, `"${e.note.replace(/"/g, '""')}"`].join(",")
  );
  return [header, ...rows].join("\n");
}
