interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  accent?: "amber" | "blue" | "emerald" | "red";
}

export function MetricCard({ label, value, detail, accent = "amber" }: MetricCardProps) {
  const accents = {
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600"
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl font-black ${accents[accent]}`}>
          •
        </span>
      </div>
      <p className="mt-4 text-2xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </article>
  );
}
