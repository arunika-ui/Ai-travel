"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { readData } from "@/lib/data/localDb";
import { listUsers, setUserActive } from "@/lib/trips/auth";
import { getSettings, updateSettings } from "@/lib/trips/settings";
import { averageRating } from "@/lib/trips/feedback";
import { listAdminAuditLog, logAdminAction } from "@/lib/trips/auditLog";
import { listPlaceReports } from "@/lib/trips/report";
import { AdminAuditEntry, AppSettings, PlaceReport, User } from "@/lib/trips/types";

export default function AdminPage() {
  return (
    <AuthGuard requireAdmin>
      {(user) => <AdminContent adminId={user.id} />}
    </AuthGuard>
  );
}

function AdminContent({ adminId }: { adminId: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [tripCount, setTripCount] = useState(0);
  const [commandsByDay, setCommandsByDay] = useState<[string, number][]>([]);
  const [toolUsage, setToolUsage] = useState<[string, number][]>([]);
  const [rating, setRating] = useState(0);
  const [settings, setSettings] = useState<AppSettings>({
    maxToolCallsPerCommand: 5,
    dailyAICommandLimit: 50,
    dailyItineraryGenerationLimit: 5,
  });
  const [auditLog, setAuditLog] = useState<AdminAuditEntry[]>([]);
  const [placeReports, setPlaceReports] = useState<PlaceReport[]>([]);

  function refresh() {
    const data = readData();
    setUsers(listUsers());
    setTripCount(data.trips.length);
    setRating(averageRating());
    setSettings(getSettings());
    setAuditLog(listAdminAuditLog());
    setPlaceReports(listPlaceReports());

    const byDay = new Map<string, number>();
    const byTool = new Map<string, number>();
    for (const log of data.commandLogs) {
      const day = log.createdAt.slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
      for (const tool of log.toolsUsed) {
        byTool.set(tool, (byTool.get(tool) ?? 0) + 1);
      }
    }
    setCommandsByDay(Array.from(byDay.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1)));
    setToolUsage(Array.from(byTool.entries()).sort((a, b) => b[1] - a[1]));
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleToggleUser(user: User) {
    setUserActive(user.id, !user.active);
    logAdminAction(adminId, user.active ? "Suspended user" : "Activated user", user.email);
    refresh();
  }

  function handleSettingsSave(e: React.FormEvent) {
    e.preventDefault();
    updateSettings(settings);
    logAdminAction(
      adminId,
      "Updated AI agent settings",
      `maxToolCallsPerCommand=${settings.maxToolCallsPerCommand}, dailyAICommandLimit=${settings.dailyAICommandLimit}, dailyItineraryGenerationLimit=${settings.dailyItineraryGenerationLimit}`
    );
    refresh();
  }

  const maxDayCount = Math.max(1, ...commandsByDay.map(([, c]) => c));
  const maxToolCount = Math.max(1, ...toolUsage.map(([, c]) => c));

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-serif text-3xl text-ink">Admin console</h1>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Trips created" value={tripCount} />
          <Stat label="Users" value={users.length} />
          <Stat label="AI commands logged" value={commandsByDay.reduce((s, [, c]) => s + c, 0)} />
          <Stat label="Average rating" value={rating > 0 ? `${rating} ★` : "No ratings yet"} />
        </div>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Users</h2>
          <ul className="mt-2 divide-y divide-slate-100">
            {users.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{u.name} <span className="text-slate-400">· {u.role}</span></p>
                  <p className="text-slate-500">{u.email}</p>
                </div>
                <button
                  onClick={() => handleToggleUser(u)}
                  className={
                    u.active
                      ? "rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      : "rounded-lg border border-green-300 bg-white px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                  }
                >
                  {u.active ? "Suspend" : "Activate"}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold text-slate-900">AI commands per day</h2>
            {commandsByDay.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No AI commands logged yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {commandsByDay.map(([day, count]) => (
                  <div key={day}>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>{day}</span>
                      <span>{count}</span>
                    </div>
                    <div className="mt-0.5 h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(count / maxDayCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold text-slate-900">Most-used tools</h2>
            {toolUsage.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No tool calls logged yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {toolUsage.map(([tool, count]) => (
                  <div key={tool}>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>{tool}</span>
                      <span>{count}</span>
                    </div>
                    <div className="mt-0.5 h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(count / maxToolCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">AI agent settings</h2>
          <p className="mt-1 text-sm text-slate-600">
            These limits are enforced live by the chat agent and the itinerary generator (BR-9, FR-11.4).
          </p>
          <form onSubmit={handleSettingsSave} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="maxToolCalls" className="block text-sm font-medium text-slate-700">
                Max tool calls per command
              </label>
              <input
                id="maxToolCalls"
                type="number"
                min={1}
                max={10}
                value={settings.maxToolCallsPerCommand}
                onChange={(e) => setSettings((s) => ({ ...s, maxToolCallsPerCommand: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label htmlFor="dailyLimit" className="block text-sm font-medium text-slate-700">
                Daily AI command limit
              </label>
              <input
                id="dailyLimit"
                type="number"
                min={1}
                max={500}
                value={settings.dailyAICommandLimit}
                onChange={(e) => setSettings((s) => ({ ...s, dailyAICommandLimit: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label htmlFor="dailyGenLimit" className="block text-sm font-medium text-slate-700">
                Daily itinerary generations
              </label>
              <input
                id="dailyGenLimit"
                type="number"
                min={1}
                max={50}
                value={settings.dailyItineraryGenerationLimit}
                onChange={(e) => setSettings((s) => ({ ...s, dailyItineraryGenerationLimit: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <button
              type="submit"
              className="sm:col-span-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Save settings
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Place reports</h2>
          <p className="mt-1 text-sm text-slate-600">Submitted via &ldquo;Report incorrect info&rdquo; (FR-10.3).</p>
          {placeReports.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No reports yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-100 text-sm">
              {placeReports.map((r) => (
                <li key={r.id} className="py-2">
                  <span className="font-medium text-slate-900">{r.placeName}</span>{" "}
                  <span className="text-slate-500">— {new Date(r.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Admin audit log</h2>
          <p className="mt-1 text-sm text-slate-600">Every administrator action, with who and when (FR-11.5).</p>
          {auditLog.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No admin actions recorded yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-100 text-sm">
              {auditLog.map((entry) => (
                <li key={entry.id} className="py-2">
                  <span className="font-medium text-slate-900">{entry.action}</span>
                  <span className="text-slate-500"> — {entry.detail} · {new Date(entry.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
