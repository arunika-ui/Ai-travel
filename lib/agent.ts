import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/chat/completions";
import { getWeather } from "@/lib/tools/weather";
import { geocode } from "@/lib/tools/geocode";
import { searchPlaces } from "@/lib/tools/places";

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set on the server. Add it to your environment to generate itineraries."
    );
  }
  return new OpenAI({ apiKey });
}

export const MODEL = "gpt-4o-mini";

export const AGENT_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "getWeather",
      description:
        "Get the weather forecast (max/min temp in Celsius, precipitation probability, summary) for a location and date. Use this to plan indoor/outdoor activities and flag rain risk.",
      parameters: {
        type: "object",
        properties: {
          lat: { type: "number", description: "Latitude" },
          lng: { type: "number", description: "Longitude" },
          date: { type: "string", description: "ISO date (yyyy-mm-dd)" },
        },
        required: ["lat", "lng", "date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "geocode",
      description:
        "Resolve a place name or address to latitude/longitude coordinates using OpenStreetMap.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Place name, e.g. 'Eiffel Tower, Paris'" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "searchPlaces",
      description:
        "Search for points of interest (restaurants, attractions, museums, parks, etc.) near a destination using OpenStreetMap. Returns name, category and coordinates.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "What to search for, e.g. 'museums in Rome' or 'vegetarian restaurant'",
          },
          near: {
            type: "object",
            properties: {
              lat: { type: "number" },
              lng: { type: "number" },
            },
            description: "Optional coordinates to bias the search near",
          },
        },
        required: ["query"],
      },
    },
  },
];

export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "getWeather":
      return getWeather(Number(args.lat), Number(args.lng), String(args.date));
    case "geocode":
      return geocode(String(args.query));
    case "searchPlaces":
      return searchPlaces(
        String(args.query),
        args.near as { lat: number; lng: number } | undefined
      );
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

/**
 * Runs a bounded tool-calling loop against the Chat Completions API.
 * Executes up to `maxToolCalls` rounds of tool calls, feeding results
 * back to the model, then returns the final assistant message.
 */
export async function runAgentLoop(options: {
  messages: ChatCompletionMessageParam[];
  maxToolCalls: number;
  onToolCall?: (name: string, args: Record<string, unknown>) => void;
  jsonMode?: boolean;
}): Promise<string> {
  const client = getOpenAIClient();
  const messages = [...options.messages];
  let toolCallsUsed = 0;

  for (let round = 0; round < options.maxToolCalls + 1; round++) {
    const allowTools = toolCallsUsed < options.maxToolCalls;
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages,
      tools: allowTools ? AGENT_TOOLS : undefined,
      tool_choice: allowTools ? "auto" : undefined,
      response_format: options.jsonMode ? { type: "json_object" } : undefined,
      temperature: 0.4,
    });

    const choice = completion.choices[0];
    const message = choice.message;

    if (!message.tool_calls || message.tool_calls.length === 0) {
      return message.content ?? "";
    }

    messages.push(message);

    for (const toolCall of message.tool_calls) {
      if (toolCall.type !== "function") continue;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(toolCall.function.arguments || "{}");
      } catch {
        args = {};
      }
      options.onToolCall?.(toolCall.function.name, args);
      const result = await executeTool(toolCall.function.name, args);
      toolCallsUsed++;
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result ?? null).slice(0, 4000),
      });
    }
  }

  // Final forced round without tools to get a text/JSON answer.
  const completion = await client.chat.completions.create({
    model: MODEL,
    messages,
    response_format: options.jsonMode ? { type: "json_object" } : undefined,
    temperature: 0.4,
  });
  return completion.choices[0].message.content ?? "";
}
