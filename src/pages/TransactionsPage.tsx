import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { TransactionForm } from "../components/TransactionForm";
import { TransactionList } from "../components/TransactionList";
import { useFinancije } from "../context/FinanceContext";
import type { Transakcija } from "../types";
import "./TransactionsPage.css";

type FilterMode = "all" | "income" | "expense";
type SortMode = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

const sortOptions: { value: SortMode; label: string }[] = [
  { value: "date-desc", label: "Najnovije prvo" },
  { value: "date-asc", label: "Najstarije prvo" },
  { value: "amount-desc", label: "Najveći iznos" },
  { value: "amount-asc", label: "Najmanji iznos" },
];

export function TransactionsPage() {
  const { transakcije: transactions, obrisiTransakciju: deleteTransaction } =
    useFinancije();
  const [filter, setFilter] = useState<FilterMode>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("date-desc");
  const [editingTransaction, setEditingTransaction] =
    useState<Transakcija | null>(null);

  const filteredTransactions = useMemo(() => {
    let result = transactions;
    if (filter !== "all") {
      result = result.filter((transaction) => transaction.vrsta === filter);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (transaction) =>
          transaction.naziv.toLowerCase().includes(query) ||
          transaction.kategorija.toLowerCase().includes(query),
      );
    }

    return [...result].sort((a, b) => {
      switch (sortMode) {
        case "date-asc":
          return a.datum.localeCompare(b.datum);
        case "amount-desc":
          return b.iznos - a.iznos;
        case "amount-asc":
          return a.iznos - b.iznos;
        case "date-desc":
        default:
          return b.datum.localeCompare(a.datum);
      }
    });
  }, [filter, transactions, searchQuery, sortMode]);

  const handleDelete = (id: string) => {
    if (editingTransaction?.id === id) {
      setEditingTransaction(null);
    }
    deleteTransaction(id);
  };

  return (
    <div className="page-stack transactions-page">
      <section className="panel page-toolbar">
        <div>
          <p className="panel-kicker">Unos i upravljanje</p>
          <h2>Dodavanje i pregled transakcija</h2>
          <p className="section-copy">
            Uređivanje, brisanje i filtriranje transakcije.
          </p>
        </div>
      </section>

      <TransactionForm
        key={editingTransaction?.id ?? "new-transaction"}
        editingTransaction={editingTransaction}
        onDoneEditing={() => setEditingTransaction(null)}
      />

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="panel-kicker">Filteri</p>
            <h2>Pregled transakcija</h2>
          </div>
          <div className="filter-row">
            {(
              [
                ["all", "Sve"],
                ["income", "Prihodi"],
                ["expense", "Troškovi"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`chip-button ${filter === value ? "active" : ""}`}
                onClick={() => setFilter(value)}
              >
                <Filter size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="list-controls">
          <label className="field search-field">
            <span>Pretraga</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pretraži po nazivu ili kategoriji..."
            />
          </label>

          <label className="field sort-field">
            <span>Sortiraj</span>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <TransactionList
          transactions={filteredTransactions}
          onDelete={handleDelete}
          onEdit={setEditingTransaction}
        />
      </section>
    </div>
  );
}
