import { AgentStep } from "@/lib/ai/TravelAgent";

export function GenerationProgress({ steps, active }: { steps: AgentStep[]; active: boolean }) {
  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-4" role="status" aria-live="polite">
      <p className="font-medium text-brand-800">
        {active ? "AI companion is building your itinerary..." : "Itinerary ready."}
      </p>
      <ul className="mt-2 space-y-1 text-sm text-brand-700">
        {steps.map((step, idx) => (
          <li key={idx}>🔧 {step.tool}() → {step.resultSummary}</li>
        ))}
      </ul>
    </div>
  );
}
