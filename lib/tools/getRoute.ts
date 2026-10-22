import { z } from "zod";
import { AITool } from "@/lib/tools/types";

const params = z.object({
  fromLat: z.number(),
  fromLng: z.number(),
  toLat: z.number(),
  toLng: z.number(),
});

export interface RouteResult {
  distanceKm: number;
  estimatedMinutes: number;
}

/** Haversine-distance estimate with a flat average-city-speed assumption (no real routing API). */
function execute({ fromLat, fromLng, toLat, toLng }: z.infer<typeof params>): RouteResult {
  const R = 6371;
  const dLat = ((toLat - fromLat) * Math.PI) / 180;
  const dLng = ((toLng - fromLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((fromLat * Math.PI) / 180) * Math.cos((toLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const distanceKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
  const AVG_SPEED_KMH = 20;
  const estimatedMinutes = Math.max(5, Math.round((distanceKm / AVG_SPEED_KMH) * 60));
  return { distanceKm, estimatedMinutes };
}

export const getRoute: AITool<z.infer<typeof params>, RouteResult> = {
  name: "getRoute",
  description: "Estimates travel distance and time between two points using straight-line distance.",
  params,
  execute,
};
