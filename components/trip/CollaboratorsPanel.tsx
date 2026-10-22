"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { Collaborator, CollaboratorRole, Trip } from "@/lib/trips/types";
import { tripRepository } from "@/lib/data/TripRepository";

export function CollaboratorsPanel({
  trip,
  onUpdated,
}: {
  trip: Trip;
  onUpdated: (trip: Trip) => void;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CollaboratorRole>("editor");
  const [error, setError] = useState<string | null>(null);

  const collaborators = trip.collaborators ?? [];

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    if (collaborators.some((c) => c.email === trimmed)) {
      setError("That person is already invited.");
      return;
    }
    const newCollaborator: Collaborator = { id: nanoid(6), email: trimmed, role, invitedAt: new Date().toISOString() };
    const updated: Trip = { ...trip, collaborators: [...collaborators, newCollaborator] };
    await tripRepository.save(updated);
    onUpdated(updated);
    setEmail("");
  }

  async function handleRevoke(id: string) {
    const updated: Trip = { ...trip, collaborators: collaborators.filter((c) => c.id !== id) };
    await tripRepository.save(updated);
    onUpdated(updated);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        Collaborators{collaborators.length > 0 ? ` (${collaborators.length})` : ""}
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
          <p className="text-sm font-semibold text-slate-900">Invite a collaborator</p>
          <p className="mt-1 text-xs text-slate-500">
            Prototype only (FR-9.4–9.6): no email is sent and there is no real second account in
            this browser — this just records the invite and role so the feature can be demoed.
          </p>
          <form onSubmit={handleInvite} className="mt-3 space-y-2">
            <label htmlFor="collab-email" className="sr-only">Email</label>
            <input
              id="collab-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <div className="flex gap-2">
              <select
                aria-label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value as CollaboratorRole)}
                className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="editor">Editor — can change the plan</option>
                <option value="viewer">Viewer — can only view</option>
              </select>
              <button type="submit" className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white">
                Invite
              </button>
            </div>
            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
          </form>

          {collaborators.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3">
              {collaborators.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span>{c.email} <span className="text-xs text-slate-400">· {c.role}</span></span>
                  <button
                    onClick={() => handleRevoke(c.id)}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
