"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, Polyline } from "react-leaflet";
import L from "leaflet";
import { DayPlan } from "@/lib/trips/types";

function numberedIcon(n: number): L.DivIcon {
  return L.divIcon({
    html: `<div style="background:#1d4ed8;color:white;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)">${n}</div>`,
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export function MapView({ day }: { day: DayPlan }) {
  const points = useMemo(
    () =>
      day.activities
        .filter((a) => typeof a.lat === "number" && typeof a.lng === "number")
        .map((a, idx) => ({ lat: a.lat as number, lng: a.lng as number, title: a.title, time: a.startTime, order: idx + 1 })),
    [day]
  );

  if (points.length === 0) {
    return (
      <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
        Map tiles are unavailable or no locations are mapped for Day {day.dayNumber}, but the rest of the app still works.
      </p>
    );
  }

  const center: [number, number] = [points[0].lat, points[0].lng];

  return (
    <div className="h-80 overflow-hidden rounded-xl border border-slate-200" role="group" aria-label={`Map for Day ${day.dayNumber}`}>
      <MapContainer center={center} zoom={13} className="h-full w-full" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={points.map((p) => [p.lat, p.lng])} pathOptions={{ color: "#2563eb" }} />
        {points.map((p) => (
          <Marker key={p.order} position={[p.lat, p.lng]} icon={numberedIcon(p.order)}>
            <Popup>
              {p.order}. {p.time} · {p.title}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
