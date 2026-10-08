interface StatusBadgeProps {
  value: string;
}

export function StatusBadge({ value }: StatusBadgeProps) {
  const normalized = value.toUpperCase();

  const styles =
    normalized === "ACTIVO" || normalized === "COMPLETADA" || normalized === "ENTRADA"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "SALIDA"
        ? "bg-blue-50 text-blue-700"
        : normalized === "PENDIENTE"
          ? "bg-amber-50 text-amber-700"
          : "bg-red-50 text-red-700";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${styles}`}>
      {value}
    </span>
  );
}
