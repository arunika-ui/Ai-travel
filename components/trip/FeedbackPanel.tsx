"use client";

import { useEffect, useState } from "react";
import { Trip } from "@/lib/trips/types";
import { getFeedback, submitFeedback } from "@/lib/trips/feedback";
import { getCurrentItinerary } from "@/lib/trips/itinerary";

export function FeedbackPanel({ trip }: { trip: Trip }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const existing = getFeedback(trip.id);
    if (existing) {
      setRating(existing.rating);
      setComment(existing.comment);
      setSubmitted(true);
    }
  }, [trip.id]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    const itinerary = getCurrentItinerary(trip.id);
    submitFeedback({ tripId: trip.id, itineraryVersion: itinerary?.version ?? 1, rating, comment });
    setSubmitted(true);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900">How was this trip?</h3>
      <form onSubmit={handleSubmit} className="mt-2 space-y-3">
        <div role="radiogroup" aria-label="Star rating" className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              className="text-2xl leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {n <= rating ? "★" : "☆"}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="feedback-comment" className="block text-sm font-medium text-slate-700">
            Comment (optional)
          </label>
          <textarea
            id="feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          disabled={rating === 0}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60"
        >
          {submitted ? "Update feedback" : "Submit feedback"}
        </button>
        {submitted && <p role="status" className="text-sm text-green-600">Thanks for your feedback!</p>}
      </form>
    </div>
  );
}
