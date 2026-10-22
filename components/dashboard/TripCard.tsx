import Link from "next/link";
import { Trip } from "@/lib/trips/types";
import { Badge } from "@/components/ui/Badge";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/trips/status";
import { getDestination } from "@/lib/mock-data/destinations";
import { TripStatus } from "@/lib/trips/types";

export function TripCard({ trip, status }: { trip: Trip; status: TripStatus }) {
  const destination = getDestination(trip.destination);
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">{trip.title}</p>
          <p className="text-sm text-slate-600">
            {destination?.name ?? trip.destination} · {trip.startDate} to {trip.endDate}
          </p>
        </div>
        <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        {trip.travelers} traveler(s) · Budget ₹{trip.budget.toLocaleString("en-IN")}
      </p>
    </Link>
  );
}
