import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ReceiptText,
  Landmark,
  LineChart,
  Menu,
  X,
  PlusCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./AppLayout.css";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Početna",
    subtitle: "Brzi pregled financija i statusa računa",
  },
  "/transakcije": {
    title: "Transakcije",
    subtitle: "Unos, pregled i brisanje transakcija",
  },
  "/racuni": {
    title: "Računi",
    subtitle: "Pregled stanja, kategorija i zdravlja budžeta",
  },
  "/predikcija": {
    title: "Predikcija",
    subtitle: "Procjena budućih troškova i prihoda",
  },
};

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isFirebaseConfigured, logout } = useAuth();

  const currentMeta = useMemo(
    () => pageMeta[location.pathname] ?? pageMeta["/"],
    [location.pathname],
  );

  const navLinks = [
    { to: "/", label: "Početna", icon: LayoutDashboard },
    { to: "/transakcije", label: "Transakcije", icon: ReceiptText },
    { to: "/racuni", label: "Računi", icon: Landmark },
    { to: "/predikcija", label: "Predikcija", icon: LineChart },
  ];

  return (
    <div className="app-frame">
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">F</div>
          <div>
            <p className="brand-kicker">Završni rad</p>
            <h2>Finance Flow</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {isFirebaseConfigured && user ? (
            <p className="sidebar-user">{user.email}</p>
          ) : (
            <p>Osobne financije</p>
          )}
          <button
            className="primary-btn sidebar-cta"
            type="button"
            onClick={() => navigate("/transakcije")}
          >
            <PlusCircle size={18} />
            Nova transakcija
          </button>
          {isFirebaseConfigured && user ? (
            <button
              className="secondary-btn sidebar-cta"
              type="button"
              onClick={() => logout()}
            >
              <LogOut size={18} />
              Odjava
            </button>
          ) : null}
        </div>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <button
            className="icon-button mobile-toggle"
            type="button"
            onClick={() => setMobileNavOpen((current) => !current)}
            aria-label={mobileNavOpen ? "Zatvori izbornik" : "Otvori izbornik"}
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="topbar-copy">
            <p className="topbar-eyebrow">Digital Finance Studio</p>
            <h1>{currentMeta.title}</h1>
            <p>{currentMeta.subtitle}</p>
          </div>
        </header>

        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
