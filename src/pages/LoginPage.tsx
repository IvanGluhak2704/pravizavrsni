import { useState, type FormEvent } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

type Mode = "login" | "register";
export function LoginPage() {
  const { login, register, error } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!email.trim() || password.length < 8) {
      setLocalError("Unesi ispravan e-mail i lozinku od barem 8 znakova.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="panel auth-card" onSubmit={handleSubmit}>
        <div className="panel-header">
          <div>
            <p className="panel-kicker">Finance Flow</p>
            <h2>{mode === "login" ? "Prijava" : "Registracija"}</h2>
          </div>
        </div>
        <p className="section-copy">
          {mode === "login"
            ? "Prijavi se kako bi pristupio svojim financijskim podacima spremljenim u oblaku."
            : "Napravi novi račun kako bi tvoje transakcije bile sigurno spremljene u oblaku."}
        </p>
        <div className="auth-fields">
          <label className="field">
            <span>E-mail</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ime@example.com"
              required
            />
          </label>
          <label className="field">
            <span>Lozinka</span>
            <input
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Najmanje 8 znakova"
              minLength={8}
              required
            />
          </label>
        </div>
        {localError || error ? (
          <p className="auth-error" role="alert">
            {localError ?? error}
          </p>
        ) : null}
        <button
          className="primary-btn form-btn"
          type="submit"
          disabled={submitting}
        >
          {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
          {submitting
            ? "Molimo pričekaj..."
            : mode === "login"
              ? "Prijavi se"
              : "Registriraj se"}
        </button>
        <button
          className="ghost-button auth-switch"
          type="button"
          onClick={() => {
            setMode((current) => (current === "login" ? "register" : "login"));
            setLocalError(null);
          }}
        >
          {mode === "login"
            ? "Nemaš račun? Registriraj se"
            : "Već imaš račun? Prijavi se"}
        </button>
      </form>
    </div>
  );
}
