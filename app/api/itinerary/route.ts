import { NextRequest } from "next/server";
import { tripInputSchema } from "@/lib/validation";
import { buildItinerarySystemPrompt, itinerarySchema, validateItinerary } from "@/lib/itinerary";
import { runAgentLoop } from "@/lib/agent";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const parsed = tripInputSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: "Validation failed",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      }),
      { status: 400 }
    );
  }

  const input = parsed.data;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(new TextEncoder().encode(sseEvent(event, data)));

      try {
        send("status", { message: "Planning your trip..." });

        const systemPrompt = buildItinerarySystemPrompt(input);
        const messages: ChatCompletionMessageParam[] = [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Plan the trip to ${input.destination} now. Call tools as needed, then output the final JSON itinerary.`,
          },
        ];

        let lastIssues: string[] = [];
        let finalItinerary: unknown = null;

        for (let attempt = 0; attempt < 2; attempt++) {
          const content = await runAgentLoop({
            messages,
            maxToolCalls: 8,
            jsonMode: true,
            onToolCall: (name, args) => {
              send("status", { message: describeTool(name, args) });
            },
          });

          let candidate: unknown;
          try {
            candidate = JSON.parse(content);
          } catch {
            lastIssues = ["The model did not return valid JSON."];
            messages.push({
              role: "user",
              content: "That was not valid JSON. Reply with ONLY the JSON object described earlier.",
            });
            continue;
          }

          const schemaResult = itinerarySchema.safeParse(candidate);
          if (!schemaResult.success) {
            lastIssues = schemaResult.error.issues.map((i) => i.message);
            messages.push({
              role: "user",
              content: `The JSON did not match the required shape: ${lastIssues.join("; ")}. Fix it and reply with ONLY the corrected JSON.`,
            });
            continue;
          }

          const businessIssues = validateItinerary(schemaResult.data, input);
          if (businessIssues.length > 0) {
            lastIssues = businessIssues.map((i) => i.message);
            send("status", { message: "Adjusting plan to fit budget and schedule..." });
            messages.push({
              role: "user",
              content: `Fix these issues and reply with ONLY the corrected JSON: ${lastIssues.join("; ")}`,
            });
            continue;
          }

          finalItinerary = schemaResult.data;
          break;
        }

        if (!finalItinerary) {
          send("error", {
            message:
              "Could not generate a valid itinerary within budget and schedule constraints. " +
              (lastIssues[0] ?? "Please try again or adjust your trip details."),
          });
          controller.close();
          return;
        }

        send("itinerary", { itinerary: finalItinerary });
        controller.close();
      } catch (err: any) {
        send("error", { message: err?.message ?? "Unexpected server error" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function describeTool(name: string, args: Record<string, unknown>): string {
  switch (name) {
    case "getWeather":
      return `Checking weather for ${args.date ?? "a day"}...`;
    case "geocode":
      return `Locating ${args.query ?? "a place"}...`;
    case "searchPlaces":
      return `Finding places for "${args.query ?? ""}"...`;
    default:
      return "Working on your itinerary...";
  }
}
