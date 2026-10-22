import { z } from "zod";
import { AITool } from "@/lib/tools/types";
import { getPlace } from "@/lib/mock-data/destinations";
import { Place } from "@/lib/trips/types";

const params = z.object({
  placeId: z.string(),
});

export interface PlaceDetails extends Place {
  openingHoursText: string;
  directionsUrl: string;
}

function execute({ placeId }: z.infer<typeof params>): PlaceDetails | null {
  const place = getPlace(placeId);
  if (!place) return null;
  return {
    ...place,
    openingHoursText: `${String(place.openHour).padStart(2, "0")}:00–${String(place.closeHour).padStart(2, "0")}:00`,
    directionsUrl: `https://www.openstreetmap.org/directions?to=${place.lat}%2C${place.lng}`,
  };
}

export const getPlaceDetails: AITool<z.infer<typeof params>, PlaceDetails | null> = {
  name: "getPlaceDetails",
  description: "Gets full details for one place: name, coordinates, rating, opening hours, and a directions link.",
  params,
  execute,
};
