export interface GeocodeResult {
  name: string;
  lat: number;
  lng: number;
  displayName: string;
}

const NOMINATIM_HEADERS = {
  "User-Agent": "ai-travel-companion/0.1 (educational project)",
  "Accept-Language": "en",
};

/**
 * Resolves a place name to coordinates via OpenStreetMap Nominatim.
 * No API key required; respects Nominatim's usage policy with a
 * descriptive User-Agent and a single request per call.
 */
export async function geocode(query: string): Promise<GeocodeResult | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString(), { headers: NOMINATIM_HEADERS, cache: "no-store" });
    if (!res.ok) throw new Error(`nominatim ${res.status}`);
    const data = await res.json();
    const first = Array.isArray(data) ? data[0] : null;
    if (!first) return null;

    return {
      name: query,
      lat: parseFloat(first.lat),
      lng: parseFloat(first.lon),
      displayName: first.display_name,
    };
  } catch {
    return null;
  }
}
