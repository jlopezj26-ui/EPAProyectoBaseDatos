export type SortDirection = "asc" | "desc";
export type SortState = { key: string; direction: SortDirection };

export function toggleSort(current: SortState, key: string): SortState {
  return current.key === key
    ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
    : { key, direction: "asc" };
}

export function compareValues(left: unknown, right: unknown): number {
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left ?? "").localeCompare(String(right ?? ""), "es", {
    numeric: true,
    sensitivity: "base",
  });
}
