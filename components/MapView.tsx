"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, Polyline } from "react-leaflet";
import L from "leaflet";
import { DayPlan } from "@/lib/types";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export function MapView({ day }: { day: DayPlan }) {
  const points = useMemo(
    () =>
      day.activities
        .filter((a) => a.location.lat != null && a.location.lng != null)
        .map((a) => ({
          lat: a.location.lat as number,
          lng: a.location.lng as number,
          title: a.title,
          time: a.time,
        })),
    [day]
  );

  if (points.length === 0) {
    return (
      <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
        No mapped locations for Day {day.day} yet.
      </p>
    );
  }

  const center: [number, number] = [points[0].lat, points[0].lng];

  return (
    <div className="h-80 overflow-hidden rounded-xl border border-slate-200" role="group" aria-label={`Map for Day ${day.day}`}>
      <MapContainer center={center} zoom={13} className="h-full w-full" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={points.map((p) => [p.lat, p.lng])} pathOptions={{ color: "#2563eb" }} />
        {points.map((p, idx) => (
          <Marker key={idx} position={[p.lat, p.lng]} icon={icon}>
            <Popup>
              {p.time} · {p.title}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
