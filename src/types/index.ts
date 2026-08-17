export interface Transakcija {
  id: string;
  naziv: string;
  kategorija: string;
  vrsta: "income" | "expense";
  iznos: number;
  datum: string;
  kreiranoU: number;
}

export interface Kategorija {
  id: string;
  name: string;
  vrsta: "income" | "expense";
  color: string;
  icon: string;
}

export interface FinancijskeStatistike {
  ukupniPrihod: number;
  ukupniTrosak: number;
  stanje: number;
  prosjecniMjesecniTrosak: number;
  prosjecniMjesecniPrihod: number;
}

export interface PodaciPredikcije {
  mjesec: string;
  predvidjeniTrosak: number;
  predvidjeniPrihod: number;
  pouzdanost: number;
}
