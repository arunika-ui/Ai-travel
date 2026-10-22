import clsx from "clsx";
import { budgetAlertLevel } from "@/lib/validation/businessRules";

export function BudgetBar({ spent, budget, currencySymbol = "₹" }: { spent: number; budget: number; currencySymbol?: string }) {
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const level = budgetAlertLevel(spent, budget);

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">
          {currencySymbol}{spent.toLocaleString("en-IN")} of {currencySymbol}{budget.toLocaleString("en-IN")}
        </span>
        <span className={clsx("font-semibold", level === "over" ? "text-red-600" : level === "warning" ? "text-amber-600" : "text-green-600")}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="mt-1 h-3 w-full rounded-full bg-slate-200" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Budget used">
        <div
          className={clsx("h-3 rounded-full transition-all", level === "over" ? "bg-red-600" : level === "warning" ? "bg-amber-500" : "bg-green-600")}
          style={{ width: `${pct}%` }}
        />
      </div>
      {level !== "none" && (
        <p role="alert" className={clsx("mt-1 text-sm", level === "over" ? "text-red-600" : "text-amber-700")}>
          {level === "over" ? "You have exceeded your budget." : "Heads up: you've used 80% or more of your budget."}
        </p>
      )}
    </div>
  );
}
