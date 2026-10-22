import { z } from "zod";
import { AITool } from "@/lib/tools/types";
import { getPlacesForCity } from "@/lib/mock-data/destinations";
import { Place, PlaceCategory } from "@/lib/trips/types";

const params = z.object({
  cityId: z.string(),
  category: z.string().optional(),
  indoor: z.boolean().optional(),
  maxCostPerPerson: z.number().optional(),
  query: z.string().optional(),
});

function execute(input: z.infer<typeof params>): Place[] {
  let results = getPlacesForCity(input.cityId);

  if (input.category) {
    results = results.filter((p) => p.category === (input.category as PlaceCategory));
  }
  if (typeof input.indoor === "boolean") {
    results = results.filter((p) => p.indoor === input.indoor);
  }
  if (typeof input.maxCostPerPerson === "number") {
    results = results.filter((p) => p.costPerPersonINR <= input.maxCostPerPerson!);
  }
  if (input.query) {
    const q = input.query.toLowerCase();
    results = results.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  return results.sort((a, b) => b.rating - a.rating).slice(0, 8);
}

export const searchPlaces: AITool<z.infer<typeof params>, Place[]> = {
  name: "searchPlaces",
  description: "Searches sample points of interest in a city, filterable by category, indoor/outdoor and max cost.",
  params,
  execute,
};
