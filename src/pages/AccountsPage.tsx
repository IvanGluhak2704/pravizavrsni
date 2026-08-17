import { useMemo, useState, type FormEvent } from "react";
import { BadgeCheck, Landmark, Plus, Trash2, Wallet } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useFinancije } from "../context/FinanceContext";
import { buildCategoryChartData } from "../utils/chartData";
import "./AccountsPage.css";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("hr-HR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

const CATEGORY_COLORS = [
  "#10b981",
  "#f59e0b",
  "#7c3aed",
  "#ec4899",
  "#f43f5e",
  "#0ea5e9",
  "#14b8a6",
];

type CategoryType = "income" | "expense";

export function AccountsPage() {
  const {
    transakcije: transactions,
    kategorije: categories,
    statistika: stats,
    dodajKategoriju: addCategory,
    obrisiKategoriju: deleteCategory,
  } = useFinancije();
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState<CategoryType>("expense");

  const categoryTotals = useMemo(
    () => buildCategoryChartData(transactions, "expense"),
    [transactions],
  );

  const handleAddCategory = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    addCategory({
      name: categoryName.trim(),
      vrsta: categoryType,
      color: CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length],
      icon: categoryName.trim().slice(0, 2).toUpperCase(),
    });

    setCategoryName("");
    setCategoryType("expense");
  };

  return (
    <div className="page-stack accounts-page">
      <section className="panel page-toolbar">
        <div>
          <p className="panel-kicker">Računi</p>
          <h2>Pregled stanja računa</h2>
          <p className="section-copy">
            Ova stranica daje sažetak stanja, kategorija i navika potrošnje.
          </p>
        </div>
      </section>

      <section className="metrics-grid">
        <div className="metric-card metric-green">
          <div className="metric-header">
            <span>Ukupni prihod</span>
            <div className="metric-icon">
              <Landmark size={18} />
            </div>
          </div>
          <strong>{formatCurrency(stats.ukupniPrihod)}</strong>
        </div>
        <div className="metric-card metric-amber">
          <div className="metric-header">
            <span>Ukupni trošak</span>
            <div className="metric-icon">
              <Wallet size={18} />
            </div>
          </div>
          <strong>{formatCurrency(stats.ukupniTrosak)}</strong>
        </div>
        <div className="metric-card metric-blue">
          <div className="metric-header">
            <span>Stanje</span>
            <div className="metric-icon">
              <BadgeCheck size={18} />
            </div>
          </div>
          <strong>{formatCurrency(stats.stanje)}</strong>
        </div>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Kategorije</p>
              <h2>Aktivne kategorije</h2>
            </div>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <div className="category-card" key={category.id}>
                <div className="category-card-info">
                  <span className="category-icon">{category.icon}</span>
                  <div>
                    <strong>{category.name}</strong>
                    <p>{category.vrsta === "income" ? "Prihod" : "Trošak"}</p>
                  </div>
                </div>
                <button
                  className="icon-button danger-button"
                  type="button"
                  onClick={() => deleteCategory(category.id)}
                  aria-label={`Obriši kategoriju ${category.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <form className="category-add-form" onSubmit={handleAddCategory}>
            <label className="field">
              <span>Naziv kategorije</span>
              <input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Npr. Pretplate"
              />
            </label>

            <label className="field">
              <span>Tip</span>
              <select
                value={categoryType}
                onChange={(e) =>
                  setCategoryType(e.target.value as CategoryType)
                }
              >
                <option value="expense">Trošak</option>
                <option value="income">Prihod</option>
              </select>
            </label>

            <button className="secondary-btn category-add-btn" type="submit">
              <Plus size={16} />
              Dodaj kategoriju
            </button>
          </form>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Raspodjela</p>
              <h2>Potrošnja po kategorijama</h2>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={categoryTotals}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
              >
                {categoryTotals.map((entry) => (
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
            {categoryTotals.map((entry) => (
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
    </div>
  );
}
