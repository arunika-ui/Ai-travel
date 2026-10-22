export interface WeatherForecast {
  date: string;
  cityId: string;
  tempC: number;
  rainChance: number; // 0-100
  condition: "Sunny" | "Partly Cloudy" | "Cloudy" | "Rain" | "Thunderstorm";
  eveningRainChance: number; // 0-100, used to decide indoor/outdoor evening activities
}

/** Deterministic string hash so the same (city, date) always gives the same forecast. */
function seededHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const BASE_TEMP_C: Record<string, number> = {
  udaipur: 28,
  goa: 31,
  jaipur: 30,
  manali: 14,
  rishikesh: 24,
};

const CONDITIONS: WeatherForecast["condition"][] = [
  "Sunny",
  "Partly Cloudy",
  "Cloudy",
  "Rain",
  "Thunderstorm",
];

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * The "Udaipur Heritage Getaway" demo trip starts 7 days from today, so
 * its day 2 is 8 days from today. That date always forecasts rain so the
 * chat "swap to indoor" demo works regardless of when the app is opened.
 */
function forcedRainKey(): string {
  return `udaipur:${addDays(new Date(), 8)}`;
}

/** Deterministic forecast for a given city + date. */
export function getWeatherForecast(cityId: string, date: string): WeatherForecast {
  if (`${cityId}:${date}` === forcedRainKey()) {
    return {
      date,
      cityId,
      tempC: BASE_TEMP_C[cityId] ?? 26,
      rainChance: 70,
      eveningRainChance: 70,
      condition: "Rain",
    };
  }

  const seed = seededHash(`${cityId}:${date}`);
  const baseTemp = BASE_TEMP_C[cityId] ?? 26;
  const tempC = baseTemp + ((seed % 7) - 3);
  const rainChance = seed % 100;
  const eveningRainChance = (seed >> 3) % 100;
  const condition = CONDITIONS[seed % CONDITIONS.length];

  return { date, cityId, tempC, rainChance, eveningRainChance, condition };
}
