import type { PodaciPredikcije, Transakcija } from "../types";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateMonthlyTrend(values: number[]): number {
  if (values.length < 2) return 0;

  const middle = Math.floor(values.length / 2);
  const olderHalf = values.slice(0, middle);
  const newerHalf = values.slice(middle);

  return (average(newerHalf) - average(olderHalf)) / middle;
}

export function predictFutureExpenses(
  transactions: Transakcija[],
  monthsAhead: number = 3,
): PodaciPredikcije[] {
  const now = new Date();
  const predictions: PodaciPredikcije[] = [];

  const monthlyData: Record<string, { expense: number; income: number }> = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.datum);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { expense: 0, income: 0 };
    }

    if (transaction.vrsta === "expense") {
      monthlyData[monthKey].expense += transaction.iznos;
    } else {
      monthlyData[monthKey].income += transaction.iznos;
    }
  });

  const orderedMonths = Object.keys(monthlyData).sort();
  const expenseSeries = orderedMonths.map(
    (monthKey) => monthlyData[monthKey].expense,
  );
  const incomeSeries = orderedMonths.map(
    (monthKey) => monthlyData[monthKey].income,
  );

  const avgExpense = average(expenseSeries);
  const avgIncome = average(incomeSeries);

  const expenseTrend = calculateMonthlyTrend(expenseSeries);
  const incomeTrend = calculateMonthlyTrend(incomeSeries);

  const confidence = Math.min(90, 55 + orderedMonths.length * 5);

  for (let i = 1; i <= monthsAhead; i += 1) {
    const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthStr = futureDate.toLocaleDateString("hr-HR", {
      month: "long",
      year: "numeric",
    });

    predictions.push({
      mjesec: monthStr,
      predvidjeniTrosak: Math.max(0, Math.round(avgExpense + expenseTrend * i)),
      predvidjeniPrihod: Math.max(0, Math.round(avgIncome + incomeTrend * i)),
      pouzdanost: confidence,
    });
  }

  return predictions;
}
