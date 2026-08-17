import { Pencil } from "lucide-react";
import type { Transakcija } from "../types";
import "./TransactionList.css";

type Props = {
  transactions: Transakcija[];
  onDelete?: (id: string) => void;
  onEdit?: (transaction: Transakcija) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("hr-HR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function TransactionList({ transactions, onDelete, onEdit }: Props) {
  return (
    <div className="panel transaction-panel">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Pregled</p>
          <h2>Popis transakcija</h2>
        </div>
      </div>

      <div className="transaction-list transaction-list-large">
        {transactions.map((transaction) => (
          <div className="transaction-item" key={transaction.id}>
            <div className="transaction-main">
              <div className={`transaction-dot ${transaction.vrsta}`} />
              <div>
                <h3>{transaction.naziv}</h3>
                <p>
                  {transaction.kategorija} • {transaction.datum}
                </p>
              </div>
            </div>

            <div className="transaction-actions">
              <strong
                className={transaction.vrsta === "income" ? "green" : "red"}
              >
                {transaction.vrsta === "income" ? "+" : "-"}
                {formatCurrency(transaction.iznos)}
              </strong>
              {onEdit ? (
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => onEdit(transaction)}
                  aria-label={`Uredi transakciju ${transaction.naziv}`}
                >
                  <Pencil size={14} />
                  Uredi
                </button>
              ) : null}
              {onDelete ? (
                <button
                  className="ghost-button danger-button"
                  type="button"
                  onClick={() => onDelete(transaction.id)}
                  aria-label={`Obriši transakciju ${transaction.naziv}`}
                >
                  Obriši
                </button>
              ) : null}
            </div>
          </div>
        ))}

        {transactions.length === 0 ? (
          <div className="empty-state">
            <h3>Nema transakcija</h3>
            <p>Dodaj prvu transakciju da bi se prikazali podaci.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
