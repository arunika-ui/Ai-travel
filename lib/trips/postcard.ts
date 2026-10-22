import { Trip } from "@/lib/trips/types";
import { getDestination } from "@/lib/mock-data/destinations";

const GRADIENTS: [string, string][] = [
  ["#58101c", "#231f1c"],
  ["#7c1f1f", "#450d16"],
  ["#a8928a", "#58101c"],
  ["#231f1c", "#6e1423"],
  ["#cfc8bd", "#7c1f1f"],
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Renders a shareable 1200x800 "postcard" PNG entirely client-side: a
 * journal photo if one exists (cover-fit with a scrim for text legibility),
 * otherwise the same gradient art used on the landing page, plus the trip
 * title, destination and dates. Returns a data URL — no server, no upload.
 */
export async function renderPostcard(trip: Trip, photoDataUrl: string | null): Promise<string> {
  const WIDTH = 1200;
  const HEIGHT = 800;
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser.");

  const destinationIndex = getDestination(trip.destination)
    ? ["udaipur", "goa", "jaipur", "manali", "rishikesh"].indexOf(trip.destination)
    : 0;
  const [from, to] = GRADIENTS[Math.max(destinationIndex, 0) % GRADIENTS.length];

  if (photoDataUrl) {
    const img = await loadImage(photoDataUrl);
    const scale = Math.max(WIDTH / img.width, HEIGHT / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (WIDTH - w) / 2, (HEIGHT - h) / 2, w, h);
    const scrim = ctx.createLinearGradient(0, HEIGHT * 0.4, 0, HEIGHT);
    scrim.addColorStop(0, "rgba(0,0,0,0)");
    scrim.addColorStop(1, "rgba(0,0,0,0.75)");
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, from);
    gradient.addColorStop(1, to);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  const destination = getDestination(trip.destination);
  ctx.fillStyle = "#faf6ef";
  ctx.textBaseline = "alphabetic";

  ctx.font = "600 28px DM Sans, sans-serif";
  ctx.fillText("AI TRAVEL COMPANION", 60, 70);

  ctx.font = "italic 64px Georgia, serif";
  ctx.fillText(destination?.name ?? trip.destination, 60, 420);

  ctx.font = "400 32px Georgia, serif";
  ctx.fillText(trip.title, 60, 470);

  ctx.font = "500 26px DM Sans, sans-serif";
  ctx.fillText(`${trip.startDate} — ${trip.endDate}`, 60, 520);

  return canvas.toDataURL("image/png");
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
