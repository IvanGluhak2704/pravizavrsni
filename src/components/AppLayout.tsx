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
} from "lucide-react";
import "./AppLayout.css";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Početna", subtitle: "Pregled financija" },
  "/transakcije": {
    title: "Transakcije",
    subtitle: "Unos, pregled i brisanje transakcija",
  },
  "/racuni": { title: "Računi", subtitle: "Pregled i upravljanje računima" },
  "/predikcija": {
    title: "Predikcija",
    subtitle: "Procjena budućih financija",
  },
};

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentPageMeta = useMemo(() => {
    return pageMeta[location.pathname] ?? { title: "", subtitle: "" };
  }, [location.pathname]);

  const navLinks = [
    { to: "/", label: "Početna", icon: LayoutDashboard },
    { to: "/transakcije", label: "Transakcije", icon: ReceiptText },
    { to: "/racuni", label: "Računi", icon: Landmark },
    { to: "/predikcija", label: "Predikcija", icon: LineChart },
  ];

  return (
    <div className="app-frame">
      <aside className={`app-sidebar ${mobileNavOpen ? "open" : ""}`}>
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
                <Icon size={20} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <p>Osobne financije</p>
          <button
            className="primary-btn sidebar-cta"
            type="button"
            onClick={() => navigate("/transakcije")}
          >
            <PlusCircle size={20} />
            <span>Dodaj transakciju</span>
          </button>
        </div>
      </aside>
      <div className="app-shell">
        <header className="topbar">
          <button
            className="icon-button mobile-toggle"
            type="button"
            onClick={() => setMobileNavOpen((current) => !current)}
            aria-label={
              mobileNavOpen ? "Zatvori navigaciju" : "Otvori navigaciju"
            }
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="topbar-copy">
            <p className="topbar-eyebrow">Digital Finance studio</p>
            <h1 className="topbar-title">{currentPageMeta.title}</h1>
            <p className="topbar-subtitle">{currentPageMeta.subtitle}</p>
          </div>
        </header>
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
