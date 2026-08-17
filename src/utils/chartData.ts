import type { Transakcija } from "../types";
const CHART_COLORS = ["#7c3aed", "#10b981", "#f59e0b", "#ec4899", "#0ea5e9"];
export interface ChartSlice {
  name: string;
  value: number;
  color: string;
}

export function buildCategoryChartData(
  transactions: Transakcija[],
  type?: Transakcija["vrsta"],
): ChartSlice[] {
  const totals: Record<string, number> = {};

  transactions.forEach((transaction) => {
    if (type && transaction.vrsta !== type) {
      return;
    }

    const trenutniZbroj = totals[transaction.kategorija] || 0;
    totals[transaction.kategorija] = trenutniZbroj + transaction.iznos;
  });

  const slices = Object.entries(totals).map(([name, value], index) => ({
    name,
    value,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));
  return slices.sort(
    (left, right) =>
      right.value - left.value || left.name.localeCompare(right.name),
  );
}
