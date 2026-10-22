import clsx from "clsx";

export function BudgetBar({
  spentINR,
  budgetINR,
}: {
  spentINR: number;
  budgetINR: number;
}) {
  const pct = budgetINR > 0 ? Math.min(100, (spentINR / budgetINR) * 100) : 0;
  const over80 = spentINR >= budgetINR * 0.8;
  const over100 = spentINR > budgetINR;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">
          ₹{spentINR.toLocaleString("en-IN")} of ₹{budgetINR.toLocaleString("en-IN")}
        </span>
        <span
          className={clsx(
            "font-semibold",
            over100 ? "text-red-600" : over80 ? "text-amber-600" : "text-green-600"
          )}
        >
          {pct.toFixed(0)}%
        </span>
      </div>
      <div
        className="mt-1 h-3 w-full rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Budget used"
      >
        <div
          className={clsx(
            "h-3 rounded-full transition-all",
            over100 ? "bg-red-600" : over80 ? "bg-amber-500" : "bg-green-600"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {over80 && (
        <p role="alert" className={clsx("mt-1 text-sm", over100 ? "text-red-600" : "text-amber-700")}>
          {over100
            ? "You have exceeded your budget."
            : "Heads up: you've used 80% or more of your budget."}
        </p>
      )}
    </div>
  );
}
