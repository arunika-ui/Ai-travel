import { AITool } from "@/lib/tools/types";
import { getWeather } from "@/lib/tools/getWeather";
import { searchPlaces } from "@/lib/tools/searchPlaces";
import { getPlaceDetails } from "@/lib/tools/getPlaceDetails";
import { getRoute } from "@/lib/tools/getRoute";
import { convertCurrency } from "@/lib/tools/convertCurrency";
import { getItinerary } from "@/lib/tools/getItinerary";

// Matches FR-5.2 in the SRS exactly: getWeather, searchPlaces,
// getPlaceDetails, getRoute, convertCurrency, getItinerary.
export const ALL_TOOLS: AITool[] = [
  getWeather,
  searchPlaces,
  getPlaceDetails,
  getRoute,
  convertCurrency,
  getItinerary,
];

export const TOOLS_BY_NAME: Record<string, AITool> = Object.fromEntries(
  ALL_TOOLS.map((t) => [t.name, t])
);

export { getWeather, searchPlaces, getPlaceDetails, getRoute, convertCurrency, getItinerary };
