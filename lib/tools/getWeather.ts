import { z } from "zod";
import { AITool } from "@/lib/tools/types";
import { getWeatherForecast } from "@/lib/mock-data/weather";

const params = z.object({
  cityId: z.string(),
  date: z.string(),
});

export const getWeather: AITool<z.infer<typeof params>, ReturnType<typeof getWeatherForecast>> = {
  name: "getWeather",
  description: "Gets the deterministic sample forecast (temperature, rain chance, condition) for a city and date.",
  params,
  execute: ({ cityId, date }) => getWeatherForecast(cityId, date),
};
