import { z } from "zod";
import { AITool } from "@/lib/tools/types";
import { getCurrentItinerary } from "@/lib/trips/itinerary";
import { itineraryTotalCost } from "@/lib/validation/businessRules";
import { Itinerary } from "@/lib/trips/types";

const params = z.object({
  tripId: z.string(),
});

interface GetItineraryResult {
  itinerary: Itinerary | null;
  totalCost: number;
}

export const getItinerary: AITool<z.infer<typeof params>, GetItineraryResult> = {
  name: "getItinerary",
  description: "Reads the current itinerary and its total estimated cost for a trip.",
  params,
  execute: ({ tripId }) => {
    const itinerary = getCurrentItinerary(tripId);
    return { itinerary, totalCost: itinerary ? itineraryTotalCost(itinerary) : 0 };
  },
};
