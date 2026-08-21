import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import type { Transakcija, Kategorija, FinancijskeStatistike } from "../types";
import { db, isFirebaseConfigured } from "../services/firebase";
import { useAuth } from "./AuthContext";

interface TipFinancijskogKonteksta {
  transakcije: Transakcija[];
  kategorije: Kategorija[];
  statistika: FinancijskeStatistike;
  sinkronizacija: boolean;
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

async function posijZadaneKategorije(uid: string) {
  const firestore = db;
  if (!firestore) return;

  const categoriesRef = collection(firestore, "users", uid, "categories");
  const existing = await getDocs(categoriesRef);
  if (!existing.empty) return;

  const batch = writeBatch(firestore);

  zadaneKategorije.forEach((category) => {
    const ref = doc(categoriesRef);
    batch.set(ref, {
      name: category.name,
      vrsta: category.vrsta,
      color: category.color,
      icon: category.icon,
    });
  });

  await batch.commit();
}

export function FinancijskiProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const cloudMode = isFirebaseConfigured && Boolean(uid);

  const [state, setState] = useState<FinancijskoStanje>(ucitajPocetnoStanje());
  const stats = useMemo(
    () => izracunajStatistiku(state.transakcije),
    [state.transakcije],
  );

  useEffect(() => {
    if (cloudMode) return;
    window.localStorage.setItem(KLJUC_SPREMANJA, JSON.stringify(state));
  }, [state, cloudMode]);

  useEffect(() => {
    if (!cloudMode || !db || !uid) return;

    posijZadaneKategorije(uid).catch((err) =>
      console.error("Greška pri postavljanju početnih kategorija:", err),
    );

    const transactionsRef = collection(db, "users", uid, "transactions");
    const categoriesRef = collection(db, "users", uid, "categories");

    const unsubTransactions = onSnapshot(
      query(transactionsRef, orderBy("kreiranoU", "desc")),
      (snapshot) => {
        const transakcije = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Transakcija[];
        setState((current) => ({ ...current, transakcije }));
      },
      (err) => console.error("Greška pri dohvatu transakcija:", err),
    );

    const unsubCategories = onSnapshot(
      categoriesRef,
      (snapshot) => {
        const kategorije = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Kategorija[];
        setState((current) => ({ ...current, kategorije }));
      },
      (err) => console.error("Greška pri dohvatu kategorija:", err),
    );

    return () => {
      unsubTransactions();
      unsubCategories();
    };
  }, [cloudMode, uid]);

  function dodajTransakciju(
    transaction: Omit<Transakcija, "id" | "kreiranoU">,
  ) {
    if (cloudMode && db && uid) {
      addDoc(collection(db, "users", uid, "transactions"), {
        ...transaction,
        kreiranoU: Date.now(),
      }).catch((err) =>
        console.error("Greška pri spremanju transakcije:", err),
      );
      return;
    }

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
    if (cloudMode && db && uid) {
      deleteDoc(doc(db, "users", uid, "transactions", id)).catch((err) =>
        console.error("Greška pri brisanju transakcije:", err),
      );
      return;
    }

    setState((current) => ({
      ...current,
      transakcije: current.transakcije.filter(
        (transaction) => transaction.id !== id,
      ),
    }));
  }

  function azurirajTransakciju(id: string, transaction: Partial<Transakcija>) {
    if (cloudMode && db && uid) {
      setDoc(doc(db, "users", uid, "transactions", id), transaction, {
        merge: true,
      }).catch((err) =>
        console.error("Greška pri ažuriranju transakcije:", err),
      );
      return;
    }

    setState((current) => ({
      ...current,
      transakcije: current.transakcije.map((item) =>
        item.id === id ? { ...item, ...transaction } : item,
      ),
    }));
  }

  function dodajKategoriju(category: Omit<Kategorija, "id">) {
    if (cloudMode && db && uid) {
      addDoc(collection(db, "users", uid, "categories"), category).catch(
        (err) => console.error("Greška pri spremanju kategorije:", err),
      );
      return;
    }

    const newCategory: Kategorija = { ...category, id: Date.now().toString() };
    setState((current) => ({
      ...current,
      kategorije: [...current.kategorije, newCategory],
    }));
  }

  function obrisiKategoriju(id: string) {
    if (cloudMode && db && uid) {
      deleteDoc(doc(db, "users", uid, "categories", id)).catch((err) =>
        console.error("Greška pri brisanju kategorije:", err),
      );
      return;
    }

    setState((current) => ({
      ...current,
      kategorije: current.kategorije.filter((category) => category.id !== id),
    }));
  }

  const value: TipFinancijskogKonteksta = {
    transakcije: state.transakcije,
    kategorije: state.kategorije,
    statistika: stats,
    sinkronizacija: cloudMode,
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
    throw new Error("koristiFinancije mora biti unutar FinancijskiProvider");
  return context;
}
