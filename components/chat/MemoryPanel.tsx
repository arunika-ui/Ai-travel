"use client";

import { useEffect, useState } from "react";
import { TripMemory } from "@/lib/trips/types";
import { listMemory, updateMemory, deleteMemory } from "@/lib/trips/memory";
import { EmptyState } from "@/components/ui/EmptyState";

export function MemoryPanel({ tripId }: { tripId: string }) {
  const [memories, setMemories] = useState<TripMemory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    setMemories(listMemory(tripId));
  }, [tripId]);

  function startEdit(m: TripMemory) {
    setEditingId(m.id);
    setEditValue(m.value);
  }

  function saveEdit() {
    if (!editingId) return;
    updateMemory(editingId, editValue);
    setMemories(listMemory(tripId));
    setEditingId(null);
  }

  function handleDelete(id: string) {
    deleteMemory(id);
    setMemories(listMemory(tripId));
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900">What the AI remembers about this trip</h3>
      <p className="mt-1 text-sm text-slate-600">
        Lasting preferences picked up from your chat commands. Edit or remove anything that&apos;s wrong.
      </p>

      {memories.length === 0 && (
        <div className="mt-4">
          <EmptyState title="Nothing remembered yet" body="Preferences you confirm in chat (like indoor evenings on rainy days) will show up here." />
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {memories.map((m) => (
          <li key={m.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            {editingId === m.id ? (
              <div className="flex gap-2">
                <label htmlFor={`memory-${m.id}`} className="sr-only">
                  Edit memory value
                </label>
                <input
                  id={`memory-${m.id}`}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button onClick={saveEdit} className="rounded-lg bg-brand-600 px-3 py-1 text-sm text-white">
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-slate-800">{m.value}</p>
                  <p className="text-xs text-slate-400">
                    {m.source === "ai" ? "Learned by AI" : "Set by you"} · {new Date(m.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => startEdit(m)}
                    className="rounded px-2 py-1 font-medium text-brand-700 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="rounded px-2 py-1 font-medium text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
