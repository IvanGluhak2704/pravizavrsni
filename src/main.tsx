import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import "./styles/common.css";
import App from "./App.tsx";
import { FinancijskiProvider } from "./context/FinanceContext";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FinancijskiProvider>
          <App />
        </FinancijskiProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
