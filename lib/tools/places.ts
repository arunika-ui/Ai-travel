export interface PlaceResult {
  name: string;
  category: string;
  lat: number;
  lng: number;
  displayName: string;
}

const NOMINATIM_HEADERS = {
  "User-Agent": "ai-travel-companion/0.1 (educational project)",
  "Accept-Language": "en",
};

/**
 * Searches for points of interest near a destination using OpenStreetMap
 * Nominatim's free-text search (viewbox-biased toward the destination).
 * No API key required.
 */
export async function searchPlaces(
  query: string,
  near?: { lat: number; lng: number }
): Promise<PlaceResult[]> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "5");
    url.searchParams.set("addressdetails", "0");
    if (near) {
      const delta = 0.3;
      url.searchParams.set(
        "viewbox",
        `${near.lng - delta},${near.lat + delta},${near.lng + delta},${near.lat - delta}`
      );
      url.searchParams.set("bounded", "1");
    }

    const res = await fetch(url.toString(), { headers: NOMINATIM_HEADERS, cache: "no-store" });
    if (!res.ok) throw new Error(`nominatim ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => ({
      name: item.name || item.display_name?.split(",")[0] || query,
      category: item.type || item.class || "place",
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
    }));
  } catch {
    return [];
  }
}
