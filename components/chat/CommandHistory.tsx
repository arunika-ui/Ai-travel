"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { AICommandLog } from "@/lib/trips/types";
import { listCommandLog } from "@/lib/trips/commandLog";
import { EmptyState } from "@/components/ui/EmptyState";

const STATUS_STYLE: Record<AICommandLog["status"], string> = {
  APPLIED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-700",
  ANSWERED: "bg-blue-100 text-blue-700",
};

export function CommandHistory({ tripId }: { tripId: string }) {
  const [log, setLog] = useState<AICommandLog[]>([]);

  useEffect(() => {
    setLog(listCommandLog(tripId));
  }, [tripId]);

  if (log.length === 0) {
    return <EmptyState title="No AI commands yet" body="Ask the chat to change something and it will show up here." />;
  }

  return (
    <ul className="space-y-3">
      {log.map((entry) => (
        <li key={entry.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-slate-900">&ldquo;{entry.text}&rdquo;</p>
            <span className={clsx("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_STYLE[entry.status])}>
              {entry.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{entry.reply}</p>
          {entry.toolsUsed.length > 0 && (
            <p className="mt-1 text-xs text-slate-400">Tools used: {entry.toolsUsed.join(", ")}</p>
          )}
          <p className="mt-1 text-xs text-slate-400">{new Date(entry.createdAt).toLocaleString()}</p>
        </li>
      ))}
    </ul>
  );
}
