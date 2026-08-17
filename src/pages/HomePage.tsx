import { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFinancije } from "../context/FinanceContext";
import { buildCategoryChartData } from "../utils/chartData";
import { predictFutureExpenses } from "../utils/prediction";
import "./HomePage.css";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("hr-HR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function InfoCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  tone: "green" | "amber" | "blue" | "violet";
}) {
  return (
    <div className={`metric-card metric-${tone}`}>
      <div className="metric-header">
        <span>{title}</span>
        <div className="metric-icon">{icon}</div>
      </div>
      <strong>{value}</strong>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { transakcije: transactions, statistika: stats } = useFinancije();
  const predictions = useMemo(
    () => predictFutureExpenses(transactions, 4),
    [transactions],
  );

  const chartData = [
    { label: "Prihod", value: stats.ukupniPrihod },
    { label: "Trošak", value: stats.ukupniTrosak },
    { label: "Stanje", value: Math.max(stats.stanje, 0) },
  ];
  const categoryData = useMemo(
    () => buildCategoryChartData(transactions, "expense"),
    [transactions],
  );

  return (
    <div className="page-stack home-page">
      <section className="hero-card panel">
        <div className="hero-copy">
          <p className="panel-kicker">Uvodni pregled</p>
          <h2>Digitalni pregled osobnih financija</h2>
          <p>Ovdje pratiš prihode, troškove, stanja računa i predikcije.</p>
        </div>

        <div className="hero-actions hero-actions-grid">
          <button
            className="primary-btn"
            type="button"
            onClick={() => navigate("/transakcije")}
          >
            <Sparkles size={18} />
            Idi na unos
          </button>
          <button
            className="secondary-btn"
            type="button"
            onClick={() => navigate("/racuni")}
          >
            <Wallet size={18} />
            Pregled računa
          </button>
          <button
            className="secondary-btn"
            type="button"
            onClick={() => navigate("/predikcija")}
          >
            <TrendingUp size={18} />
            Predikcija
          </button>
        </div>
      </section>

      <section className="metrics-grid">
        <InfoCard
          title="Ukupni prihod"
          value={formatCurrency(stats.ukupniPrihod)}
          icon={<ArrowUpRight size={18} />}
          tone="green"
        />
        <InfoCard
          title="Ukupni trošak"
          value={formatCurrency(stats.ukupniTrosak)}
          icon={<ArrowDownRight size={18} />}
          tone="amber"
        />
        <InfoCard
          title="Stanje računa"
          value={formatCurrency(stats.stanje)}
          icon={<Wallet size={18} />}
          tone="blue"
        />
        <InfoCard
          title="Predikcija"
          value={formatCurrency(predictions[0]?.predvidjeniTrosak ?? 0)}
          icon={<TrendingUp size={18} />}
          tone="violet"
        />
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Trendovi</p>
              <h2>Predviđeni tokovi</h2>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={predictions.map((item) => ({
                month: item.mjesec,
                expense: item.predvidjeniTrosak,
                income: item.predvidjeniPrihod,
              }))}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(100,116,139,0.18)"
              />
              <XAxis dataKey="month" stroke="#64748b" />
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
                dataKey="income"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#e11d48"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Troškovi</p>
              <h2>Potrošnja po kategorijama</h2>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={4}
              >
                {categoryData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid rgba(15,23,42,0.1)",
                  borderRadius: 12,
                  color: "#1e293b",
                  boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="legend-list">
            {categoryData.map((entry) => (
              <div className="legend-item" key={entry.name}>
                <span className="legend-item-label">
                  <span
                    className="legend-dot"
                    style={{ background: entry.color }}
                  />
                  {entry.name}
                </span>
                <strong>{formatCurrency(entry.value)}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Brzi uvid</p>
              <h2>Posljednje transakcije</h2>
            </div>
          </div>

          <div className="mini-summary-list">
            {transactions.slice(0, 4).map((transaction) => (
              <div className="mini-summary-item" key={transaction.id}>
                <div>
                  <strong>{transaction.naziv}</strong>
                  <p>
                    {transaction.kategorija} • {transaction.datum}
                  </p>
                </div>
                <span
                  className={
                    transaction.vrsta === "income" ? "positive" : "negative"
                  }
                >
                  {transaction.vrsta === "income" ? "+" : "-"}
                  {formatCurrency(transaction.iznos)}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Sažetak</p>
              <h2>Pregled salda</h2>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(100,116,139,0.18)"
              />
              <XAxis dataKey="label" stroke="#64748b" />
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
              <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>
    </div>
  );
}
