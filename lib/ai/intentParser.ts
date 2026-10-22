export type TimeOfDay = "morning" | "afternoon" | "evening";

export type Intent =
  | { type: "swap"; day: number | null; timeOfDay: TimeOfDay | null; target: string | null; reason: string | null }
  | { type: "add"; day: number | null; timeOfDay: TimeOfDay | null; category: string | null }
  | { type: "remove"; target: string }
  | { type: "move"; target: string; day: number | null; timeOfDay: TimeOfDay | null }
  | { type: "pace"; day: number | null; direction: "relax" | "pack" }
  | { type: "budget"; amount: number | null }
  | { type: "weatherQuestion"; day: number | null }
  | { type: "spendingQuestion"; category: string | null }
  | { type: "placesQuestion"; query: string }
  | { type: "unknown"; raw: string };

const DAY_RE = /day\s*(\d+)/i;
const TIME_RE = /(morning|afternoon|evening)/i;
const BUDGET_AMOUNT_RE = /(?:₹|rs\.?|inr)\s*([\d,]+)/i;

function extractDay(text: string): number | null {
  const m = text.match(DAY_RE);
  return m ? Number(m[1]) : null;
}

function extractTimeOfDay(text: string): TimeOfDay | null {
  const m = text.match(TIME_RE);
  return (m?.[1].toLowerCase() as TimeOfDay) ?? null;
}

/** Tolerant keyword + regex intent parser (no LLM): supports the commands listed in the demo script. */
export function parseIntent(text: string): Intent {
  const t = text.trim().toLowerCase();

  if (/weather|rain|forecast|temperature/.test(t) && /\?|what|how/.test(t)) {
    return { type: "weatherQuestion", day: extractDay(t) };
  }

  if (/how much|spent|spend|expense/.test(t) && /\?|what|how/.test(t)) {
    const categoryMatch = t.match(/on (food|hotel|transport|activities|shopping|other)/);
    return { type: "spendingQuestion", category: categoryMatch?.[1] ?? null };
  }

  if (/suggest|recommend|find|near|places? (for|to)/.test(t) && !/swap|replace|add|remove|move/.test(t)) {
    return { type: "placesQuestion", query: text.trim() };
  }

  if (/swap|replace|instead of/.test(t)) {
    const target = extractTarget(t, ["swap", "replace"]);
    const reasonMatch = t.match(/(rain|cheap|indoor|outdoor|closed)/);
    return {
      type: "swap",
      day: extractDay(t),
      timeOfDay: extractTimeOfDay(t),
      target,
      reason: reasonMatch?.[1] ?? null,
    };
  }

  if (/^add |add a |add an |add more/.test(t)) {
    const categoryMatch = t.match(
      /(heritage|museum|lake|beach|food|cafe|market|adventure|nature|temple|nightlife|shopping)/
    );
    return { type: "add", day: extractDay(t), timeOfDay: extractTimeOfDay(t), category: categoryMatch?.[1] ?? null };
  }

  if (/^remove |delete |drop /.test(t)) {
    const target = extractTarget(t, ["remove", "delete", "drop"]);
    return { type: "remove", target: target ?? t };
  }

  if (/^move /.test(t)) {
    const target = extractTarget(t, ["move"]);
    return { type: "move", target: target ?? t, day: extractDay(t), timeOfDay: extractTimeOfDay(t) };
  }

  if (/relaxed|less packed|slow down|lighter/.test(t)) {
    return { type: "pace", day: extractDay(t), direction: "relax" };
  }
  if (/pack more|more into|busier|add more activities|tighter/.test(t)) {
    return { type: "pace", day: extractDay(t), direction: "pack" };
  }

  if (/fit.*budget|cheaper|reduce cost|lower the cost|within ₹|within rs/.test(t)) {
    const amountMatch = t.match(BUDGET_AMOUNT_RE);
    const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, "")) : null;
    return { type: "budget", amount };
  }

  return { type: "unknown", raw: text };
}

function extractTarget(text: string, verbs: string[]): string | null {
  let rest = text;
  for (const v of verbs) {
    rest = rest.replace(new RegExp(`^.*\\b${v}\\b\\s*(the\\s+)?`, "i"), "");
  }
  rest = rest
    .replace(/to (something|a cheaper|indoor|outdoor).*/i, "")
    .replace(/with.*/i, "")
    .replace(/on day\s*\d+.*/i, "")
    .replace(/(morning|afternoon|evening)/i, "")
    .trim();
  return rest.length > 0 ? rest : null;
}

export const EXAMPLE_COMMANDS = [
  "Day 2 evening may rain, swap to something indoor",
  "Replace the day 1 lunch with a cheaper place",
  "Add a cafe on day 3 afternoon",
  "Remove the market visit",
  "Move City Palace to day 2 morning",
  "Make day 1 more relaxed",
  "Fit the plan into ₹20,000",
  "What's the weather on day 2?",
  "How much have I spent on food?",
  "Suggest vegetarian food near my hotel",
];
