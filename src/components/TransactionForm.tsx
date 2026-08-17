import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useFinancije } from "../context/FinanceContext";
import type { Transakcija } from "../types";
import "./TransactionForm.css";

type TransactionType = "income" | "expense";

type Props = {
  editingTransaction?: Transakcija | null;
  onDoneEditing?: () => void;
};

function getDefaultCategoryName(
  categories: { name: string; vrsta: TransactionType }[],
): string {
  const expenseCategory = categories.find((c) => c.vrsta === "expense");
  if (expenseCategory) {
    return expenseCategory.name;
  }

  if (categories.length > 0) {
    return categories[0].name;
  }

  return "";
}

export function TransactionForm({ editingTransaction, onDoneEditing }: Props) {
  const {
    kategorije: categories,
    dodajTransakciju: addTransaction,
    azurirajTransakciju: updateTransaction,
  } = useFinancije();
  const [title, setTitle] = useState(editingTransaction?.naziv ?? "");
  const [category, setCategory] = useState(
    editingTransaction?.kategorija ?? getDefaultCategoryName(categories),
  );
  const [amount, setAmount] = useState(
    editingTransaction ? String(editingTransaction.iznos) : "",
  );
  const [type, setType] = useState<TransactionType>(
    editingTransaction?.vrsta ?? "expense",
  );
  const [date, setDate] = useState(
    editingTransaction?.datum ?? new Date().toISOString().slice(0, 10),
  );

  const isEditing = Boolean(editingTransaction);

  const matchingCategories = categories.filter((c) => c.vrsta === type);
  const categoryOptions =
    matchingCategories.length > 0 ? matchingCategories : categories;

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);

    const matching = categories.filter((c) => c.vrsta === nextType);
    if (matching.length > 0 && !matching.some((c) => c.name === category)) {
      setCategory(matching[0].name);
    }
  };

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategory(getDefaultCategoryName(categories));
    setType("expense");
    setDate(new Date().toISOString().slice(0, 10));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    const payload = {
      naziv: title,
      kategorija: category,
      iznos: Number(amount),
      vrsta: type,
      datum: date,
    };

    if (isEditing && editingTransaction) {
      updateTransaction(editingTransaction.id, payload);
      onDoneEditing?.();
    } else {
      addTransaction(payload);
      resetForm();
    }
  };

  const handleCancel = () => {
    onDoneEditing?.();
  };

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <p className="panel-kicker">{isEditing ? "Uređivanje" : "Unos"}</p>
          <h2>{isEditing ? "Uredi transakciju" : "Nova transakcija"}</h2>
        </div>
        {isEditing ? (
          <button
            className="icon-button"
            type="button"
            onClick={handleCancel}
            aria-label="Odustani od uređivanja"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Naziv</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Npr. Plaća, Namirnice..."
          />
        </label>

        <label className="field">
          <span>Kategorija</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Iznos</span>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </label>

        <label className="field">
          <span>Datum</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Tip</span>
          <select
            value={type}
            onChange={(e) =>
              handleTypeChange(e.target.value as TransactionType)
            }
          >
            <option value="expense">Trošak</option>
            <option value="income">Prihod</option>
          </select>
        </label>
      </div>

      <div className="form-actions">
        <button className="primary-btn form-btn" type="submit">
          {isEditing ? "Spremi izmjene" : "Dodaj transakciju"}
        </button>
        {isEditing ? (
          <button className="ghost-button" type="button" onClick={handleCancel}>
            Odustani
          </button>
        ) : null}
      </div>
    </form>
  );
}
