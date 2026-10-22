export interface WeatherResult {
  date: string;
  maxTempC: number | null;
  minTempC: number | null;
  precipitationProbability: number | null;
  summary: string;
}

const WEATHER_CODE_SUMMARY: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Freezing fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Light rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Light rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

/**
 * Fetches a daily forecast (or climatological average for far-future
 * dates) from Open-Meteo. No API key required.
 */
export async function getWeather(
  lat: number,
  lng: number,
  date: string
): Promise<WeatherResult> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lng));
    url.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode"
    );
    url.searchParams.set("start_date", date);
    url.searchParams.set("end_date", date);
    url.searchParams.set("timezone", "auto");

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`open-meteo ${res.status}`);
    const data = await res.json();

    const idx = 0;
    const maxTempC = data?.daily?.temperature_2m_max?.[idx] ?? null;
    const minTempC = data?.daily?.temperature_2m_min?.[idx] ?? null;
    const precipitationProbability =
      data?.daily?.precipitation_probability_max?.[idx] ?? null;
    const code = data?.daily?.weathercode?.[idx];
    const summary =
      (typeof code === "number" ? WEATHER_CODE_SUMMARY[code] : null) ??
      "Forecast unavailable";

    return { date, maxTempC, minTempC, precipitationProbability, summary };
  } catch {
    return {
      date,
      maxTempC: null,
      minTempC: null,
      precipitationProbability: null,
      summary: "Forecast unavailable",
    };
  }
}
