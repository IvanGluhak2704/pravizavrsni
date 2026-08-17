import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Transakcija, Kategorija, FinancijskeStatistike } from "../types";

interface TipFinancijskogKonteksta {
  transakcije: Transakcija[];
  kategorije: Kategorija[];
  statistika: FinancijskeStatistike;
  dodajTransakciju: (
    transaction: Omit<Transakcija, "id" | "kreiranoU">,
  ) => void;
  obrisiTransakciju: (id: string) => void;
  azurirajTransakciju: (id: string, transaction: Partial<Transakcija>) => void;
  dodajKategoriju: (category: Omit<Kategorija, "id">) => void;
  obrisiKategoriju: (id: string) => void;
}

interface FinancijskoStanje {
  transakcije: Transakcija[];
  kategorije: Kategorija[];
}

const KLJUC_SPREMANJA = "financial-tracker-state";

const zadaneKategorije: Kategorija[] = [
  { id: "1", name: "Plača", vrsta: "income", color: "#10b981", icon: "PL" },
  { id: "2", name: "Hrana", vrsta: "expense", color: "#f59e0b", icon: "HR" },
  { id: "3", name: "Prijevoz", vrsta: "expense", color: "#3b82f6", icon: "PR" },
  { id: "4", name: "Zabava", vrsta: "expense", color: "#ec4899", icon: "ZA" },
  {
    id: "5",
    name: "Zdravstvo",
    vrsta: "expense",
    color: "#ef4444",
    icon: "ZD",
  },
];

const initialState: FinancijskoStanje = {
  transakcije: [],
  kategorije: zadaneKategorije,
};

const FinancijskiKontekst = createContext<TipFinancijskogKonteksta | undefined>(
  undefined,
);

function izracunajStatistiku(
  transactions: Transakcija[],
): FinancijskeStatistike {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((transaction) => {
    if (transaction.vrsta === "income") {
      totalIncome += transaction.iznos;
    } else {
      totalExpense += transaction.iznos;
    }
  });

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const monthCount = 6;

  let recentIncome = 0;
  let recentExpense = 0;

  transactions.forEach((transaction) => {
    const isRecent = new Date(transaction.datum) >= sixMonthsAgo;
    if (!isRecent) return;

    if (transaction.vrsta === "income") {
      recentIncome += transaction.iznos;
    } else {
      recentExpense += transaction.iznos;
    }
  });

  return {
    ukupniPrihod: totalIncome,
    ukupniTrosak: totalExpense,
    stanje: totalIncome - totalExpense,
    prosjecniMjesecniTrosak: recentExpense / monthCount,
    prosjecniMjesecniPrihod: recentIncome / monthCount,
  };
}

function ucitajPocetnoStanje(): FinancijskoStanje {
  if (typeof window === "undefined") {
    return initialState;
  }

  const savedState = window.localStorage.getItem(KLJUC_SPREMANJA);
  if (!savedState) {
    return initialState;
  }

  try {
    return JSON.parse(savedState) as FinancijskoStanje;
  } catch {
    return initialState;
  }
}

export function FinancijskiProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinancijskoStanje>(ucitajPocetnoStanje);
  const stats = useMemo(
    () => izracunajStatistiku(state.transakcije),
    [state.transakcije],
  );

  useEffect(() => {
    window.localStorage.setItem(KLJUC_SPREMANJA, JSON.stringify(state));
  }, [state]);

  function dodajTransakciju(
    transaction: Omit<Transakcija, "id" | "kreiranoU">,
  ) {
    const newTransaction: Transakcija = {
      ...transaction,
      id: Date.now().toString(),
      kreiranoU: Date.now(),
    };
    setState((current) => ({
      ...current,
      transakcije: [newTransaction, ...current.transakcije],
    }));
  }

  function obrisiTransakciju(id: string) {
    setState((current) => ({
      ...current,
      transakcije: current.transakcije.filter(
        (transaction) => transaction.id !== id,
      ),
    }));
  }

  function azurirajTransakciju(id: string, transaction: Partial<Transakcija>) {
    setState((current) => ({
      ...current,
      transakcije: current.transakcije.map((item) =>
        item.id === id ? { ...item, ...transaction } : item,
      ),
    }));
  }

  function dodajKategoriju(category: Omit<Kategorija, "id">) {
    const newCategory: Kategorija = { ...category, id: Date.now().toString() };
    setState((current) => ({
      ...current,
      kategorije: [...current.kategorije, newCategory],
    }));
  }

  function obrisiKategoriju(id: string) {
    setState((current) => ({
      ...current,
      kategorije: current.kategorije.filter((category) => category.id !== id),
    }));
  }

  const value: TipFinancijskogKonteksta = {
    transakcije: state.transakcije,
    kategorije: state.kategorije,
    statistika: stats,
    dodajTransakciju,
    obrisiTransakciju,
    azurirajTransakciju,
    dodajKategoriju,
    obrisiKategoriju,
  };

  return (
    <FinancijskiKontekst.Provider value={value}>
      {children}
    </FinancijskiKontekst.Provider>
  );
}

export function useFinancije() {
  const context = useContext(FinancijskiKontekst);
  if (!context)
    throw new Error("koristi financije mora biti unutar FinancijskiProvider");
  return context;
}
