export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <p className="font-medium text-slate-700">{title}</p>
      {body && <p className="mt-1 text-sm text-slate-500">{body}</p>}
    </div>
  );
}
