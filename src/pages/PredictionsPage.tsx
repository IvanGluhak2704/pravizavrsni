import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFinancije } from "../context/FinanceContext";
import { predictFutureExpenses } from "../utils/prediction";
import "./PredictionsPage.css";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("hr-HR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function PredictionsPage() {
  const { transakcije: transactions, statistika: stats } = useFinancije();
  const predictions = useMemo(
    () => predictFutureExpenses(transactions, 4),
    [transactions],
  );

  return (
    <div className="page-stack predictions-page">
      <section className="panel page-toolbar">
        <div>
          <p className="panel-kicker">Analitička projekcija</p>
          <h2>Predikcija budućih troškova</h2>
        </div>
      </section>

      <section className="metrics-grid">
        <div className="metric-card metric-violet">
          <div className="metric-header">
            <span>Prosječni prihod</span>
            <span className="metric-icon">€</span>
          </div>
          <strong>{formatCurrency(stats.prosjecniMjesecniPrihod)}</strong>
        </div>
        <div className="metric-card metric-amber">
          <div className="metric-header">
            <span>Prosječni trošak</span>
            <span className="metric-icon">€</span>
          </div>
          <strong>{formatCurrency(stats.prosjecniMjesecniTrosak)}</strong>
        </div>
        <div className="metric-card metric-green">
          <div className="metric-header">
            <span>Predviđeni iznos računa</span>
            <span className="metric-icon">€</span>
          </div>
          <strong>{formatCurrency(stats.stanje)}</strong>
        </div>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Graf</p>
              <h2>Procjena sljedećih mjeseci</h2>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={predictions}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(100,116,139,0.18)"
              />
              <XAxis dataKey="mjesec" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid rgba(15,23,42,0.1)",
                  borderRadius: 12,
                  color: "#1e293b",
                  boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
                }}
              />
              <Line
                type="monotone"
                dataKey="predvidjeniTrosak"
                stroke="#e11d48"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="predvidjeniPrihod"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Izračun</p>
              <h2>Detaljna tablica predikcije</h2>
            </div>
          </div>

          <div className="prediction-table">
            {predictions.map((item) => (
              <div className="prediction-table-row" key={item.mjesec}>
                <div>
                  <strong>{item.mjesec}</strong>
                  <p>Pouzdanost {item.pouzdanost}%</p>
                </div>
                <div className="prediction-amounts">
                  <span className="positive">
                    Prihod {formatCurrency(item.predvidjeniPrihod)}
                  </span>
                  <br />
                  <span className="negative">
                    Trošak {formatCurrency(item.predvidjeniTrosak)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
