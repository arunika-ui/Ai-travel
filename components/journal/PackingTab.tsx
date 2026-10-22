"use client";

import { useEffect, useState } from "react";
import { PackingItem, Trip } from "@/lib/trips/types";
import { ensurePackingList, regeneratePackingList, toggleItem, addCustomItem, removeItem } from "@/lib/trips/packing";

export function PackingTab({ trip, readOnly }: { trip: Trip; readOnly?: boolean }) {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    setItems(ensurePackingList(trip));
  }, [trip.id]);

  function refresh() {
    setItems(ensurePackingList(trip));
  }

  function handleToggle(id: string) {
    toggleItem(id);
    refresh();
  }

  function handleRegenerate() {
    setItems(regeneratePackingList(trip));
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.trim()) return;
    addCustomItem(trip.id, newItem.trim());
    setNewItem("");
    refresh();
  }

  function handleRemove(id: string) {
    removeItem(id);
    refresh();
  }

  const byCategory = new Map<string, PackingItem[]>();
  for (const item of items) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }
  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">
            Packing checklist — {checkedCount}/{items.length} packed
          </p>
          {!readOnly && (
            <button onClick={handleRegenerate} className="text-xs font-medium text-brand-700 underline">
              Regenerate from trip details
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Built from your destination&apos;s climate, interests and trip length — not AI, just rules.
        </p>

        {Array.from(byCategory.entries()).map(([category, categoryItems]) => (
          <div key={category} className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{category}</p>
            <ul className="mt-1 space-y-1">
              {categoryItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-sm text-slate-800">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      disabled={readOnly}
                      onChange={() => handleToggle(item.id)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className={item.checked ? "line-through text-slate-400" : ""}>{item.label}</span>
                  </label>
                  {!readOnly && item.category === "Custom" && (
                    <button onClick={() => handleRemove(item.id)} className="text-xs text-red-600 hover:underline">
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {!readOnly && (
          <form onSubmit={handleAdd} className="mt-4 flex gap-2">
            <label htmlFor="new-packing-item" className="sr-only">Add an item</label>
            <input
              id="new-packing-item"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add your own item"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button type="submit" className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white">
              Add
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
