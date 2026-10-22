import { AITool } from "@/lib/tools/types";
import { getWeather } from "@/lib/tools/getWeather";
import { searchPlaces } from "@/lib/tools/searchPlaces";
import { getRoute } from "@/lib/tools/getRoute";
import { convertCurrency } from "@/lib/tools/convertCurrency";
import { getItinerary } from "@/lib/tools/getItinerary";

export const ALL_TOOLS: AITool[] = [getWeather, searchPlaces, getRoute, convertCurrency, getItinerary];

export const TOOLS_BY_NAME: Record<string, AITool> = Object.fromEntries(
  ALL_TOOLS.map((t) => [t.name, t])
);

export { getWeather, searchPlaces, getRoute, convertCurrency, getItinerary };
