import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { itinerarySchema, validateItinerary } from "@/lib/itinerary";
import { runAgentLoop } from "@/lib/agent";
import { tripInputSchema } from "@/lib/validation";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  message: z.string().min(1).max(1000),
  itinerary: itinerarySchema,
  input: tripInputSchema,
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 400 }
    );
  }

  const { message, itinerary, input } = parsed.data;

  const systemPrompt = `You are an AI travel companion helping edit an existing itinerary for a trip to ${input.destination} (${input.startDate} to ${input.endDate}, budget ₹${input.budgetINR}, ${input.travelers} traveler(s)).

The current itinerary (JSON) is:
${JSON.stringify(itinerary)}

The user will give you an instruction (e.g. "Day 2 evening may rain, swap to something indoor"). You may call getWeather, geocode, and searchPlaces tools (up to 5 total calls) to find real alternatives.

Then reply with ONLY a JSON object of this exact shape:
{
  "itinerary": { ... the full updated itinerary, same shape as the input itinerary ... },
  "changeSummary": "one or two sentences describing what changed and why"
}

Keep all days/activities you are not asked to change exactly as they were. Keep the total within the ₹${input.budgetINR} budget and avoid overlapping activity times.`;

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: message },
  ];

  try {
    let result: { itinerary: unknown; changeSummary: string } | null = null;
    let lastIssues: string[] = [];

    for (let attempt = 0; attempt < 2; attempt++) {
      const content = await runAgentLoop({
        messages,
        maxToolCalls: 5,
        jsonMode: true,
      });

      let candidate: any;
      try {
        candidate = JSON.parse(content);
      } catch {
        messages.push({
          role: "user",
          content: "That was not valid JSON. Reply with ONLY the JSON object described earlier.",
        });
        continue;
      }

      const schemaResult = itinerarySchema.safeParse(candidate.itinerary);
      if (!schemaResult.success) {
        lastIssues = schemaResult.error.issues.map((i) => i.message);
        messages.push({
          role: "user",
          content: `The itinerary JSON did not match the required shape: ${lastIssues.join("; ")}. Reply with ONLY the corrected JSON object.`,
        });
        continue;
      }

      const businessIssues = validateItinerary(schemaResult.data, input);
      if (businessIssues.length > 0) {
        lastIssues = businessIssues.map((i) => i.message);
        messages.push({
          role: "user",
          content: `Fix these issues and reply with ONLY the corrected JSON object: ${lastIssues.join("; ")}`,
        });
        continue;
      }

      result = {
        itinerary: schemaResult.data,
        changeSummary:
          typeof candidate.changeSummary === "string"
            ? candidate.changeSummary
            : "Itinerary updated.",
      };
      break;
    }

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Could not apply that change while keeping the plan valid. " +
            (lastIssues[0] ?? "Try rephrasing your request."),
        },
        { status: 422 }
      );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}
