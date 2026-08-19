import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { AppLayout } from "./components/AppLayout";
import { AccountsPage } from "./pages/AccountsPage";
import { HomePage } from "./pages/HomePage";
import { PredictionsPage } from "./pages/PredictionsPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const {user, loading, isFirebaseConfigured} = useAuth();

  if (!isFirebaseConfigured && loading) {
    return (
      <div className="auth-screen">
        <p>Učitavanje...</p>
      </div>
    );
  }
  if (isFirebaseConfigured && !user) {
    return (
      return (<LoginPage />);
    );
  }


  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="transakcije" element={<TransactionsPage />} />
        <Route path="racuni" element={<AccountsPage />} />
        <Route path="predikcija" element={<PredictionsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
